# Kealin AI Novels - Extended Modules
# v3.0: Enhanced memory, scene control, character cards, quality checking, auth, database

from .config import (
    APP_VERSION, APP_NAME, APP_SUBTITLE,
    BANNED_WORDS, AI_TRANSITION_WORDS, AI_WORD_MAPPINGS,
    DEFAULT_HOST, DEFAULT_PORT, DEFAULT_DEBUG,
    CN_CHAR_RATIO, EN_WORD_RATIO, PUNCT_RATIO,
)
from .auth import require_auth, get_api_secret, AUTH_ENABLED
from .database import init_db, save_project_state, save_chapter, get_project_state, list_projects, get_chapters
from .memory import (
    HierarchicalMemory, MemoryEntry, ChapterSummary, SemanticIndex,
    parse_summary_text, build_auto_summary_prompt, build_fact_extraction_prompt,
)
from .scene import (
    SceneInfo, SceneTransition, ChapterScenePlan,
    SceneType, EmotionalBeat, PacingLevel,
    analyze_pacing, detect_scene_breaks,
    build_scene_plan_prompt, build_scene_content_prompt,
)
from .character import (
    CharacterCard, CharacterCardManager,
    CharacterTrait, VoiceProfile, CharacterRelationship, CharacterArc,
    build_character_card_prompt_for_ai, build_all_characters_context,
    build_character_consistency_prompt, build_voice_generation_prompt,
)
from .quality import (
    QualityReport, QualityIssue,
    calculate_ai_taste_score, analyze_readability, analyze_style_consistency,
    generate_quality_report, build_quality_check_prompt,
    detect_banned_words, detect_dialogue_lines, detect_dialogue_tags,
)

__all__ = [
    # Config
    "APP_VERSION", "APP_NAME", "APP_SUBTITLE",
    "BANNED_WORDS", "AI_TRANSITION_WORDS", "AI_WORD_MAPPINGS",
    "DEFAULT_HOST", "DEFAULT_PORT", "DEFAULT_DEBUG",
    "CN_CHAR_RATIO", "EN_WORD_RATIO", "PUNCT_RATIO",
    # Auth
    "require_auth", "get_api_secret", "AUTH_ENABLED",
    # Database
    "init_db", "save_project_state", "save_chapter", "get_project_state", "list_projects", "get_chapters",
    # Memory
    "HierarchicalMemory", "MemoryEntry", "ChapterSummary", "SemanticIndex",
    "parse_summary_text", "build_auto_summary_prompt", "build_fact_extraction_prompt",
    # Scene
    "SceneInfo", "SceneTransition", "ChapterScenePlan",
    "SceneType", "EmotionalBeat", "PacingLevel",
    "analyze_pacing", "detect_scene_breaks",
    "build_scene_plan_prompt", "build_scene_content_prompt",
    # Character
    "CharacterCard", "CharacterCardManager",
    "CharacterTrait", "VoiceProfile", "CharacterRelationship", "CharacterArc",
    "build_character_card_prompt_for_ai", "build_all_characters_context",
    "build_character_consistency_prompt", "build_voice_generation_prompt",
    # Quality
    "QualityReport", "QualityIssue",
    "calculate_ai_taste_score", "analyze_readability", "analyze_style_consistency",
    "generate_quality_report", "build_quality_check_prompt",
    "detect_banned_words", "detect_dialogue_lines", "detect_dialogue_tags",
]
