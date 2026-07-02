/**
 * Kealin AI Novels — 主应用脚本
 * 集成：创作工作台、提示词管理、右键菜单、AI助手、状态管理
 */

// ============================================================
// 默认提示词配置
// ============================================================

const DEFAULT_PROMPTS = {
    outline: `基于以下信息，设计一个网文大纲。要求情节有嚼头、人物有棱角，不要写成流水账。

背景设定：\${background}
人物设定：\${characters}
角色关系：\${relationships}
核心剧情：\${plot}
写作风格：\${style}

大纲要求：
- 核心矛盾要尖锐，别搞那种"误会一下就和好"的弱冲突
- 转折要有因果链，不是突然冒出来的
- 人物动机要合理，别让角色为了推动剧情而做蠢事
- 设计2-3个读者会记住的"名场面"
- 结局要有余味，别搞大团圆糊弄

输出格式：
1. 一句话核心卖点
2. 故事梗概（300字，只写干货）
3. 主要人物（每人100字，重点写性格缺陷和内心矛盾）
4. 情节主线（按节点列出，每个节点写清楚因果）
5. 关键转折设计（2-3个，写明白"为什么"转折）
6. 结局走向`,

    chapter: `把下面的大纲拆成章节细纲。每章要有明确的情节推进，不要写成流水账。

大纲：\${outline}
背景：\${background}
人物：\${characters}
关系：\${relationships}
剧情：\${plot}
风格：\${style}

要求：
- 每章必须有一个"事件"——读者看完能用一句话概括"这章发生了什么"
- 情节要连贯，上一章的因导致下一章的果
- 别每章都搞"危机-化解"的套路，要有变化
- 对话和行动推动剧情，不要用旁白解说

用 ###fenge 分隔章节，格式：

###fenge
第X章：[章节标题]
这章发生的事：[一句话]
主要事件：
1. [起因]
2. [经过]
3. [结果/悬念]
关键对话或冲突：[简述]
为下一章埋的线：[具体]
###fenge`,

    content: `你是一个网文写手。根据下面的章节大纲，写出正文。

大纲：\${outline}
本章细纲：\${chapter_outline}
背景：\${background}
人物：\${characters}
关系：\${relationships}
剧情：\${plot}
风格：\${style}

写作铁律（违反任何一条都是废稿）：

【语言】
- 句子长短交替。短句制造节奏，长句铺陈信息。禁止通篇都是20字左右的"标准句"
- 禁止排比句。"他感到……他感到……他感到……"这种直接扣分
- 禁止"不禁XX"、"仿佛XX"、"宛如XX"、"这一刻他明白"、"他知道，XX" 这类模板句式
- 一个段落里"的"字不超过3个
- 形容词能删就删。"温暖的阳光"→"阳光"；"缓缓地走来"→"走过来"

【对话】
- 对话推动剧情，不是凑字数。每句对话要么暴露信息，要么暴露性格，要么推动行动
- 不同角色说话方式要不同。粗人说粗话，文人说文话，小孩说小孩话
- 禁止"XX说道"、"XX淡淡道"、"XX沉声道"反复出现。用动作代替说话标签
- 对话不要一问一答像审讯，要有打断、跑题、答非所问

【叙事】
- 用动作和结果表达情绪，不要写"他很愤怒"。写"他把杯子摔了"
- 禁止段落结尾总结式抒情。"这就是XX的意义啊"、"他终于明白了XX"——全部删掉
- 场景描写只写和剧情有关的细节。不要为了"营造氛围"而堆砌环境描写
- 人物内心活动用行为暗示，不要大段心理独白
- 节奏：该快的地方一句话带过一年，该慢的地方一个眼神写三段

【禁止清单】
以下词句出现任何一个，重写该段：
"心中一凛"、"眼中闪过一丝XX"、"嘴角勾起一抹XX"、"一股XX涌上心头"、"仿佛XX一般"、"宛如XX"、"不由得"、"情不自禁"、"目光深邃"、"意味深长"、"若有所思"、"恍然大悟"

直接写，不要在开头写"好的"或任何确认语。`
};

const DEFAULT_MENUS = {
    outline: {
        menu: [
            { name: "AI评分", prompt: "对以下大纲打分（0-100），评分维度：\n1. 核心矛盾是否尖锐（不是那种误会一下就和好的弱冲突）\n2. 转折有没有因果链（不是突然冒出来的）\n3. 人物有没有缺陷和成长（不是工具人）\n4. 有没有读者会记住的"名场面"\n5. 结局有没有余味\n\n扣分项：情节靠巧合推进-20，人物动机不合理-15，模板化三幕式结构-10\n\n大纲：\${selected_text}" },
            { name: "加强冲突", prompt: "以下大纲的冲突太弱了。把矛盾改尖锐，让人物面临两难选择，不是简单的善恶对立。\n背景：\${background}\n人物：\${characters}\n大纲：\${selected_text}" },
            { name: "加因果链", prompt: "以下大纲的转折缺乏因果。每个转折都要有前因，不能突然冒出来。补上前因后果。\n大纲：\${selected_text}" },
            { name: "修人物动机", prompt: "以下大纲中人物动机不合理。人不是为了推动剧情而存在的，给每个关键行为找到真实动机。\n人物：\${characters}\n关系：\${relationships}\n大纲：\${selected_text}" },
            { name: "砍废话", prompt: "删掉以下大纲中所有废话、套话、正确的废话。只留核心情节节点和关键转折。删完后字数应减少30%以上。\n大纲：\${selected_text}" }
        ]
    },
    chapter: {
        menu: [
            { name: "AI评分", prompt: "对以下章节细纲打分（0-100）。核心标准：每章能不能用一句话概括"这章发生了什么"。如果概括不出来，说明剧情散了，扣大分。\n\n扣分项：没有明确事件-30，情节流水账-20，对话不推动剧情-15\n\n章节细纲：\${selected_text}" },
            { name: "加事件驱动", prompt: "以下章节细纲没有明确事件驱动。每章必须有一个核心事件，用行动和对话推进，不要用旁白叙述。\n细纲：\${selected_text}" },
            { name: "理因果链", prompt: "以下章节之间缺乏因果联系。上一章的果要成为下一章的因。重新梳理因果关系。\n大纲：\${outline}\n细纲：\${selected_text}" },
            { name: "砍流水账", prompt: "以下章节细纲是流水账。删掉所有"然后XX"、"接着XX"式的平铺直叙，只留有转折、有冲突、有信息量的节点。\n细纲：\${selected_text}" }
        ]
    },
    content: {
        menu: [
            { name: "AI味检测", prompt: "检测以下内容的AI味浓度（0-100分，100=完全人写，0=纯AI垃圾）。\n\n重点检查：\n1. 有没有"不禁XX"、"仿佛XX"、"宛如XX"、"心中一凛"、"眼中闪过"、"嘴角勾起"等模板句式\n2. 有没有排比句\n3. 段落结尾有没有总结式抒情（"这就是XX的意义啊"）\n4. 形容词是否过多（"温暖的阳光"→该删"温暖的"）\n5. 对话是不是都在"XX说道"后面接完整句子\n6. 有没有大段心理独白代替行为描写\n7. "的"字密度（每段超过5个扣分）\n8. 句子长度是否均匀（全在15-25字=AI味重）\n\n逐项打分，最后给总分。列出所有有问题的句子。\n\n内容：\${selected_text}" },
            { name: "去AI味重写", prompt: "以下内容AI味很重，重写它。\n\n重写规则：\n- 删掉所有"不禁"、"仿佛"、"宛如"、"心中一凛"、"眼中闪过"、"嘴角勾起"、"一股XX涌上心头"\n- 删掉排比句\n- 删掉段落结尾的总结抒情\n- "的"字每段不超过3个\n- 形容词能删就删\n- 用动作代替情绪描写（"他很愤怒"→"他把杯子摔了"）\n- 对话标签用动作代替"XX说道"\n- 句子长短交替\n\n风格：\${style}\n内容：\${selected_text}" },
            { name: "压缩精简", prompt: "以下内容太啰嗦了。砍掉：\n1. 不推动剧情的环境描写\n2. 重复表达同一个意思的句子\n3. 所有"的"字超过3个的形容词堆砌\n4. 没有信息量的过渡句\n5. 总结式抒情\n\n目标：字数减少40%，信息量不减。\n内容：\${selected_text}" },
            { name: "改对话", prompt: "以下对话太假了。改得像真人说话：\n- 不同角色说话方式要不同\n- 别一问一答像审讯，要有打断、跑题、答非所问\n- 删掉"XX说道"、"XX淡淡道"，用动作代替\n- 对话要有潜台词，不是什么都说出来\n\n人物：\${characters}\n内容：\${selected_text}" },
            { name: "砍形容词", prompt: "以下内容形容词太多，读着累。规则：\n- "温暖的阳光"→"阳光"\n- "缓缓地走来"→"走过来"\n- "美丽的花朵"→"花"\n- 删掉所有不改变意思的修饰词\n- 一个段落里"的"字不超过3个\n\n直接输出改后的文本，不要解释。\n内容：\${selected_text}" },
            { name: "加动作写情绪", prompt: "以下内容在用形容词写情绪，改成用动作和行为表达：\n- "他很紧张"→写他的具体动作\n- "她心如刀割"→写她做了什么\n- "气氛很尴尬"→写谁说了什么、做了什么\n\n不要加内心独白来解释。让读者自己从行为中感受。\n内容：\${selected_text}" },
            { name: "加口语感", prompt: "以下内容读着像机器写的。改成有口语感的写法：\n- 短句为主，偶尔一个长句\n- 可以用不完整的句子\n- 可以用省略号、破折号\n- 像在跟朋友讲故事，不是在写作文\n\n内容：\${selected_text}" }
        ]
    }
};

// ============================================================
// 小说类型配置
// ============================================================

const GENRE_CONFIGS = {
    urban: {
        name: "都市重生",
        fields: {
            background: "现代都市，主角重生回到过去，拥有前世记忆",
            characters: "主角：重生者，冷静果断，拥有未来信息\n女主：聪明独立\n反派：野心勃勃的商业对手",
            relationships: "主角与女主从误解到信任\n主角与反派的商业博弈",
            plot: "主角利用重生优势，在商界崛起，同时处理复杂的人际关系和感情纠葛",
            style: "节奏紧凑，商战与情感交织，语言犀利"
        }
    },
    xianxia: {
        name: "仙侠修真",
        fields: {
            background: "灵气复苏的修真世界，宗门林立，强者为尊",
            characters: "主角：天赋异禀的修真者\n师尊：神秘强大的长辈\n红颜：同样追求大道的女修",
            relationships: "师徒传承\n道友互助\n正邪对立",
            plot: "主角从微末崛起，历经磨难，最终证道飞升",
            style: "古典雅致，仙气飘渺，战斗描写磅礴大气"
        }
    },
    fantasy: {
        name: "东方玄幻",
        fields: {
            background: "浩瀚的玄幻世界，万族林立，天道轮回",
            characters: "主角：身世神秘的少年天才\n伙伴：忠诚的战友\n敌人：各路天骄与远古大能",
            relationships: "兄弟情义\n红尘情缘\n宿命对决",
            plot: "主角踏上逆天之路，揭开身世之谜，最终超越天道",
            style: "大气恢宏，热血燃情，东方美学"
        }
    },
    system: {
        name: "系统流",
        fields: {
            background: "现代都市或异世界，主角获得神秘系统",
            characters: "主角：普通觉醒者\n系统：智能辅助\n各路势力",
            relationships: "系统与宿主的互动\n势力间的博弈",
            plot: "主角通过完成系统任务不断变强，揭开系统背后的真相",
            style: "轻松爽快，升级打怪，节奏明快"
        }
    },
    apocalypse: {
        name: "末日求生",
        fields: {
            background: "末日降临，文明崩塌，变异生物横行",
            characters: "主角：冷静理性的幸存者\n队友：各有专长的伙伴\n敌人：变异体与其他势力",
            relationships: "生死与共的战友情\n乱世中的温情",
            plot: "主角在末日中建立庇护所，探索末日起源，带领幸存者重建文明",
            style: "紧张刺激，生存细节真实，人性刻画深刻"
        }
    },
    romance: {
        name: "现代言情",
        fields: {
            background: "现代都市，职场或校园",
            characters: "女主：独立自信\n男主：外冷内热\n配角：闺蜜、情敌等",
            relationships: "从误会到了解\n从心动到深爱",
            plot: "男女主经历误会、考验，最终走到一起",
            style: "甜蜜温馨，情感细腻，对话生动"
        }
    },
    history: {
        name: "历史架空",
        fields: {
            background: "架空历史世界，王朝更迭，权谋争斗",
            characters: "主角：穿越者或重生者\n谋士：智计百出\n武将：忠勇无双",
            relationships: "君臣际遇\n政治联姻\n敌国博弈",
            plot: "主角从底层崛起，运用现代知识改变历史走向",
            style: "厚重沉稳，权谋精妙，历史感强"
        }
    }
};

// ============================================================
// 应用状态
// ============================================================

const AppState = {
    chapters: [],
    aiConversation: [],
    selectedText: "",
    currentTarget: null,
    isStreaming: false,
};

// ============================================================
// 工具函数
// ============================================================

function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function toast(msg, type = "info") {
    const container = $("#toast-container");
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => {
        el.style.opacity = "0";
        el.style.transform = "translateX(40px)";
        el.style.transition = "all 0.3s ease";
        setTimeout(() => el.remove(), 300);
    }, 3000);
}

function showModal(id) { document.getElementById(id).style.display = "flex"; }
function hideModal(id) { document.getElementById(id).style.display = "none"; }

// 流式读取
async function streamFetch(url, body, onChunk) {
    const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        onChunk(text);
    }
    return text;
}

// 提示词变量替换
function fillTemplate(template, vars) {
    let result = template;
    for (const [key, val] of Object.entries(vars)) {
        result = result.replaceAll(`\${${key}}`, val || "");
    }
    return result;
}

// 字数统计
function countChars(text) {
    return text ? text.replace(/\s/g, "").length : 0;
}

// ============================================================
// 状态持久化
// ============================================================

function saveState() {
    const state = {
        fields: {
            background: $("#field-background").value,
            characters: $("#field-characters").value,
            relationships: $("#field-relationships").value,
            plot: $("#field-plot").value,
            style: $("#field-style").value,
        },
        outline: $("#outline").value,
        chapters: AppState.chapters,
        prompts: {
            outline: $("#prompt-outline").value,
            chapter: $("#prompt-chapter").value,
            content: $("#prompt-content").value,
        },
        menus: {
            outline: $("#menu-outline").value,
            chapter: $("#menu-chapter").value,
            content: $("#menu-content").value,
        },
        genre: $("#genre-selector").value,
        aiConversation: AppState.aiConversation,
    };
    try {
        localStorage.setItem("kealin_novels_state", JSON.stringify(state));
    } catch (e) {
        console.error("保存失败:", e);
    }
}

function loadState() {
    try {
        const raw = localStorage.getItem("kealin_novels_state");
        if (!raw) return;
        const state = JSON.parse(raw);

        // 恢复字段
        if (state.fields) {
            for (const [k, v] of Object.entries(state.fields)) {
                const el = $(`#field-${k}`);
                if (el) el.value = v || "";
            }
        }

        // 恢复大纲
        if (state.outline) $("#outline").value = state.outline;

        // 恢复提示词
        if (state.prompts) {
            if (state.prompts.outline) $("#prompt-outline").value = state.prompts.outline;
            if (state.prompts.chapter) $("#prompt-chapter").value = state.prompts.chapter;
            if (state.prompts.content) $("#prompt-content").value = state.prompts.content;
        }

        // 恢复菜单配置
        if (state.menus) {
            if (state.menus.outline) $("#menu-outline").value = state.menus.outline;
            if (state.menus.chapter) $("#menu-chapter").value = state.menus.chapter;
            if (state.menus.content) $("#menu-content").value = state.menus.content;
        }

        // 恢复类型
        if (state.genre) $("#genre-selector").value = state.genre;

        // 恢复章节
        if (state.chapters && Array.isArray(state.chapters)) {
            AppState.chapters = state.chapters;
            renderChapters();
        }

        // 恢复AI对话
        if (state.aiConversation && Array.isArray(state.aiConversation)) {
            AppState.aiConversation = state.aiConversation;
            AppState.aiConversation.forEach(msg => {
                addAIMessage(msg.role, msg.content, false);
            });
        }
    } catch (e) {
        console.error("加载状态失败:", e);
    }
}

// ============================================================
// 导入导出
// ============================================================

function exportAll() {
    const state = JSON.parse(localStorage.getItem("kealin_novels_state") || "{}");
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kealin-novels-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("已导出", "success");
}

function importAll() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                localStorage.setItem("kealin_novels_state", JSON.stringify(data));
                location.reload();
            } catch {
                toast("导入失败：文件格式错误", "error");
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ============================================================
// 章节管理
// ============================================================

function addChapter(outline = "", content = "") {
    AppState.chapters.push({ outline, content, expanded: false });
    renderChapters();
    saveState();
}

function renderChapters() {
    const container = $("#chapters-container");
    container.innerHTML = "";

    AppState.chapters.forEach((ch, i) => {
        const div = document.createElement("div");
        div.className = `chapter-item${ch.expanded ? " expanded" : ""}`;
        div.innerHTML = `
            <div class="chapter-header" data-idx="${i}">
                <div class="chapter-title-area">
                    <span class="chapter-num">${i + 1}</span>
                    <span>${truncate(ch.outline || "新章节", 40)}</span>
                </div>
                <div class="chapter-actions">
                    <span class="chapter-arrow">▶</span>
                    <button class="btn btn-sm btn-ghost btn-danger" data-action="delete" data-idx="${i}">删除</button>
                </div>
            </div>
            <div class="chapter-body">
                <div class="chapter-outline-area">
                    <h4>章节细纲</h4>
                    <textarea class="ch-outline" data-idx="${i}" placeholder="在此编辑章节细纲...">${ch.outline}</textarea>
                    <div style="margin-top:6px;display:flex;gap:6px;">
                        <button class="btn btn-sm btn-primary" data-action="gen-content" data-idx="${i}">生成正文</button>
                        <button class="btn btn-sm btn-ghost" data-action="copy-outline" data-idx="${i}">复制细纲</button>
                    </div>
                </div>
                <div class="chapter-content-area">
                    <h4>章节正文</h4>
                    <textarea class="ch-content textarea-tall" data-idx="${i}" placeholder="点击「生成正文」或在此手动编写...">${ch.content}</textarea>
                    <div class="card-footer">
                        <span class="char-count">${countChars(ch.content)} 字</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    // 绑定事件
    container.querySelectorAll(".chapter-header").forEach(el => {
        el.addEventListener("click", (e) => {
            if (e.target.closest("[data-action]")) return;
            const idx = parseInt(el.dataset.idx);
            AppState.chapters[idx].expanded = !AppState.chapters[idx].expanded;
            el.closest(".chapter-item").classList.toggle("expanded");
            saveState();
        });
    });

    container.querySelectorAll("[data-action='delete']").forEach(el => {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            if (confirm("确定删除这个章节？")) {
                AppState.chapters.splice(idx, 1);
                renderChapters();
                saveState();
            }
        });
    });

    container.querySelectorAll("[data-action='gen-content']").forEach(el => {
        el.addEventListener("click", async (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            await generateContent(idx);
        });
    });

    container.querySelectorAll("[data-action='copy-outline']").forEach(el => {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            navigator.clipboard.writeText(AppState.chapters[idx].outline || "");
            toast("已复制", "success");
        });
    });

    // textarea 变化时保存
    container.querySelectorAll(".ch-outline").forEach(el => {
        el.addEventListener("input", () => {
            const idx = parseInt(el.dataset.idx);
            AppState.chapters[idx].outline = el.value;
            debouncedSave();
        });
        // 右键菜单
        el.addEventListener("contextmenu", (e) => showContextMenu(e, "chapter", el));
    });

    container.querySelectorAll(".ch-content").forEach(el => {
        el.addEventListener("input", () => {
            const idx = parseInt(el.dataset.idx);
            AppState.chapters[idx].content = el.value;
            debouncedSave();
            updateStats();
        });
        el.addEventListener("contextmenu", (e) => showContextMenu(e, "content", el));
    });

    updateStats();
}

function truncate(str, len) {
    return str.length > len ? str.slice(0, len) + "..." : str;
}

let saveTimer;
function debouncedSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 500);
}

// ============================================================
// 统计
// ============================================================

function updateStats() {
    let total = countChars($("#outline").value);
    AppState.chapters.forEach(ch => {
        total += countChars(ch.content);
    });
    $("#total-chars").textContent = `字数: ${total.toLocaleString()}`;
    $("#chapter-count").textContent = `章节: ${AppState.chapters.length}`;
}

// ============================================================
// AI 生成
// ============================================================

function getFieldVars() {
    return {
        background: $("#field-background").value,
        characters: $("#field-characters").value,
        relationships: $("#field-relationships").value,
        plot: $("#field-plot").value,
        style: $("#field-style").value,
    };
}

async function generateOutline() {
    const vars = getFieldVars();
    const prompt = fillTemplate($("#prompt-outline").value, vars);

    const outlineEl = $("#outline");
    outlineEl.value = "";
    outlineEl.classList.add("streaming-cursor");

    try {
        await streamFetch("/gen", { prompt }, (text) => {
            outlineEl.value = text;
            outlineEl.scrollTop = outlineEl.scrollHeight;
        });
    } catch (e) {
        toast("生成大纲失败: " + e.message, "error");
    } finally {
        outlineEl.classList.remove("streaming-cursor");
        saveState();
        updateStats();
    }
}

async function generateChapters() {
    const vars = getFieldVars();
    const templateVars = { ...vars, outline: $("#outline").value };
    const prompt = fillTemplate($("#prompt-chapter").value, templateVars);

    const btn = $("#btn-gen-chapters");
    btn.classList.add("loading");
    btn.innerHTML = '<span class="spinner"></span> 生成中...';

    try {
        const text = await streamFetch("/gen", { prompt }, () => {});
        // 分割章节
        const parts = text.split("###fenge").map(s => s.trim()).filter(s => s.length > 0);
        if (parts.length === 0) {
            toast("未能解析出章节，请检查大纲后重试", "error");
            return;
        }
        parts.forEach(p => addChapter(p, ""));
        toast(`成功生成 ${parts.length} 个章节`, "success");
    } catch (e) {
        toast("生成章节失败: " + e.message, "error");
    } finally {
        btn.classList.remove("loading");
        btn.innerHTML = "从大纲生成章节";
    }
}

async function generateContent(idx) {
    const ch = AppState.chapters[idx];
    const vars = getFieldVars();
    const templateVars = {
        ...vars,
        outline: $("#outline").value,
        chapter_outline: ch.outline,
    };
    const prompt = fillTemplate($("#prompt-content").value, templateVars);

    const contentEl = $(`#chapters-container .ch-content[data-idx="${idx}"]`);
    if (!contentEl) return;

    contentEl.value = "";
    contentEl.classList.add("streaming-cursor");

    try {
        await streamFetch("/gen", { prompt }, (text) => {
            contentEl.value = text;
            contentEl.scrollTop = contentEl.scrollHeight;
            ch.content = text;
        });
    } catch (e) {
        toast("生成正文失败: " + e.message, "error");
    } finally {
        contentEl.classList.remove("streaming-cursor");
        saveState();
        updateStats();
    }
}

// ============================================================
// 右键菜单
// ============================================================

function showContextMenu(e, type, target) {
    e.preventDefault();
    const selectedText = window.getSelection().toString();
    if (!selectedText) return;

    AppState.selectedText = selectedText;
    AppState.currentTarget = target;

    let menuConfig;
    try {
        menuConfig = JSON.parse($(`#menu-${type}`).value);
    } catch {
        toast("菜单配置 JSON 格式错误", "error");
        return;
    }

    const menu = $("#context-menu");
    menu.innerHTML = "";
    menuConfig.menu.forEach(item => {
        const div = document.createElement("div");
        div.className = "context-menu-item";
        div.textContent = item.name;
        div.addEventListener("click", () => handleContextAction(item));
        menu.appendChild(div);
    });

    // 定位
    const x = Math.min(e.pageX, window.innerWidth - 180);
    const y = Math.min(e.pageY, window.innerHeight - menu.children.length * 36);
    menu.style.left = x + "px";
    menu.style.top = y + "px";
    menu.style.display = "block";

    // 点击外部关闭
    const close = (ev) => {
        if (!menu.contains(ev.target)) {
            menu.style.display = "none";
            document.removeEventListener("click", close);
        }
    };
    setTimeout(() => document.addEventListener("click", close), 0);
}

async function handleContextAction(item) {
    $("#context-menu").style.display = "none";

    const vars = {
        ...getFieldVars(),
        outline: $("#outline").value,
        selected_text: AppState.selectedText,
    };
    const prompt = fillTemplate(item.prompt, vars);

    // 显示预览模态框
    const modal = $("#prompt-preview-modal");
    const previewText = $("#prompt-preview-text");
    previewText.value = prompt;
    showModal("prompt-preview-modal");

    // 确认发送
    const confirmBtn = $("#btn-confirm-prompt");
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
    newBtn.id = "btn-confirm-prompt";

    newBtn.addEventListener("click", async () => {
        hideModal("prompt-preview-modal");
        const finalPrompt = previewText.value;

        // 显示结果模态框
        const resultModal = $("#modal");
        $("#modal-title").textContent = item.name;
        $("#modal-body").innerHTML = '<div style="text-align:center;padding:20px;"><span class="spinner"></span> 生成中...</div>';
        $("#modal-footer").innerHTML = "";
        showModal("modal");

        try {
            const result = await streamFetch("/gen", { prompt: finalPrompt }, (text) => {
                $("#modal-body").textContent = text;
            });

            $("#modal-footer").innerHTML = `
                <button class="btn btn-ghost" onclick="hideModal('modal')">取消</button>
                <button class="btn btn-primary" id="btn-apply-result">应用更改</button>
            `;
            $("#btn-apply-result").addEventListener("click", () => {
                if (AppState.currentTarget) {
                    AppState.currentTarget.value = result;
                    AppState.currentTarget.dispatchEvent(new Event("input"));
                }
                hideModal("modal");
                toast("已应用更改", "success");
            });
        } catch (e) {
            $("#modal-body").textContent = "生成失败: " + e.message;
        }
    });
}

// ============================================================
// AI 助手
// ============================================================

function addAIMessage(role, content, save = true) {
    const container = $("#ai-messages");
    const div = document.createElement("div");
    div.className = `ai-msg ai-${role}`;
    div.textContent = content;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;

    if (save) {
        AppState.aiConversation.push({ role, content });
        debouncedSave();
    }
}

async function sendAIMessage() {
    const input = $("#ai-input");
    const msg = input.value.trim();
    if (!msg || AppState.isStreaming) return;

    input.value = "";
    addAIMessage("user", msg);

    AppState.isStreaming = true;
    const sendBtn = $("#btn-send-ai");
    sendBtn.classList.add("loading");
    sendBtn.innerHTML = '<span class="spinner"></span>';

    // 构建带上下文的提示词
    const context = `你是一个网文写作助手，风格偏实战派，不搞花哨修辞。你帮作者解决具体问题：卡壳了怎么推进、人物怎么立起来、对话怎么改自然、哪里啰嗦了要砍。

你的原则：
- 给具体建议，不要说"要注意XX"这种废话
- 举例说明，不要空讲道理
- 如果作者写得啰嗦，直接说哪里要砍
- 禁止使用"不禁"、"仿佛"、"宛如"等AI味词汇

当前小说背景：${$("#field-background").value}
人物：${$("#field-characters").value}

用户问题：${msg}`;

    // 创建临时消息元素
    const container = $("#ai-messages");
    const tempDiv = document.createElement("div");
    tempDiv.className = "ai-msg ai-assistant streaming-cursor";
    tempDiv.textContent = "";
    container.appendChild(tempDiv);
    container.scrollTop = container.scrollHeight;

    try {
        await streamFetch("/gen", { prompt: context }, (text) => {
            tempDiv.textContent = text;
            container.scrollTop = container.scrollHeight;
        });
        tempDiv.classList.remove("streaming-cursor");
        AppState.aiConversation.push({ role: "assistant", content: tempDiv.textContent });
        debouncedSave();
    } catch (e) {
        tempDiv.textContent = "请求失败: " + e.message;
        tempDiv.classList.remove("streaming-cursor");
    } finally {
        AppState.isStreaming = false;
        sendBtn.classList.remove("loading");
        sendBtn.textContent = "发送";
    }
}

// ============================================================
// 提示词预览
// ============================================================

function showPromptPreview(type) {
    const vars = getFieldVars();
    let template, templateVars;

    if (type === "outline") {
        template = $("#prompt-outline").value;
        templateVars = vars;
    } else if (type === "chapter") {
        template = $("#prompt-chapter").value;
        templateVars = { ...vars, outline: $("#outline").value };
    } else {
        template = $("#prompt-content").value;
        templateVars = { ...vars, outline: $("#outline").value, chapter_outline: "（当前章节细纲）" };
    }

    const filled = fillTemplate(template, templateVars);
    $("#prompt-preview-text").value = filled;
    showModal("prompt-preview-modal");

    // 确认按钮直接发送生成
    const confirmBtn = $("#btn-confirm-prompt");
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
    newBtn.id = "btn-confirm-prompt";

    newBtn.addEventListener("click", () => {
        hideModal("prompt-preview-modal");
        if (type === "outline") generateOutline();
        else if (type === "chapter") generateChapters();
    });
}

// ============================================================
// 初始化
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    // 初始化提示词默认值
    $("#prompt-outline").value = DEFAULT_PROMPTS.outline;
    $("#prompt-chapter").value = DEFAULT_PROMPTS.chapter;
    $("#prompt-content").value = DEFAULT_PROMPTS.content;
    $("#menu-outline").value = JSON.stringify(DEFAULT_MENUS.outline, null, 2);
    $("#menu-chapter").value = JSON.stringify(DEFAULT_MENUS.chapter, null, 2);
    $("#menu-content").value = JSON.stringify(DEFAULT_MENUS.content, null, 2);

    // 初始化小说类型选择器
    const genreSelect = $("#genre-selector");
    Object.entries(GENRE_CONFIGS).forEach(([key, cfg]) => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = cfg.name;
        genreSelect.appendChild(opt);
    });

    // 加载保存的状态
    loadState();

    // ---- 导航标签 ----
    $$(".nav-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            $$(".nav-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            $$(".panel").forEach(p => p.classList.remove("active"));
            $(`#panel-${tab.dataset.panel}`).classList.add("active");
        });
    });

    // ---- 侧边栏折叠 ----
    $("#sidebar-toggle").addEventListener("click", () => {
        $("#sidebar").classList.toggle("collapsed");
    });

    // ---- 小说类型切换 ----
    genreSelect.addEventListener("change", () => {
        const cfg = GENRE_CONFIGS[genreSelect.value];
        if (!cfg) return;
        for (const [k, v] of Object.entries(cfg.fields)) {
            const el = $(`#field-${k}`);
            if (el && !el.value.trim()) el.value = v;
        }
        toast(`已加载「${cfg.name}」模板`, "info");
    });

    // ---- 生成按钮 ----
    $("#btn-gen-outline").addEventListener("click", generateOutline);
    $("#btn-regen-outline").addEventListener("click", generateOutline);
    $("#btn-gen-chapters").addEventListener("click", generateChapters);
    $("#btn-add-chapter").addEventListener("click", () => addChapter());
    $("#btn-reset-chapters").addEventListener("click", () => {
        if (confirm("确定清空所有章节？")) {
            AppState.chapters = [];
            renderChapters();
            saveState();
        }
    });

    // ---- 预览提示词 ----
    $("#btn-preview-prompts").addEventListener("click", () => showPromptPreview("outline"));

    // ---- 大纲右键菜单 ----
    $("#outline").addEventListener("contextmenu", (e) => showContextMenu(e, "outline", $("#outline")));

    // ---- 字数统计 ----
    $$(".textarea-main, .textarea-sm").forEach(el => {
        el.addEventListener("input", () => {
            const countEl = el.closest(".card")?.querySelector(".char-count");
            if (countEl) countEl.textContent = countChars(el.value) + " 字";
            updateStats();
            debouncedSave();
        });
    });

    // ---- AI 助手 ----
    $("#btn-send-ai").addEventListener("click", sendAIMessage);
    $("#ai-input").addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendAIMessage();
        }
    });
    $("#btn-clear-chat").addEventListener("click", () => {
        AppState.aiConversation = [];
        $("#ai-messages").innerHTML = '<div class="ai-msg ai-system">对话已清空</div>';
        saveState();
    });

    // ---- 导入导出 ----
    $("#btn-export").addEventListener("click", exportAll);
    $("#btn-import").addEventListener("click", importAll);

    // ---- 书名简介生成 ----
    $("#btn-gen-title").addEventListener("click", () => showBookInfoGen("title"));
    $("#btn-gen-summary").addEventListener("click", () => showBookInfoGen("summary"));

    // ---- 提示词恢复默认 ----
    $("#btn-reset-outline-prompt").addEventListener("click", () => {
        $("#prompt-outline").value = DEFAULT_PROMPTS.outline;
        saveState();
        toast("已恢复默认", "success");
    });
    $("#btn-reset-chapter-prompt").addEventListener("click", () => {
        $("#prompt-chapter").value = DEFAULT_PROMPTS.chapter;
        saveState();
        toast("已恢复默认", "success");
    });
    $("#btn-reset-content-prompt").addEventListener("click", () => {
        $("#prompt-content").value = DEFAULT_PROMPTS.content;
        saveState();
        toast("已恢复默认", "success");
    });

    // ---- 模型配置 ----
    loadModelConfig();
    $("#btn-save-primary").addEventListener("click", () => saveModelConfig("primary"));
    $("#btn-save-secondary").addEventListener("click", () => saveModelConfig("secondary"));

    // ---- 模态框关闭 ----
    $("#modal-close").addEventListener("click", () => hideModal("modal"));
    $$(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.style.display = "none";
        });
    });

    // ---- 思维导图 ----
    $("#btn-mindmap").addEventListener("click", () => {
        showModal("mindmap-modal");
        renderMindmap();
    });

    // ---- 键盘快捷键 ----
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            $$(".modal-overlay").forEach(m => m.style.display = "none");
            $("#context-menu").style.display = "none";
        }
    });

    // ---- 初始统计 ----
    updateStats();
});

// ============================================================
// 书名简介生成
// ============================================================

function showBookInfoGen(type) {
    const modal = $("#bookinfo-modal");
    const title = type === "title" ? "AI 生成书名" : "AI 生成简介";
    $("#bookinfo-title").textContent = title;

    const body = $("#bookinfo-body");
    if (type === "title") {
        body.innerHTML = `
            <div class="field-group">
                <label>小说类型</label>
                <input type="text" id="bi-type" class="input" value="${GENRE_CONFIGS[$("#genre-selector").value]?.name || ''}">
            </div>
            <div class="field-group">
                <label>故事简介</label>
                <textarea id="bi-summary" class="textarea-sm" placeholder="简要描述你的故事...">${$("#field-plot").value}</textarea>
            </div>
            <div class="field-group">
                <label>生成结果</label>
                <textarea id="bi-result" class="textarea-main" readonly></textarea>
            </div>
        `;
        $("#bookinfo-footer").innerHTML = `
            <button class="btn btn-ghost" onclick="document.getElementById('bookinfo-modal').style.display='none'">关闭</button>
            <button class="btn btn-primary" id="btn-bi-gen">生成书名</button>
        `;
        $("#btn-bi-gen").addEventListener("click", async () => {
            const btn = $("#btn-bi-gen");
            btn.classList.add("loading");
            btn.innerHTML = '<span class="spinner"></span> 生成中...';
            const prompt = `给一部${$("#bi-type").value || "网文"}起5个书名。故事：${$("#bi-summary").value || "无"}\n\n要求：能让人在一堆书里点进来。别用"之"字连接，别用"传奇""风云""天下"这种烂大街的词。每个书名单独一行，带序号。`;
            try {
                await streamFetch("/gen", { prompt }, (text) => {
                    $("#bi-result").value = text;
                });
            } catch (e) {
                toast("生成失败: " + e.message, "error");
            } finally {
                btn.classList.remove("loading");
                btn.textContent = "生成书名";
            }
        });
    } else {
        body.innerHTML = `
            <div class="field-group">
                <label>书名</label>
                <input type="text" id="bi-title-input" class="input" placeholder="输入书名...">
            </div>
            <div class="field-group">
                <label>生成结果</label>
                <textarea id="bi-result" class="textarea-main textarea-tall" readonly></textarea>
            </div>
        `;
        $("#bookinfo-footer").innerHTML = `
            <button class="btn btn-ghost" onclick="document.getElementById('bookinfo-modal').style.display='none'">关闭</button>
            <button class="btn btn-primary" id="btn-bi-gen">生成简介</button>
        `;
        $("#btn-bi-gen").addEventListener("click", async () => {
            const btn = $("#btn-bi-gen");
            btn.classList.add("loading");
            btn.innerHTML = '<span class="spinner"></span> 生成中...';
            const vars = getFieldVars();
            const prompt = `给小说《${$("#bi-title-input").value || "未命名"}》写个简介。\n类型：${GENRE_CONFIGS[$("#genre-selector").value]?.name || "网文"}\n背景：${vars.background}\n人物：${vars.characters}\n剧情：${vars.plot}\n\n要求：\n- 开头一句话就要有钩子，让人想看下去\n- 别用"且看XX如何XX"这种套话\n- 别用"波澜壮阔""跌宕起伏"这种形容词\n- 写清楚主角是谁、要干什么、最大的障碍是什么\n- 200字以内`;
            try {
                await streamFetch("/gen", { prompt }, (text) => {
                    $("#bi-result").value = text;
                });
            } catch (e) {
                toast("生成失败: " + e.message, "error");
            } finally {
                btn.classList.remove("loading");
                btn.textContent = "生成简介";
            }
        });
    }
    showModal("bookinfo-modal");
}

// ============================================================
// 模型配置管理
// ============================================================

async function loadModelConfig() {
    try {
        const resp = await fetch("/api/config");
        const config = await resp.json();
        if (config.primary) {
            $("#cfg-primary-endpoint").value = config.primary.endpoint || "";
            $("#cfg-primary-model").value = config.primary.model || "";
            const badge = $("#primary-status");
            if (config.primary.has_key) {
                badge.textContent = "已配置";
                badge.className = "badge badge-ok";
            }
        }
    } catch (e) {
        console.error("加载模型配置失败:", e);
    }
}

async function saveModelConfig(key) {
    const prefix = `cfg-${key}`;
    const data = {
        model_key: key,
        api_endpoint: $(`#${prefix}-endpoint`).value,
        api_key: $(`#${prefix}-key`).value,
        model: $(`#${prefix}-model`).value,
    };
    if ($(`#${prefix}-temp`)) data.temperature = $(`#${prefix}-temp`).value;
    if ($(`#${prefix}-tokens`)) data.max_tokens = $(`#${prefix}-tokens`).value;

    try {
        const resp = await fetch("/api/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const result = await resp.json();
        if (result.ok) {
            toast("模型配置已保存", "success");
            loadModelConfig();
        } else {
            toast("保存失败", "error");
        }
    } catch (e) {
        toast("保存失败: " + e.message, "error");
    }
}

// ============================================================
// 思维导图（简易文本版）
// ============================================================

function renderMindmap() {
    const container = $("#mindmap-container");
    const outline = $("#outline").value;
    if (!outline.trim()) {
        container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);">请先生成大纲</div>';
        return;
    }

    // 简单解析大纲为树形结构
    const lines = outline.split("\n").filter(l => l.trim());
    let html = '<div style="padding:20px;font-size:13px;line-height:2;">';
    html += '<div style="font-size:18px;font-weight:700;color:var(--accent-light);margin-bottom:16px;">📖 故事大纲</div>';

    lines.forEach(line => {
        const trimmed = line.trim();
        if (/^[一二三四五六七八九十]+[、.]/.test(trimmed) || /^\d+[、.]/.test(trimmed) || /^第[一二三四五六七八九十\d]+[章部]/.test(trimmed)) {
            html += `<div style="font-weight:600;color:var(--text-primary);margin-top:8px;">├─ ${trimmed}</div>`;
        } else if (/^[-•·]/.test(trimmed) || /^\d+\)/.test(trimmed)) {
            html += `<div style="padding-left:24px;color:var(--text-secondary);">│  ├─ ${trimmed.replace(/^[-•·]\s*/, "")}</div>`;
        } else {
            html += `<div style="padding-left:12px;color:var(--text-secondary);">${trimmed}</div>`;
        }
    });

    html += '</div>';
    container.innerHTML = html;
}
