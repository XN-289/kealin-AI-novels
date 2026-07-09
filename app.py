"""
Kealin AI Novels — 超级进化版
一个基于大模型的智能小说创作工具
55轮迭代优化，全面增强
"""

from flask import Flask, request, Response, render_template, jsonify
import requests
import json
import logging
import os
import time
from dotenv import load_dotenv

# Import enhanced modules
from modules.memory import (
    HierarchicalMemory, ChapterSummary, parse_summary_text,
    build_auto_summary_prompt, build_fact_extraction_prompt,
)
from modules.scene import (
    SceneInfo, ChapterScenePlan, analyze_pacing, detect_scene_breaks,
    build_scene_plan_prompt, build_scene_content_prompt,
)
from modules.character import (
    CharacterCard, CharacterCardManager,
    build_character_card_prompt_for_ai, build_all_characters_context,
    build_character_consistency_prompt,
)
from modules.quality import (
    QualityReport, generate_quality_report, build_quality_check_prompt,
    calculate_ai_taste_score, analyze_readability,
)

load_dotenv()

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 开发模式下禁用静态文件缓存
@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

# 启动时间（用于健康检查）
START_TIME = time.time()

# ============================================================
# 模型配置 - 修改这里的 API_KEY 和 API_ENDPOINT 即可切换模型
# 支持 OpenAI 兼容格式的所有模型（DeepSeek、通义千问、豆包、Claude等）
# ============================================================

CONFIG = {
    # 主模型 - 用于大纲、章节、正文生成（建议用高质量模型）
    # temperature 0.6: 减少随机修辞，让输出更紧凑
    "primary": {
        "api_key": os.getenv("PRIMARY_API_KEY", "sk-your-key-here"),
        "api_endpoint": os.getenv("PRIMARY_API_ENDPOINT", "https://api.deepseek.com/v1/chat/completions"),
        "model": os.getenv("PRIMARY_MODEL", "deepseek-chat"),
        "temperature": 0.6,
        "max_tokens": 8192,
        "timeout": int(os.getenv("PRIMARY_TIMEOUT", "120")),
    },
    # 辅助模型 - 用于AI迭代优化、拆书等（可用低成本模型）
    "secondary": {
        "api_key": os.getenv("SECONDARY_API_KEY", ""),
        "api_endpoint": os.getenv("SECONDARY_API_ENDPOINT", "https://api.deepseek.com/v1/chat/completions"),
        "model": os.getenv("SECONDARY_MODEL", "deepseek-chat"),
        "temperature": 0.5,
        "max_tokens": 8192,
        "timeout": int(os.getenv("SECONDARY_TIMEOUT", "120")),
    },
}


def build_headers(api_key: str) -> dict:
    """构建请求头"""
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    }


def stream_openai_compat(endpoint: str, headers: dict, payload: dict, timeout: int = 120):
    """处理 OpenAI 兼容格式的流式响应（第39轮：增强错误处理和重试）"""
    max_retries = 3
    retry_count = 0

    while retry_count < max_retries:
        try:
            logger.info(f"调用API: {endpoint}, model: {payload.get('model')}")
            resp = requests.post(endpoint, headers=headers, json=payload, stream=True, timeout=timeout)

            if resp.status_code == 429:
                # 速率限制，等待后重试
                retry_count += 1
                wait_time = min(2 ** retry_count, 10)
                logger.warning(f"速率限制，等待{wait_time}秒后重试 ({retry_count}/{max_retries})")
                time.sleep(wait_time)
                continue

            if resp.status_code != 200:
                error_msg = f"API错误 [{resp.status_code}]: {resp.text[:500]}"
                logger.error(error_msg)
                yield error_msg
                return

            for line in resp.iter_lines():
                if not line:
                    continue
                decoded = line.decode("utf-8")
                if not decoded.startswith("data: "):
                    continue
                data_str = decoded[6:]
                if data_str.strip() == "[DONE]":
                    break
                try:
                    data = json.loads(data_str)
                    delta = data.get("choices", [{}])[0].get("delta", {})
                    content = delta.get("content", "")
                    if content:
                        yield content
                except json.JSONDecodeError:
                    continue

            # 成功完成，退出重试循环
            return

        except requests.exceptions.Timeout:
            retry_count += 1
            if retry_count < max_retries:
                logger.warning(f"请求超时，重试中 ({retry_count}/{max_retries})")
                time.sleep(1)
                continue
            yield "\n[错误: 请求超时，请检查网络或稍后重试]"
            return

        except requests.exceptions.ConnectionError:
            retry_count += 1
            if retry_count < max_retries:
                logger.warning(f"连接失败，重试中 ({retry_count}/{max_retries})")
                time.sleep(2)
                continue
            yield "\n[错误: 无法连接到API服务器，请检查网络]"
            return

        except Exception as e:
            logger.error(f"流式处理异常: {e}")
            yield f"\n[错误: {str(e)}]"
            return


def call_model(prompt: str, model_key: str = "primary"):
    """统一的模型调用入口"""
    cfg = CONFIG[model_key]
    if not cfg["api_key"] or cfg["api_key"] == "sk-your-key-here":
        yield "[错误: 请先在 app.py 或 .env 中配置 API_KEY]"
        return

    headers = build_headers(cfg["api_key"])
    payload = {
        "model": cfg["model"],
        "messages": [{"role": "user", "content": prompt}],
        "stream": True,
        "temperature": cfg["temperature"],
        "max_tokens": cfg["max_tokens"],
    }

    yield from stream_openai_compat(cfg["api_endpoint"], headers, payload, cfg.get("timeout", 120))


# ============================================================
# 路由
# ============================================================

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/docs")
def docs():
    """项目文档页面"""
    return render_template("docs.html")


@app.route("/gen", methods=["POST"])
def generate():
    """主生成接口 - 用于大纲、章节、正文"""
    data = request.json
    prompt = data.get("prompt", "")
    if not prompt:
        return Response("错误: 空提示词", status=400)

    logger.info(f"收到生成请求，prompt长度: {len(prompt)}")
    logger.info(f"使用模型: {CONFIG['primary']['model']}, endpoint: {CONFIG['primary']['api_endpoint']}")

    return Response(
        call_model(prompt, "primary"),
        mimetype="text/plain",
        headers={"X-Accel-Buffering": "no"},
    )


@app.route("/gen2", methods=["POST"])
def generate2():
    """辅助生成接口 - 用于AI迭代优化"""
    data = request.json
    prompt = data.get("prompt", "")
    if not prompt:
        return Response("错误: 空提示词", status=400)

    return Response(
        call_model(prompt, "secondary"),
        mimetype="text/plain",
        headers={"X-Accel-Buffering": "no"},
    )


@app.route("/api/config", methods=["GET"])
def get_config():
    """获取当前模型配置（隐藏密钥）"""
    safe_config = {}
    for key, cfg in CONFIG.items():
        safe_config[key] = {
            "endpoint": cfg["api_endpoint"],
            "model": cfg["model"],
            "has_key": bool(cfg["api_key"]) and cfg["api_key"] != "sk-your-key-here",
            "temperature": cfg["temperature"],
            "max_tokens": cfg["max_tokens"],
            "timeout": cfg.get("timeout", 120),
        }
    return jsonify(safe_config)


@app.route("/api/config", methods=["POST"])
def update_config():
    """运行时更新模型配置"""
    data = request.json
    model_key = data.get("model_key", "primary")
    if model_key not in CONFIG:
        return jsonify({"error": "无效的模型键"}), 400

    cfg = CONFIG[model_key]
    if "api_key" in data:
        cfg["api_key"] = data["api_key"]
    if "api_endpoint" in data:
        cfg["api_endpoint"] = data["api_endpoint"]
    if "model" in data:
        cfg["model"] = data["model"]
    if "temperature" in data:
        cfg["temperature"] = float(data["temperature"])
    if "max_tokens" in data:
        cfg["max_tokens"] = int(data["max_tokens"])
    if "timeout" in data:
        cfg["timeout"] = int(data["timeout"])

    logger.info(f"模型配置已更新: {model_key}")
    return jsonify({"ok": True})


@app.route("/api/health", methods=["GET"])
def health_check():
    """健康检查端点（第40轮）"""
    uptime = int(time.time() - START_TIME)

    # 检查模型配置状态
    primary_ok = bool(CONFIG["primary"]["api_key"]) and CONFIG["primary"]["api_key"] != "sk-your-key-here"
    secondary_ok = bool(CONFIG["secondary"]["api_key"]) and CONFIG["secondary"]["api_key"] != "sk-your-key-here"

    return jsonify({
        "status": "ok",
        "uptime": uptime,
        "uptime_human": f"{uptime // 3600}h {(uptime % 3600) // 60}m {uptime % 60}s",
        "models": {
            "primary": {
                "configured": primary_ok,
                "model": CONFIG["primary"]["model"],
                "endpoint": CONFIG["primary"]["api_endpoint"],
            },
            "secondary": {
                "configured": secondary_ok,
                "model": CONFIG["secondary"]["model"],
                "endpoint": CONFIG["secondary"]["api_endpoint"],
            }
        },
        "version": "2.1.0"
    })


# ============================================================
# Enhanced API Endpoints (v2.2)
# ============================================================


@app.route("/api/memory/summary", methods=["POST"])
def api_auto_summary():
    """Generate a structured chapter summary using the memory system."""
    data = request.json
    chapter_content = data.get("content", "")
    chapter_outline = data.get("outline", "")
    chapter_idx = data.get("chapter_idx", -1)

    if not chapter_content:
        return jsonify({"error": "内容不能为空"}), 400

    prompt = build_auto_summary_prompt(chapter_content, chapter_outline)

    def generate():
        yield from call_model(prompt, "secondary")

    return Response(
        generate(),
        mimetype="text/plain",
        headers={"X-Accel-Buffering": "no"},
    )


@app.route("/api/memory/extract-facts", methods=["POST"])
def api_extract_facts():
    """Extract key facts from chapter content for semantic memory."""
    data = request.json
    chapter_content = data.get("content", "")

    if not chapter_content:
        return jsonify({"error": "内容不能为空"}), 400

    prompt = build_fact_extraction_prompt(chapter_content)

    def generate():
        yield from call_model(prompt, "secondary")

    return Response(
        generate(),
        mimetype="text/plain",
        headers={"X-Accel-Buffering": "no"},
    )


@app.route("/api/memory/search", methods=["POST"])
def api_memory_search():
    """Search memories using semantic index."""
    data = request.json
    memories_data = data.get("memories", {})
    query = data.get("query", "")
    top_k = data.get("top_k", 10)

    if not query:
        return jsonify({"error": "查询不能为空"}), 400

    try:
        memory = HierarchicalMemory.from_dict(memories_data)
        results = memory.search_memories(query, top_k=top_k)
        return jsonify({
            "results": [
                {"entry": entry.to_dict(), "score": round(score, 3)}
                for entry, score in results
            ]
        })
    except Exception as e:
        logger.error(f"Memory search error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/scene/plan", methods=["POST"])
def api_scene_plan():
    """Generate a detailed scene plan for a chapter."""
    data = request.json
    chapter_outline = data.get("outline", "")
    characters = data.get("characters", "")
    style = data.get("style", "")
    previous_summary = data.get("previous_summary", "")

    if not chapter_outline:
        return jsonify({"error": "章节大纲不能为空"}), 400

    prompt = build_scene_plan_prompt(
        chapter_outline, characters, style, previous_summary
    )

    def generate():
        yield from call_model(prompt, "primary")

    return Response(
        generate(),
        mimetype="text/plain",
        headers={"X-Accel-Buffering": "no"},
    )


@app.route("/api/scene/analyze-pacing", methods=["POST"])
def api_analyze_pacing():
    """Analyze the pacing of a text passage."""
    data = request.json
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "文本不能为空"}), 400

    result = analyze_pacing(text)
    breaks = detect_scene_breaks(text)
    return jsonify({
        "pacing": result,
        "scene_breaks": breaks,
    })


@app.route("/api/character/card", methods=["POST"])
def api_character_card():
    """Convert simple character data to structured card or generate from text."""
    data = request.json
    mode = data.get("mode", "convert")  # convert, generate, check

    if mode == "convert":
        # Convert simple character to structured card
        simple_chars = data.get("characters", [])
        manager = CharacterCardManager.from_simple_list(simple_chars)
        return jsonify({"cards": manager.to_dict()})

    elif mode == "generate":
        # Generate character card from description
        description = data.get("description", "")
        if not description:
            return jsonify({"error": "角色描述不能为空"}), 400

        prompt = f"""根据以下角色描述，生成一个详细的角色卡。

【角色描述】
{description}

请按以下JSON格式输出：
```json
{{
  "name": "角色名",
  "role": "protagonist/antagonist/supporting/minor",
  "age": "年龄",
  "gender": "性别",
  "appearance": "外貌描述",
  "distinguishing_features": ["特征1", "特征2"],
  "traits": [
    {{"name": "性格特征", "description": "详细描述", "intensity": 7, "is_flaw": false}}
  ],
  "core_belief": "核心信念",
  "motivation": "核心动机",
  "fear": "最深恐惧",
  "desire": "最渴望的东西",
  "flaw": "主要缺陷",
  "voice": {{
    "speech_style": "说话风格",
    "vocabulary_level": "词汇水平",
    "catchphrases": ["口头禅"],
    "verbal_tics": ["语言习惯"],
    "sentence_length": "句子长度偏好",
    "emotional_speech": {{"愤怒": "说话方式", "紧张": "说话方式"}},
    "forbidden_words": ["不会说的词"]
  }},
  "backstory": "背景故事",
  "key_memories": ["关键记忆"],
  "secrets": ["秘密"],
  "dialogue_rules": ["对话规则"],
  "behavioral_rules": ["行为规则"]
}}
```"""

        def generate():
            yield from call_model(prompt, "primary")

        return Response(
            generate(),
            mimetype="text/plain",
            headers={"X-Accel-Buffering": "no"},
        )

    elif mode == "check":
        # Check character consistency
        card_data = data.get("card", {})
        recent_text = data.get("text", "")

        if not card_data or not recent_text:
            return jsonify({"error": "缺少角色卡或文本"}), 400

        card = CharacterCard.from_dict(card_data)
        prompt = build_character_consistency_prompt(card, recent_text)

        def generate():
            yield from call_model(prompt, "secondary")

        return Response(
            generate(),
            mimetype="text/plain",
            headers={"X-Accel-Buffering": "no"},
        )

    return jsonify({"error": "无效的mode参数"}), 400


@app.route("/api/quality/check", methods=["POST"])
def api_quality_check():
    """Run quality analysis on text."""
    data = request.json
    text = data.get("text", "")
    check_type = data.get("check_type", "local")  # local, ai

    if not text:
        return jsonify({"error": "文本不能为空"}), 400

    if check_type == "local":
        # Local analysis (no API call)
        report = generate_quality_report(text)
        return jsonify(report.to_dict())

    elif check_type == "ai":
        # AI-powered quality check
        focus = data.get("focus", "full")
        prompt = build_quality_check_prompt(text, focus)

        def generate():
            yield from call_model(prompt, "secondary")

        return Response(
            generate(),
            mimetype="text/plain",
            headers={"X-Accel-Buffering": "no"},
        )

    return jsonify({"error": "无效的check_type"}), 400


@app.route("/api/quality/batch", methods=["POST"])
def api_quality_batch():
    """Run quality analysis on multiple chapters."""
    data = request.json
    chapters = data.get("chapters", [])  # List of chapter texts

    if not chapters:
        return jsonify({"error": "章节列表不能为空"}), 400

    reports = []
    for i, text in enumerate(chapters):
        if text and text.strip():
            report = generate_quality_report(
                text, chapter_idx=i, all_chapter_texts=chapters
            )
            reports.append({
                "chapter_idx": i,
                "report": report.to_dict(),
            })

    # Aggregate stats
    if reports:
        avg_overall = sum(r["report"]["overall_score"] for r in reports) / len(reports)
        avg_ai = sum(r["report"]["ai_taste_score"] for r in reports) / len(reports)
        avg_read = sum(r["report"]["readability_score"] for r in reports) / len(reports)
        total_issues = sum(len(r["report"]["issues"]) for r in reports)
    else:
        avg_overall = avg_ai = avg_read = 0
        total_issues = 0

    return jsonify({
        "chapters": reports,
        "summary": {
            "avg_overall_score": round(avg_overall),
            "avg_ai_taste_score": round(avg_ai),
            "avg_readability_score": round(avg_read),
            "total_issues": total_issues,
            "chapter_count": len(reports),
        },
    })


if __name__ == "__main__":
    port = int(os.getenv("PORT", 20000))
    host = os.getenv("HOST", "0.0.0.0")
    debug = os.getenv("DEBUG", "true").lower() == "true"
    print(f"\n{'='*50}")
    print(f"  Kealin AI Novels 超级进化版 v2.1")
    print(f"  访问地址: http://localhost:{port}")
    print(f"  健康检查: http://localhost:{port}/api/health")
    print(f"{'='*50}\n")
    app.run(debug=debug, port=port, host=host)
