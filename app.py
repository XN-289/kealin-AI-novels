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


@app.route("/gen", methods=["POST"])
def generate():
    """主生成接口 - 用于大纲、章节、正文"""
    data = request.json
    prompt = data.get("prompt", "")
    if not prompt:
        return Response("错误: 空提示词", status=400)

    logger.info(f"收到生成请求，prompt长度: {len(prompt)}")

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
        "version": "2.0.0"
    })


if __name__ == "__main__":
    port = int(os.getenv("PORT", 20000))
    host = os.getenv("HOST", "0.0.0.0")
    debug = os.getenv("DEBUG", "true").lower() == "true"
    print(f"\n{'='*50}")
    print(f"  Kealin AI Novels 超级进化版 v2.0")
    print(f"  访问地址: http://localhost:{port}")
    print(f"  健康检查: http://localhost:{port}/api/health")
    print(f"{'='*50}\n")
    app.run(debug=debug, port=port, host=host)
