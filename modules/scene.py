"""
Scene Control Module
Refined scene-level metadata, transitions, pacing analysis, and scene construction.
"""

import re
import json
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum


class SceneType(Enum):
    """Types of narrative scenes."""
    ACTION = "action"          # Fight, chase, physical conflict
    DIALOGUE = "dialogue"      # Conversation-heavy scene
    INTROSPECTION = "introspection"  # Character inner thoughts
    EXPOSITION = "exposition"  # World-building, backstory
    TRANSITION = "transition"  # Time/location shift
    TENSION = "tension"        # Building suspense
    CLIMAX = "climax"          # Peak moment
    DENOUEMENT = "denouement"  # Resolution
    HOOK = "hook"              # Opening hook scene


class EmotionalBeat(Enum):
    """Emotional states for scene tagging."""
    TENSE = "tense"
    RELAXED = "relaxed"
    SAD = "sad"
    EXCITED = "excited"
    SUSPENSEFUL = "suspenseful"
    ROMANTIC = "romantic"
    HUMOROUS = "humorous"
    TERRIFYING = "terrifying"
    BITTERSWEET = "bittersweet"
    TRIUMPHANT = "triumphant"


class PacingLevel(Enum):
    """Pacing speed for scene control."""
    VERY_FAST = 5    # Single sentence for a year
    FAST = 4         # Quick cuts, action
    MEDIUM = 3       # Normal narrative speed
    SLOW = 2         # Detailed description
    VERY_SLOW = 1    # Micro-moment, intense focus


@dataclass
class SceneInfo:
    """Metadata for a single scene."""
    scene_id: str = ""
    title: str = ""
    scene_type: str = "dialogue"     # SceneType value
    emotional_beat: str = "tense"    # EmotionalBeat value
    pacing: int = 3                  # PacingLevel value (1-5)
    location: str = ""
    time_of_day: str = ""
    characters_present: List[str] = field(default_factory=list)
    pov_character: str = ""          # Point-of-view character
    purpose: str = ""                # What this scene achieves narratively
    word_count_target: int = 0       # Target word count
    opening_hook: str = ""           # How the scene opens
    closing_hook: str = ""           # How the scene ends
    key_action: str = ""             # The main action/event
    sensory_focus: str = ""          # Which senses to emphasize
    notes: str = ""                  # Author notes

    def to_dict(self) -> dict:
        return {
            "scene_id": self.scene_id,
            "title": self.title,
            "scene_type": self.scene_type,
            "emotional_beat": self.emotional_beat,
            "pacing": self.pacing,
            "location": self.location,
            "time_of_day": self.time_of_day,
            "characters_present": self.characters_present,
            "pov_character": self.pov_character,
            "purpose": self.purpose,
            "word_count_target": self.word_count_target,
            "opening_hook": self.opening_hook,
            "closing_hook": self.closing_hook,
            "key_action": self.key_action,
            "sensory_focus": self.sensory_focus,
            "notes": self.notes,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "SceneInfo":
        return cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})


@dataclass
class SceneTransition:
    """Describes the transition between two scenes."""
    from_scene_id: str = ""
    to_scene_id: str = ""
    transition_type: str = "cut"     # cut, fade, dissolve, jump, flashback
    time_skip: str = ""              # e.g., "3 hours later", "next morning"
    location_change: str = ""        # e.g., "from office to home"
    emotional_shift: str = ""        # e.g., "tense to relaxed"
    bridge_text: str = ""            # Optional transition sentence

    def to_dict(self) -> dict:
        return self.__dict__.copy()


@dataclass
class ChapterScenePlan:
    """A complete scene plan for a chapter."""
    chapter_idx: int = 0
    chapter_title: str = ""
    scenes: List[SceneInfo] = field(default_factory=list)
    transitions: List[SceneTransition] = field(default_factory=list)
    emotional_arc: str = ""          # Overall emotional trajectory
    pacing_arc: str = ""             # Overall pacing trajectory
    target_word_count: int = 0
    theme: str = ""                  # Chapter-level theme
    notes: str = ""

    def to_dict(self) -> dict:
        return {
            "chapter_idx": self.chapter_idx,
            "chapter_title": self.chapter_title,
            "scenes": [s.to_dict() for s in self.scenes],
            "transitions": [t.to_dict() for t in self.transitions],
            "emotional_arc": self.emotional_arc,
            "pacing_arc": self.pacing_arc,
            "target_word_count": self.target_word_count,
            "theme": self.theme,
            "notes": self.notes,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "ChapterScenePlan":
        plan = cls(
            chapter_idx=data.get("chapter_idx", 0),
            chapter_title=data.get("chapter_title", ""),
            emotional_arc=data.get("emotional_arc", ""),
            pacing_arc=data.get("pacing_arc", ""),
            target_word_count=data.get("target_word_count", 0),
            theme=data.get("theme", ""),
            notes=data.get("notes", ""),
        )
        plan.scenes = [SceneInfo.from_dict(s) for s in data.get("scenes", [])]
        plan.transitions = [SceneTransition(**t) for t in data.get("transitions", [])]
        return plan


# -- Pacing Analysis --

def analyze_pacing(text: str) -> Dict:
    """Analyze the pacing of a text passage."""
    sentences = re.split(r'[。！？]', text)
    sentences = [s.strip() for s in sentences if s.strip()]

    if not sentences:
        return {"avg_length": 0, "variance": 0, "pacing_score": 3, "issues": []}

    lengths = [len(s) for s in sentences]
    avg = sum(lengths) / len(lengths)
    variance = sum((l - avg) ** 2 for l in lengths) / len(lengths)

    # Pacing score: 1=very slow (long uniform), 5=very fast (short varied)
    if avg > 40 and variance < 100:
        pacing = 1  # Very slow, uniform
    elif avg > 30:
        pacing = 2
    elif avg > 20:
        pacing = 3
    elif avg > 10:
        pacing = 4
    else:
        pacing = 5  # Very fast

    issues = []
    if variance < 50:
        issues.append("句子长度过于均匀，建议增加长短句交替")
    if avg > 35:
        issues.append("平均句长过长，建议增加短句")
    if avg < 10:
        issues.append("平均句长过短，可能过于碎片化")

    # Check paragraph lengths
    paragraphs = text.split('\n')
    paragraphs = [p.strip() for p in paragraphs if p.strip()]
    para_lengths = [len(p) for p in paragraphs]
    if para_lengths:
        para_avg = sum(para_lengths) / len(para_lengths)
        para_var = sum((l - para_avg) ** 2 for l in para_lengths) / len(para_lengths)
        if para_var < 200 and len(paragraphs) > 3:
            issues.append("段落长度过于规则，建议变化段落长度")

    return {
        "sentence_count": len(sentences),
        "avg_length": round(avg, 1),
        "variance": round(variance, 1),
        "pacing_score": pacing,
        "pacing_label": PacingLevel(pacing).name,
        "issues": issues,
    }


def detect_scene_breaks(text: str) -> List[Dict]:
    """Detect potential scene breaks in text based on patterns."""
    breaks = []
    lines = text.split('\n')

    scene_break_patterns = [
        r'^\*{3,}$',           # ***
        r'^-{3,}$',            # ---
        r'^#{2,}\s',           # ## heading
        r'第.{1,3}章',         # Chapter markers
        r'【.+?】',            # 【scene markers】
        r'◆{2,}',             # ◆◆
        r'＊{3,}',             # ＊＊＊
    ]

    for i, line in enumerate(lines):
        stripped = line.strip()
        for pattern in scene_break_patterns:
            if re.match(pattern, stripped):
                breaks.append({
                    "line": i,
                    "text": stripped,
                    "type": "explicit",
                })
                break

    # Also detect implicit breaks: large time/location shifts
    time_markers = ['第二天', '几天后', '一周后', '一个月后', '次日', '翌日',
                    '清晨', '傍晚', '深夜', '黎明', '午后', '天亮时']
    location_markers = ['来到', '走进', '离开', '回到', '到达', '出发']

    for i, line in enumerate(lines):
        for marker in time_markers:
            if marker in line:
                breaks.append({
                    "line": i,
                    "text": line.strip()[:50],
                    "type": "time_shift",
                    "marker": marker,
                })
                break

    return breaks


# -- Scene Construction Prompt --

def build_scene_plan_prompt(chapter_outline: str, characters: str,
                             style: str, previous_summary: str = "") -> str:
    """Build a prompt for AI to generate a detailed scene plan."""
    return f"""你是一个专业的分镜/分场策划。根据以下章节细纲，设计详细的场景方案。

【章节细纲】
{chapter_outline}

【人物设定】
{characters}

【写作风格】
{style}

{f"【前文摘要】{previous_summary}" if previous_summary else ""}

【场景设计要求】
请将本章拆分为2-5个场景，每个场景包含：

1. 场景类型：action/dialogue/introspection/exposition/transition/tension/climax
2. 情绪节拍：tense/relaxed/sad/excited/suspenseful/romantic/humorous
3. 节奏控制：1-5（1=极慢，如一个眼神写三段；5=极快，如一句话带过一年）
4. 场景地点和时间
5. 出场人物和视角人物
6. 场景目的（这个场景在叙事上完成了什么）
7. 目标字数
8. 开头钩子（如何抓住读者）
9. 结尾钩子（如何过渡到下一个场景）
10. 核心事件/动作
11. 感官重点（重点描写哪个感官）
12. 场景转换方式（硬切/淡入/时间跳跃/回忆）

【节奏铁律】
- 黄金200字：每个场景的前200字必须有冲突、悬念或意外
- 节奏变化：连续2个场景不能用相同节奏
- 情绪曲线：不能连续3个场景相同情绪
- 信息密度：每个场景至少透露一个新信息
- 场景转换：用动作/对话转换，不要用旁白解说

请按以下JSON格式输出（不要输出其他内容）：
```json
{{
  "scenes": [
    {{
      "scene_id": "s1",
      "title": "场景标题",
      "scene_type": "类型",
      "emotional_beat": "情绪",
      "pacing": 3,
      "location": "地点",
      "time_of_day": "时间",
      "characters_present": ["角色1", "角色2"],
      "pov_character": "视角角色",
      "purpose": "叙事目的",
      "word_count_target": 800,
      "opening_hook": "开头钩子",
      "closing_hook": "结尾钩子",
      "key_action": "核心事件",
      "sensory_focus": "感官重点",
      "notes": "补充说明"
    }}
  ],
  "transitions": [
    {{
      "from_scene_id": "s1",
      "to_scene_id": "s2",
      "transition_type": "cut",
      "time_skip": "",
      "location_change": "",
      "emotional_shift": "",
      "bridge_text": "转换句"
    }}
  ],
  "emotional_arc": "整章情绪走向",
  "pacing_arc": "整章节奏走向",
  "theme": "本章主题"
}}
```"""


def build_scene_content_prompt(scene_info: SceneInfo, chapter_outline: str,
                                characters: str, style: str,
                                previous_context: str = "",
                                permanent_memory: str = "",
                                world_info: str = "") -> str:
    """Build a prompt for generating content for a specific scene."""
    pacing_desc = {
        1: "极慢节奏：用大量细节和感官描写，一个微小的动作可以展开成几段",
        2: "慢节奏：详细描写，关注人物内心和环境细节",
        3: "中等节奏：正常叙事速度，描写与推进平衡",
        4: "快节奏：短句为主，快速推进情节",
        5: "极快节奏：一句话带过大量时间或事件，制造紧张感",
    }

    return f"""你是一个网文写手，风格偏实战派。根据以下场景方案，写出该场景的正文。

═══════════════════════════════════════════
【场景信息】
═══════════════════════════════════════════
场景类型：{scene_info.scene_type}
情绪节拍：{scene_info.emotional_beat}
节奏控制：{pacing_desc.get(scene_info.pacing, "中等节奏")}
地点：{scene_info.location}
时间：{scene_info.time_of_day}
出场人物：{', '.join(scene_info.characters_present)}
视角人物：{scene_info.pov_character}
核心事件：{scene_info.key_action}
感官重点：{scene_info.sensory_focus}
目标字数：{scene_info.word_count_target or '根据内容自然决定'}
开头钩子：{scene_info.opening_hook}
结尾钩子：{scene_info.closing_hook}

═══════════════════════════════════════════
【章节大纲】
═══════════════════════════════════════════
{chapter_outline}

═══════════════════════════════════════════
【人物设定】
═══════════════════════════════════════════
{characters}

═══════════════════════════════════════════
【写作风格】
═══════════════════════════════════════════
{style}

{permanent_memory}

{previous_context}

{world_info}

═══════════════════════════════════════════
【场景写作规则】
═══════════════════════════════════════════
1. 开头200字必须有冲突、悬念或意外，不要从环境描写开始
2. 根据场景类型调整写法：
   - action场景：短句为主，动作描写密集，节奏快
   - dialogue场景：对话推动剧情，每句话有潜台词
   - introspection场景：用行为暗示内心，不要大段独白
   - tension场景：控制信息释放节奏，制造悬念
   - climax场景：情绪爆发，节奏可以变化极大
3. 根据节奏控制调整句子长度和段落密度
4. 重点描写场景指定的感官（视觉/听觉/嗅觉/触觉/味觉）
5. 结尾必须有钩子，自然过渡到下一个场景

【禁止清单】
以下词句出现任何一个，重写该段：
"心中一凛"、"眼中闪过一丝XX"、"嘴角勾起一抹XX"、"一股XX涌上心头"、"仿佛XX一般"、"宛如XX"、"不由得"、"情不自禁"、"目光深邃"、"意味深长"、"若有所思"、"恍然大悟"、"不禁XX"、"眉头微蹙"、"嘴角上扬"、"心中暗道"、"不觉间"、"霎时间"、"此刻的他"、"他深知"、"无疑"、"显然"

直接写正文，不要加任何解释。"""
