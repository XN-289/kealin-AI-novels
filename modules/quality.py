"""
Writing Quality Consistency Check Module
Automated quality monitoring, style consistency analysis, and quality scoring.
"""

import re
import json
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, field
from collections import Counter

# Import unified banned words from central config (single source of truth)
from .config import BANNED_WORDS, AI_TRANSITION_WORDS

# Fix #7: 预编译模板正则表达式，避免每次检测时重复编译
_TEMPLATE_PATTERNS = []
for _w in BANNED_WORDS:
    if "XX" in _w:
        try:
            _TEMPLATE_PATTERNS.append((_w, re.compile(_w.replace("XX", "(.+?)"))))
        except re.error:
            pass


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
    return len(re.findall(r'[一-龥]', text))


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
    # Fix #7: 使用预编译的模板正则
    for word, pattern in _TEMPLATE_PATTERNS:
        try:
            for match in pattern.finditer(text):
                detections.append({
                    "word": match.group(0),
                    "position": match.start(),
                    "type": "template",
                })
        except re.error:
            pass
    # 精确匹配（跳过含XX的模板词）
    for word in BANNED_WORDS:
        if "XX" in word:
            continue
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

    # Fix #6: 一次性解析文本，缓存结果供后续使用
    sentences = get_sentences(text)
    paragraphs = get_paragraphs(text)
    chinese_count = count_chinese_chars(text)

    # Banned words: -3 each
    banned = detect_banned_words(text)
    score -= len(banned) * 3

    # AI transitions: -2 each
    transitions = detect_ai_transitions(text)
    score -= len(transitions) * 2

    # Repetitive sentence patterns
    if len(sentences) > 3:
        openings = [s[:4] for s in sentences if len(s) >= 4]
        opening_counts = Counter(openings)
        repeated = sum(c - 1 for c in opening_counts.values() if c > 2)
        score -= repeated * 3

    # "的" density
    de_count = count_de_particle(text)
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
            score -= 10
        elif variance < 40:
            score -= 5

    # Paragraph length uniformity（使用已缓存的 paragraphs）
    if len(paragraphs) > 3:
        para_lengths = [len(p) for p in paragraphs]
        para_avg = sum(para_lengths) / len(para_lengths)
        para_var = sum((l - para_avg) ** 2 for l in para_lengths) / len(paragraphs)
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

    # Ending summary/sentiment detection（使用已缓存的 paragraphs）
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

def build_quality_check_prompt(text: str, check_type: str = "full",
                               previous_content: str = None,
                               style_description: str = None) -> str:
    """Build a prompt for AI-powered quality checking.
    融合 novel-qa 的 10 大检查维度和 novel-studio 的写作风格规范。
    支持传入前文内容和风格描述，用于风格一致性检查。"""
    check_descriptions = {
        "full": "全面质量检查",
        "ai_taste": "AI味检测",
        "readability": "可读性分析",
        "dialogue": "对话质量检查",
        "pacing": "节奏分析",
        "consistency": "风格一致性检查",
    }

    check_desc = check_descriptions.get(check_type, "全面质量检查")

    # 构建风格一致性检查上下文
    style_context = ""
    if previous_content:
        style_context += f"""

═══════════════════════════════════════════
【前文内容 - 用于风格一致性对比】
═══════════════════════════════════════════
{previous_content[:2000]}  # 限制长度避免token过多
"""
    if style_description:
        style_context += f"""

═══════════════════════════════════════════
【项目风格设定】
═══════════════════════════════════════════
{style_description}
"""

    return f"""帮我看一下这段内容写得怎么样，做{check_desc}。说人话，别用表格。

【检查文本】
{text}
{style_context}

【检查维度——像一个挑剔的读者一样读】

1. AI味检测
   - 禁用词：有没有"心中一凛"、"眼中闪过"、"嘴角勾起"、"眉头微蹙"、"不禁"、"仿佛XX一般"、"宛如"、"若有所思"、"恍然大悟"、"此刻的他"、"他深知"这些模板句
   - 排比句：有没有同句式重复三次以上的（"有时候…有时候…有时候…"）
   - 段尾抒情：有没有"这就是XX的意义啊"这种总结式结尾
   - 结构化对比：有没有"不是XX而是XX"这种议论文句式
   - "的"字密度：每段超过5个扣分
   - 句式均匀度：全在15-25字=AI味重
   - 对话标签重复："XX说道"、"XX淡淡道"反复出现
   - 场景切入方式：是不是每段都用"时间状语+主句"开头（"有一天…"、"再后来…"、"那天…"）
   - 破折号密度：是否过度使用——做解释说明

2. 风格一致性
   - 与前文的句式节奏是否一致（长短句比例、段落长度变化）
   - 与前文的描写手法是否一致（环境描写比重、心理描写方式）
   - 与前文的对话风格是否一致（语气词使用、对话标签方式）
   - 与项目风格设定是否匹配
   - 是否存在跨章自我复制（同一段话几乎原封不动重复出现）

3. 人设一致性
   - 性格是否突变（需有合理铺垫）
   - 口头禅、说话方式是否一致
   - 行为模式是否符合人设

4. 时间线一致性
   - 事件发生的先后顺序是否合理
   - 日期/年份是否前后矛盾

5. 情节逻辑
   - 因果关系是否成立
   - 角色动机是否充分
   - 行为是否符合常识和情境

6. 对话合理性
   - 说话方式是否符合人设
   - 对话中引用的前文事件是否准确
   - 是否有足够铺垫避免"忽然知情"式的突兀对话

7. 伏笔闭环
   - 已埋伏笔是否有回收
   - 是否有悬而未决的线索

8. 场景/环境一致性
   - 地点描述是否前后一致
   - 空间布局是否合理
   - 天气、时间段是否与情节匹配

9. 情感逻辑
   - 情绪反应的强度是否与刺激匹配
   - 情绪转变是否有合理过渡

10. 文风自然度
    - 是否存在跨段/跨章自我复制（同一段话几乎原封不动重复出现）
    - 是否有"结构化输出"问题（编号式、模板化句式）
    - 同一意思是否在短时间内反复表达但表述几乎相同
    - 特定词汇/表达是否过度使用（超过5-6次且分布集中）

11. 吸引力
    - 开头是否有钩子
    - 结尾是否有悬念
    - 是否有感官细节
    - 是否有动作/冲突

【输出要求】
说人话，给我一个整体评价，然后按严重程度列出问题。每个问题说清楚：是什么问题、在哪里、怎么改。不需要打分表格。"""
