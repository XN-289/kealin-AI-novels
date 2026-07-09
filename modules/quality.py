"""
Writing Quality Consistency Check Module
Automated quality monitoring, style consistency analysis, and quality scoring.
"""

import re
import json
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, field
from collections import Counter


# -- Banned Words / AI Taste Detection --

BANNED_WORDS = [
    "心中一凛", "眼中闪过一丝", "眼中闪过一抹", "嘴角勾起一抹",
    "一股XX涌上心头", "仿佛XX一般", "宛如XX", "不由得",
    "情不自禁", "目光深邃", "意味深长", "若有所思", "恍然大悟",
    "不禁XX", "眉头微蹙", "嘴角上扬", "心中暗道", "不觉间",
    "霎时间", "此刻的他", "他深知", "无疑", "显然", "毫无疑问",
    "不言而喻", "与此同时", "就在这时", "突然间", "猛然间",
    "刹那间", "恍惚间", "不知不觉", "本能地", "下意识地",
    "条件反射般", "如同XX一般", "好似XX", "恰似XX", "宛如XX似的",
    "这一刻他明白", "他知道，",
]

AI_TRANSITION_WORDS = [
    "首先", "其次", "再次", "最后", "总之", "综上所述",
    "值得注意的是", "需要指出的是", "不难发现", "显而易见",
    "毋庸置疑", "不可否认", "事实上", "实际上",
]


@dataclass
class QualityIssue:
    """A single quality issue found in text."""
    issue_type: str          # banned_word, repetition, pacing, dialogue, structure, etc.
    severity: str            # high, medium, low
    location: str            # Approximate location description
    description: str         # What the issue is
    suggestion: str = ""     # How to fix it
    line_number: int = -1    # Line number if applicable

    def to_dict(self) -> dict:
        return self.__dict__.copy()


@dataclass
class QualityReport:
    """Complete quality analysis report."""
    overall_score: int = 0           # 0-100
    ai_taste_score: int = 0          # 0-100 (100 = human-like, 0 = pure AI)
    readability_score: int = 0       # 0-100
    consistency_score: int = 0       # 0-100
    engagement_score: int = 0        # 0-100
    issues: List[QualityIssue] = field(default_factory=list)
    stats: Dict = field(default_factory=dict)
    recommendations: List[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "overall_score": self.overall_score,
            "ai_taste_score": self.ai_taste_score,
            "readability_score": self.readability_score,
            "consistency_score": self.consistency_score,
            "engagement_score": self.engagement_score,
            "issues": [i.to_dict() for i in self.issues],
            "stats": self.stats,
            "recommendations": self.recommendations,
        }


# -- Text Analysis Functions --

def count_chinese_chars(text: str) -> int:
    """Count Chinese characters in text."""
    return len(re.findall(r'[一-鿿]', text))


def get_sentences(text: str) -> List[str]:
    """Split text into sentences."""
    sentences = re.split(r'[。！？…]+', text)
    return [s.strip() for s in sentences if s.strip() and len(s.strip()) > 1]


def get_paragraphs(text: str) -> List[str]:
    """Split text into paragraphs."""
    paragraphs = text.split('\n')
    return [p.strip() for p in paragraphs if p.strip()]


def count_de_particle(text: str) -> int:
    """Count occurrences of 的 particle."""
    return text.count('的')


def detect_dialogue_lines(text: str) -> List[str]:
    """Extract dialogue lines from text."""
    # Match text inside Chinese quotes
    dialogues = re.findall(r'[""](.*?)["""]', text)
    return dialogues


def detect_dialogue_tags(text: str) -> List[str]:
    """Detect dialogue attribution tags (XX说道, etc.)."""
    tags = re.findall(r'[一-鿿]{1,4}(?:说|道|喊|叫|问|答|笑|吼|嘟囔|嘀咕|冷哼|轻声|淡淡|沉声|厉声|大声)道?["""]', text)
    return tags


# -- AI Taste Detection --

def detect_banned_words(text: str) -> List[Dict]:
    """Detect banned/AI-taste words in text."""
    detections = []
    for word in BANNED_WORDS:
        if "XX" in word:
            regex_str = word.replace("XX", "(.+?)")
            try:
                for match in re.finditer(regex_str, text):
                    detections.append({
                        "word": match.group(0),
                        "position": match.start(),
                        "type": "template",
                    })
            except re.error:
                pass
        else:
            idx = 0
            while True:
                idx = text.find(word, idx)
                if idx == -1:
                    break
                detections.append({
                    "word": word,
                    "position": idx,
                    "type": "exact",
                })
                idx += len(word)
    return detections


def detect_ai_transitions(text: str) -> List[Dict]:
    """Detect AI-style transition words."""
    detections = []
    for word in AI_TRANSITION_WORDS:
        idx = text.find(word)
        if idx != -1:
            detections.append({
                "word": word,
                "position": idx,
                "type": "transition",
            })
    return detections


def calculate_ai_taste_score(text: str) -> int:
    """Calculate AI taste score (0-100, 100=human-like)."""
    if not text or len(text) < 50:
        return 100

    score = 100

    # Banned words: -3 each
    banned = detect_banned_words(text)
    score -= len(banned) * 3

    # AI transitions: -2 each
    transitions = detect_ai_transitions(text)
    score -= len(transitions) * 2

    # Repetitive sentence patterns
    sentences = get_sentences(text)
    if len(sentences) > 3:
        # Check for similar sentence openings
        openings = [s[:4] for s in sentences if len(s) >= 4]
        opening_counts = Counter(openings)
        repeated = sum(c - 1 for c in opening_counts.values() if c > 2)
        score -= repeated * 3

    # "的" density
    de_count = count_de_particle(text)
    chinese_count = count_chinese_chars(text)
    if chinese_count > 0:
        de_density = de_count / chinese_count
        if de_density > 0.06:
            score -= 10
        elif de_density > 0.04:
            score -= 5

    # Sentence length uniformity
    if sentences:
        lengths = [len(s) for s in sentences]
        avg = sum(lengths) / len(lengths)
        variance = sum((l - avg) ** 2 for l in lengths) / len(lengths)
        if variance < 20:
            score -= 10  # Too uniform
        elif variance < 40:
            score -= 5

    # Paragraph length uniformity
    paragraphs = get_paragraphs(text)
    if len(paragraphs) > 3:
        para_lengths = [len(p) for p in paragraphs]
        para_avg = sum(para_lengths) / len(para_lengths)
        para_var = sum((l - para_avg) ** 2 for l in para_lengths) / len(para_lengths)
        if para_var < 200:
            score -= 5

    # Dialogue tag repetition
    tags = detect_dialogue_tags(text)
    if tags:
        tag_counts = Counter(tags)
        repeated_tags = sum(c - 1 for c in tag_counts.values() if c > 1)
        score -= repeated_tags * 2

    # Parallel structure detection (排比句)
    if sentences:
        parallel_count = 0
        for i in range(len(sentences) - 2):
            s1, s2, s3 = sentences[i], sentences[i + 1], sentences[i + 2]
            if (len(s1) > 3 and len(s2) > 3 and len(s3) > 3 and
                s1[:3] == s2[:3] == s3[:3]):
                parallel_count += 1
        score -= parallel_count * 5

    # Ending summary/sentiment detection (段尾总结抒情)
    paragraphs = get_paragraphs(text)
    summary_endings = ['的意义', '这就是', '或许这就是', '也许这就是', '这大概就是']
    for p in paragraphs:
        last_20 = p[-20:] if len(p) > 20 else p
        for ending in summary_endings:
            if ending in last_20:
                score -= 3
                break

    return max(0, min(100, round(score)))


# -- Readability Analysis --

def analyze_readability(text: str) -> Dict:
    """Analyze text readability."""
    sentences = get_sentences(text)
    paragraphs = get_paragraphs(text)
    chinese_count = count_chinese_chars(text)

    if not sentences:
        return {"score": 0, "issues": []}

    # Sentence length stats
    sent_lengths = [len(s) for s in sentences]
    avg_sent = sum(sent_lengths) / len(sent_lengths)
    max_sent = max(sent_lengths)
    min_sent = min(sent_lengths)

    # Paragraph length stats
    para_lengths = [len(p) for p in paragraphs] if paragraphs else [0]
    avg_para = sum(para_lengths) / len(para_lengths)

    # Dialogue ratio
    dialogue_lines = detect_dialogue_lines(text)
    dialogue_chars = sum(len(d) for d in dialogue_lines)
    dialogue_ratio = dialogue_chars / chinese_count if chinese_count > 0 else 0

    issues = []
    score = 80  # Start at 80

    # Too long sentences
    long_sentences = [s for s in sentences if len(s) > 50]
    if long_sentences:
        issues.append(f"有{len(long_sentences)}个句子超过50字，建议拆分")
        score -= len(long_sentences) * 2

    # Too uniform sentence length
    if sent_lengths:
        variance = sum((l - avg_sent) ** 2 for l in sent_lengths) / len(sent_lengths)
        if variance < 30:
            issues.append("句子长度过于均匀，建议增加长短句交替")
            score -= 10

    # Dialogue ratio
    if dialogue_ratio < 0.1:
        issues.append("对话比例过低（<10%），可能缺少互动感")
        score -= 5
    elif dialogue_ratio > 0.6:
        issues.append("对话比例过高（>60%），可能缺乏描写和叙事")
        score -= 5

    # Paragraph length
    if avg_para > 200:
        issues.append("平均段落过长，建议适当分段")
        score -= 5

    return {
        "score": max(0, min(100, score)),
        "sentence_count": len(sentences),
        "avg_sentence_length": round(avg_sent, 1),
        "max_sentence_length": max_sent,
        "min_sentence_length": min_sent,
        "paragraph_count": len(paragraphs),
        "avg_paragraph_length": round(avg_para, 1),
        "dialogue_ratio": round(dialogue_ratio, 2),
        "chinese_char_count": chinese_count,
        "issues": issues,
    }


# -- Style Consistency --

def analyze_style_consistency(texts: List[str]) -> Dict:
    """Analyze style consistency across multiple text passages."""
    if len(texts) < 2:
        return {"score": 100, "issues": ["需要至少两段文本才能分析一致性"]}

    all_stats = []
    for text in texts:
        sentences = get_sentences(text)
        if not sentences:
            continue
        lengths = [len(s) for s in sentences]
        avg = sum(lengths) / len(lengths)
        de_density = count_de_particle(text) / max(1, count_chinese_chars(text))
        dialogue_count = len(detect_dialogue_lines(text))
        all_stats.append({
            "avg_sentence_length": avg,
            "de_density": de_density,
            "dialogue_count": dialogue_count,
            "sentence_count": len(sentences),
        })

    if len(all_stats) < 2:
        return {"score": 100, "issues": []}

    issues = []
    score = 100

    # Check sentence length consistency
    avg_lengths = [s["avg_sentence_length"] for s in all_stats]
    length_range = max(avg_lengths) - min(avg_lengths)
    if length_range > 15:
        issues.append(f"句长风格不一致：平均句长范围 {min(avg_lengths):.0f}-{max(avg_lengths):.0f} 字")
        score -= 15
    elif length_range > 8:
        issues.append(f"句长风格略有差异：平均句长范围 {min(avg_lengths):.0f}-{max(avg_lengths):.0f} 字")
        score -= 5

    # Check "的" density consistency
    de_densities = [s["de_density"] for s in all_stats]
    de_range = max(de_densities) - min(de_densities)
    if de_range > 0.03:
        issues.append("「的」字密度不一致，文风可能不统一")
        score -= 10

    # Check dialogue density consistency
    if all_stats:
        dialogue_ratios = [s["dialogue_count"] / max(1, s["sentence_count"]) for s in all_stats]
        dr_range = max(dialogue_ratios) - min(dialogue_ratios)
        if dr_range > 0.3:
            issues.append("对话密度不一致，有些章节对话多、有些章节对话少")
            score -= 10

    return {
        "score": max(0, min(100, score)),
        "issues": issues,
        "stats": all_stats,
    }


# -- Full Quality Report --

def generate_quality_report(text: str, chapter_idx: int = -1,
                             all_chapter_texts: List[str] = None) -> QualityReport:
    """Generate a comprehensive quality report for a text."""
    report = QualityReport()

    # AI taste
    report.ai_taste_score = calculate_ai_taste_score(text)

    # Readability
    readability = analyze_readability(text)
    report.readability_score = readability["score"]
    report.stats["readability"] = readability

    # Style consistency (if multiple chapters provided)
    if all_chapter_texts and len(all_chapter_texts) > 1:
        consistency = analyze_style_consistency(all_chapter_texts)
        report.consistency_score = consistency["score"]
        report.stats["consistency"] = consistency
    else:
        report.consistency_score = 70  # Default when can't check

    # Engagement (heuristic)
    report.engagement_score = _calculate_engagement(text, readability)

    # Collect issues
    _collect_issues(text, report, readability)

    # Overall score (weighted average)
    report.overall_score = round(
        report.ai_taste_score * 0.35 +
        report.readability_score * 0.25 +
        report.consistency_score * 0.20 +
        report.engagement_score * 0.20
    )

    # Generate recommendations
    report.recommendations = _generate_recommendations(report)

    return report


def _calculate_engagement(text: str, readability: Dict) -> int:
    """Calculate engagement score based on heuristics."""
    score = 70  # Base score

    sentences = get_sentences(text)
    paragraphs = get_paragraphs(text)

    if not sentences:
        return 0

    # Check opening hook (first 200 chars should have conflict/suspense)
    opening = text[:200]
    hook_words = ['突然', '竟然', '没想到', '不曾想', '居然', '秘密',
                  '危险', '死', '杀', '爱', '恨', '背叛', '发现',
                  '选择', '必须', '不能', '为什么']
    has_hook = any(w in opening for w in hook_words)
    if has_hook:
        score += 10
    else:
        score -= 10

    # Check closing hook
    closing = text[-200:] if len(text) > 200 else text
    hook_endings = ['？', '……', '...', '——', '然而', '但是', '可是',
                    '没想到', '却发现', '突然']
    has_ending_hook = any(w in closing for w in hook_endings)
    if has_ending_hook:
        score += 5
    else:
        score -= 5

    # Dialogue presence
    dialogue_lines = detect_dialogue_lines(text)
    if len(dialogue_lines) > 2:
        score += 5

    # Sensory details
    sensory_words = ['闻到', '听到', '看到', '摸到', '尝到', '感觉到',
                     '声音', '味道', '气味', '触感', '温度', '光线',
                     '阳光', '月光', '风', '雨', '雪', '热', '冷']
    sensory_count = sum(1 for w in sensory_words if w in text)
    if sensory_count > 3:
        score += 5
    elif sensory_count == 0:
        score -= 5

    # Action verbs (dynamic writing)
    action_words = ['跑', '冲', '抓', '推', '拉', '打', '踢', '摔',
                    '跳', '翻', '扑', '挡', '闪', '躲', '砍', '刺']
    action_count = sum(1 for w in action_words if w in text)
    if action_count > 5:
        score += 5

    return max(0, min(100, score))


def _collect_issues(text: str, report: QualityReport, readability: Dict):
    """Collect all quality issues from text."""
    # Banned words
    banned = detect_banned_words(text)
    for b in banned:
        report.issues.append(QualityIssue(
            issue_type="banned_word",
            severity="high",
            location=f"位置 {b['position']}",
            description=f"发现AI味词汇「{b['word']}」",
            suggestion="删除或替换为更自然的表达",
        ))

    # AI transitions
    transitions = detect_ai_transitions(text)
    for t in transitions:
        report.issues.append(QualityIssue(
            issue_type="ai_transition",
            severity="medium",
            location=f"位置 {t['position']}",
            description=f"发现AI风格过渡词「{t['word']}」",
            suggestion="删除或用更自然的方式过渡",
        ))

    # Readability issues
    for issue_text in readability.get("issues", []):
        report.issues.append(QualityIssue(
            issue_type="readability",
            severity="medium",
            location="整体",
            description=issue_text,
        ))

    # Dialogue tag repetition
    tags = detect_dialogue_tags(text)
    if tags:
        tag_counts = Counter(tags)
        for tag, count in tag_counts.items():
            if count > 2:
                report.issues.append(QualityIssue(
                    issue_type="dialogue_tag",
                    severity="medium",
                    location="多处",
                    description=f"对话标签「{tag}」重复{count}次",
                    suggestion="用动作代替说话标签，或变化标签写法",
                ))

    # Parallel sentences
    sentences = get_sentences(text)
    for i in range(len(sentences) - 2):
        s1, s2, s3 = sentences[i], sentences[i + 1], sentences[i + 2]
        if (len(s1) > 3 and len(s2) > 3 and len(s3) > 3 and
            s1[:3] == s2[:3] == s3[:3]):
            report.issues.append(QualityIssue(
                issue_type="parallel_structure",
                severity="high",
                location=f"句子 {i+1}-{i+3}",
                description=f"检测到排比句结构：「{s1[:10]}...」",
                suggestion="打破排比，改用不同句式",
            ))

    # Summary endings
    paragraphs = get_paragraphs(text)
    for i, p in enumerate(paragraphs):
        last_20 = p[-20:] if len(p) > 20 else p
        summary_endings = ['的意义', '这就是', '或许这就是']
        for ending in summary_endings:
            if ending in last_20:
                report.issues.append(QualityIssue(
                    issue_type="summary_ending",
                    severity="medium",
                    location=f"第{i+1}段末尾",
                    description=f"段落结尾有总结式抒情：「{last_20[:15]}...」",
                    suggestion="删除结尾的总结抒情，让读者自己感受",
                ))
                break


def _generate_recommendations(report: QualityReport) -> List[str]:
    """Generate actionable recommendations based on the report."""
    recs = []

    if report.ai_taste_score < 60:
        recs.append("AI味较重，建议使用「去AI味重写」功能优化")
    elif report.ai_taste_score < 75:
        recs.append("有一定AI味，建议检查并替换高频AI词汇")

    if report.readability_score < 60:
        recs.append("可读性较低，建议调整句式长短、增加对话比例")

    if report.consistency_score < 60:
        recs.append("风格一致性较差，建议统一文风")

    if report.engagement_score < 60:
        recs.append("吸引力不足，建议增加冲突、悬念或感官描写")

    # Count high severity issues
    high_issues = [i for i in report.issues if i.severity == "high"]
    if len(high_issues) > 5:
        recs.append(f"发现{len(high_issues)}个高优先级问题，建议优先处理")

    # Specific issue type recommendations
    issue_types = Counter(i.issue_type for i in report.issues)
    if issue_types.get("banned_word", 0) > 3:
        recs.append("多个禁用词出现，建议批量替换或使用「去AI味重写」")
    if issue_types.get("dialogue_tag", 0) > 2:
        recs.append("对话标签重复过多，建议用动作描写代替")
    if issue_types.get("parallel_structure", 0) > 0:
        recs.append("检测到排比句，建议打破工整的句式结构")

    if not recs:
        recs.append("质量良好，继续保持当前写作水平")

    return recs


# -- Prompt Builder for AI Quality Check --

def build_quality_check_prompt(text: str, check_type: str = "full") -> str:
    """Build a prompt for AI-powered quality checking."""
    check_descriptions = {
        "full": "全面质量检查",
        "ai_taste": "AI味检测",
        "readability": "可读性分析",
        "dialogue": "对话质量检查",
        "pacing": "节奏分析",
        "consistency": "风格一致性检查",
    }

    check_desc = check_descriptions.get(check_type, "全面质量检查")

    return f"""你是一个严格的网文编辑，负责{check_desc}。

【检查文本】
{text}

【检查维度】
1. AI味检测（30%）
   - 禁用词：心中一凛、眼中闪过、嘴角勾起、不由得、仿佛XX一般、宛如XX、情不自禁、目光深邃等
   - 排比句：三个以上相似句式
   - 段尾总结抒情：这就是XX的意义啊
   - "的"字密度：每段超过5个扣分
   - 句式均匀度：全在15-25字=AI味重
   - 对话标签重复：XX说道反复出现

2. 可读性（25%）
   - 句子长短交替
   - 段落长度变化
   - 对话与叙事比例
   - 信息密度

3. 风格一致性（20%）
   - 文风是否统一
   - 用词习惯是否一致
   - 节奏是否连贯

4. 吸引力（25%）
   - 开头是否有钩子
   - 结尾是否有悬念
   - 是否有感官细节
   - 是否有动作/冲突

【输出要求】
请按以下格式输出：

【综合评分】XX/100
【AI味评分】XX/100
【可读性评分】XX/100
【风格一致性评分】XX/100
【吸引力评分】XX/100

【问题列表】
1. [严重程度] 问题描述（位置）→ 修改建议
2. ...

【修改建议】
1. 具体建议1
2. 具体建议2
..."""
