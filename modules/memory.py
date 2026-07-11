"""
Enhanced Memory System Module
Implements auto-summarization, semantic retrieval, and hierarchical memory management.

Memory hierarchy:
  1. Working Memory (current chapter context) - immediate
  2. Short-term Memory (recent chapter summaries) - last N chapters
  3. Long-term Memory (semantic-indexed key facts) - full novel
  4. Permanent Memory (author-mandated rules) - always injected
"""

import json
import re
import hashlib
from datetime import datetime
from typing import List, Dict, Optional, Tuple


class MemoryEntry:
    """A single memory unit with metadata for semantic retrieval."""

    def __init__(self, content: str, entry_type: str = "fact",
                 chapter_idx: int = -1, tags: List[str] = None,
                 importance: int = 5, created_at: str = None):
        self.id = hashlib.md5(
            (content + str(chapter_idx) + (created_at or "")).encode()
        ).hexdigest()[:12]
        self.content = content
        self.entry_type = entry_type  # fact, event, character_state, plot_thread, setting, foreshadowing
        self.chapter_idx = chapter_idx
        self.tags = tags or []
        self.importance = importance  # 1-10
        self.created_at = created_at or datetime.now().isoformat()
        self.access_count = 0
        self.last_accessed = None
        self.decay_factor = 1.0  # For recency-weighted retrieval

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "content": self.content,
            "entry_type": self.entry_type,
            "chapter_idx": self.chapter_idx,
            "tags": self.tags,
            "importance": self.importance,
            "created_at": self.created_at,
            "access_count": self.access_count,
            "decay_factor": self.decay_factor,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "MemoryEntry":
        entry = cls(
            content=data["content"],
            entry_type=data.get("entry_type", "fact"),
            chapter_idx=data.get("chapter_idx", -1),
            tags=data.get("tags", []),
            importance=data.get("importance", 5),
            created_at=data.get("created_at"),
        )
        entry.id = data.get("id", entry.id)
        entry.access_count = data.get("access_count", 0)
        entry.decay_factor = data.get("decay_factor", 1.0)
        return entry


class ChapterSummary:
    """Structured summary for a single chapter."""

    def __init__(self, chapter_idx: int, title: str = ""):
        self.chapter_idx = chapter_idx
        self.title = title
        self.narrative = ""        # 50-100 word summary
        self.characters = {}       # {name: state_change}
        self.foreshadowing = []    # Plot threads opened
        self.callbacks = []        # Previous threads advanced
        self.end_state = ""        # Where we left off
        self.scene_breakdown = []  # List of SceneInfo
        self.emotional_arc = ""    # Emotional trajectory
        self.key_dialogues = []    # Important dialogue snippets
        self.created_at = datetime.now().isoformat()

    def to_dict(self) -> dict:
        return {
            "chapter_idx": self.chapter_idx,
            "title": self.title,
            "narrative": self.narrative,
            "characters": self.characters,
            "foreshadowing": self.foreshadowing,
            "callbacks": self.callbacks,
            "end_state": self.end_state,
            "scene_breakdown": [s.to_dict() if hasattr(s, "to_dict") else s for s in self.scene_breakdown],
            "emotional_arc": self.emotional_arc,
            "key_dialogues": self.key_dialogues,
            "created_at": self.created_at,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "ChapterSummary":
        s = cls(data["chapter_idx"], data.get("title", ""))
        s.narrative = data.get("narrative", "")
        s.characters = data.get("characters", {})
        s.foreshadowing = data.get("foreshadowing", [])
        s.callbacks = data.get("callbacks", [])
        s.end_state = data.get("end_state", "")
        s.scene_breakdown = data.get("scene_breakdown", [])
        s.emotional_arc = data.get("emotional_arc", "")
        s.key_dialogues = data.get("key_dialogues", [])
        s.created_at = data.get("created_at", "")
        return s


class SemanticIndex:
    """Simple keyword-based semantic index for memory retrieval.

    Uses TF-IDF-like scoring with Chinese text tokenization (character n-grams).
    For production, replace with embedding-based search.
    """

    def __init__(self):
        self._index: Dict[str, List[Tuple[str, float]]] = {}  # token -> [(entry_id, weight)]
        self._entries: Dict[str, MemoryEntry] = {}

    def _tokenize(self, text: str) -> List[str]:
        """Simple Chinese tokenization using character bigrams + word boundaries."""
        text = text.lower().strip()
        # Extract Chinese character bigrams
        chars = re.findall(r'[一-龥]', text)
        bigrams = [chars[i] + chars[i + 1] for i in range(len(chars) - 1)]
        # Also keep individual characters for single-char important words
        unigrams = chars
        # Extract alphanumeric tokens
        alphanum = re.findall(r'[a-z0-9]+', text)
        return list(set(bigrams + unigrams + alphanum))

    def add(self, entry: MemoryEntry):
        self._entries[entry.id] = entry
        tokens = self._tokenize(entry.content)
        for token in tokens:
            if token not in self._index:
                self._index[token] = []
            weight = entry.importance / 10.0 * entry.decay_factor
            self._index[token].append((entry.id, weight))

    def remove(self, entry_id: str):
        if entry_id in self._entries:
            del self._entries[entry_id]
        for token in list(self._index.keys()):
            self._index[token] = [(eid, w) for eid, w in self._index[token] if eid != entry_id]
            if not self._index[token]:
                del self._index[token]

    def search(self, query: str, top_k: int = 10,
               entry_types: List[str] = None,
               min_importance: int = 1,
               recency_weight: float = 0.2,
               importance_weight: float = 0.3,
               relevance_weight: float = 0.5) -> List[Tuple[MemoryEntry, float]]:
        """Enhanced semantic search with multi-factor scoring.

        Combines keyword relevance, recency (decay factor), and importance
        into a single score. Inspired by LangChain's hybrid retrieval strategy.

        score = relevance_weight * normalized_relevance
              + recency_weight * decay_factor
              + importance_weight * importance/10
        """
        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        # Calculate raw keyword match scores
        raw_scores: Dict[str, float] = {}
        for token in query_tokens:
            if token in self._index:
                for entry_id, weight in self._index[token]:
                    if entry_id not in raw_scores:
                        raw_scores[entry_id] = 0.0
                    raw_scores[entry_id] += weight

        # Normalize relevance to [0, 1]
        max_raw = max(raw_scores.values()) if raw_scores else 1.0

        results = []
        for entry_id, raw_score in raw_scores.items():
            entry = self._entries.get(entry_id)
            if not entry:
                continue
            if entry_types and entry.entry_type not in entry_types:
                continue
            if entry.importance < min_importance:
                continue

            normalized_relevance = raw_score / max_raw if max_raw > 0 else 0.0
            recency_score = entry.decay_factor
            importance_score = entry.importance / 10.0

            final_score = (
                relevance_weight * normalized_relevance
                + recency_weight * recency_score
                + importance_weight * importance_score
            )

            entry.access_count += 1
            entry.last_accessed = datetime.now().isoformat()
            results.append((entry, final_score))

        results.sort(key=lambda x: -x[1])
        return results[:top_k]

    def to_dict(self) -> dict:
        return {
            "entries": {eid: e.to_dict() for eid, e in self._entries.items()},
        }

    @classmethod
    def from_dict(cls, data: dict) -> "SemanticIndex":
        idx = cls()
        for eid, edata in data.get("entries", {}).items():
            entry = MemoryEntry.from_dict(edata)
            idx.add(entry)
        return idx


class HierarchicalMemory:
    """Full hierarchical memory system combining all layers."""

    def __init__(self):
        self.permanent_memories: List[str] = []          # Author-mandated, always injected
        self.chapter_summaries: Dict[int, ChapterSummary] = {}  # idx -> summary
        self.semantic_index = SemanticIndex()              # Long-term fact store
        self.working_context: Dict = {}                    # Current chapter context
        self.max_recent_chapters = 10                      # Sliding window size

    # -- Permanent Memory --

    def add_permanent(self, content: str):
        if content and content.strip() and content.strip() not in self.permanent_memories:
            self.permanent_memories.append(content.strip())

    def remove_permanent(self, index: int):
        if 0 <= index < len(self.permanent_memories):
            self.permanent_memories.pop(index)

    def update_permanent(self, index: int, content: str):
        if 0 <= index < len(self.permanent_memories):
            self.permanent_memories[index] = content.strip()

    def get_permanent_context(self) -> str:
        if not self.permanent_memories:
            return ""
        items = "\n".join(f"{i+1}. {m}" for i, m in enumerate(self.permanent_memories))
        return (
            f"【作者永久记忆 - 必须严格遵守】\n"
            f"以下是作者特别强调的重要设定和要求，在整个创作过程中必须严格遵守：\n{items}"
        )

    # -- Chapter Summaries --

    def add_summary(self, summary: ChapterSummary):
        self.chapter_summaries[summary.chapter_idx] = summary
        # Index key facts from summary into semantic store
        self._index_summary_facts(summary)

    def _index_summary_facts(self, summary: ChapterSummary):
        """Extract and index key facts from a chapter summary."""
        idx = summary.chapter_idx
        # Index narrative
        if summary.narrative:
            self.semantic_index.add(MemoryEntry(
                content=summary.narrative,
                entry_type="event",
                chapter_idx=idx,
                tags=["summary"],
                importance=7,
            ))
        # Index character states
        for name, state in summary.characters.items():
            self.semantic_index.add(MemoryEntry(
                content=f"{name}: {state}",
                entry_type="character_state",
                chapter_idx=idx,
                tags=["character", name],
                importance=8,
            ))
        # Index foreshadowing
        for fs in summary.foreshadowing:
            self.semantic_index.add(MemoryEntry(
                content=fs,
                entry_type="foreshadowing",
                chapter_idx=idx,
                tags=["foreshadowing", "plot"],
                importance=9,
            ))

    def get_previous_chapters_context(self, current_idx: int,
                                       max_chapters: int = None) -> str:
        """Get context from previous chapters using summaries with sliding window."""
        max_ch = max_chapters or self.max_recent_chapters
        prev = []
        start = max(0, current_idx - max_ch)

        for i in range(start, current_idx):
            summary = self.chapter_summaries.get(i)
            if summary:
                title = summary.title or f"第{i+1}章"
                text = summary.narrative or "(无摘要)"
                # Add character state changes if present
                if summary.characters:
                    char_info = "; ".join(f"{k}→{v}" for k, v in summary.characters.items())
                    text += f"\n角色变化: {char_info}"
                # Add active foreshadowing
                if summary.foreshadowing:
                    text += f"\n伏笔: {', '.join(summary.foreshadowing)}"
                # Add end state
                if summary.end_state:
                    text += f"\n结尾状态: {summary.end_state}"
                prev.append(f"【{title}】\n{text}")
            # Fallback: if no summary but we know chapter index exists, note it
            # (caller should have provided chapter content externally)

        if not prev:
            return "（这是第一章，暂无前文内容）"
        return "\n\n---\n\n".join(prev)

    # -- Semantic Retrieval --

    def add_fact(self, content: str, entry_type: str = "fact",
                 chapter_idx: int = -1, tags: List[str] = None,
                 importance: int = 5):
        entry = MemoryEntry(
            content=content,
            entry_type=entry_type,
            chapter_idx=chapter_idx,
            tags=tags or [],
            importance=importance,
        )
        self.semantic_index.add(entry)
        return entry

    def search_memories(self, query: str, top_k: int = 10,
                        entry_types: List[str] = None) -> List[Tuple[MemoryEntry, float]]:
        return self.semantic_index.search(query, top_k, entry_types)

    def get_relevant_context(self, query: str, current_chapter_idx: int) -> str:
        """Get semantically relevant context for the current writing task."""
        results = self.search_memories(query, top_k=5, min_importance=4)
        if not results:
            return ""

        items = []
        for entry, score in results:
            source = f"(第{entry.chapter_idx+1}章)" if entry.chapter_idx >= 0 else ""
            items.append(f"- [{entry.entry_type}] {entry.content} {source}")

        return (
            f"【语义相关记忆】\n"
            f"以下信息与当前写作内容相关（共{len(results)}条）：\n" +
            "\n".join(items)
        )

    # -- Working Context --

    def set_working_context(self, **kwargs):
        self.working_context.update(kwargs)

    def get_working_context(self) -> dict:
        return self.working_context.copy()

    # -- Full Context Builder --

    def build_generation_context(self, current_chapter_idx: int,
                                  query_text: str = "",
                                  include_permanent: bool = True,
                                  include_previous: bool = True,
                                  include_semantic: bool = True) -> str:
        """Build the complete memory context for content generation."""
        parts = []

        if include_permanent:
            perm = self.get_permanent_context()
            if perm:
                parts.append(perm)

        if include_previous:
            prev = self.get_previous_chapters_context(current_chapter_idx)
            if prev:
                parts.append(
                    f"【前面章节摘要 - 保持连贯性】\n{prev}"
                )

        if include_semantic and query_text:
            sem = self.get_relevant_context(query_text, current_chapter_idx)
            if sem:
                parts.append(sem)

        return "\n\n".join(parts)

    # -- Auto Consolidation & Stats --

    def auto_consolidate(self, consolidator: "MemoryConsolidator" = None) -> Optional[dict]:
        """Auto-check and consolidate memory if entries exceed threshold.

        Returns:
            Consolidation stats dict, or None if not triggered.
        """
        if consolidator is None:
            consolidator = MemoryConsolidator()

        if not consolidator.should_consolidate(self):
            return None

        return consolidator.consolidate(self)

    def get_memory_stats(self) -> dict:
        """Return memory system statistics.

        Returns:
            Dict with: total_entries, type_distribution, avg_importance,
            estimated_tokens, chapter_count, permanent_count.
        """
        entries = list(self.semantic_index._entries.values())
        total = len(entries)

        type_dist: Dict[str, int] = {}
        for entry in entries:
            type_dist[entry.entry_type] = type_dist.get(entry.entry_type, 0) + 1

        avg_imp = sum(e.importance for e in entries) / total if total > 0 else 0.0

        all_text = " ".join(e.content for e in entries)
        all_text += " ".join(self.permanent_memories)
        for summary in self.chapter_summaries.values():
            all_text += summary.narrative or ""
        estimated_tokens = TokenEstimator.estimate_tokens(all_text)

        return {
            "total_entries": total,
            "type_distribution": type_dist,
            "avg_importance": round(avg_imp, 2),
            "estimated_tokens": estimated_tokens,
            "chapter_count": len(self.chapter_summaries),
            "permanent_count": len(self.permanent_memories),
        }

    def compress_context(self, text: str, max_tokens: int = 8000) -> str:
        """Compress context text to fit within token budget.

        Strategy: Keep paragraphs from the tail (most recent/important),
        truncate from the front if needed.

        Args:
            text: Context text to compress
            max_tokens: Target token上限

        Returns:
            Compressed text
        """
        current_tokens = TokenEstimator.estimate_tokens(text)
        if current_tokens <= max_tokens:
            return text

        paragraphs = re.split(r'\n\n+', text)
        if not paragraphs:
            return text

        result_parts = []
        token_budget = max_tokens

        for para in reversed(paragraphs):
            para_tokens = TokenEstimator.estimate_tokens(para)
            if para_tokens <= token_budget:
                result_parts.insert(0, para)
                token_budget -= para_tokens
            else:
                if not result_parts:
                    ratio = max_tokens / para_tokens if para_tokens > 0 else 1.0
                    truncated_len = max(100, int(len(para) * ratio))
                    result_parts.insert(0, para[:truncated_len] + "……（已压缩）")
                break

        return "\n\n".join(result_parts)

    # -- Serialization --

    def to_dict(self) -> dict:
        return {
            "permanent_memories": self.permanent_memories,
            "chapter_summaries": {
                str(k): v.to_dict() for k, v in self.chapter_summaries.items()
            },
            "semantic_index": self.semantic_index.to_dict(),
            "max_recent_chapters": self.max_recent_chapters,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "HierarchicalMemory":
        mem = cls()
        mem.permanent_memories = data.get("permanent_memories", [])
        for k, v in data.get("chapter_summaries", {}).items():
            mem.chapter_summaries[int(k)] = ChapterSummary.from_dict(v)
        mem.semantic_index = SemanticIndex.from_dict(data.get("semantic_index", {}))
        mem.max_recent_chapters = data.get("max_recent_chapters", 10)
        return mem


# -- Summary Parsing Utility --

def parse_summary_text(text: str, chapter_idx: int, title: str = "") -> ChapterSummary:
    """Parse structured summary text (from LLM output) into a ChapterSummary object."""
    summary = ChapterSummary(chapter_idx, title)

    # Extract narrative
    m = re.search(r'【本章摘要】\s*(.+?)(?=【|$)', text, re.DOTALL)
    if m:
        summary.narrative = m.group(1).strip()

    # Extract characters
    m = re.search(r'【出场角色】\s*(.+?)(?=【|$)', text, re.DOTALL)
    if m:
        for line in m.group(1).strip().split('\n'):
            line = line.strip().lstrip('- ')
            if '：' in line:
                name, state = line.split('：', 1)
                summary.characters[name.strip()] = state.strip()
            elif ':' in line:
                name, state = line.split(':', 1)
                summary.characters[name.strip()] = state.strip()

    # Extract foreshadowing
    m = re.search(r'【伏笔/悬念】\s*(.+?)(?=【|$)', text, re.DOTALL)
    if m:
        summary.foreshadowing = [
            line.strip().lstrip('- ')
            for line in m.group(1).strip().split('\n')
            if line.strip()
        ]

    # Extract callbacks
    m = re.search(r'【与前文关联】\s*(.+?)(?=【|$)', text, re.DOTALL)
    if m:
        summary.callbacks = [
            line.strip().lstrip('- ')
            for line in m.group(1).strip().split('\n')
            if line.strip()
        ]

    # Extract end state
    m = re.search(r'【结尾状态】\s*(.+?)$', text, re.DOTALL)
    if m:
        summary.end_state = m.group(1).strip()

    return summary


# -- Auto-summary Prompt Builder --

def build_auto_summary_prompt(chapter_content: str, chapter_outline: str = "") -> str:
    """Build a prompt for the LLM to auto-generate a structured chapter summary."""
    return f"""你是一个小说编辑。请为以下章节内容生成一个结构化摘要，用于帮助AI在生成后续章节时保持连贯性。

【章节大纲】
{chapter_outline}

【章节内容】
{chapter_content}

【摘要要求】
1. 用第三人称概述本章发生的主要事件（50-100字）
2. 列出本章出场的角色及其状态变化（具体写清楚发生了什么变化）
3. 记录本章埋下的伏笔或悬念（具体到哪句话/哪个细节暗示了什么）
4. 记录本章与前文的呼应关系
5. 记录本章结尾的状态（为下一章做铺垫）
6. 标注本章的情绪走向（从什么情绪到什么情绪）
7. 提取本章中最重要的1-2句对话（推动剧情的）

请按以下格式输出：
【本章摘要】（50-100字）
【出场角色】角色名：状态变化
【伏笔/悬念】具体伏笔内容
【与前文关联】呼应了什么
【结尾状态】本章结束时的情况
【情绪走向】开始情绪 → 结束情绪
【关键对话】最重要的对话（可选）"""


# -- Semantic Memory Prompt Builder --

def build_fact_extraction_prompt(chapter_content: str) -> str:
    """Build a prompt to extract key facts for long-term semantic memory."""
    return f"""你是一个小说资料员。请从以下章节内容中提取关键事实，这些事实将被存入长期记忆库，在后续章节生成时用于保持一致性。

【章节内容】
{chapter_content}

【提取要求】
请提取以下类型的关键事实，每条事实单独一行：

1. 【人物事实】角色的身份、能力、习惯、关系变化等
2. 【设定事实】世界观规则、地名、势力、物品等
3. 【剧情事实】已发生的重大事件、已确认的信息
4. 【伏笔事实】已埋下但未揭示的伏笔

格式：
[类型] 具体事实内容

请只提取确实存在于文本中的事实，不要编造。每条事实应该简洁明确（不超过50字）。"""


# ============================================================
#  MemoryConsolidator — 借鉴 mem0 的记忆整合管理
# ============================================================

class MemoryConsolidator:
    """记忆整合器，借鉴 mem0 的记忆管理策略。

    当记忆条目过多时，自动执行衰减、修剪、合并，保持记忆库精简高效。
    """

    def __init__(self, max_entries: int = 200, decay_rate: float = 0.95):
        """
        Args:
            max_entries: 触发整合的条目数阈值
            decay_rate: 每次整合时的衰减因子（0~1）
        """
        self.max_entries = max_entries
        self.decay_rate = decay_rate

    def should_consolidate(self, memory: "HierarchicalMemory") -> bool:
        """检查是否需要整合记忆（条目数超过阈值）。"""
        return len(memory.semantic_index._entries) > self.max_entries

    def consolidate(self, memory: "HierarchicalMemory") -> dict:
        """执行完整的记忆整合流程：衰减 -> 修剪 -> 合并。

        Returns:
            整合统计信息 dict
        """
        before_count = len(memory.semantic_index._entries)

        # 第一步：对所有条目应用衰减
        self._decay_all(memory)

        # 第二步：移除低价值条目
        pruned = self._prune_low_value(memory)

        # 第三步：合并相似条目
        merged = self._merge_similar(memory)

        after_count = len(memory.semantic_index._entries)

        return {
            "before_count": before_count,
            "after_count": after_count,
            "pruned": pruned,
            "merged": merged,
            "reduced": before_count - after_count,
        }

    def _decay_all(self, memory: "HierarchicalMemory"):
        """对所有条目应用衰减因子，使较老的记忆逐渐淡化。"""
        for entry in memory.semantic_index._entries.values():
            entry.decay_factor *= self.decay_rate

    def _prune_low_value(self, memory: "HierarchicalMemory") -> int:
        """移除低价值条目：importance * decay_factor < 2.0 且 access_count < 2 的条目。

        Returns:
            被移除的条目数
        """
        to_remove = []
        for entry_id, entry in memory.semantic_index._entries.items():
            effective_value = entry.importance * entry.decay_factor
            if effective_value < 2.0 and entry.access_count < 2:
                to_remove.append(entry_id)

        for entry_id in to_remove:
            memory.semantic_index.remove(entry_id)

        return len(to_remove)

    def _merge_similar(self, memory: "HierarchicalMemory") -> int:
        """合并内容相似度 > 50% 的条目，保留重要度更高的条目。

        Returns:
            被合并的条目数
        """
        entries = list(memory.semantic_index._entries.values())
        removed_count = 0
        already_merged = set()

        for i in range(len(entries)):
            if entries[i].id in already_merged:
                continue
            for j in range(i + 1, len(entries)):
                if entries[j].id in already_merged:
                    continue

                # 只合并同类型的条目
                if entries[i].entry_type != entries[j].entry_type:
                    continue

                sim = self._similarity(entries[i], entries[j])
                if sim > 0.5:
                    # 保留重要度更高的条目
                    if entries[i].importance >= entries[j].importance:
                        keep, remove = entries[i], entries[j]
                    else:
                        keep, remove = entries[j], entries[i]

                    # 将被移除条目的访问次数累加到保留条目上
                    keep.access_count += remove.access_count
                    already_merged.add(remove.id)
                    removed_count += 1

        # 批量移除被合并的条目
        for entry_id in already_merged:
            memory.semantic_index.remove(entry_id)

        return removed_count

    @staticmethod
    def _similarity(e1: "MemoryEntry", e2: "MemoryEntry") -> float:
        """基于字符 n-gram 的相似度计算（Jaccard 系数）。

        使用 bigram 作为特征单位，计算两个条目内容的重叠比例。
        """
        def _get_bigrams(text: str) -> set:
            chars = re.findall(r'[一-龥]', text.lower())
            if len(chars) < 2:
                return set(chars) if chars else set()
            bigrams = {chars[i] + chars[i + 1] for i in range(len(chars) - 1)}
            # 同时保留单字以处理短文本
            return bigrams | set(chars)

        bg1 = _get_bigrams(e1.content)
        bg2 = _get_bigrams(e2.content)

        if not bg1 or not bg2:
            return 0.0

        intersection = bg1 & bg2
        union = bg1 | bg2
        return len(intersection) / len(union) if union else 0.0


# ============================================================
#  TokenEstimator — 借鉴 MemGPT 的上下文窗口监控
# ============================================================

class TokenEstimator:
    """Token 估算工具类，借鉴 MemGPT 的上下文窗口管理思路。

    用于在不调用 tokenizer 的情况下快速估算文本 token 数，
    帮助判断是否需要压缩上下文。
    """

    # 中文字符与 token 的近似比例
    CN_CHAR_RATIO = 1.5    # 中文约 1.5 字/token
    EN_WORD_RATIO = 1.3    # 英文约 1.3 token/word
    PUNCT_RATIO = 0.5      # 标点约 0.5 token/个

    @classmethod
    def estimate_tokens(cls, text: str) -> int:
        """估算文本的 token 数。

        策略：中文字符数 / 1.5 + 英文单词数 * 1.3 + 其他字符数 * 0.5

        Args:
            text: 待估算的文本

        Returns:
            估算的 token 数
        """
        if not text:
            return 0

        # 统计中文字符数
        cn_chars = len(re.findall(r'[一-龥]', text))
        # 统计英文单词数
        en_words = len(re.findall(r'[a-zA-Z]+', text))
        # 其他字符（标点、数字、空格等）
        other_chars = len(text) - cn_chars - sum(len(w) for w in re.findall(r'[a-zA-Z]+', text))
        other_chars = max(0, other_chars)

        tokens = cn_chars / cls.CN_CHAR_RATIO + en_words * cls.EN_WORD_RATIO + other_chars * cls.PUNCT_RATIO
        return max(1, int(tokens))

    @classmethod
    def estimate_context_size(cls, memory: "HierarchicalMemory", chapter_idx: int) -> int:
        """估算生成上下文的 token 总量。

        Args:
            memory: 层级记忆对象
            chapter_idx: 当前章节索引

        Returns:
            估算的上下文 token 总量
        """
        # 永久记忆
        permanent_text = memory.get_permanent_context()
        perm_tokens = cls.estimate_tokens(permanent_text)

        # 前文摘要
        prev_text = memory.get_previous_chapters_context(chapter_idx)
        prev_tokens = cls.estimate_tokens(prev_text)

        # 语义索引中所有条目的总内容量
        all_entries_text = " ".join(
            entry.content for entry in memory.semantic_index._entries.values()
        )
        semantic_tokens = cls.estimate_tokens(all_entries_text)

        return perm_tokens + prev_tokens + semantic_tokens

    @classmethod
    def should_compress(cls, memory: "HierarchicalMemory", chapter_idx: int,
                        max_tokens: int = 8000) -> bool:
        """判断是否需要压缩上下文。

        Args:
            memory: 层级记忆对象
            chapter_idx: 当前章节索引
            max_tokens: 上下文 token 上限

        Returns:
            True 表示需要压缩
        """
        current_tokens = cls.estimate_context_size(memory, chapter_idx)
        return current_tokens > max_tokens


# (Enhanced search is now built into SemanticIndex.search directly — no monkey-patching needed)


# (Enhanced methods auto_consolidate, get_memory_stats, compress_context are now
#  directly defined in HierarchicalMemory class — no monkey-patching needed)


# ============================================================
#  build_consistency_check_prompt — 已废弃
#  原函数从未被任何端点调用（死代码）
#  一致性检查已由 character.py 的 build_character_consistency_prompt 替代
# ============================================================
