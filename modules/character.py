"""
Structured Character Card System Module
Rich character profiles with consistency tracking, voice analysis, and dynamic state management.
"""

import re
import json
from typing import List, Dict, Optional, Set
from dataclasses import dataclass, field


@dataclass
class CharacterTrait:
    """A single character trait with evidence tracking."""
    name: str                       # e.g., "勇敢", "话多"
    description: str = ""           # Detailed description
    evidence: List[str] = field(default_factory=list)  # Specific examples from text
    intensity: int = 5              # 1-10 scale
    is_flaw: bool = False           # Whether this is a character flaw
    growth_potential: bool = False   # Whether this trait can change

    def to_dict(self) -> dict:
        return self.__dict__.copy()


@dataclass
class VoiceProfile:
    """Character's speech patterns and voice characteristics."""
    speech_style: str = ""          # e.g., "简洁有力"、"啰嗦但真诚"
    vocabulary_level: str = ""      # e.g., "通俗"、"文雅"、"粗犷"
    catchphrases: List[str] = field(default_factory=list)
    verbal_tics: List[str] = field(default_factory=list)  # e.g., "总是在句尾加'嘛'"
    sentence_length: str = ""       # e.g., "短句为主"、"喜欢长句"
    dialect_markers: List[str] = field(default_factory=list)
    emotional_speech: Dict[str, str] = field(default_factory=dict)
    # e.g., {"愤怒": "会用脏话", "紧张": "说话结巴"}
    forbidden_words: List[str] = field(default_factory=list)
    # Words this character would never use

    def to_dict(self) -> dict:
        return self.__dict__.copy()


@dataclass
class CharacterRelationship:
    """Relationship between two characters."""
    target_name: str
    relationship_type: str          # e.g., "恋人"、"师徒"、"宿敌"
    description: str = ""
    intensity: int = 5              # 1-10 emotional intensity
    history: str = ""               # Brief history of the relationship
    current_tension: str = ""       # Current state of tension
    future_trajectory: str = ""     # Where this relationship is heading

    def to_dict(self) -> dict:
        return self.__dict__.copy()


@dataclass
class CharacterArc:
    """Tracks character development over the story."""
    starting_state: str = ""        # Who they are at the beginning
    current_state: str = ""         # Who they are now
    target_state: str = ""          # Who they should become
    key_moments: List[Dict] = field(default_factory=list)
    # e.g., [{"chapter": 3, "event": "失去了师傅", "change": "开始变得冷酷"}]
    internal_conflict: str = ""     # Core internal struggle
    external_conflict: str = ""     # Core external challenge
    growth_stage: str = "setup"     # setup -> confrontation -> resolution

    def to_dict(self) -> dict:
        return self.__dict__.copy()


@dataclass
class CharacterCard:
    """A complete, structured character card."""
    id: str = ""
    name: str = ""
    aliases: List[str] = field(default_factory=list)    # Other names/nicknames
    role: str = "supporting"        # protagonist, antagonist, supporting, minor

    # Physical
    age: str = ""
    gender: str = ""
    appearance: str = ""
    distinguishing_features: List[str] = field(default_factory=list)
    # e.g., ["左手缺一根小指", "总穿黑色衣服"]

    # Personality
    traits: List[CharacterTrait] = field(default_factory=list)
    core_belief: str = ""           # What they fundamentally believe
    motivation: str = ""            # What drives them
    fear: str = ""                  # Their deepest fear
    desire: str = ""                # What they want most
    flaw: str = ""                  # Their main character flaw

    # Voice
    voice: VoiceProfile = field(default_factory=VoiceProfile)

    # Background
    backstory: str = ""
    key_memories: List[str] = field(default_factory=list)
    secrets: List[str] = field(default_factory=list)

    # Relationships
    relationships: List[CharacterRelationship] = field(default_factory=list)

    # Arc
    arc: CharacterArc = field(default_factory=CharacterArc)

    # Dynamic State
    current_status: str = "alive"   # alive, dead, missing, unknown
    current_location: str = ""
    current_emotional_state: str = ""
    current_goal: str = ""          # What they're trying to do right now
    inventory: List[str] = field(default_factory=list)  # Items they carry

    # Writing Rules
    dialogue_rules: List[str] = field(default_factory=list)
    # e.g., ["从不主动提起过去", "紧张时会摸耳朵"]
    behavioral_rules: List[str] = field(default_factory=list)
    # e.g., ["遇到危险时会先保护弱者", "从不撒谎但会隐瞒"]

    # Metadata
    first_appearance: int = -1      # Chapter index
    last_appearance: int = -1       # Chapter index
    total_appearances: int = 0
    notes: str = ""

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "aliases": self.aliases,
            "role": self.role,
            "age": self.age,
            "gender": self.gender,
            "appearance": self.appearance,
            "distinguishing_features": self.distinguishing_features,
            "traits": [t.to_dict() for t in self.traits],
            "core_belief": self.core_belief,
            "motivation": self.motivation,
            "fear": self.fear,
            "desire": self.desire,
            "flaw": self.flaw,
            "voice": self.voice.to_dict(),
            "backstory": self.backstory,
            "key_memories": self.key_memories,
            "secrets": self.secrets,
            "relationships": [r.to_dict() for r in self.relationships],
            "arc": self.arc.to_dict(),
            "current_status": self.current_status,
            "current_location": self.current_location,
            "current_emotional_state": self.current_emotional_state,
            "current_goal": self.current_goal,
            "inventory": self.inventory,
            "dialogue_rules": self.dialogue_rules,
            "behavioral_rules": self.behavioral_rules,
            "first_appearance": self.first_appearance,
            "last_appearance": self.last_appearance,
            "total_appearances": self.total_appearances,
            "notes": self.notes,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "CharacterCard":
        card = cls()
        card.id = data.get("id", "")
        card.name = data.get("name", "")
        card.aliases = data.get("aliases", [])
        card.role = data.get("role", "supporting")
        card.age = data.get("age", "")
        card.gender = data.get("gender", "")
        card.appearance = data.get("appearance", "")
        card.distinguishing_features = data.get("distinguishing_features", [])
        card.traits = [CharacterTrait(**t) for t in data.get("traits", [])]
        card.core_belief = data.get("core_belief", "")
        card.motivation = data.get("motivation", "")
        card.fear = data.get("fear", "")
        card.desire = data.get("desire", "")
        card.flaw = data.get("flaw", "")
        card.voice = VoiceProfile(**data.get("voice", {}))
        card.backstory = data.get("backstory", "")
        card.key_memories = data.get("key_memories", [])
        card.secrets = data.get("secrets", [])
        card.relationships = [CharacterRelationship(**r) for r in data.get("relationships", [])]
        card.arc = CharacterArc(**data.get("arc", {}))
        card.current_status = data.get("current_status", "alive")
        card.current_location = data.get("current_location", "")
        card.current_emotional_state = data.get("current_emotional_state", "")
        card.current_goal = data.get("current_goal", "")
        card.inventory = data.get("inventory", [])
        card.dialogue_rules = data.get("dialogue_rules", [])
        card.behavioral_rules = data.get("behavioral_rules", [])
        card.first_appearance = data.get("first_appearance", -1)
        card.last_appearance = data.get("last_appearance", -1)
        card.total_appearances = data.get("total_appearances", 0)
        card.notes = data.get("notes", "")
        return card

    # -- Quick migration from old simple format --

    @classmethod
    def from_simple(cls, simple: dict) -> "CharacterCard":
        """Create a CharacterCard from the old simple character format."""
        card = cls(
            id=simple.get("id", ""),
            name=simple.get("name", ""),
            appearance=simple.get("appearance", ""),
            backstory=simple.get("background", ""),
            notes=simple.get("notes", ""),
        )
        # Parse personality into traits
        personality = simple.get("personality", "")
        if personality:
            card.traits.append(CharacterTrait(
                name="性格",
                description=personality,
                intensity=7,
            ))
        # Parse catchphrase into voice
        catchphrase = simple.get("catchphrase", "")
        if catchphrase:
            card.voice.catchphrases = [catchphrase]
        return card


class CharacterCardManager:
    """Manages a collection of character cards with consistency checking."""

    def __init__(self):
        self.cards: Dict[str, CharacterCard] = {}  # id -> CharacterCard

    def add(self, card: CharacterCard) -> str:
        if not card.id:
            import hashlib
            from datetime import datetime
            card.id = hashlib.md5(
                (card.name + datetime.now().isoformat()).encode()
            ).hexdigest()[:10]
        self.cards[card.id] = card
        return card.id

    def remove(self, card_id: str) -> bool:
        if card_id in self.cards:
            del self.cards[card_id]
            return True
        return False

    def get(self, card_id: str) -> Optional[CharacterCard]:
        return self.cards.get(card_id)

    def get_by_name(self, name: str) -> Optional[CharacterCard]:
        for card in self.cards.values():
            if card.name == name or name in card.aliases:
                return card
        return None

    def get_all(self) -> List[CharacterCard]:
        return list(self.cards.values())

    def get_protagonists(self) -> List[CharacterCard]:
        return [c for c in self.cards.values() if c.role == "protagonist"]

    def get_active_characters(self, chapter_idx: int) -> List[CharacterCard]:
        """Get characters who have appeared recently."""
        return [
            c for c in self.cards.values()
            if c.last_appearance >= max(0, chapter_idx - 5)
        ]

    def record_appearance(self, card_id: str, chapter_idx: int):
        card = self.cards.get(card_id)
        if card:
            if card.first_appearance < 0:
                card.first_appearance = chapter_idx
            card.last_appearance = chapter_idx
            card.total_appearances += 1

    def update_state(self, card_id: str, **kwargs):
        """Update character's dynamic state."""
        card = self.cards.get(card_id)
        if card:
            for key, value in kwargs.items():
                if hasattr(card, key):
                    setattr(card, key, value)

    # -- Consistency Checking --

    def check_name_consistency(self, text: str) -> List[Dict]:
        """Check if character names are used consistently in text."""
        issues = []
        for card in self.cards.values():
            name = card.name
            if not name:
                continue
            # Check for partial name matches that might indicate inconsistency
            for alias in card.aliases:
                if alias in text and name not in text:
                    issues.append({
                        "type": "name_alias_mismatch",
                        "character": name,
                        "detail": f"文本中使用了别名「{alias}」而非正式名「{name}」",
                        "severity": "low",
                    })

        # Check for potential duplicate characters (similar names)
        names = [c.name for c in self.cards.values() if c.name]
        for i, n1 in enumerate(names):
            for n2 in names[i + 1:]:
                if self._names_similar(n1, n2):
                    issues.append({
                        "type": "similar_names",
                        "characters": [n1, n2],
                        "detail": f"「{n1}」和「{n2}」名字相似，可能造成混淆",
                        "severity": "medium",
                    })

        return issues

    def check_voice_consistency(self, character_name: str,
                                  dialogue_lines: List[str]) -> List[Dict]:
        """Check if dialogue matches the character's voice profile."""
        card = self.get_by_name(character_name)
        if not card or not card.voice.speech_style:
            return []

        issues = []
        for line in dialogue_lines:
            # Check forbidden words
            for word in card.voice.forbidden_words:
                if word in line:
                    issues.append({
                        "type": "forbidden_word",
                        "character": character_name,
                        "line": line,
                        "detail": f"「{character_name}」不应该说「{word}」",
                        "severity": "high",
                    })

        return issues

    def _names_similar(self, n1: str, n2: str) -> bool:
        """Check if two names are similar enough to cause confusion."""
        if n1 == n2:
            return True
        # Check if one contains the other
        if n1 in n2 or n2 in n1:
            return True
        # Check first character same (common in Chinese names)
        if len(n1) >= 2 and len(n2) >= 2 and n1[0] == n2[0]:
            # Same surname, similar given name length
            if abs(len(n1) - len(n2)) <= 1:
                return True
        return False

    # -- Serialization --

    def to_dict(self) -> dict:
        return {cid: c.to_dict() for cid, c in self.cards.items()}

    @classmethod
    def from_dict(cls, data: dict) -> "CharacterCardManager":
        mgr = cls()
        for cid, cdata in data.items():
            mgr.cards[cid] = CharacterCard.from_dict(cdata)
        return mgr

    @classmethod
    def from_simple_list(cls, simple_list: List[dict]) -> "CharacterCardManager":
        """Create from the old simple character list format."""
        mgr = cls()
        for s in simple_list:
            card = CharacterCard.from_simple(s)
            if not card.id:
                import hashlib
                from datetime import datetime
                card.id = hashlib.md5(
                    (card.name + datetime.now().isoformat()).encode()
                ).hexdigest()[:10]
            mgr.cards[card.id] = card
        return mgr


# -- Prompt Builders --

def build_character_card_prompt_for_ai(card: CharacterCard) -> str:
    """Build a character card string suitable for injection into AI prompts."""
    parts = [f"【{card.name}】"]

    if card.role:
        role_map = {"protagonist": "主角", "antagonist": "反派",
                    "supporting": "配角", "minor": "龙套"}
        parts.append(f"角色定位：{role_map.get(card.role, card.role)}")

    if card.appearance:
        parts.append(f"外貌：{card.appearance}")

    if card.traits:
        trait_descs = []
        for t in card.traits:
            suffix = "（缺陷）" if t.is_flaw else ""
            trait_descs.append(f"{t.name}{suffix}: {t.description}" if t.description else t.name)
        parts.append(f"性格：{'、'.join(trait_descs)}")

    if card.motivation:
        parts.append(f"动机：{card.motivation}")

    if card.flaw:
        parts.append(f"缺陷：{card.flaw}")

    if card.voice.speech_style:
        parts.append(f"说话风格：{card.voice.speech_style}")

    if card.voice.catchphrases:
        parts.append(f"口头禅：{'、'.join(card.voice.catchphrases)}")

    if card.dialogue_rules:
        parts.append(f"对话规则：{'; '.join(card.dialogue_rules)}")

    if card.behavioral_rules:
        parts.append(f"行为规则：{'; '.join(card.behavioral_rules)}")

    if card.current_emotional_state:
        parts.append(f"当前状态：{card.current_emotional_state}")

    if card.current_goal:
        parts.append(f"当前目标：{card.current_goal}")

    return "\n".join(parts)


def build_all_characters_context(cards: List[CharacterCard]) -> str:
    """Build context string for all characters."""
    if not cards:
        return ""
    sections = [build_character_card_prompt_for_ai(c) for c in cards]
    return "【角色卡】\n" + "\n\n".join(sections)


def build_character_consistency_prompt(card: CharacterCard,
                                         recent_text: str) -> str:
    """Build a prompt to check character consistency in recent text."""
    return f"""你是一个小说编辑。检查以下文本中「{card.name}」的行为和对话是否与角色设定一致。

【角色设定】
{build_character_card_prompt_for_ai(card)}

【近期文本】
{recent_text}

【检查维度】
1. 性格一致性：行为是否符合角色性格？
2. 对话一致性：说话方式是否符合角色说话风格？
3. 动机一致性：行为是否符合角色动机？
4. 能力一致性：做的事情是否在角色能力范围内？
5. 关系一致性：与其他角色的互动是否符合关系设定？

如果发现问题，请指出：
- 具体是哪句话/哪个行为
- 为什么与角色设定不符
- 如何修改

如果没有问题，说明检查通过。"""


def build_voice_generation_prompt(card: CharacterCard,
                                    context: str = "") -> str:
    """Build a prompt to generate dialogue in this character's voice."""
    voice_rules = []
    if card.voice.speech_style:
        voice_rules.append(f"- 说话风格：{card.voice.speech_style}")
    if card.voice.vocabulary_level:
        voice_rules.append(f"- 词汇水平：{card.voice.vocabulary_level}")
    if card.voice.sentence_length:
        voice_rules.append(f"- 句子长度：{card.voice.sentence_length}")
    if card.voice.catchphrases:
        voice_rules.append(f"- 口头禅：{'、'.join(card.voice.catchphrases)}")
    if card.voice.verbal_tics:
        voice_rules.append(f"- 语言习惯：{'、'.join(card.voice.verbal_tics)}")
    if card.voice.forbidden_words:
        voice_rules.append(f"- 禁用词汇：{'、'.join(card.voice.forbidden_words)}")
    if card.voice.emotional_speech:
        for emotion, style in card.voice.emotional_speech.items():
            voice_rules.append(f"- {emotion}时：{style}")

    return f"""为以下角色生成对话。

【角色信息】
姓名：{card.name}
性格：{', '.join(t.name for t in card.traits)}
当前情绪：{card.current_emotional_state or '正常'}

【对话规则】
{chr(10).join(voice_rules) if voice_rules else '（未设定特殊规则）'}

{f"【场景上下文】{context}" if context else ""}

请生成符合该角色性格和说话风格的对话。不要使用角色不会说的话。"""
