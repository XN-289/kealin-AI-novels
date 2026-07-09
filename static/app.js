/**
 * Kealin AI Novels — 超级进化版
 * 集成：创作工作台、提示词管理、右键菜单、AI助手、状态管理
 * 56轮迭代优化，从作者视角全面重构
 */

// ============================================================
// 默认提示词配置 — 全面重写（第21-23轮、第51轮）
// ============================================================

const DEFAULT_PROMPTS = {
    outline: `你是一个资深网文策划。基于以下信息，设计一个能留住读者的网文大纲。

背景设定：\${background}
人物设定：\${characters}
角色关系：\${relationships}
核心剧情：\${plot}
写作风格：\${style}

大纲要求：
- 核心矛盾要尖锐，不是"误会一下就和好"的弱冲突，是真正的两难选择
- 转折要有因果链，每个转折都能追溯到前因，不是突然冒出来的
- 人物动机要合理，每个关键行为都有真实动机，不是为了推动剧情而做蠢事
- 设计3-5个读者会记住的"名场面"，写清楚为什么读者会记住
- 结局要有余味，不是大团圆糊弄

【网文黄金结构】
- 黄金三章：前三章必须建立核心冲突+展示主角特质+第一个小高潮
- 付费点设计：在读者最想知道后续的地方断章（约第30章、第60章）
- 留存钩子：每5章必须有一个小高潮或大转折，防止读者弃书
- 差异化：标注这个故事跟同类题材的核心区别是什么

输出格式：
1. 一句话核心卖点（让读者在3秒内决定点进来）
2. 黄金三章设计（前三章各写什么，怎么钩住读者）
3. 故事梗概（300字，只写干货）
4. 主要人物（每人100字，重点写性格缺陷和内心矛盾，不要写成完美人设）
5. 情节主线（按节点列出，每个节点写清楚因果）
6. 关键转折设计（3-5个，写明白"为什么"转折，转折后人物发生什么变化）
7. 付费点和留存钩子设计
8. 结局走向（留什么余味）`,

    chapter: `你是一个网文分章策划。把下面的大纲拆成章节细纲，每章要有明确的情节推进。

大纲：\${outline}
背景：\${background}
人物：\${characters}
关系：\${relationships}
剧情：\${plot}
风格：\${style}

要求：
- 每章必须有一个"事件"——读者看完能用一句话概括"这章发生了什么"
- 情节要连贯，上一章的因导致下一章的果
- 别每章都搞"危机-化解"的套路，要有变化——有时候是日常、有时候是反转、有时候是伏笔
- 对话和行动推动剧情，不要用旁白解说
- 每章标注情绪曲线（紧张/轻松/悲伤/热血/悬疑）
- 每章标注钩子强度（1-5星，5星=读者绝对忍不住看下一章）

用 ###fenge 分隔章节，格式：

###fenge
第X章：[章节标题]
这章发生的事：[一句话]
情绪曲线：[紧张/轻松/悲伤/热血/悬疑]
钩子强度：[1-5星]
主要事件：
1. [起因]
2. [经过]
3. [结果/悬念]
关键对话或冲突：[简述]
与前文关联：[呼应了什么]
为下一章埋的线：[具体]
###fenge`,

    content: `你是一个网文写手，风格偏实战派，不搞花哨修辞。根据下面的章节大纲，写出正文。

═══════════════════════════════════════════
【基础设定】
═══════════════════════════════════════════
大纲：\${outline}
本章细纲：\${chapter_outline}
背景：\${background}
人物：\${characters}
关系：\${relationships}
剧情：\${plot}
风格：\${style}

═══════════════════════════════════════════
【作者永久记忆 - 必须严格遵守】
═══════════════════════════════════════════
\${permanent_memory}

═══════════════════════════════════════════
【前面章节摘要 - 保持连贯性】
═══════════════════════════════════════════
\${previous_chapters}

\${world_info}

═══════════════════════════════════════════
【写作铁律 - 违反任何一条都是废稿】
═══════════════════════════════════════════

一、开头黄金200字
- 每章开头200字必须有冲突、悬念或意外，不要从环境描写开始
- 读者看完前200字必须想看第201字
- 可以是：一句狠话、一个意外、一个选择、一个发现

二、语言规则
- 句子长短交替。短句制造节奏，长句铺陈信息。禁止通篇都是20字左右的"标准句"
- 禁止排比句。"他感到……他感到……他感到……"这种直接扣分
- 一个段落里"的"字不超过3个
- 形容词能删就删。"温暖的阳光"→"阳光"；"缓缓地走来"→"走过来"
- 用具体感官替代抽象形容："他闻到花香"→"栀子花的甜腻味灌进鼻腔"
- 信息密度：每段必须有新信息，禁止原地踏步
- 段落长度不规则：有的段落2句，有的5句，避免每段都是3-4句的工整感

三、对话规则
- 对话推动剧情，不是凑字数。每句对话要么暴露信息，要么暴露性格，要么推动行动
- 不同角色说话方式要不同。粗人说粗话，文人说文话，小孩说小孩话
- 禁止"XX说道"、"XX淡淡道"、"XX沉声道"反复出现。用动作代替说话标签
- 对话不要一问一答像审讯，要有打断、跑题、答非所问
- 对话要有潜台词，不是什么都说出来

四、叙事规则
- 用动作和结果表达情绪，不要写"他很愤怒"。写"他把杯子摔了"
- 禁止段落结尾总结式抒情。"这就是XX的意义啊"全部删掉
- 场景描写只写和剧情有关的细节。不要为了"营造氛围"而堆砌环境描写
- 人物内心活动用行为暗示，不要大段心理独白
- 节奏：该快的地方一句话带过一年，该慢的地方一个眼神写三段

五、结尾钩子
- 每章结尾必须留悬念或钩子
- 钩子必须跟下一章内容有关，不能是无关联的悬念
- 可以是：一个未解的问题、一个意外发现、一个艰难选择、一句话只说了一半

六、连贯性要求
- 人物性格必须与前面章节保持一致，不能突然变脸
- 如果前面章节有伏笔，本章要适当呼应或推进
- 世界观设定不能前后矛盾
- 角色关系的发展要有因果链，不能突变

【禁止清单】
以下词句出现任何一个，重写该段：
"心中一凛"、"眼中闪过一丝XX"、"嘴角勾起一抹XX"、"一股XX涌上心头"、"仿佛XX一般"、"宛如XX"、"不由得"、"情不自禁"、"目光深邃"、"意味深长"、"若有所思"、"恍然大悟"、"不禁XX"、"这一刻他明白"、"他知道，XX"、"眉头微蹙"、"嘴角上扬"、"眼中闪过一抹"、"心中暗道"、"不觉间"、"霎时间"、"此刻的他"、"他深知"、"无疑"、"显然"、"毫无疑问"、"不言而喻"、"与此同时"、"就在这时"、"突然间"、"猛然间"、"刹那间"、"恍惚间"、"不知不觉"、"本能地"、"下意识地"、"条件反射般"、"如同XX一般"、"好似XX"、"恰似XX"、"宛如XX似的"

直接写，不要在开头写"好的"或任何确认语。`,

    // 章节摘要生成（第57轮）
    summary: `你是一个小说编辑。请为以下章节内容生成一个简洁的摘要，用于帮助AI在生成后续章节时保持连贯性。

【章节内容】
\${chapter_content}

【摘要要求】
1. 用第三人称概述本章发生的主要事件（50-100字）
2. 列出本章出场的角色及其状态变化
3. 记录本章埋下的伏笔或悬念
4. 记录本章与前文的呼应关系
5. 记录本章结尾的状态（为下一章做铺垫）

请按以下格式输出：
【本章摘要】（50-100字）
【出场角色】角色名：状态变化
【伏笔/悬念】具体伏笔内容
【与前文关联】呼应了什么
【结尾状态】本章结束时的情况`
};

// ============================================================
// 右键菜单配置 — 大幅扩展（第4-10轮、第25-26轮）
// ============================================================

const DEFAULT_MENUS = {
    outline: {
        menu: [
            { name: "AI评分", prompt: `对以下大纲打分（0-100），评分维度：\n1. 核心矛盾是否尖锐（不是那种误会一下就和好的弱冲突）\n2. 转折有没有因果链（不是突然冒出来的）\n3. 人物有没有缺陷和成长（不是工具人）\n4. 有没有读者会记住的"名场面"\n5. 结局有没有余味\n6. 黄金三章是否有吸引力\n7. 付费点设计是否合理\n8. 跟同类题材的差异化\n\n扣分项：情节靠巧合推进-20，人物动机不合理-15，模板化三幕式结构-10，没有留存钩子-15\n\n大纲：\${selected_text}` },
            { name: "加强冲突", prompt: `以下大纲的冲突太弱了。把矛盾改尖锐，让人物面临两难选择，不是简单的善恶对立。冲突要让人物必须付出代价才能做出选择。\n背景：\${background}\n人物：\${characters}\n大纲：\${selected_text}` },
            { name: "加因果链", prompt: `以下大纲的转折缺乏因果。每个转折都要有前因，不能突然冒出来。补上前因后果，让每个转折都合理。\n大纲：\${selected_text}` },
            { name: "修人物动机", prompt: `以下大纲中人物动机不合理。人不是为了推动剧情而存在的，给每个关键行为找到真实动机。动机要跟人物的性格缺陷和过往经历有关。\n人物：\${characters}\n关系：\${relationships}\n大纲：\${selected_text}` },
            { name: "砍废话", prompt: `删掉以下大纲中所有废话、套话、正确的废话。只留核心情节节点和关键转折。删完后字数应减少30%以上。\n大纲：\${selected_text}` },
            { name: "加暗线", prompt: `在以下大纲中添加1-2条暗线/伏笔线。暗线要求：\n1. 有明确的埋设点（在哪一章埋下）\n2. 有明确的回收点（在哪一章揭开）\n3. 暗线跟主线有交叉，不是独立的支线\n4. 揭开时要有反转效果\n\n大纲：\${selected_text}` },
            { name: "砍冗余人物", prompt: `分析以下大纲中的人物，识别可以合并或删除的工具人角色。标准：\n1. 只出场一次且没有独立动机的角色→考虑合并\n2. 存在只是为了传话/解释信息的角色→考虑删除\n3. 功能重复的角色→考虑合并\n\n给出具体合并/删除建议。\n大纲：\${selected_text}` },
            { name: "加黄金三章", prompt: `优化以下大纲的前三章设计。要求：\n1. 第一章必须有核心冲突的种子\n2. 第二章必须展示主角的核心特质\n3. 第三章必须有一个小高潮\n4. 三章之内必须让读者知道"这本书讲什么"和"主角是什么人"\n\n大纲：\${selected_text}` }
        ]
    },
    chapter: {
        menu: [
            { name: "AI评分", prompt: `对以下章节细纲打分（0-100）。核心标准：每章能不能用一句话概括"这章发生了什么"。如果概括不出来，说明剧情散了，扣大分。\n\n评分维度：\n1. 每章是否有明确事件\n2. 情节是否有起伏（不是流水账）\n3. 对话是否推动剧情\n4. 钩子强度（读者看完想不想看下一章）\n5. 与前文是否有因果关联\n\n扣分项：没有明确事件-30，情节流水账-20，对话不推动剧情-15，没有钩子-15\n\n章节细纲：\${selected_text}` },
            { name: "加事件驱动", prompt: `以下章节细纲没有明确事件驱动。每章必须有一个核心事件，用行动和对话推进，不要用旁白叙述。事件要有起因、经过、结果。\n细纲：\${selected_text}` },
            { name: "理因果链", prompt: `以下章节之间缺乏因果联系。上一章的果要成为下一章的因。重新梳理因果关系，让每章都有"为什么发生在这里"的理由。\n大纲：\${outline}\n细纲：\${selected_text}` },
            { name: "砍流水账", prompt: `以下章节细纲是流水账。删掉所有"然后XX"、"接着XX"式的平铺直叙，只留有转折、有冲突、有信息量的节点。\n细纲：\${selected_text}` },
            { name: "加悬念钩子", prompt: `在以下章节细纲的每章结尾添加悬念钩子。要求：\n1. 钩子必须跟下一章内容有关\n2. 不能是无关联的悬念\n3. 钩子强度标注（1-5星）\n4. 最好是在最关键的地方断开\n\n细纲：\${selected_text}` },
            { name: "补对话要点", prompt: `在以下章节细纲中补充关键对话的要点。要求：\n1. 对话必须推动剧情或暴露人物性格\n2. 标注对话的目的（传递信息/制造冲突/揭示关系）\n3. 不同角色的说话方式要有区别\n\n人物：\${characters}\n细纲：\${selected_text}` },
            { name: "加情绪曲线", prompt: `为以下章节细纲标注情绪曲线。每章标注：\n1. 主要情绪（紧张/轻松/悲伤/热血/悬疑/温馨）\n2. 情绪起伏节奏（高潮/低谷）\n3. 与前后章的情绪对比\n\n确保连续3章不会有相同情绪（避免审美疲劳）。\n细纲：\${selected_text}` }
        ]
    },
    content: {
        menu: [
            { name: "AI味检测", prompt: `检测以下内容的AI味浓度（0-100分，100=完全人写，0=纯AI垃圾）。\n\n重点检查：\n1. 禁用词检测：有没有"不禁XX"、"仿佛XX"、"宛如XX"、"心中一凛"、"眼中闪过"、"嘴角勾起"、"眉头微蹙"、"嘴角上扬"、"心中暗道"、"不觉间"、"霎时间"、"此刻的他"、"他深知"、"无疑"、"显然"等模板句式\n2. 排比句检测：有没有排比句\n3. 段尾抒情：段落结尾有没有总结式抒情（"这就是XX的意义啊"）\n4. 形容词堆砌：形容词是否过多（"温暖的阳光"→该删"温暖的"）\n5. 对话标签：对话是不是都在"XX说道"后面接完整句子\n6. 心理独白：有没有大段心理独白代替行为描写\n7. "的"字密度：每段超过5个扣分\n8. 句子长度均匀度：全在15-25字=AI味重\n9. 句式多样性：是否有过多相同句式开头\n10. 词汇多样性：是否有高频重复词\n\n逐项打分，最后给总分。列出所有有问题的句子。\n\n内容：\${selected_text}` },
            { name: "去AI味重写", prompt: `以下内容AI味很重，重写它。\n\n重写规则：\n- 删掉所有禁用词（见禁止清单）\n- 删掉排比句\n- 删掉段落结尾的总结抒情\n- "的"字每段不超过3个\n- 形容词能删就删\n- 用动作代替情绪描写（"他很愤怒"→"他把杯子摔了"）\n- 对话标签用动作代替"XX说道"\n- 句子长短交替\n- 用具体感官替代抽象形容\n\n风格：\${style}\n内容：\${selected_text}` },
            { name: "压缩精简", prompt: `以下内容太啰嗦了。砍掉：\n1. 不推动剧情的环境描写\n2. 重复表达同一个意思的句子\n3. 所有"的"字超过3个的形容词堆砌\n4. 没有信息量的过渡句\n5. 总结式抒情\n6. 大段心理独白\n\n目标：字数减少40%，信息量不减。保留所有关键剧情信息和人物行为。\n内容：\${selected_text}` },
            { name: "改对话", prompt: `以下对话太假了。改得像真人说话：\n- 不同角色说话方式要不同\n- 别一问一答像审讯，要有打断、跑题、答非所问\n- 删掉"XX说道"、"XX淡淡道"，用动作代替\n- 对话要有潜台词，不是什么都说出来\n- 加入打断、沉默、转移话题\n\n人物：\${characters}\n内容：\${selected_text}` },
            { name: "砍形容词", prompt: `以下内容形容词太多，读着累。规则：\n- "温暖的阳光"→"阳光"\n- "缓缓地走来"→"走过来"\n- "美丽的花朵"→"花"\n- 删掉所有不改变意思的修饰词\n- 一个段落里"的"字不超过3个\n\n直接输出改后的文本，不要解释。\n内容：\${selected_text}` },
            { name: "加动作写情绪", prompt: `以下内容在用形容词写情绪，改成用动作和行为表达：\n- "他很紧张"→写他的具体动作（手指敲桌子、反复看手机、说话变快）\n- "她心如刀割"→写她做了什么（攥紧拳头、转身不让人看见眼泪）\n- "气氛很尴尬"→写谁说了什么、做了什么（沉默、找话题、假装看手机）\n\n不要加内心独白来解释。让读者自己从行为中感受。\n内容：\${selected_text}` },
            { name: "加口语感", prompt: `以下内容读着像机器写的。改成有口语感的写法：\n- 短句为主，偶尔一个长句\n- 可以用不完整的句子\n- 可以用省略号、破折号\n- 像在跟朋友讲故事，不是在写作文\n- 可以用方言、俚语（适度）\n\n内容：\${selected_text}` },
            { name: "加伏笔", prompt: `在以下内容中添加伏笔。要求：\n1. 伏笔要自然，不能太刻意\n2. 伏笔要在后文有回收\n3. 伏笔可以是：一个细节、一句话、一个物件、一个表情\n4. 标注伏笔的埋设点和预设的回收点\n\n大纲：\${outline}\n内容：\${selected_text}` },
            { name: "改节奏", prompt: `调整以下内容的节奏。\n\n分析当前节奏问题：\n- 如果太拖沓：压缩句子，用短句段落，删掉不推动剧情的描写\n- 如果太快：扩写关键场景，加入细节和对话，放慢重要时刻\n\n目标：让节奏跟内容匹配。紧张的地方快节奏，重要的地方慢节奏。\n内容：\${selected_text}` },
            { name: "加感官描写", prompt: `以下内容缺少感官细节。用视觉/听觉/嗅觉/触觉/味觉的具体细节替代抽象描述。\n\n示例：\n- "他闻到花香"→"栀子花的甜腻味灌进鼻腔，混着雨后泥土的腥气"\n- "天气很热"→"柏油路软得能踩出脚印，蝉鸣吵得人头疼"\n- "她很漂亮"→"她低头时，一缕头发垂下来遮住半边脸"\n\n不要过度描写，只加跟剧情有关的感官细节。\n内容：\${selected_text}` },
            { name: "续写", prompt: `根据以下已有内容，续写500-1000字。要求：\n1. 保持人物性格一致\n2. 保持情节连贯\n3. 保持语言风格一致\n4. 续写要有新信息或新冲突\n5. 结尾要留钩子\n\n大纲：\${outline}\n背景：\${background}\n人物：\${characters}\n已有内容：\${selected_text}` },
            { name: "改写风格", prompt: `将以下内容改写为指定风格。\n\n风格：热血/悬疑/搞笑/文艺/硬核（选择一个或自定义）\n要求：\n1. 保留核心剧情和人物\n2. 调整语言风格和节奏\n3. 仍然遵守反AI味规则\n\n内容：\${selected_text}` },
            { name: "一致性检查", action: "consistencyCheck" }
        ]
    },
    // 多阶段去AI味流水线菜单（基于最佳实践）
    pipeline: {
        menu: [
            { name: "一键去AI味", action: "executePipeline", options: { enableStyleRewrite: true, enableDeTemplate: true, enableHumanize: true, enablePolish: true } },
            { name: "仅风格改写", action: "executePipeline", options: { enableStyleRewrite: true, enableDeTemplate: false, enableHumanize: false, enablePolish: false } },
            { name: "仅去模板化", action: "executePipeline", options: { enableStyleRewrite: false, enableDeTemplate: true, enableHumanize: false, enablePolish: false } },
            { name: "仅人味注入", action: "executePipeline", options: { enableStyleRewrite: false, enableDeTemplate: false, enableHumanize: true, enablePolish: false } },
            { name: "AI味检测(本地)", action: "localAIDetect" }
        ]
    }
};

// ============================================================
// 小说类型配置 — 扩展（第18-19轮）
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
    },
    scifi: {
        name: "科幻末世",
        fields: {
            background: "未来世界，科技高度发达但社会崩坏，AI觉醒或外星入侵",
            characters: "主角：普通人在危机中觉醒\n同伴：各有专长的幸存者\n敌人：AI/外星势力/人类叛徒",
            relationships: "信任与背叛\n人性考验\n生存同盟",
            plot: "主角在末世中寻找真相，带领幸存者对抗威胁，揭示危机背后的阴谋",
            style: "硬核科幻，紧张刺激，人性深度刻画"
        }
    },
    gaming: {
        name: "游戏竞技",
        fields: {
            background: "虚拟游戏世界或电竞圈，主角是职业选手或游戏高手",
            characters: "主角：天赋型选手\n队友：各有特色的队友\n对手：强大的竞争对手",
            relationships: "队友默契\n对手竞争\n粉丝互动",
            plot: "主角从低谷崛起，带领战队征战赛场，最终夺冠",
            style: "热血燃情，团队精神，技术描写专业"
        }
    },
    mystery: {
        name: "悬疑推理",
        fields: {
            background: "现代都市或封闭环境，发生连环案件",
            characters: "主角：聪明理性的侦探/警察\n助手：忠诚的搭档\n嫌疑人：各怀鬼胎的嫌疑人",
            relationships: "搭档默契\n嫌疑人关系网\n受害者关联",
            plot: "主角通过逻辑推理和细节观察，层层揭开案件真相",
            style: "逻辑严密，氛围紧张，反转出人意料"
        }
    }
};

// ============================================================
// 应用状态 — 大幅扩展（第13、18-20、36、41、46轮）
// ============================================================

const AppState = {
    chapters: [],
    aiConversation: [],
    selectedText: "",
    currentTarget: null,
    isStreaming: false,

    // 角色管理（第18轮）
    characters: [],

    // 世界观笔记（第19轮）
    worldNotes: [],

    // 灵感笔记（第46轮）
    inspirationNotes: [],

    // 写作目标（第13轮）
    dailyGoal: 2000,
    todayWritten: 0,
    lastWriteDate: null,

    // 版本历史（第36轮）
    versions: [],

    // 多项目管理（第41轮）
    projects: [],
    currentProject: null,

    // 写作统计（第47轮）
    stats: {
        totalDays: 0,
        maxDaily: 0,
        streakDays: 0,
        lastWriteDate: null
    },

    // 提示词历史
    promptHistory: [],

    // 永久记忆（第56轮）— 用户手动添加的长期记忆
    permanentMemory: [],

    // 关键词触发式记忆注入（基于SillyTavern World Info方案）
    worldInfo: {
        enabled: true,
        entries: []
    },

    // 反AI味词汇库配置
    antiAIConfig: {
        enabled: true,
        autoReplace: false,  // 是否自动替换（需用户确认）
        customMappings: []   // 用户自定义映射
    },

    // 多阶段去AI味流水线配置
    pipelineConfig: {
        enabled: false,
        stages: {
            draft: { temperature: 0.7 },      // 初稿生成
            styleRewrite: { temperature: 0.6 }, // 风格改写
            deTemplate: { temperature: 0.4 },   // 去模板化
            humanize: { temperature: 0.8 },     // 人味注入
            polish: { temperature: 0.5 }        // 最终润色
        }
    }
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

// 流式读取（第39轮：增强错误处理）
async function streamFetch(url, body, onChunk) {
    const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${errorText}`);
    }
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

// 日期格式化
function formatDate(date) {
    return new Date(date).toLocaleDateString('zh-CN');
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================================================
// 状态持久化（第36、41轮增强）
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
            summary: $("#prompt-summary")?.value || "",
        },
        menus: {
            outline: $("#menu-outline").value,
            chapter: $("#menu-chapter").value,
            content: $("#menu-content").value,
        },
        genre: $("#genre-selector").value,
        aiConversation: AppState.aiConversation,
        characters: AppState.characters,
        worldNotes: AppState.worldNotes,
        inspirationNotes: AppState.inspirationNotes,
        dailyGoal: AppState.dailyGoal,
        todayWritten: AppState.todayWritten,
        lastWriteDate: AppState.lastWriteDate,
        versions: AppState.versions,
        stats: AppState.stats,
        permanentMemory: AppState.permanentMemory,
        // World Info 关键词触发配置
        worldInfo: AppState.worldInfo,
        // 反AI味配置
        antiAIConfig: AppState.antiAIConfig,
        // 多阶段流水线配置
        pipelineConfig: AppState.pipelineConfig
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
        if (!raw) {
            console.log("[loadState] 无保存数据，使用默认值");
            return;
        }
        const state = JSON.parse(raw);
        if (!state || typeof state !== "object") {
            console.warn("[loadState] 状态数据无效");
            return;
        }

        // 恢复字段
        if (state.fields && typeof state.fields === "object") {
            for (const [k, v] of Object.entries(state.fields)) {
                const el = document.getElementById(`field-${k}`);
                if (el && typeof v === "string") el.value = v;
            }
        }

        // 恢复大纲
        if (state.outline && typeof state.outline === "string") {
            const outlineEl = document.getElementById("outline");
            if (outlineEl) outlineEl.value = state.outline;
        }

        // 恢复提示词（只恢复非空值，空值保留默认）
        if (state.prompts && typeof state.prompts === "object") {
            const pOutline = document.getElementById("prompt-outline");
            const pChapter = document.getElementById("prompt-chapter");
            const pContent = document.getElementById("prompt-content");
            const pSummary = document.getElementById("prompt-summary");
            if (state.prompts.outline && pOutline) pOutline.value = state.prompts.outline;
            if (state.prompts.chapter && pChapter) pChapter.value = state.prompts.chapter;
            if (state.prompts.content && pContent) pContent.value = state.prompts.content;
            if (state.prompts.summary && pSummary) pSummary.value = state.prompts.summary;
        }

        // 恢复菜单配置（只恢复非空值）
        if (state.menus && typeof state.menus === "object") {
            const mOutline = document.getElementById("menu-outline");
            const mChapter = document.getElementById("menu-chapter");
            const mContent = document.getElementById("menu-content");
            if (state.menus.outline && mOutline) mOutline.value = state.menus.outline;
            if (state.menus.chapter && mChapter) mChapter.value = state.menus.chapter;
            if (state.menus.content && mContent) mContent.value = state.menus.content;
        }

        // 恢复类型
        if (state.genre && typeof state.genre === "string") {
            const genreEl = document.getElementById("genre-selector");
            if (genreEl) genreEl.value = state.genre;
        }

        // 恢复章节（兼容旧数据：补充 sceneConfig）
        if (state.chapters && Array.isArray(state.chapters)) {
            AppState.chapters = state.chapters.map(ch => {
                if (!ch.sceneConfig) {
                    ch.sceneConfig = {
                        characters: [],
                        contextRange: 'summary',
                        styleOverride: '',
                        sceneGoal: '',
                        sceneType: 'narrative',
                        emotionalTone: '',
                        pacing: 'normal'
                    };
                }
                return ch;
            });
            try { renderChapters(); } catch (e) { console.error("[loadState] renderChapters失败:", e); }
        }

        // 恢复AI对话
        if (state.aiConversation && Array.isArray(state.aiConversation)) {
            AppState.aiConversation = state.aiConversation;
            try {
                AppState.aiConversation.forEach(msg => {
                    if (msg && msg.role && msg.content) {
                        addAIMessage(msg.role, msg.content, false);
                    }
                });
            } catch (e) { console.error("[loadState] 恢复AI对话失败:", e); }
        }

        // 恢复角色（第18轮，SillyTavern增强兼容）
        if (state.characters && Array.isArray(state.characters)) {
            AppState.characters = state.characters.map(c => {
                // 兼容旧数据：将旧字段映射到新字段
                if (!c.description && c.appearance) c.description = c.appearance;
                if (!c.speech_style && c.catchphrase) c.speech_style = c.catchphrase;
                if (!c.relationships) c.relationships = {};
                if (!c.example_dialogue) c.example_dialogue = [];
                if (!c.current_state) c.current_state = '';
                if (!c.first_appearance) c.first_appearance = '';
                if (!c.arc) c.arc = '';
                return c;
            });
            try { renderCharacters(); } catch (e) { console.error("[loadState] renderCharacters失败:", e); }
        }

        // 恢复世界观笔记（第19轮）
        if (state.worldNotes && Array.isArray(state.worldNotes)) {
            AppState.worldNotes = state.worldNotes;
            try { renderWorldNotes(); } catch (e) { console.error("[loadState] renderWorldNotes失败:", e); }
        }

        // 恢复灵感笔记（第46轮）
        if (state.inspirationNotes && Array.isArray(state.inspirationNotes)) {
            AppState.inspirationNotes = state.inspirationNotes;
            try { renderInspirationNotes(); } catch (e) { console.error("[loadState] renderInspirationNotes失败:", e); }
        }

        // 恢复写作目标（第13轮）
        if (state.dailyGoal) AppState.dailyGoal = state.dailyGoal;
        if (state.todayWritten) AppState.todayWritten = state.todayWritten;
        if (state.lastWriteDate) AppState.lastWriteDate = state.lastWriteDate;

        // 恢复版本历史（第36轮）
        if (state.versions && Array.isArray(state.versions)) {
            AppState.versions = state.versions;
        }

        // 恢复统计（第47轮）
        if (state.stats && typeof state.stats === "object") {
            AppState.stats = { ...AppState.stats, ...state.stats };
        }

        // 恢复永久记忆（第56轮）
        if (state.permanentMemory && Array.isArray(state.permanentMemory)) {
            AppState.permanentMemory = state.permanentMemory;
            try { renderPermanentMemory(); } catch (e) { console.error("[loadState] renderPermanentMemory失败:", e); }
        }

        // 恢复 World Info 关键词触发配置
        if (state.worldInfo && typeof state.worldInfo === "object") {
            AppState.worldInfo = { ...AppState.worldInfo, ...state.worldInfo };
            if (!Array.isArray(AppState.worldInfo.entries)) {
                AppState.worldInfo.entries = [];
            }
        }

        // 恢复反AI味配置
        if (state.antiAIConfig && typeof state.antiAIConfig === "object") {
            AppState.antiAIConfig = { ...AppState.antiAIConfig, ...state.antiAIConfig };
        }

        // 恢复多阶段流水线配置
        if (state.pipelineConfig && typeof state.pipelineConfig === "object") {
            AppState.pipelineConfig = { ...AppState.pipelineConfig, ...state.pipelineConfig };
        }

        // 检查是否是新的一天，重置今日字数
        checkNewDay();

        console.log("[loadState] 状态恢复成功");

    } catch (e) {
        console.error("[loadState] 加载状态失败，清除损坏数据:", e);
        // 如果数据损坏，清除它
        try { localStorage.removeItem("kealin_novels_state"); } catch (_) {}
    }
}

function checkNewDay() {
    const today = new Date().toDateString();
    if (AppState.lastWriteDate !== today) {
        AppState.todayWritten = 0;
        AppState.lastWriteDate = today;
    }
}

// ============================================================
// 导入导出（第37-38轮增强）
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

// 导出TXT（第37轮）
function exportTxt() {
    let content = "";
    const title = $("#field-plot").value.slice(0, 20) || "未命名小说";
    content += `《${title}》\n\n`;

    // 大纲
    if ($("#outline").value) {
        content += `【大纲】\n${$("#outline").value}\n\n`;
    }

    // 章节
    AppState.chapters.forEach((ch, i) => {
        content += `\n${'='.repeat(40)}\n`;
        content += `第${i + 1}章\n`;
        content += `${'='.repeat(40)}\n\n`;
        if (ch.content) {
            content += ch.content + "\n";
        }
    });

    const totalChars = countChars(content);
    content += `\n\n【统计】共 ${AppState.chapters.length} 章，${totalChars} 字`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast("已导出TXT", "success");
}

// 导出Markdown（第38轮）
function exportMarkdown() {
    let content = "";
    const title = $("#field-plot").value.slice(0, 20) || "未命名小说";
    content += `# ${title}\n\n`;

    // 大纲
    if ($("#outline").value) {
        content += `## 大纲\n\n${$("#outline").value}\n\n`;
    }

    // 章节
    AppState.chapters.forEach((ch, i) => {
        content += `## 第${i + 1}章\n\n`;
        if (ch.content) {
            content += ch.content + "\n\n";
        }
    });

    const totalChars = countChars(content);
    content += `---\n\n*共 ${AppState.chapters.length} 章，${totalChars} 字*\n`;

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast("已导出Markdown", "success");
}

// ============================================================
// 章节管理（第15、16、33轮增强）
// ============================================================

function addChapter(outline = "", content = "") {
    AppState.chapters.push({
        outline,
        content,
        expanded: false,
        summary: '',
        // 场景级配置（借鉴 Novelcrafter）
        sceneConfig: {
            characters: [],           // 本场景出场角色（从角色列表选择）
            contextRange: 'summary',  // 'full' | 'summary' | 'minimal'
            styleOverride: '',        // 本场景风格覆盖
            sceneGoal: '',            // 本场景要达成的目标
            sceneType: 'narrative',   // 'action' | 'dialogue' | 'narrative' | 'transition'
            emotionalTone: '',        // 情绪基调
            pacing: 'normal'          // 'slow' | 'normal' | 'fast'
        }
    });
    renderChapters();
    saveState();
}

function renderChapters() {
    const container = $("#chapters-container");
    container.innerHTML = "";

    AppState.chapters.forEach((ch, i) => {
        const div = document.createElement("div");
        div.className = `chapter-item${ch.expanded ? " expanded" : ""}`;
        div.setAttribute("draggable", "true");
        div.setAttribute("data-idx", i);

        // 提取章节标题
        const titleMatch = ch.outline.match(/第.{1,3}章[：:](.+)/);
        const title = titleMatch ? titleMatch[1].trim() : (ch.outline.slice(0, 20) || "新章节");
        const contentCharCount = countChars(ch.content);
        const outlineCharCount = countChars(ch.outline);
        const charCount = contentCharCount > 0 ? contentCharCount : outlineCharCount;
        const status = ch.content ? (ch.content.length > 100 ? "✅" : "📝") : "⏳";

        // 确保 sceneConfig 存在（兼容旧数据）
        if (!ch.sceneConfig) {
            ch.sceneConfig = {
                characters: [],
                contextRange: 'summary',
                styleOverride: '',
                sceneGoal: '',
                sceneType: 'narrative',
                emotionalTone: '',
                pacing: 'normal'
            };
        }
        const sc = ch.sceneConfig;

        // 构建角色多选HTML
        const charCheckboxes = AppState.characters.map(c => {
            const checked = sc.characters.includes(c.id) ? 'checked' : '';
            return `<label style="display:inline-flex;align-items:center;gap:4px;margin-right:12px;font-size:12px;">
                <input type="checkbox" class="scene-char-check" data-char-id="${c.id}" data-idx="${i}" ${checked}>
                ${c.name || '未命名'}
            </label>`;
        }).join('');

        div.innerHTML = `
            <div class="chapter-header" data-idx="${i}">
                <div class="chapter-title-area">
                    <span class="chapter-num">${i + 1}</span>
                    <span class="chapter-title-text">${truncate(title, 30)}</span>
                    <span class="chapter-status">${status}</span>
                    <span class="chapter-chars">${charCount}${contentCharCount > 0 ? '字' : '字(纲)'}</span>
                </div>
                <div class="chapter-actions">
                    <span class="chapter-arrow">▶</span>
                    <button class="btn btn-sm btn-ghost" data-action="move-up" data-idx="${i}" title="上移">↑</button>
                    <button class="btn btn-sm btn-ghost" data-action="move-down" data-idx="${i}" title="下移">↓</button>
                    <button class="btn btn-sm btn-ghost btn-danger" data-action="delete" data-idx="${i}">删除</button>
                </div>
            </div>
            <div class="chapter-body">
                <div class="chapter-outline-area">
                    <h4>章节细纲</h4>
                    <textarea class="ch-outline" data-idx="${i}" placeholder="在此编辑章节细纲...">${ch.outline}</textarea>
                    <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">
                        <button class="btn btn-sm btn-primary" data-action="gen-content" data-idx="${i}">生成正文</button>
                        <button class="btn btn-sm btn-ghost" data-action="copy-outline" data-idx="${i}">复制细纲</button>
                        <button class="btn btn-sm btn-ghost" data-action="preview-chapter" data-idx="${i}">预览</button>
                        <button class="btn btn-sm btn-ghost" data-action="consistency-check" data-idx="${i}">一致性检查</button>
                    </div>
                </div>
                <div class="scene-config-panel" data-idx="${i}" style="margin-top:8px;padding:10px;border:1px solid var(--border);border-radius:6px;background:var(--bg-card);">
                    <div style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;" onclick="toggleSceneConfig(${i})">
                        <h4 style="margin:0;font-size:13px;">场景配置（借鉴 Novelcrafter）</h4>
                        <span class="scene-config-toggle" id="scene-toggle-${i}" style="font-size:12px;">▶</span>
                    </div>
                    <div class="scene-config-body" id="scene-body-${i}" style="display:none;margin-top:10px;">
                        <div style="margin-bottom:8px;">
                            <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px;">出场角色</label>
                            <div style="display:flex;flex-wrap:wrap;gap:2px;">
                                ${charCheckboxes || '<span style="font-size:11px;color:var(--text-muted);">暂无角色，请先添加角色</span>'}
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px;">
                            <div>
                                <label style="font-size:12px;font-weight:600;display:block;margin-bottom:2px;">上下文范围</label>
                                <select class="scene-context-range select-input" data-idx="${i}" style="font-size:12px;width:100%;">
                                    <option value="minimal" ${sc.contextRange === 'minimal' ? 'selected' : ''}>精简(2章)</option>
                                    <option value="summary" ${sc.contextRange === 'summary' ? 'selected' : ''}>摘要(5章)</option>
                                    <option value="full" ${sc.contextRange === 'full' ? 'selected' : ''}>完整(10章)</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size:12px;font-weight:600;display:block;margin-bottom:2px;">场景类型</label>
                                <select class="scene-type select-input" data-idx="${i}" style="font-size:12px;width:100%;">
                                    <option value="narrative" ${sc.sceneType === 'narrative' ? 'selected' : ''}>叙事</option>
                                    <option value="action" ${sc.sceneType === 'action' ? 'selected' : ''}>动作</option>
                                    <option value="dialogue" ${sc.sceneType === 'dialogue' ? 'selected' : ''}>对话</option>
                                    <option value="transition" ${sc.sceneType === 'transition' ? 'selected' : ''}>过渡</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size:12px;font-weight:600;display:block;margin-bottom:2px;">节奏</label>
                                <select class="scene-pacing select-input" data-idx="${i}" style="font-size:12px;width:100%;">
                                    <option value="slow" ${sc.pacing === 'slow' ? 'selected' : ''}>慢节奏</option>
                                    <option value="normal" ${sc.pacing === 'normal' ? 'selected' : ''}>正常</option>
                                    <option value="fast" ${sc.pacing === 'fast' ? 'selected' : ''}>快节奏</option>
                                </select>
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
                            <div>
                                <label style="font-size:12px;font-weight:600;display:block;margin-bottom:2px;">情绪基调</label>
                                <input type="text" class="input scene-emotional-tone" data-idx="${i}" value="${sc.emotionalTone}" placeholder="如：紧张、温馨、悲伤" style="font-size:12px;">
                            </div>
                            <div>
                                <label style="font-size:12px;font-weight:600;display:block;margin-bottom:2px;">风格覆盖</label>
                                <input type="text" class="input scene-style-override" data-idx="${i}" value="${sc.styleOverride}" placeholder="本场景特殊风格要求" style="font-size:12px;">
                            </div>
                        </div>
                        <div>
                            <label style="font-size:12px;font-weight:600;display:block;margin-bottom:2px;">场景目标</label>
                            <textarea class="textarea-sm scene-goal" data-idx="${i}" rows="2" placeholder="本场景要达成的目标（如：揭示主角的过去、制造男女主误会）" style="font-size:12px;width:100%;box-sizing:border-box;">${sc.sceneGoal}</textarea>
                        </div>
                    </div>
                </div>
                <div class="chapter-content-area">
                    <h4>章节正文</h4>
                    <textarea class="ch-content textarea-tall" data-idx="${i}" placeholder="点击「生成正文」或在此手动编写...">${ch.content}</textarea>
                    <div class="micro-controls" data-idx="${i}">
                        <span class="micro-label">选中文本后操作：</span>
                        <button class="btn btn-xs btn-ghost" data-action="rewrite-selection" data-idx="${i}" data-mode="rewrite">🔄 重写选中</button>
                        <button class="btn btn-xs btn-ghost" data-action="rewrite-selection" data-idx="${i}" data-mode="expand">📝 扩写</button>
                        <button class="btn btn-xs btn-ghost" data-action="rewrite-selection" data-idx="${i}" data-mode="compress">✂️ 缩写</button>
                        <button class="btn btn-xs btn-ghost" data-action="rewrite-selection" data-idx="${i}" data-mode="dialogue">💬 改对话</button>
                        <button class="btn btn-xs btn-ghost" data-action="rewrite-selection" data-idx="${i}" data-mode="describe">🎨 加描写</button>
                    </div>
                    <div class="card-footer">
                        <span class="char-count">${charCount} 字</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    // 绑定事件
    bindChapterEvents();

    // 绑定拖拽事件（第15轮）
    bindDragEvents();

    updateStats();
}

function bindChapterEvents() {
    const container = $("#chapters-container");

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

    // 上移/下移（第15轮）
    container.querySelectorAll("[data-action='move-up']").forEach(el => {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            if (idx > 0) {
                [AppState.chapters[idx - 1], AppState.chapters[idx]] = [AppState.chapters[idx], AppState.chapters[idx - 1]];
                renderChapters();
                saveState();
            }
        });
    });

    container.querySelectorAll("[data-action='move-down']").forEach(el => {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            if (idx < AppState.chapters.length - 1) {
                [AppState.chapters[idx], AppState.chapters[idx + 1]] = [AppState.chapters[idx + 1], AppState.chapters[idx]];
                renderChapters();
                saveState();
            }
        });
    });

    // 预览章节
    container.querySelectorAll("[data-action='preview-chapter']").forEach(el => {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            showChapterPreview(idx);
        });
    });

    // 微观控制：重写选中文本（第57轮）
    container.querySelectorAll("[data-action='rewrite-selection']").forEach(el => {
        el.addEventListener("click", async (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            const mode = el.dataset.mode;
            const contentEl = container.querySelector(`.ch-content[data-idx="${idx}"]`);
            if (!contentEl) return;

            const start = contentEl.selectionStart;
            const end = contentEl.selectionEnd;
            const selectedText = contentEl.value.substring(start, end);

            if (!selectedText || selectedText.trim().length === 0) {
                toast("请先选中要操作的文本", "warning");
                return;
            }

            await rewriteSelection(idx, selectedText, start, end, mode);
        });
    });

    // textarea 变化时保存
    container.querySelectorAll(".ch-outline").forEach(el => {
        el.addEventListener("input", () => {
            const idx = parseInt(el.dataset.idx);
            AppState.chapters[idx].outline = el.value;
            debouncedSave();
        });
        el.addEventListener("contextmenu", (e) => showContextMenu(e, "chapter", el));
    });

    container.querySelectorAll(".ch-content").forEach(el => {
        el.addEventListener("input", () => {
            const idx = parseInt(el.dataset.idx);
            AppState.chapters[idx].content = el.value;
            debouncedSave();
            updateTodayWritten(el.value.length);
            updateStats();
        });
        el.addEventListener("contextmenu", (e) => showContextMenu(e, "content", el));
    });

    // ---- 场景配置控件事件绑定 ----

    // 出场角色复选框
    container.querySelectorAll(".scene-char-check").forEach(el => {
        el.addEventListener("change", () => {
            const idx = parseInt(el.dataset.idx);
            const charId = el.dataset.charId;
            const sc = AppState.chapters[idx].sceneConfig;
            if (el.checked) {
                if (!sc.characters.includes(charId)) sc.characters.push(charId);
            } else {
                sc.characters = sc.characters.filter(id => id !== charId);
            }
            debouncedSave();
        });
    });

    // 上下文范围
    container.querySelectorAll(".scene-context-range").forEach(el => {
        el.addEventListener("change", () => {
            const idx = parseInt(el.dataset.idx);
            AppState.chapters[idx].sceneConfig.contextRange = el.value;
            debouncedSave();
        });
    });

    // 场景类型
    container.querySelectorAll(".scene-type").forEach(el => {
        el.addEventListener("change", () => {
            const idx = parseInt(el.dataset.idx);
            AppState.chapters[idx].sceneConfig.sceneType = el.value;
            debouncedSave();
        });
    });

    // 节奏
    container.querySelectorAll(".scene-pacing").forEach(el => {
        el.addEventListener("change", () => {
            const idx = parseInt(el.dataset.idx);
            AppState.chapters[idx].sceneConfig.pacing = el.value;
            debouncedSave();
        });
    });

    // 情绪基调
    container.querySelectorAll(".scene-emotional-tone").forEach(el => {
        el.addEventListener("input", () => {
            const idx = parseInt(el.dataset.idx);
            AppState.chapters[idx].sceneConfig.emotionalTone = el.value;
            debouncedSave();
        });
    });

    // 风格覆盖
    container.querySelectorAll(".scene-style-override").forEach(el => {
        el.addEventListener("input", () => {
            const idx = parseInt(el.dataset.idx);
            AppState.chapters[idx].sceneConfig.styleOverride = el.value;
            debouncedSave();
        });
    });

    // 场景目标
    container.querySelectorAll(".scene-goal").forEach(el => {
        el.addEventListener("input", () => {
            const idx = parseInt(el.dataset.idx);
            AppState.chapters[idx].sceneConfig.sceneGoal = el.value;
            debouncedSave();
        });
    });

    // 一致性检查按钮
    container.querySelectorAll("[data-action='consistency-check']").forEach(el => {
        el.addEventListener("click", async (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            await checkChapterConsistency(idx);
        });
    });
}

// 切换场景配置面板显示
function toggleSceneConfig(idx) {
    const body = document.getElementById(`scene-body-${idx}`);
    const toggle = document.getElementById(`scene-toggle-${idx}`);
    if (!body || !toggle) return;
    const isHidden = body.style.display === 'none';
    body.style.display = isHidden ? 'block' : 'none';
    toggle.textContent = isHidden ? '▼' : '▶';
}

// 拖拽排序（第15轮）
function bindDragEvents() {
    const container = $("#chapters-container");
    let draggedIdx = null;

    container.querySelectorAll(".chapter-item").forEach(el => {
        el.addEventListener("dragstart", (e) => {
            draggedIdx = parseInt(el.dataset.idx);
            el.style.opacity = "0.5";
            e.dataTransfer.effectAllowed = "move";
        });

        el.addEventListener("dragend", () => {
            el.style.opacity = "1";
            draggedIdx = null;
        });

        el.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            el.style.borderTop = "2px solid var(--accent)";
        });

        el.addEventListener("dragleave", () => {
            el.style.borderTop = "";
        });

        el.addEventListener("drop", (e) => {
            e.preventDefault();
            el.style.borderTop = "";
            const dropIdx = parseInt(el.dataset.idx);
            if (draggedIdx !== null && draggedIdx !== dropIdx) {
                const item = AppState.chapters.splice(draggedIdx, 1)[0];
                AppState.chapters.splice(dropIdx, 0, item);
                renderChapters();
                saveState();
            }
        });
    });
}

// 章节预览
function showChapterPreview(idx) {
    const ch = AppState.chapters[idx];
    const modal = $("#modal");
    $("#modal-title").textContent = `第${idx + 1}章预览`;
    $("#modal-body").innerHTML = `
        <div style="margin-bottom:16px;">
            <h4 style="color:var(--accent-light);margin-bottom:8px;">章节细纲</h4>
            <div style="white-space:pre-wrap;line-height:1.8;color:var(--text-secondary);">${ch.outline || "（未填写）"}</div>
        </div>
        <div>
            <h4 style="color:var(--accent-light);margin-bottom:8px;">章节正文</h4>
            <div style="white-space:pre-wrap;line-height:2;font-size:15px;">${ch.content || "（未生成）"}</div>
        </div>
    `;
    $("#modal-footer").innerHTML = '<button class="btn btn-ghost" onclick="hideModal(\'modal\')">关闭</button>';
    showModal("modal");
}

function truncate(str, len) {
    return str.length > len ? str.slice(0, len) + "..." : str;
}

let saveTimer;
function debouncedSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 500);
}

// 更新今日写字数（第13轮）
function updateTodayWritten(chars) {
    checkNewDay();
    AppState.todayWritten += 1; // 粗略计数，实际应统计增量
    AppState.lastWriteDate = new Date().toDateString();

    // 更新统计（第47轮）
    AppState.stats.lastWriteDate = AppState.lastWriteDate;
    if (AppState.todayWritten > AppState.stats.maxDaily) {
        AppState.stats.maxDaily = AppState.todayWritten;
    }
}

// ============================================================
// 统计（第17轮增强）
// ============================================================

function updateStats() {
    let total = countChars($("#outline").value);
    AppState.chapters.forEach(ch => {
        total += countChars(ch.content);
    });
    $("#total-chars").textContent = `字数: ${total.toLocaleString()}`;
    $("#chapter-count").textContent = `章节: ${AppState.chapters.length}`;

    // 更新今日字数显示
    const todayEl = $("#today-chars");
    if (todayEl) {
        todayEl.textContent = `今日: ${AppState.todayWritten}`;
    }

    // 更新进度条
    updateGoalProgress();
}

// 写作目标进度（第13轮、第32轮）
function updateGoalProgress() {
    const progressEl = $("#goal-progress");
    if (!progressEl) return;

    const percentage = Math.min(100, Math.round((AppState.todayWritten / AppState.dailyGoal) * 100));
    progressEl.style.width = percentage + "%";
    progressEl.style.background = percentage >= 100 ? "var(--success)" :
                                   percentage >= 60 ? "var(--accent)" :
                                   percentage >= 30 ? "var(--warning)" : "var(--danger)";

    const goalTextEl = $("#goal-text");
    if (goalTextEl) {
        goalTextEl.textContent = `${AppState.todayWritten}/${AppState.dailyGoal}字`;
    }
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

    // 保存版本（第36轮）
    saveVersion("生成大纲前");

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

    // 保存版本（第36轮）
    saveVersion("生成章节前");

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

// 获取前面章节的上下文（滑动窗口记忆，第56轮，第57轮增强）
function getPreviousChaptersContext(currentIdx, maxChapters = 10) {
    return getPreviousChaptersContextWithSummary(currentIdx, maxChapters);
}

// 获取永久记忆内容（第56轮）
function getPermanentMemoryContext() {
    if (!AppState.permanentMemory || AppState.permanentMemory.length === 0) {
        return "";
    }
    const memoryItems = AppState.permanentMemory
        .filter(m => m && m.trim().length > 0)
        .map((m, i) => `${i + 1}. ${m}`)
        .join("\n");
    return memoryItems ? `【作者永久记忆】\n以下是作者特别强调的重要设定和要求，在整个创作过程中必须严格遵守：\n${memoryItems}` : "";
}

// ============================================================
// 关键词触发式记忆注入（深度借鉴 SillyTavern World Info 设计）
// ============================================================

// 次级关键词逻辑枚举（借鉴 SillyTavern Selective Logic）
const SELECTIVE_LOGIC = {
    AND_ANY: 0,   // 主key匹配 + 次级key任意一个匹配
    NOT_ALL: 1,   // 主key匹配 + 次级key并非全部匹配
    NOT_ANY: 2,   // 主key匹配 + 次级key全部不匹配
    AND_ALL: 3    // 主key匹配 + 次级key全部匹配
};

// 匹配源枚举
const MATCH_SOURCES = {
    OUTLINE: 'outline',           // 大纲
    PLOT: 'plot',                 // 剧情
    BACKGROUND: 'background',     // 背景
    CHARACTERS: 'characters',     // 角色设定
    STYLE: 'style',               // 写作风格
    PREVIOUS_CHAPTERS: 'previous' // 前文章节摘要
};

// 创建默认的 World Info 条目结构
function createWorldInfoEntry(overrides = {}) {
    return {
        id: generateId(),
        name: '',                           // 条目名称/备注
        keywords: [],                       // 主关键词列表
        secondaryKeywords: [],              // 次级（筛选）关键词
        selectiveLogic: SELECTIVE_LOGIC.AND_ANY, // 次级关键词逻辑
        content: '',                        // 插入的设定内容
        priority: 100,                      // 插入优先级（越大越靠后，影响越大）
        enabled: true,                      // 是否启用
        constant: false,                    // 保底条目（无需关键词，每次生成都注入）
        useRegex: false,                    // 是否使用正则匹配
        caseSensitive: false,               // 大小写敏感
        matchWholeWords: false,             // 全词匹配（中文建议关闭）
        probability: 100,                   // 触发概率（0-100）
        group: '',                          // 互斥组名称（同组只激活一个）
        matchSources: [                     // 匹配源（在哪些字段中搜索关键词）
            MATCH_SOURCES.OUTLINE,
            MATCH_SOURCES.PLOT,
            MATCH_SOURCES.BACKGROUND,
            MATCH_SOURCES.CHARACTERS,
            MATCH_SOURCES.PREVIOUS_CHAPTERS
        ],
        sticky: null,                       // 激活后保持活跃的章节数（null=仅本章）
        cooldown: null,                     // 激活后冷却章节数
        createdAt: new Date().toISOString()
    };
}

// 添加World Info条目
function addWorldInfoEntry(name, keywords, content, priority = 100, options = {}) {
    const entry = createWorldInfoEntry({
        name,
        keywords: Array.isArray(keywords) ? keywords : keywords.split(/[,，、\s]+/).filter(k => k.trim()),
        content,
        priority,
        ...options
    });
    AppState.worldInfo.entries.push(entry);
    saveState();
    return entry;
}

// 删除World Info条目
function removeWorldInfoEntry(entryId) {
    const idx = AppState.worldInfo.entries.findIndex(e => e.id === entryId);
    if (idx !== -1) {
        AppState.worldInfo.entries.splice(idx, 1);
        saveState();
        return true;
    }
    return false;
}

// 检查单个关键词是否匹配文本（支持正则）
function matchSingleKeyword(keyword, text, useRegex = false, caseSensitive = false, matchWholeWords = false) {
    if (!keyword || !text) return false;

    try {
        if (useRegex) {
            // 正则匹配（借鉴 SillyTavern：以 / 为定界符）
            const regexMatch = keyword.match(/^\/(.+)\/([gimsuy]*)$/);
            if (regexMatch) {
                const flags = regexMatch[2] || (caseSensitive ? '' : 'i');
                const regex = new RegExp(regexMatch[1], flags);
                return regex.test(text);
            }
        }

        // 纯文本匹配
        const searchText = caseSensitive ? text : text.toLowerCase();
        const searchKeyword = caseSensitive ? keyword.trim() : keyword.trim().toLowerCase();

        if (matchWholeWords) {
            // 全词匹配（对中文不太友好，但保留选项）
            const regex = new RegExp(`\\b${escapeRegex(searchKeyword)}\\b`, caseSensitive ? '' : 'i');
            return regex.test(text);
        }

        return searchText.includes(searchKeyword);
    } catch (e) {
        console.warn(`[World Info] 关键词匹配异常: ${keyword}`, e);
        return false;
    }
}

// 正则转义
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 检查条目是否匹配（支持主关键词 + 次级关键词逻辑）
function matchEntry(entry, textSources) {
    if (!entry.enabled) return false;

    // 保底条目（constant）无需匹配
    if (entry.constant) return true;

    // 概率检查（借鉴 SillyTavern Probability）
    if (entry.probability < 100) {
        const rand = Math.random() * 100;
        if (rand > entry.probability) return false;
    }

    // 合并所有匹配源的文本
    const combinedText = textSources.join('\n');

    // 主关键词匹配
    const mainMatch = entry.keywords.some(kw =>
        matchSingleKeyword(kw, combinedText, entry.useRegex, entry.caseSensitive, entry.matchWholeWords)
    );

    if (!mainMatch) return false;

    // 如果没有次级关键词，直接匹配成功
    if (!entry.secondaryKeywords || entry.secondaryKeywords.length === 0) return true;

    // 次级关键词逻辑（借鉴 SillyTavern Selective Logic）
    const secondaryMatches = entry.secondaryKeywords.map(kw =>
        matchSingleKeyword(kw, combinedText, entry.useRegex, entry.caseSensitive, entry.matchWholeWords)
    );

    switch (entry.selectiveLogic) {
        case SELECTIVE_LOGIC.AND_ANY:
            return secondaryMatches.some(m => m);  // 任意一个匹配
        case SELECTIVE_LOGIC.NOT_ALL:
            return !secondaryMatches.every(m => m); // 并非全部匹配
        case SELECTIVE_LOGIC.NOT_ANY:
            return !secondaryMatches.some(m => m);  // 全部不匹配
        case SELECTIVE_LOGIC.AND_ALL:
            return secondaryMatches.every(m => m);  // 全部匹配
        default:
            return secondaryMatches.some(m => m);
    }
}

// 获取匹配的文本源（根据条目配置的 matchSources）
function getTextSources(chapterIdx) {
    const vars = getFieldVars();
    const sources = [];

    // 始终包含当前章节大纲
    const ch = AppState.chapters[chapterIdx];
    if (ch) {
        sources.push(ch.outline || '');
    }

    // 根据配置添加其他匹配源
    sources.push(vars.outline || '');
    sources.push(vars.plot || '');
    sources.push(vars.background || '');
    sources.push(vars.characters || '');
    sources.push(vars.style || '');

    // 前文章节摘要（借鉴 SillyTavern Scan Depth）
    if (chapterIdx > 0) {
        const prevContext = getPreviousChaptersContextWithSummary(chapterIdx, 5);
        sources.push(prevContext || '');
    }

    return sources.filter(s => s.length > 0);
}

// 根据文本内容匹配关键词，返回相关的世界设定
function matchWorldInfo(textOrChapterIdx) {
    if (!AppState.worldInfo.enabled) return [];

    let textSources;
    if (typeof textOrChapterIdx === 'number') {
        textSources = getTextSources(textOrChapterIdx);
    } else {
        textSources = [textOrChapterIdx];
    }

    const matchedEntries = [];
    const groupActivated = new Set(); // 互斥组已激活记录

    for (const entry of AppState.worldInfo.entries) {
        if (!entry.enabled) continue;

        // 检查互斥组（借鉴 SillyTavern Inclusion Group）
        if (entry.group && groupActivated.has(entry.group)) continue;

        if (matchEntry(entry, textSources)) {
            matchedEntries.push(entry);

            // 记录互斥组激活
            if (entry.group) {
                groupActivated.add(entry.group);
            }
        }
    }

    // 按优先级排序（priority 越大越靠后，影响越大）
    matchedEntries.sort((a, b) => a.priority - b.priority);

    return matchedEntries;
}

// 获取关键词触发的记忆上下文
function getWorldInfoContext(textOrChapterIdx) {
    if (!AppState.worldInfo.enabled) return "";

    const matchedEntries = matchWorldInfo(textOrChapterIdx);
    if (matchedEntries.length === 0) return "";

    // 分离保底条目和条件条目
    const constantEntries = matchedEntries.filter(e => e.constant);
    const conditionalEntries = matchedEntries.filter(e => !e.constant);

    // 保底条目优先，然后条件条目
    const sortedEntries = [...constantEntries, ...conditionalEntries];

    const contextItems = sortedEntries
        .map(entry => `【${entry.name || '世界设定'}】\n${entry.content}`)
        .join("\n\n");

    return `【世界设定 - 关键词触发】\n以下是与当前内容相关的世界设定（共${matchedEntries.length}条）：\n\n${contextItems}`;
}

// 初始化World Info预设（可在UI中配置）
function initDefaultWorldInfo() {
    if (AppState.worldInfo.entries.length > 0) return; // 已有数据，不初始化

    // 示例1：保底条目（每次生成都注入，借鉴 SillyTavern Constant）
    addWorldInfoEntry("世界观基调", [], "这是一个弱肉强食的修真世界，实力为尊，但人心比实力更复杂。", 50, {
        constant: true
    });

    // 示例2：带次级关键词的条目（借鉴 SillyTavern Selective Logic）
    addWorldInfoEntry("魔法系统", ["魔法", "法术", "咒语", "魔力", "元素"],
        "本世界魔法分为五系：火、水、风、土、暗。每系魔法有三个等级：初级（元素操控）、中级（元素具现）、高级（元素融合）。施法需要精神力支撑，过度使用会导致精神力枯竭。", 100, {
            secondaryKeywords: ["战斗", "施法", "修炼"],
            selectiveLogic: SELECTIVE_LOGIC.AND_ANY
        });

    // 示例3：政治格局
    addWorldInfoEntry("政治格局", ["帝国", "皇帝", "皇宫", "朝廷", "王国", "势力"],
        "大陆上有三大势力：大炎帝国（中央集权，皇帝萧承乾，年号永昌）、北境联邦（军事联盟，由五大部落组成）、东海诸国（商贸发达，以商会为核心）。三大势力维持着脆弱的和平。", 100);

    // 示例4：正则匹配示例
    addWorldInfoEntry("禁术", ["/禁[术法咒]/", "禁术", "禁法"],
        "禁术是被各大宗门联合封印的危险法术，使用禁术者会被天下共诛。目前已知的禁术有：血祭大法、噬魂咒、逆天改命术。", 200, {
            useRegex: true
        });
}

// 构建角色信息注入提示词（增强版，包含SillyTavern风格字段）
function buildCharacterPrompt(char) {
    const parts = [];
    parts.push(`【${char.name || '未命名'}】`);
    if (char.personality) parts.push(`性格：${char.personality}`);
    if (char.description || char.appearance) parts.push(`外貌：${char.description || char.appearance}`);
    if (char.speech_style) parts.push(`说话风格：${char.speech_style}`);
    if (char.current_state) parts.push(`当前状态：${char.current_state}`);
    if (char.background) parts.push(`背景：${char.background}`);
    if (char.arc) parts.push(`角色弧线：${char.arc}`);
    if (char.first_appearance) parts.push(`首次出场：${char.first_appearance}`);
    if (char.relationships && Object.keys(char.relationships).length > 0) {
        const rels = Object.entries(char.relationships).map(([k, v]) => `${k}(${v})`).join('、');
        parts.push(`关系：${rels}`);
    }
    if (char.example_dialogue && char.example_dialogue.length > 0) {
        parts.push(`示例对话：\n${char.example_dialogue.map((d, i) => `  ${i+1}. ${d}`).join('\n')}`);
    }
    return parts.join('\n');
}

async function generateContent(idx) {
    const ch = AppState.chapters[idx];
    const vars = getFieldVars();

    // 确保 sceneConfig 存在
    if (!ch.sceneConfig) {
        ch.sceneConfig = {
            characters: [],
            contextRange: 'summary',
            styleOverride: '',
            sceneGoal: '',
            sceneType: 'narrative',
            emotionalTone: '',
            pacing: 'normal'
        };
    }
    const sc = ch.sceneConfig;

    // 根据 contextRange 调整前文注入量
    const contextChapterMap = { full: 10, summary: 5, minimal: 2 };
    const maxContextChapters = contextChapterMap[sc.contextRange] || 5;

    // 构建记忆上下文（第56轮，第57轮增强，场景级控制）
    const previousChapters = getPreviousChaptersContextWithSummary(idx, maxContextChapters);
    const permanentMemory = getPermanentMemoryContext();

    // 关键词触发式记忆注入（深度借鉴 SillyTavern World Info）
    // 传入章节索引，系统会自动扫描大纲、剧情、背景、角色、前文章节等多个匹配源
    const worldInfoContext = getWorldInfoContext(idx);
    if (worldInfoContext) {
        const matchedCount = matchWorldInfo(idx).length;
        console.log(`[World Info] 第${idx + 1}章匹配到 ${matchedCount} 条世界设定`);
    }

    // 构建角色信息（根据场景配置过滤）
    let charactersPrompt = vars.characters;
    if (sc.characters && sc.characters.length > 0) {
        // 只注入选中角色的信息
        const selectedChars = AppState.characters.filter(c => sc.characters.includes(c.id));
        if (selectedChars.length > 0) {
            charactersPrompt = selectedChars.map(c => buildCharacterPrompt(c)).join('\n\n');
        }
    } else {
        // 没有指定角色时，注入所有角色信息
        if (AppState.characters.length > 0) {
            charactersPrompt = AppState.characters.map(c => buildCharacterPrompt(c)).join('\n\n');
        }
    }

    // 构建场景级附加提示
    let sceneAddon = '';
    if (sc.sceneType && sc.sceneType !== 'narrative') {
        const sceneTypeMap = { action: '动作场景', dialogue: '对话场景', transition: '过渡场景' };
        sceneAddon += `\n【场景类型】${sceneTypeMap[sc.sceneType] || sc.sceneType}，请调整写法以匹配场景类型。`;
    }
    if (sc.pacing && sc.pacing !== 'normal') {
        const pacingMap = { slow: '慢节奏，注重细节和情感铺陈', fast: '快节奏，紧凑推进，减少描写' };
        sceneAddon += `\n【节奏要求】${pacingMap[sc.pacing]}。`;
    }
    if (sc.emotionalTone) {
        sceneAddon += `\n【情绪基调】本场景情绪基调为「${sc.emotionalTone}」，请保持一致。`;
    }
    if (sc.sceneGoal) {
        sceneAddon += `\n【场景目标】本场景必须达成：${sc.sceneGoal}`;
    }
    if (sc.styleOverride) {
        sceneAddon += `\n【本场景风格覆盖】${sc.styleOverride}`;
    }

    const templateVars = {
        ...vars,
        characters: charactersPrompt,
        outline: $("#outline").value,
        chapter_outline: ch.outline,
        previous_chapters: previousChapters,
        permanent_memory: permanentMemory,
        world_info: worldInfoContext
    };

    let prompt = fillTemplate($("#prompt-content").value, templateVars);

    // 追加场景级指令
    if (sceneAddon) {
        prompt += `\n\n═══════════════════════════════════════════\n【场景级控制】\n═══════════════════════════════════════════\n${sceneAddon}`;
    }

    const contentEl = $(`#chapters-container .ch-content[data-idx="${idx}"]`);
    if (!contentEl) return;

    // 保存版本（第36轮）
    saveVersion(`生成第${idx + 1}章前`);

    contentEl.value = "";
    contentEl.classList.add("streaming-cursor");

    try {
        await streamFetch("/gen", { prompt }, (text) => {
            contentEl.value = text;
            contentEl.scrollTop = contentEl.scrollHeight;
            ch.content = text;
        });

        // 自动生成章节摘要（第57轮）
        if (ch.content && ch.content.trim().length > 100) {
            toast("正在生成章节摘要...", "info");
            await generateChapterSummary(idx);
        }

        // 检测AI味并提示用户
        if (ch.content && AppState.antiAIConfig.enabled) {
            const aiScore = calculateAIScore(ch.content);
            if (aiScore < 60) {
                toast(`AI味检测：得分 ${aiScore}/100，建议使用"去AI味重写"功能优化`, "warning");
            }
        }
    } catch (e) {
        toast("生成正文失败: " + e.message, "error");
    } finally {
        contentEl.classList.remove("streaming-cursor");
        saveState();
        updateStats();
    }
}

// 微观控制：重写选中文本（第57轮）
async function rewriteSelection(chapterIdx, selectedText, startPos, endPos, mode = "rewrite") {
    const ch = AppState.chapters[chapterIdx];
    const contentEl = $(`#chapters-container .ch-content[data-idx="${chapterIdx}"]`);
    if (!contentEl || !ch) return;

    // 获取上下文
    const fullText = contentEl.value;
    const contextBefore = fullText.substring(Math.max(0, startPos - 500), startPos);
    const contextAfter = fullText.substring(endPos, Math.min(fullText.length, endPos + 500));

    // 构建模式特定的指令
    const modeInstructions = {
        rewrite: "重写这段内容，保持原意但改变表达方式，使其更生动自然。",
        expand: "扩写这段内容，增加更多细节、描写和情感，使其更丰富饱满。",
        compress: "压缩这段内容，去除冗余，保留核心信息，使其更简洁有力。",
        dialogue: "将这段内容改写为对话形式，通过人物对话推动情节。",
        describe: "为这段内容添加更多环境描写、感官细节和氛围营造。"
    };

    const instruction = modeInstructions[mode] || modeInstructions.rewrite;

    const prompt = `你是一个网文写手。根据上下文，对选中的内容进行${mode === "rewrite" ? "重写" : mode === "expand" ? "扩写" : mode === "compress" ? "缩写" : mode === "dialogue" ? "对话改写" : "描写添加"}。

【前文上下文】
${contextBefore}

【需要处理的内容】
${selectedText}

【后文上下文】
${contextAfter}

【处理要求】
${instruction}

【重要规则】
1. 输出必须与前后文自然衔接
2. 保持人物性格和语气一致
3. 不要改变原文的核心信息和情节走向
4. 直接输出处理后的内容，不要加任何解释

请输出处理后的内容：`;

    // 保存版本
    saveVersion(`第${chapterIdx + 1}章微观重写前`);

    // 创建临时显示区域
    const tempDiv = document.createElement("div");
    tempDiv.className = "rewrite-preview";
    tempDiv.innerHTML = `
        <div class="rewrite-header">
            <span>重写预览 (${mode})</span>
            <div class="rewrite-actions">
                <button class="btn btn-sm btn-primary" id="btn-apply-rewrite">应用</button>
                <button class="btn btn-sm btn-ghost" id="btn-cancel-rewrite">取消</button>
            </div>
        </div>
        <textarea class="rewrite-textarea" id="rewrite-result"></textarea>
    `;

    // 插入到章节内容区域后面
    contentEl.parentNode.insertBefore(tempDiv, contentEl.nextSibling);

    const resultEl = tempDiv.querySelector("#rewrite-result");
    resultEl.classList.add("streaming-cursor");

    try {
        await streamFetch("/gen", { prompt }, (text) => {
            resultEl.value = text;
            resultEl.scrollTop = resultEl.scrollHeight;
        });
    } catch (e) {
        toast("重写失败: " + e.message, "error");
        tempDiv.remove();
        return;
    } finally {
        resultEl.classList.remove("streaming-cursor");
    }

    // 绑定应用/取消按钮
    tempDiv.querySelector("#btn-apply-rewrite").addEventListener("click", () => {
        const newText = resultEl.value;
        if (newText) {
            contentEl.value = fullText.substring(0, startPos) + newText + fullText.substring(endPos);
            contentEl.dispatchEvent(new Event("input"));
            ch.content = contentEl.value;
            saveState();
            toast("已应用重写", "success");
        }
        tempDiv.remove();
    });

    tempDiv.querySelector("#btn-cancel-rewrite").addEventListener("click", () => {
        tempDiv.remove();
    });
}

// ============================================================
// 反AI味词汇自动替换系统
// ============================================================

// AI高频词映射表
const AI_WORD_MAPPINGS = {
    // 副词/连词类
    "旨在": ["想要", "打算", "计划"],
    "极大地": ["特别", "很", "非常", "极其"],
    "日益": ["越来越", "日渐"],
    "值得注意的是": [""],
    "与此同时": ["这时候", "就在这时", "这时"],
    "不言而喻": [""],
    "无疑": ["肯定", "当然", "确实"],
    "显然": ["明显", "一看就知道"],
    "毫无疑问": ["肯定", "当然"],
    "事实上": ["其实", "实际上"],

    // 形容词/描述类
    "仿佛...一般": ["像", "好像", "好似"],
    "宛如": ["像", "好像", "好似"],
    "好似": ["像", "好像"],
    "恰似": ["像", "好像"],
    "犹如": ["像", "好像"],

    // 动作/心理类
    "不由得": ["忍不住", "不自觉"],
    "情不自禁": ["忍不住", "控制不住"],
    "恍然大悟": ["突然明白了", "一下子明白了", "这才明白"],
    "若有所思": ["想了想", "琢磨着", "思考着"],
    "意味深长": ["别有深意", "意有所指"],
    "不禁": ["忍不住", "不自觉"],
    "下意识": ["本能地", "不自觉地"],
    "本能地": ["不自觉地", "下意识地"],

    // 网文高频套话
    "心中一凛": ["心里一紧", "心头一跳"],
    "眼中闪过一丝": ["眼里露出", "眼神里带着"],
    "眼中闪过一抹": ["眼里露出", "眼神里带着"],
    "嘴角勾起一抹": ["嘴角微微上扬", "笑了笑"],
    "嘴角上扬": ["笑了", "笑了笑"],
    "眉头微蹙": ["皱了皱眉", "眉头一皱"],
    "一股XX涌上心头": ["心里一阵XX"],
    "心中暗道": ["心想", "心里嘀咕"],
    "目光深邃": ["眼神深沉", "眼睛深邃"],
    "不觉间": ["不知不觉", "不知不觉中"],
    "霎时间": ["一瞬间", "刹那", "猛地"],
    "此刻的他": ["他", "这时的他"],
    "他深知": ["他知道", "他明白"],
    "这一刻他明白": ["他明白了", "他这才明白"],
    "他知道，": ["他明白，"],

    // 转折/过渡类
    "突然间": ["突然", "猛地"],
    "猛然间": ["猛然", "猛地", "一下子"],
    "刹那间": ["一瞬间", "刹那", "猛地"],
    "恍惚间": ["恍惚中", "迷迷糊糊中"],
    "不知不觉": ["不知不觉中", "不自觉地"],
    "条件反射般": ["本能地", "下意识地"],
    "如同XX一般": ["像XX一样", "好像XX"],
    "宛如XX似的": ["像XX一样", "好像XX"]
};

// 检测文本中的AI味词汇
function detectAIWords(text) {
    const detections = [];

    for (const [aiWord, alternatives] of Object.entries(AI_WORD_MAPPINGS)) {
        // 处理包含XX的模板词
        if (aiWord.includes("XX")) {
            const regexStr = aiWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace("XX", "(.+?)");
            const regex = new RegExp(regexStr, "g");
            let match;
            while ((match = regex.exec(text)) !== null) {
                detections.push({
                    word: match[0],
                    position: match.index,
                    alternatives: alternatives.map(alt => alt.replace("XX", match[1])),
                    type: "template"
                });
            }
        } else {
            // 精确匹配
            const idx = text.indexOf(aiWord);
            if (idx !== -1) {
                detections.push({
                    word: aiWord,
                    position: idx,
                    alternatives: alternatives,
                    type: "exact"
                });
            }
        }
    }

    return detections;
}

// 计算AI味分数（0-100，100=完全人写，0=纯AI）
function calculateAIScore(text) {
    if (!text || text.length < 50) return 100;

    let score = 100;
    const detections = detectAIWords(text);

    // 每个AI味词汇扣分
    score -= detections.length * 3;

    // 检查排比句（三个以上相似句式）
    const sentences = text.split(/[。！？]/);
    const shortSentences = sentences.filter(s => s.length > 5 && s.length < 20);
    if (shortSentences.length > 3) {
        const similarCount = countSimilarSentences(shortSentences);
        if (similarCount > 2) score -= similarCount * 5;
    }

    // 检查"的"字密度
    const deCount = (text.match(/的/g) || []).length;
    const deDensity = deCount / text.length;
    if (deDensity > 0.05) score -= 10;

    // 检查句式长度均匀度
    const lengths = sentences.map(s => s.length).filter(l => l > 0);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;
    if (variance < 20) score -= 10; // 句式太均匀

    return Math.max(0, Math.min(100, Math.round(score)));
}

// 统计相似句子数量
function countSimilarSentences(sentences) {
    let count = 0;
    for (let i = 0; i < sentences.length - 1; i++) {
        for (let j = i + 1; j < sentences.length; j++) {
            if (isSimilarSentence(sentences[i], sentences[j])) {
                count++;
                break;
            }
        }
    }
    return count;
}

// 判断两个句子是否相似
function isSimilarSentence(s1, s2) {
    // 简单的相似度判断：前几个字相同
    const prefix1 = s1.slice(0, 4);
    const prefix2 = s2.slice(0, 4);
    return prefix1 === prefix2;
}

// 自动替换AI味词汇
function replaceAIWords(text, autoReplace = false) {
    let result = text;
    const detections = detectAIWords(text);
    const replacements = [];

    for (const detection of detections) {
        if (detection.alternatives.length > 0 && detection.alternatives[0] !== "") {
            const replacement = detection.alternatives[0];
            result = result.replace(detection.word, replacement);
            replacements.push({
                original: detection.word,
                replaced: replacement,
                position: detection.position
            });
        }
    }

    return {
        text: result,
        replacements,
        score: calculateAIScore(result)
    };
}

// ============================================================
// 多阶段去AI味流水线
// ============================================================

// 执行多阶段去AI味流水线
async function executeAntiAIPipeline(text, chapterIdx, options = {}) {
    const {
        enableStyleRewrite = true,
        enableDeTemplate = true,
        enableHumanize = true,
        enablePolish = true,
        styleGuide = ""
    } = options;

    let currentText = text;
    const stages = [];

    // 阶段1：风格改写
    if (enableStyleRewrite) {
        toast("阶段1/4：风格改写中...", "info");
        const stylePrompt = `请将以下内容改写为更自然的写作风格，减少AI生成的痕迹。

【风格要求】
- 句式长短交替，避免每句都是15-25字的标准长度
- 用具体感官替代抽象形容
- 用动作表达情绪，而非直接描述
- 对话要有个性，不同角色说话方式不同
${styleGuide ? `\n【自定义风格指南】\n${styleGuide}` : ""}

【原文】
${currentText}

请直接输出改写后的内容，不要加任何解释：`;

        try {
            const result = await streamFetch("/gen", { prompt: stylePrompt }, () => {});
            currentText = result;
            stages.push({ name: "风格改写", status: "完成" });
        } catch (e) {
            stages.push({ name: "风格改写", status: "失败", error: e.message });
        }
    }

    // 阶段2：去模板化
    if (enableDeTemplate) {
        toast("阶段2/4：去除模板化表达...", "info");
        const deTemplatePrompt = `请去除以下内容中的模板化表达和AI高频词。

【需要消除的表达】
- "心中一凛"、"眼中闪过一丝XX"、"嘴角勾起一抹XX"
- "仿佛XX一般"、"宛如XX"、"好似XX"
- "不由得"、"情不自禁"、"恍然大悟"
- 排比句、段落结尾的总结式抒情

【原文】
${currentText}

请直接输出去除模板化后的内容，不要加任何解释：`;

        try {
            const result = await streamFetch("/gen", { prompt: deTemplatePrompt }, () => {});
            currentText = result;
            stages.push({ name: "去模板化", status: "完成" });
        } catch (e) {
            stages.push({ name: "去模板化", status: "失败", error: e.message });
        }
    }

    // 阶段3：人味注入
    if (enableHumanize) {
        toast("阶段3/4：注入人味...", "info");
        const humanizePrompt = `请为以下内容增加"人味"，让它读起来更像真人写的。

【人味注入技巧】
- 增加一些不规则的口语化表达
- 适当使用省略号、破折号等标点
- 偶尔用方言或俚语词汇
- 句子长度要有变化，有的很长，有的很短
- 可以有一些"废话"或"闲笔"，不是每句都必须有信息量
- 增加一些个人化的比喻和联想

【原文】
${currentText}

请直接输出增加人味后的内容，不要加任何解释：`;

        try {
            const result = await streamFetch("/gen", { prompt: humanizePrompt }, () => {});
            currentText = result;
            stages.push({ name: "人味注入", status: "完成" });
        } catch (e) {
            stages.push({ name: "人味注入", status: "失败", error: e.message });
        }
    }

    // 阶段4：最终润色
    if (enablePolish) {
        toast("阶段4/4：最终润色...", "info");
        const polishPrompt = `请对以下内容进行最终润色，确保文风一致性和流畅度。

【润色要求】
- 检查前后文是否连贯
- 统一人物的说话风格
- 调整节奏，确保阅读体验流畅
- 修正任何不通顺的句子

【原文】
${currentText}

请直接输出润色后的内容，不要加任何解释：`;

        try {
            const result = await streamFetch("/gen", { prompt: polishPrompt }, () => {});
            currentText = result;
            stages.push({ name: "最终润色", status: "完成" });
        } catch (e) {
            stages.push({ name: "最终润色", status: "失败", error: e.message });
        }
    }

    // 计算最终AI味分数
    const finalScore = calculateAIScore(currentText);

    return {
        text: currentText,
        stages,
        aiScore: {
            original: calculateAIScore(text),
            final: finalScore,
            improvement: finalScore - calculateAIScore(text)
        }
    };
}

// 自动生成章节摘要（第57轮）
async function generateChapterSummary(idx) {
    const ch = AppState.chapters[idx];
    if (!ch || !ch.content || ch.content.trim().length < 100) {
        return null; // 内容太短，不需要摘要
    }

    const summaryPromptTemplate = $("#prompt-summary")?.value || DEFAULT_PROMPTS.summary;
    const templateVars = {
        chapter_content: ch.content
    };
    const prompt = fillTemplate(summaryPromptTemplate, templateVars);

    try {
        const summary = await streamFetch("/gen", { prompt }, () => {});
        // 将摘要存储到章节对象中
        ch.summary = summary.trim();
        saveState();
        console.log(`[摘要] 第${idx + 1}章摘要已生成`);
        return ch.summary;
    } catch (e) {
        console.error(`[摘要] 第${idx + 1}章摘要生成失败:`, e);
        return null;
    }
}

// 获取带摘要的前面章节上下文
function getPreviousChaptersContextWithSummary(currentIdx, maxChapters = 10) {
    const prevChapters = [];
    const startIdx = Math.max(0, currentIdx - maxChapters);

    for (let i = startIdx; i < currentIdx; i++) {
        const ch = AppState.chapters[i];
        if (!ch) continue;

        // 提取章节标题
        const titleMatch = ch.outline.match(/第.{1,3}章[：:](.+)/);
        const title = titleMatch ? titleMatch[1].trim() : `第${i + 1}章`;

        // 优先使用摘要，没有摘要则使用内容开头
        let summary;
        if (ch.summary) {
            summary = ch.summary;
        } else if (ch.content && ch.content.trim().length > 0) {
            const content = ch.content.trim();
            if (content.length > 1500) {
                const start = content.slice(0, 600);
                const end = content.slice(-400);
                summary = `${start}\n\n【...中间省略...】\n\n${end}`;
            } else {
                summary = content;
            }
        } else {
            continue; // 跳过没有内容的章节
        }

        prevChapters.push(`【${title}】\n${summary}`);
    }

    if (prevChapters.length === 0) {
        return "（这是第一章，暂无前文内容）";
    }

    return prevChapters.join("\n\n---\n\n");
}

// 批量生成（第16轮）
async function generateAllContent() {
    if (AppState.chapters.length === 0) {
        toast("请先生成章节", "error");
        return;
    }

    const btn = $("#btn-gen-all");
    if (btn) {
        btn.classList.add("loading");
        btn.innerHTML = '<span class="spinner"></span> 批量生成中...';
    }

    let completed = 0;
    const total = AppState.chapters.length;

    for (let i = 0; i < total; i++) {
        if (!AppState.chapters[i].content) {
            toast(`正在生成第${i + 1}章...`, "info");
            await generateContent(i);
            completed++;
            // 等待一下避免API限流
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    if (btn) {
        btn.classList.remove("loading");
        btn.innerHTML = "一键生成全部正文";
    }

    toast(`批量生成完成，共生成${completed}章`, "success");
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

    // 添加主菜单项
    menuConfig.menu.forEach(item => {
        const div = document.createElement("div");
        div.className = "context-menu-item";
        div.textContent = item.name;
        div.addEventListener("click", () => handleContextAction(item));
        menu.appendChild(div);
    });

    // 如果是 content 类型，添加分隔线和去AI味流水线菜单
    if (type === "content" && DEFAULT_MENUS.pipeline) {
        const separator = document.createElement("div");
        separator.className = "context-menu-separator";
        menu.appendChild(separator);

        // 添加去AI味流水线子菜单标题
        const pipelineHeader = document.createElement("div");
        pipelineHeader.className = "context-menu-item context-menu-header";
        pipelineHeader.textContent = "🔄 去AI味流水线";
        menu.appendChild(pipelineHeader);

        // 添加流水线菜单项
        DEFAULT_MENUS.pipeline.menu.forEach(item => {
            const div = document.createElement("div");
            div.className = "context-menu-item context-menu-sub";
            div.textContent = item.name;
            div.addEventListener("click", () => handleContextAction(item));
            menu.appendChild(div);
        });
    }

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

    // 处理 pipeline 类型的动作（多阶段去AI味流水线）
    if (item.action === "executePipeline") {
        await handlePipelineAction(item);
        return;
    }

    // 处理本地AI味检测
    if (item.action === "localAIDetect") {
        handleLocalAIDetect();
        return;
    }

    // 处理一致性检查
    if (item.action === "consistencyCheck") {
        const currentIdx = getCurrentChapterIdx();
        if (currentIdx >= 0) {
            await checkChapterConsistency(currentIdx);
        } else {
            toast("请先展开一个章节", "warning");
        }
        return;
    }

    // 原有的 prompt 类型处理
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

// 处理多阶段去AI味流水线动作
async function handlePipelineAction(item) {
    const selectedText = AppState.selectedText;
    if (!selectedText) {
        toast("请先选中文本", "error");
        return;
    }

    const options = item.options || {};

    // 显示进度模态框
    const modal = $("#modal");
    $("#modal-title").textContent = item.name || "去AI味流水线";
    $("#modal-body").innerHTML = `
        <div class="pipeline-progress" id="pipeline-progress">
            <div class="pipeline-stage">
                <div class="pipeline-stage-icon" id="stage-style">1</div>
                <div class="pipeline-stage-name">风格改写</div>
                <div class="pipeline-stage-status" id="stage-style-status">等待中</div>
            </div>
            <div class="pipeline-stage">
                <div class="pipeline-stage-icon" id="stage-template">2</div>
                <div class="pipeline-stage-name">去模板化</div>
                <div class="pipeline-stage-status" id="stage-template-status">等待中</div>
            </div>
            <div class="pipeline-stage">
                <div class="pipeline-stage-icon" id="stage-human">3</div>
                <div class="pipeline-stage-name">人味注入</div>
                <div class="pipeline-stage-status" id="stage-human-status">等待中</div>
            </div>
            <div class="pipeline-stage">
                <div class="pipeline-stage-icon" id="stage-polish">4</div>
                <div class="pipeline-stage-name">最终润色</div>
                <div class="pipeline-stage-status" id="stage-polish-status">等待中</div>
            </div>
        </div>
        <div style="padding: 12px;">
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">AI味分数变化</div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <div>原始: <span id="ai-score-original" class="ai-score-badge">-</span></div>
                <div>→</div>
                <div>最终: <span id="ai-score-final" class="ai-score-badge">-</span></div>
            </div>
        </div>
        <div style="padding: 0 12px 12px;">
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">处理结果</div>
            <textarea id="pipeline-result" class="textarea-sm" rows="8" style="width:100%;" readonly></textarea>
        </div>
    `;
    $("#modal-footer").innerHTML = `
        <button class="btn btn-ghost" onclick="hideModal('modal')">取消</button>
        <button class="btn btn-primary" id="btn-apply-pipeline" disabled>应用结果</button>
    `;
    showModal("modal");

    // 计算原始AI味分数
    const originalScore = calculateAIScore(selectedText);
    $("#ai-score-original").textContent = originalScore + "分";
    $("#ai-score-original").className = `ai-score-badge ${originalScore >= 70 ? 'ai-score-high' : originalScore >= 40 ? 'ai-score-medium' : 'ai-score-low'}`;

    try {
        // 执行流水线
        const result = await executeAntiAIPipeline(selectedText, -1, {
            ...options,
            styleGuide: getFieldVars().style
        });

        // 更新UI状态
        result.stages.forEach((stage, i) => {
            const stageIds = ["style", "template", "human", "polish"];
            if (i < stageIds.length) {
                const iconEl = $(`#stage-${stageIds[i]}`);
                const statusEl = $(`#stage-${stageIds[i]}-status`);
                if (iconEl && statusEl) {
                    iconEl.className = `pipeline-stage-icon ${stage.status === "完成" ? "done" : "failed"}`;
                    statusEl.textContent = stage.status;
                }
            }
        });

        // 显示最终分数
        const finalScore = result.aiScore.final;
        $("#ai-score-final").textContent = finalScore + "分";
        $("#ai-score-final").className = `ai-score-badge ${finalScore >= 70 ? 'ai-score-high' : finalScore >= 40 ? 'ai-score-medium' : 'ai-score-low'}`;

        // 显示结果
        $("#pipeline-result").value = result.text;

        // 启用应用按钮
        const applyBtn = $("#btn-apply-pipeline");
        applyBtn.disabled = false;
        applyBtn.addEventListener("click", () => {
            if (AppState.currentTarget) {
                AppState.currentTarget.value = result.text;
                AppState.currentTarget.dispatchEvent(new Event("input"));
            }
            hideModal("modal");
            toast("已应用去AI味结果", "success");
        });

        toast(`去AI味完成！AI味分数: ${originalScore} → ${finalScore}`, "success");

    } catch (e) {
        $("#modal-body").innerHTML += `<div style="color:var(--danger);padding:12px;">处理失败: ${e.message}</div>`;
        toast("流水线处理失败: " + e.message, "error");
    }
}

// 本地AI味检测（不调用API）
function handleLocalAIDetect() {
    const selectedText = AppState.selectedText;
    if (!selectedText) {
        toast("请先选中文本", "error");
        return;
    }

    const detections = detectAIWords(selectedText);
    const score = calculateAIScore(selectedText);

    // 构建检测报告
    let report = `【AI味检测报告】\n\n`;
    report += `综合评分: ${score}/100 (${score >= 70 ? '较好' : score >= 40 ? '一般' : '较差'})\n\n`;

    if (detections.length > 0) {
        report += `发现 ${detections.length} 个AI味词汇:\n\n`;
        detections.forEach((d, i) => {
            report += `${i + 1}. "${d.word}"\n`;
            if (d.alternatives.length > 0 && d.alternatives[0] !== "") {
                report += `   建议替换为: ${d.alternatives.slice(0, 3).join('、')}\n`;
            } else {
                report += `   建议删除\n`;
            }
        });
    } else {
        report += "未发现明显的AI味词汇 ✓\n";
    }

    // 显示检测结果
    const modal = $("#modal");
    $("#modal-title").textContent = "AI味检测结果";
    $("#modal-body").innerHTML = `
        <div style="padding: 12px;">
            <div style="margin-bottom: 16px;">
                <span class="ai-score-badge ${score >= 70 ? 'ai-score-high' : score >= 40 ? 'ai-score-medium' : 'ai-score-low'}">
                    AI味分数: ${score}/100
                </span>
            </div>
            <pre style="white-space: pre-wrap; font-size: 13px; line-height: 1.8; color: var(--text-secondary);">${report}</pre>
        </div>
    `;
    $("#modal-footer").innerHTML = `
        <button class="btn btn-ghost" onclick="hideModal('modal')">关闭</button>
        ${detections.length > 0 ? '<button class="btn btn-primary" id="btn-auto-fix">自动修复</button>' : ''}
    `;

    if (detections.length > 0) {
        const fixBtn = $("#btn-auto-fix");
        if (fixBtn) {
            fixBtn.addEventListener("click", () => {
                const result = replaceAIWords(selectedText);
                if (AppState.currentTarget) {
                    AppState.currentTarget.value = result.text;
                    AppState.currentTarget.dispatchEvent(new Event("input"));
                }
                hideModal("modal");
                toast(`已自动替换 ${result.replacements.length} 个AI味词汇`, "success");
            });
        }
    }

    showModal("modal");
}

// ============================================================
// AI 助手（第12轮增强上下文感知）
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

    // 构建带上下文的提示词（第12轮增强）
    const currentChapterIdx = getCurrentChapterIdx();
    const currentChapter = currentChapterIdx >= 0 ? AppState.chapters[currentChapterIdx] : null;

    const context = `你是一个网文写作助手，风格偏实战派，不搞花哨修辞。你帮作者解决具体问题：卡壳了怎么推进、人物怎么立起来、对话怎么改自然、哪里啰嗦了要砍。

你的原则：
- 给具体建议，不要说"要注意XX"这种废话
- 举例说明，不要空讲道理
- 如果作者写得啰嗦，直接说哪里要砍
- 禁止使用"不禁"、"仿佛"、"宛如"等AI味词汇
- 回答要简洁，不要长篇大论

当前小说背景：${$("#field-background").value}
人物：${$("#field-characters").value}
大纲：${$("#outline").value ? $("#outline").value.slice(0, 500) + "..." : "（未生成）"}
${currentChapter ? `当前章节（第${currentChapterIdx + 1}章）细纲：${currentChapter.outline}` : ""}
${currentChapter && currentChapter.content ? `当前章节正文（前500字）：${currentChapter.content.slice(0, 500)}...` : ""}

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

// 获取当前展开的章节索引
function getCurrentChapterIdx() {
    const expanded = document.querySelector(".chapter-item.expanded");
    if (expanded) {
        return parseInt(expanded.dataset.idx);
    }
    return -1;
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
// 角色管理（第18轮，SillyTavern增强）
// ============================================================

// 创建增强角色卡结构（借鉴 SillyTavern Character Card）
function createCharacter(overrides = {}) {
    return {
        id: generateId(),
        name: '',
        personality: '',
        description: '',           // 外貌描述
        speech_style: '',          // 说话风格（借鉴 SillyTavern）
        example_dialogue: [],      // 示例对话（借鉴 SillyTavern）
        current_state: '',         // 当前状态（借鉴 SillyTavern）
        relationships: {},         // 结构化关系 {角色名: "关系描述"}
        first_appearance: '',      // 首次出场章节
        arc: '',                   // 角色弧线/成长轨迹
        background: '',
        notes: '',
        // 兼容旧字段
        appearance: '',
        catchphrase: '',
        ...overrides
    };
}

function addCharacter(name = "", data = {}) {
    AppState.characters.push(createCharacter({ name, ...data }));
    renderCharacters();
    saveState();
}

function renderCharacters() {
    const container = $("#characters-container");
    if (!container) return;
    container.innerHTML = "";

    AppState.characters.forEach((char, i) => {
        const div = document.createElement("div");
        div.className = "character-card";
        // 显示关系摘要
        const relKeys = char.relationships ? Object.keys(char.relationships) : [];
        const relSummary = relKeys.length > 0 ? relKeys.map(k => `${k}(${char.relationships[k]})`).join('、') : '';
        div.innerHTML = `
            <div class="character-header" data-idx="${i}">
                <span class="character-name">${char.name || "未命名角色"}</span>
                ${char.current_state ? `<span class="char-state-tag" style="font-size:11px;color:var(--accent-light);margin-left:8px;">${truncate(char.current_state, 20)}</span>` : ""}
                <div class="character-actions">
                    <button class="btn btn-sm btn-ghost" data-action="edit-char" data-idx="${i}">编辑</button>
                    <button class="btn btn-sm btn-ghost btn-danger" data-action="delete-char" data-idx="${i}">删除</button>
                </div>
            </div>
            <div class="character-info">
                ${char.personality ? `<div class="char-field"><span class="char-label">性格:</span> ${truncate(char.personality, 60)}</div>` : ""}
                ${char.speech_style ? `<div class="char-field"><span class="char-label">说话风格:</span> ${truncate(char.speech_style, 60)}</div>` : ""}
                ${char.description || char.appearance ? `<div class="char-field"><span class="char-label">外貌:</span> ${truncate(char.description || char.appearance, 60)}</div>` : ""}
                ${char.arc ? `<div class="char-field"><span class="char-label">弧线:</span> ${truncate(char.arc, 60)}</div>` : ""}
                ${relSummary ? `<div class="char-field"><span class="char-label">关系:</span> ${truncate(relSummary, 60)}</div>` : ""}
            </div>
        `;
        container.appendChild(div);
    });

    // 绑定事件
    container.querySelectorAll("[data-action='edit-char']").forEach(el => {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            showCharacterEditor(idx);
        });
    });

    container.querySelectorAll("[data-action='delete-char']").forEach(el => {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            if (confirm("确定删除这个角色？")) {
                AppState.characters.splice(idx, 1);
                renderCharacters();
                saveState();
            }
        });
    });
}

function showCharacterEditor(idx) {
    const char = idx >= 0 ? AppState.characters[idx] : createCharacter();
    const isNew = idx < 0;

    // 构建关系列表HTML
    const relEntries = char.relationships ? Object.entries(char.relationships) : [];
    let relHtml = '';
    relEntries.forEach(([target, desc], ri) => {
        relHtml += `<div class="rel-row" data-ri="${ri}" style="display:flex;gap:6px;margin-bottom:4px;">
            <input type="text" class="input rel-target" value="${target}" placeholder="角色名" style="flex:1;">
            <input type="text" class="input rel-desc" value="${desc}" placeholder="关系描述" style="flex:2;">
            <button class="btn btn-xs btn-ghost btn-danger" onclick="this.parentElement.remove()">×</button>
        </div>`;
    });

    // 构建示例对话列表HTML
    const dialogues = char.example_dialogue || [];
    let dlgHtml = '';
    dialogues.forEach((dlg, di) => {
        dlgHtml += `<div class="dlg-row" data-di="${di}" style="display:flex;gap:6px;margin-bottom:4px;">
            <textarea class="textarea-sm dlg-text" rows="2" style="flex:1;" placeholder="示例对话内容...">${dlg}</textarea>
            <button class="btn btn-xs btn-ghost btn-danger" onclick="this.parentElement.remove()">×</button>
        </div>`;
    });

    const modal = $("#modal");
    $("#modal-title").textContent = isNew ? "添加角色" : "编辑角色";
    $("#modal-body").innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="field-group">
                <label>角色名称</label>
                <input type="text" id="char-name" class="input" value="${char.name}" placeholder="输入角色名称">
            </div>
            <div class="field-group">
                <label>首次出场章节</label>
                <input type="text" id="char-first-appearance" class="input" value="${char.first_appearance || ''}" placeholder="如：第3章">
            </div>
        </div>
        <div class="field-group">
            <label>性格特点</label>
            <textarea id="char-personality" class="textarea-sm" placeholder="描述角色性格...">${char.personality}</textarea>
        </div>
        <div class="field-group">
            <label>外貌描述</label>
            <textarea id="char-description" class="textarea-sm" placeholder="描述角色外貌特征...">${char.description || char.appearance || ''}</textarea>
        </div>
        <div class="field-group">
            <label>说话风格</label>
            <input type="text" id="char-speech-style" class="input" value="${char.speech_style || char.catchphrase || ''}" placeholder="如：说话简洁，很少用形容词，偶尔冷幽默">
        </div>
        <div class="field-group">
            <label>当前状态</label>
            <input type="text" id="char-current-state" class="input" value="${char.current_state || ''}" placeholder="如：正在调查连环失踪案">
        </div>
        <div class="field-group">
            <label>角色弧线/成长轨迹</label>
            <textarea id="char-arc" class="textarea-sm" placeholder="如：从冷漠独行侠→学会信任伙伴">${char.arc || ''}</textarea>
        </div>
        <div class="field-group">
            <label>背景故事</label>
            <textarea id="char-background" class="textarea-sm" placeholder="角色的背景故事...">${char.background}</textarea>
        </div>
        <div class="field-group">
            <label style="margin-bottom:8px;">结构化关系</label>
            <div id="char-relationships-container">${relHtml}</div>
            <button class="btn btn-xs btn-ghost" onclick="addCharRelationshipRow()" style="margin-top:4px;">+ 添加关系</button>
        </div>
        <div class="field-group">
            <label style="margin-bottom:8px;">示例对话（借鉴 SillyTavern）</label>
            <div id="char-dialogues-container">${dlgHtml}</div>
            <button class="btn btn-xs btn-ghost" onclick="addCharDialogueRow()" style="margin-top:4px;">+ 添加示例对话</button>
        </div>
        <div class="field-group">
            <label>备注</label>
            <textarea id="char-notes" class="textarea-sm" placeholder="其他备注...">${char.notes}</textarea>
        </div>
    `;
    $("#modal-footer").innerHTML = `
        <button class="btn btn-ghost" onclick="hideModal('modal')">取消</button>
        <button class="btn btn-primary" id="btn-save-char">保存</button>
    `;

    $("#btn-save-char").addEventListener("click", () => {
        // 收集关系数据
        const relationships = {};
        document.querySelectorAll("#char-relationships-container .rel-row").forEach(row => {
            const target = row.querySelector(".rel-target").value.trim();
            const desc = row.querySelector(".rel-desc").value.trim();
            if (target) relationships[target] = desc;
        });

        // 收集示例对话数据
        const example_dialogue = [];
        document.querySelectorAll("#char-dialogues-container .dlg-row").forEach(row => {
            const text = row.querySelector(".dlg-text").value.trim();
            if (text) example_dialogue.push(text);
        });

        const data = {
            name: $("#char-name").value,
            description: $("#char-description").value,
            personality: $("#char-personality").value,
            speech_style: $("#char-speech-style").value,
            current_state: $("#char-current-state").value,
            arc: $("#char-arc").value,
            background: $("#char-background").value,
            first_appearance: $("#char-first-appearance").value,
            relationships,
            example_dialogue,
            notes: $("#char-notes").value,
            // 兼容旧字段
            appearance: $("#char-description").value,
            catchphrase: $("#char-speech-style").value
        };

        if (isNew) {
            AppState.characters.push(createCharacter(data));
        } else {
            AppState.characters[idx] = { ...AppState.characters[idx], ...data };
        }

        renderCharacters();
        saveState();
        hideModal("modal");
        toast(isNew ? "角色已添加" : "角色已更新", "success");
    });

    showModal("modal");
}

// 动态添加关系行
function addCharRelationshipRow() {
    const container = document.getElementById("char-relationships-container");
    if (!container) return;
    const ri = container.children.length;
    const div = document.createElement("div");
    div.className = "rel-row";
    div.setAttribute("data-ri", ri);
    div.style.cssText = "display:flex;gap:6px;margin-bottom:4px;";
    div.innerHTML = `
        <input type="text" class="input rel-target" value="" placeholder="角色名" style="flex:1;">
        <input type="text" class="input rel-desc" value="" placeholder="关系描述" style="flex:2;">
        <button class="btn btn-xs btn-ghost btn-danger" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(div);
}

// 动态添加示例对话行
function addCharDialogueRow() {
    const container = document.getElementById("char-dialogues-container");
    if (!container) return;
    const di = container.children.length;
    const div = document.createElement("div");
    div.className = "dlg-row";
    div.setAttribute("data-di", di);
    div.style.cssText = "display:flex;gap:6px;margin-bottom:4px;";
    div.innerHTML = `
        <textarea class="textarea-sm dlg-text" rows="2" style="flex:1;" placeholder="示例对话内容..."></textarea>
        <button class="btn btn-xs btn-ghost btn-danger" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(div);
}

// ============================================================
// 世界观笔记（第19轮）
// ============================================================

function addWorldNote(title = "", content = "") {
    AppState.worldNotes.push({
        id: generateId(),
        title: title,
        content: content,
        createdAt: new Date().toISOString()
    });
    renderWorldNotes();
    saveState();
}

function renderWorldNotes() {
    const container = $("#world-notes-container");
    if (!container) return;
    container.innerHTML = "";

    AppState.worldNotes.forEach((note, i) => {
        const div = document.createElement("div");
        div.className = "world-note-item";
        div.innerHTML = `
            <div class="note-header" data-idx="${i}">
                <span class="note-title">${note.title || "未命名笔记"}</span>
                <div class="note-actions">
                    <button class="btn btn-sm btn-ghost" data-action="edit-note" data-idx="${i}">编辑</button>
                    <button class="btn btn-sm btn-ghost btn-danger" data-action="delete-note" data-idx="${i}">删除</button>
                </div>
            </div>
            <div class="note-preview">${note.content.slice(0, 100)}${note.content.length > 100 ? "..." : ""}</div>
        `;
        container.appendChild(div);
    });

    // 绑定事件
    container.querySelectorAll("[data-action='edit-note']").forEach(el => {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            showWorldNoteEditor(idx);
        });
    });

    container.querySelectorAll("[data-action='delete-note']").forEach(el => {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            if (confirm("确定删除这条笔记？")) {
                AppState.worldNotes.splice(idx, 1);
                renderWorldNotes();
                saveState();
            }
        });
    });
}

function showWorldNoteEditor(idx) {
    const note = idx >= 0 ? AppState.worldNotes[idx] : { title: "", content: "" };
    const isNew = idx < 0;

    const modal = $("#modal");
    $("#modal-title").textContent = isNew ? "添加世界观笔记" : "编辑世界观笔记";
    $("#modal-body").innerHTML = `
        <div class="field-group">
            <label>标题</label>
            <input type="text" id="note-title" class="input" value="${note.title}" placeholder="笔记标题">
        </div>
        <div class="field-group">
            <label>内容</label>
            <textarea id="note-content" class="textarea-tall" placeholder="世界观设定、规则、地名、势力等...">${note.content}</textarea>
        </div>
    `;
    $("#modal-footer").innerHTML = `
        <button class="btn btn-ghost" onclick="hideModal('modal')">取消</button>
        <button class="btn btn-primary" id="btn-save-note">保存</button>
    `;

    $("#btn-save-note").addEventListener("click", () => {
        const data = {
            title: $("#note-title").value,
            content: $("#note-content").value
        };

        if (isNew) {
            AppState.worldNotes.push({ id: generateId(), ...data, createdAt: new Date().toISOString() });
        } else {
            AppState.worldNotes[idx] = { ...AppState.worldNotes[idx], ...data };
        }

        renderWorldNotes();
        saveState();
        hideModal("modal");
        toast(isNew ? "笔记已添加" : "笔记已更新", "success");
    });

    showModal("modal");
}

// ============================================================
// 灵感笔记（第46轮）
// ============================================================

function addInspirationNote(content = "", tags = []) {
    AppState.inspirationNotes.push({
        id: generateId(),
        content: content,
        tags: tags,
        createdAt: new Date().toISOString()
    });
    renderInspirationNotes();
    saveState();
}

function renderInspirationNotes() {
    const container = $("#inspiration-container");
    if (!container) return;
    container.innerHTML = "";

    AppState.inspirationNotes.forEach((note, i) => {
        const div = document.createElement("div");
        div.className = "inspiration-item";
        div.innerHTML = `
            <div class="inspiration-header" data-idx="${i}">
                <span class="inspiration-date">${formatDate(note.createdAt)}</span>
                <div class="inspiration-actions">
                    <button class="btn btn-sm btn-ghost" data-action="insert-inspiration" data-idx="${i}" title="插入到当前章节">插入</button>
                    <button class="btn btn-sm btn-ghost btn-danger" data-action="delete-inspiration" data-idx="${i}">删除</button>
                </div>
            </div>
            <div class="inspiration-content">${note.content}</div>
            ${note.tags.length > 0 ? `<div class="inspiration-tags">${note.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>` : ""}
        `;
        container.appendChild(div);
    });

    // 绑定事件
    container.querySelectorAll("[data-action='insert-inspiration']").forEach(el => {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            insertInspirationToChapter(idx);
        });
    });

    container.querySelectorAll("[data-action='delete-inspiration']").forEach(el => {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            if (confirm("确定删除这条灵感？")) {
                AppState.inspirationNotes.splice(idx, 1);
                renderInspirationNotes();
                saveState();
            }
        });
    });
}

function insertInspirationToChapter(idx) {
    const note = AppState.inspirationNotes[idx];
    const expanded = document.querySelector(".chapter-item.expanded");
    if (!expanded) {
        toast("请先展开一个章节", "error");
        return;
    }

    const chapterIdx = parseInt(expanded.dataset.idx);
    const contentEl = expanded.querySelector(".ch-content");
    if (contentEl) {
        contentEl.value += "\n\n" + note.content;
        contentEl.dispatchEvent(new Event("input"));
        toast("灵感已插入", "success");
    }
}

function showInspirationEditor() {
    const modal = $("#modal");
    $("#modal-title").textContent = "记录灵感";
    $("#modal-body").innerHTML = `
        <div class="field-group">
            <label>灵感内容</label>
            <textarea id="inspiration-content" class="textarea-tall" placeholder="记录你的灵感、想法、片段..."></textarea>
        </div>
        <div class="field-group">
            <label>标签（用逗号分隔）</label>
            <input type="text" id="inspiration-tags" class="input" placeholder="剧情,人物,对话...">
        </div>
    `;
    $("#modal-footer").innerHTML = `
        <button class="btn btn-ghost" onclick="hideModal('modal')">取消</button>
        <button class="btn btn-primary" id="btn-save-inspiration">保存</button>
    `;

    $("#btn-save-inspiration").addEventListener("click", () => {
        const content = $("#inspiration-content").value;
        const tagsStr = $("#inspiration-tags").value;
        const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(t => t) : [];

        if (content) {
            addInspirationNote(content, tags);
            hideModal("modal");
            toast("灵感已保存", "success");
        }
    });

    showModal("modal");
}

// ============================================================
// 永久记忆管理（第56轮）
// ============================================================

function addPermanentMemory(content = "") {
    if (!content || content.trim().length === 0) return;
    AppState.permanentMemory.push(content.trim());
    renderPermanentMemory();
    saveState();
}

function renderPermanentMemory() {
    const container = $("#permanent-memory-container");
    if (!container) return;
    container.innerHTML = "";

    AppState.permanentMemory.forEach((memory, i) => {
        const div = document.createElement("div");
        div.className = "memory-item";
        div.innerHTML = `
            <div class="memory-content">${truncate(memory, 60)}</div>
            <div class="memory-actions">
                <button class="btn btn-sm btn-ghost" data-action="edit-memory" data-idx="${i}">编辑</button>
                <button class="btn btn-sm btn-ghost btn-danger" data-action="delete-memory" data-idx="${i}">删除</button>
            </div>
        `;
        container.appendChild(div);
    });

    // 绑定事件
    container.querySelectorAll("[data-action='edit-memory']").forEach(el => {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            showMemoryEditor(idx);
        });
    });

    container.querySelectorAll("[data-action='delete-memory']").forEach(el => {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            if (confirm("确定删除这条永久记忆？")) {
                AppState.permanentMemory.splice(idx, 1);
                renderPermanentMemory();
                saveState();
                toast("记忆已删除", "success");
            }
        });
    });
}

function showMemoryEditor(idx = -1) {
    const isEdit = idx >= 0;
    const currentMemory = isEdit ? AppState.permanentMemory[idx] : "";

    const modal = $("#modal");
    $("#modal-title").textContent = isEdit ? "编辑永久记忆" : "添加永久记忆";
    $("#modal-body").innerHTML = `
        <div class="field-group">
            <label>记忆内容</label>
            <textarea id="memory-content" class="textarea-tall" placeholder="输入你希望AI永远记住的重要设定、规则或要求...&#10;&#10;例如：&#10;- 主角是一个表面冷漠但内心善良的人&#10;- 这个世界没有魔法，只有科技&#10;- 故事发生在2045年的上海&#10;- 每章结尾必须有悬念钩子">${currentMemory}</textarea>
        </div>
        <div class="memory-tips">
            <p>💡 <strong>使用建议：</strong></p>
            <ul>
                <li>添加你认为最重要的角色核心设定</li>
                <li>添加世界观中不可违反的规则</li>
                <li>添加你对写作风格的特殊要求</li>
                <li>添加需要长期保持的剧情伏笔</li>
            </ul>
        </div>
    `;
    $("#modal-footer").innerHTML = `
        <button class="btn btn-ghost" onclick="hideModal('modal')">取消</button>
        <button class="btn btn-primary" id="btn-save-memory">${isEdit ? "保存修改" : "添加记忆"}</button>
    `;

    $("#btn-save-memory").addEventListener("click", () => {
        const content = $("#memory-content").value.trim();
        if (!content) {
            toast("记忆内容不能为空", "error");
            return;
        }

        if (isEdit) {
            AppState.permanentMemory[idx] = content;
        } else {
            AppState.permanentMemory.push(content);
        }

        renderPermanentMemory();
        saveState();
        hideModal("modal");
        toast(isEdit ? "记忆已更新" : "记忆已添加", "success");
    });

    showModal("modal");
}

// ============================================================
// 版本管理（第36轮）
// ============================================================

function saveVersion(label = "") {
    const state = {
        label: label,
        timestamp: new Date().toISOString(),
        outline: $("#outline").value,
        chapters: JSON.parse(JSON.stringify(AppState.chapters))
    };

    AppState.versions.push(state);

    // 最多保存20个版本
    if (AppState.versions.length > 20) {
        AppState.versions.shift();
    }

    saveState();
}

function showVersionHistory() {
    if (AppState.versions.length === 0) {
        toast("暂无版本历史", "info");
        return;
    }

    const modal = $("#modal");
    $("#modal-title").textContent = "版本历史";
    let html = '<div class="version-list">';
    AppState.versions.forEach((v, i) => {
        const chaptersCount = v.chapters ? v.chapters.length : 0;
        html += `
            <div class="version-item" data-idx="${i}">
                <div class="version-info">
                    <span class="version-label">${v.label || "未命名版本"}</span>
                    <span class="version-time">${new Date(v.timestamp).toLocaleString()}</span>
                    <span class="version-chapters">${chaptersCount}章</span>
                </div>
                <button class="btn btn-sm btn-ghost" data-action="restore-version" data-idx="${i}">恢复</button>
            </div>
        `;
    });
    html += '</div>';

    $("#modal-body").innerHTML = html;
    $("#modal-footer").innerHTML = '<button class="btn btn-ghost" onclick="hideModal(\'modal\')">关闭</button>';

    // 绑定恢复事件
    modal.querySelectorAll("[data-action='restore-version']").forEach(el => {
        el.addEventListener("click", () => {
            const idx = parseInt(el.dataset.idx);
            const version = AppState.versions[idx];

            if (confirm(`确定恢复到版本"${version.label}"？当前内容将被覆盖。`)) {
                $("#outline").value = version.outline || "";
                AppState.chapters = JSON.parse(JSON.stringify(version.chapters));
                renderChapters();
                saveState();
                hideModal("modal");
                toast("已恢复到选定版本", "success");
            }
        });
    });

    showModal("modal");
}

// ============================================================
// 拆书功能（第11轮）
// ============================================================

function showBookAnalysis() {
    const modal = $("#modal");
    $("#modal-title").textContent = "拆书分析";
    $("#modal-body").innerHTML = `
        <div class="field-group">
            <label>粘贴参考文本</label>
            <textarea id="analysis-text" class="textarea-tall" placeholder="粘贴你想分析的文本片段..."></textarea>
        </div>
        <div class="field-group">
            <label>分析重点</label>
            <select id="analysis-focus" class="select-input">
                <option value="all">全面分析</option>
                <option value="sentence">句式分析</option>
                <option value="rhythm">节奏分析</option>
                <option value="dialogue">对话技巧</option>
                <option value="emotion">情绪表达</option>
                <option value="description">描写技巧</option>
            </select>
        </div>
        <div id="analysis-result" style="display:none;">
            <h4 style="color:var(--accent-light);margin:12px 0 8px;">分析结果</h4>
            <div id="analysis-content" style="white-space:pre-wrap;line-height:1.8;"></div>
        </div>
    `;
    $("#modal-footer").innerHTML = `
        <button class="btn btn-ghost" onclick="hideModal('modal')">关闭</button>
        <button class="btn btn-primary" id="btn-analyze">开始分析</button>
    `;

    $("#btn-analyze").addEventListener("click", async () => {
        const text = $("#analysis-text").value;
        if (!text) {
            toast("请粘贴要分析的文本", "error");
            return;
        }

        const btn = $("#btn-analyze");
        btn.classList.add("loading");
        btn.innerHTML = '<span class="spinner"></span> 分析中...';

        const focus = $("#analysis-focus").value;
        const focusMap = {
            all: "全面分析",
            sentence: "句式分析（长短句比例、句式多样性、开头方式）",
            rhythm: "节奏分析（快慢节奏、信息密度、段落长度）",
            dialogue: "对话技巧（对话推动剧情、角色区分、潜台词）",
            emotion: "情绪表达（动作写情绪、感官细节、心理描写）",
            description: "描写技巧（环境描写、人物描写、感官细节）"
        };

        const prompt = `你是一个写作教练。分析以下文本的写作技巧，重点分析：${focusMap[focus]}。

分析维度：
1. 优点：这段文字做得好的地方，具体指出哪些句子/手法值得学习
2. 缺点：这段文字可以改进的地方，具体指出问题并给出修改建议
3. 可学习的技巧：从这段文字中可以提炼出什么写作技巧
4. AI味检测：这段文字有没有AI味，哪些地方有AI味

要求：
- 给具体例子，不要空讲道理
- 如果有AI味，指出具体是哪些词/句式
- 给出可操作的改进建议

文本：
${text}`;

        const resultEl = $("#analysis-result");
        const contentEl = $("#analysis-content");
        resultEl.style.display = "block";

        try {
            await streamFetch("/gen", { prompt }, (text) => {
                contentEl.textContent = text;
            });
        } catch (e) {
            contentEl.textContent = "分析失败: " + e.message;
        } finally {
            btn.classList.remove("loading");
            btn.textContent = "开始分析";
        }
    });

    showModal("modal");
}

// ============================================================
// 一致性检查（第28轮，场景级增强）
// ============================================================

async function checkConsistency() {
    if (AppState.chapters.length === 0) {
        toast("请先生成章节", "error");
        return;
    }

    const modal = $("#modal");
    $("#modal-title").textContent = "一致性检查";
    $("#modal-body").innerHTML = '<div style="text-align:center;padding:20px;"><span class="spinner"></span> 检查中...</div>';
    $("#modal-footer").innerHTML = "";
    showModal("modal");

    // 收集所有章节内容
    const allContent = AppState.chapters.map((ch, i) => `第${i + 1}章：\n${ch.content || "（未生成）"}`).join("\n\n");

    // 收集角色增强信息
    const charInfo = AppState.characters.map(c => {
        let info = `${c.name}：性格=${c.personality || '未设定'}`;
        if (c.speech_style) info += `，说话风格=${c.speech_style}`;
        if (c.current_state) info += `，当前状态=${c.current_state}`;
        if (c.relationships && Object.keys(c.relationships).length > 0) {
            info += `，关系=${Object.entries(c.relationships).map(([k,v]) => `${k}(${v})`).join('/')}`;
        }
        return info;
    }).join('\n');

    const prompt = `你是一个小说编辑。检查以下小说内容的一致性问题。

检查维度：
1. 人名一致性：同一个人是否有不同称呼/名字
2. 地名一致性：同一个地方是否有不同名称
3. 时间线一致性：事件发生顺序是否合理
4. 人物性格一致性：同一个角色在不同章节的性格是否一致，说话风格是否保持一致
5. 设定一致性：世界观、规则等是否前后矛盾
6. 伏笔追踪：已埋下的伏笔是否被遗忘或矛盾

要求：
- 列出所有发现的问题
- 给出具体位置（哪一章）
- 给出修改建议
- 如果没有问题，说明检查通过

大纲：${$("#outline").value}

角色设定：
${charInfo}

章节内容：
${allContent}`;

    const contentEl = document.createElement("div");
    contentEl.style.whiteSpace = "pre-wrap";
    contentEl.style.lineHeight = "1.8";
    $("#modal-body").innerHTML = "";
    $("#modal-body").appendChild(contentEl);

    try {
        await streamFetch("/gen", { prompt }, (text) => {
            contentEl.textContent = text;
        });
    } catch (e) {
        contentEl.textContent = "检查失败: " + e.message;
    }

    $("#modal-footer").innerHTML = '<button class="btn btn-ghost" onclick="hideModal(\'modal\')">关闭</button>';
}

// 单章一致性检查
async function checkChapterConsistency(chapterIdx) {
    const ch = AppState.chapters[chapterIdx];
    if (!ch || !ch.content || ch.content.trim().length < 50) {
        toast("该章节内容不足，请先生成正文", "warning");
        return;
    }

    const modal = $("#modal");
    $("#modal-title").textContent = `第${chapterIdx + 1}章 - 一致性检查`;
    $("#modal-body").innerHTML = '<div style="text-align:center;padding:20px;"><span class="spinner"></span> 检查中...</div>';
    $("#modal-footer").innerHTML = "";
    showModal("modal");

    // 收集前面章节摘要
    const prevContext = getPreviousChaptersContextWithSummary(chapterIdx, 5);

    // 收集角色设定
    const charInfo = AppState.characters.map(c => {
        let info = `${c.name}：性格=${c.personality || '未设定'}`;
        if (c.speech_style) info += `，说话风格=${c.speech_style}`;
        if (c.current_state) info += `，当前状态=${c.current_state}`;
        if (c.description) info += `，外貌=${c.description}`;
        if (c.arc) info += `，弧线=${c.arc}`;
        if (c.relationships && Object.keys(c.relationships).length > 0) {
            info += `，关系=${Object.entries(c.relationships).map(([k,v]) => `${k}(${v})`).join('/')}`;
        }
        return info;
    }).join('\n');

    const prompt = `你是一个小说编辑。对以下章节进行一致性检查。

检查维度：
1. 角色性格是否OOC：本章中角色的言行是否与设定一致
2. 设定矛盾：是否存在与世界观/已知设定矛盾的描写
3. 时间线合理性：事件发生顺序是否合理
4. 伏笔遗忘：前文埋下的伏笔在本章是否有适当推进
5. 说话风格一致性：角色的说话方式是否与设定的speech_style一致

要求：
- 列出所有发现的问题，标注严重程度（严重/一般/轻微）
- 对每个问题给出具体修改建议
- 如果没有问题，说明检查通过

大纲：${$("#outline").value}

角色设定：
${charInfo}

前文摘要：
${prevContext}

本章内容：
${ch.content}`;

    const contentEl = document.createElement("div");
    contentEl.style.whiteSpace = "pre-wrap";
    contentEl.style.lineHeight = "1.8";
    $("#modal-body").innerHTML = "";
    $("#modal-body").appendChild(contentEl);

    try {
        await streamFetch("/gen", { prompt }, (text) => {
            contentEl.textContent = text;
        });
    } catch (e) {
        contentEl.textContent = "检查失败: " + e.message;
    }

    $("#modal-footer").innerHTML = '<button class="btn btn-ghost" onclick="hideModal(\'modal\')">关闭</button>';
}

// ============================================================
// 读者视角审查（第30轮）
// ============================================================

async function readerReview() {
    if (AppState.chapters.length === 0) {
        toast("请先生成章节", "error");
        return;
    }

    const modal = $("#modal");
    $("#modal-title").textContent = "读者视角审查";
    $("#modal-body").innerHTML = '<div style="text-align:center;padding:20px;"><span class="spinner"></span> 审查中...</div>';
    $("#modal-footer").innerHTML = "";
    showModal("modal");

    const allContent = AppState.chapters.map((ch, i) => `第${i + 1}章：\n${ch.content || "（未生成）"}`).join("\n\n");

    const prompt = `你是一个挑剔的网文读者。以读者视角审读以下小说内容。

审查维度：
1. 吸引力：开头能不能吸引你继续看？
2. 留存点：你会在哪些地方弃书？为什么？
3. 跳读点：你会在哪些地方跳过？为什么？
4. 爽点：哪些地方让你觉得"爽"？
5. 槽点：哪些地方让你觉得"假"或"无聊"？

要求：
- 像真实读者一样吐槽
- 指出具体是哪一章哪个地方
- 说明为什么会让你弃书/跳读
- 给出改进建议

大纲：${$("#outline").value}

章节内容：
${allContent}`;

    const contentEl = document.createElement("div");
    contentEl.style.whiteSpace = "pre-wrap";
    contentEl.style.lineHeight = "1.8";
    $("#modal-body").innerHTML = "";
    $("#modal-body").appendChild(contentEl);

    try {
        await streamFetch("/gen", { prompt }, (text) => {
            contentEl.textContent = text;
        });
    } catch (e) {
        contentEl.textContent = "审查失败: " + e.message;
    }

    $("#modal-footer").innerHTML = '<button class="btn btn-ghost" onclick="hideModal(\'modal\')">关闭</button>';
}

// ============================================================
// 写作日历（第20轮）
// ============================================================

function showWritingCalendar() {
    const modal = $("#modal");
    $("#modal-title").textContent = "写作日历";

    // 简单的日历显示
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

    let html = `<div style="text-align:center;margin-bottom:16px;">${today.getFullYear()}年${today.getMonth() + 1}月</div>`;
    html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;font-size:12px;">';

    // 星期头
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    weekdays.forEach(d => {
        html += `<div style="color:var(--text-muted);padding:4px;">${d}</div>`;
    });

    // 空白天数
    for (let i = 0; i < firstDay; i++) {
        html += '<div></div>';
    }

    // 日期
    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = d === today.getDate();
        const hasWritten = false; // 这里应该检查实际的写作记录
        const style = isToday ? "background:var(--accent);color:white;border-radius:4px;" : "";
        html += `<div style="padding:4px;${style}">${d}</div>`;
    }

    html += '</div>';

    // 统计
    html += `
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
            <div>今日字数: ${AppState.todayWritten}</div>
            <div>目标字数: ${AppState.dailyGoal}</div>
            <div>最高日产: ${AppState.stats.maxDaily}</div>
        </div>
    `;

    $("#modal-body").innerHTML = html;
    $("#modal-footer").innerHTML = '<button class="btn btn-ghost" onclick="hideModal(\'modal\')">关闭</button>';
    showModal("modal");
}

// ============================================================
// 初始化（第14轮快捷键、全面事件绑定）
// 安全绑定：每个 addEventListener 独立 try-catch，一个失败不影响其他
// ============================================================

// 安全绑定辅助函数
function bind(id, event, handler) {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener(event, handler);
    } else {
        console.warn(`[bind] 元素 #${id} 不存在，跳过绑定`);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("[Kealin] DOMContentLoaded 开始初始化...");

    // 变量提升到回调顶层 — 修复 try 块作用域导致后续所有按钮绑定失效的致命 bug
    let promptOutline, promptChapter, promptContent;
    let menuOutline, menuChapter, menuContent;
    let genreSelect;

    try {
        // 初始化提示词默认值（先设默认值，loadState 会覆盖有保存数据的部分）
        promptOutline = $("#prompt-outline");
        promptChapter = $("#prompt-chapter");
        promptContent = $("#prompt-content");
        const promptSummary = $("#prompt-summary");
        menuOutline = $("#menu-outline");
        menuChapter = $("#menu-chapter");
        menuContent = $("#menu-content");

        if (promptOutline) promptOutline.value = DEFAULT_PROMPTS.outline;
        if (promptChapter) promptChapter.value = DEFAULT_PROMPTS.chapter;
        if (promptContent) promptContent.value = DEFAULT_PROMPTS.content;
        if (promptSummary) promptSummary.value = DEFAULT_PROMPTS.summary;
        if (menuOutline) menuOutline.value = JSON.stringify(DEFAULT_MENUS.outline, null, 2);
        if (menuChapter) menuChapter.value = JSON.stringify(DEFAULT_MENUS.chapter, null, 2);
        if (menuContent) menuContent.value = JSON.stringify(DEFAULT_MENUS.content, null, 2);

        // 初始化小说类型选择器
        genreSelect = $("#genre-selector");
        if (genreSelect) {
            Object.entries(GENRE_CONFIGS).forEach(([key, cfg]) => {
                const opt = document.createElement("option");
                opt.value = key;
                opt.textContent = cfg.name;
                genreSelect.appendChild(opt);
            });
        }

        // 加载保存的状态（会覆盖上面的默认值）
        try {
            loadState();
        } catch (e) {
            console.error("[Kealin] loadState 失败:", e);
        }

        console.log("[Kealin] 默认值和状态加载完成");
    } catch (e) {
        console.error("[Kealin] 初始化默认值失败:", e);
    }

    // ---- 导航标签 ----
    try {
        $$(".nav-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                $$(".nav-tab").forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                $$(".panel").forEach(p => p.classList.remove("active"));
                const panel = $(`#panel-${tab.dataset.panel}`);
                if (panel) panel.classList.add("active");
            });
        });
    } catch (e) {
        console.error("[Kealin] 导航标签绑定失败:", e);
    }

    // ---- 侧边栏折叠 ----
    bind("sidebar-toggle", "click", () => {
        const sidebar = $("#sidebar");
        if (sidebar) sidebar.classList.toggle("collapsed");
    });

    // ---- 小说类型切换 ----
    if (genreSelect) {
        genreSelect.addEventListener("change", () => {
            const cfg = GENRE_CONFIGS[genreSelect.value];
            if (!cfg) return;
            for (const [k, v] of Object.entries(cfg.fields)) {
                const el = $(`#field-${k}`);
                if (el && !el.value.trim()) el.value = v;
            }
            toast(`已加载「${cfg.name}」模板`, "info");
        });
    }

    // ---- 生成按钮 ----
    bind("btn-gen-outline", "click", generateOutline);
    bind("btn-regen-outline", "click", generateOutline);
    bind("btn-gen-chapters", "click", generateChapters);
    bind("btn-add-chapter", "click", () => addChapter());
    bind("btn-reset-chapters", "click", () => {
        if (confirm("确定清空所有章节？")) {
            AppState.chapters = [];
            renderChapters();
            saveState();
        }
    });
    bind("btn-gen-all", "click", generateAllContent);

    // ---- 预览提示词 ----
    bind("btn-preview-prompts", "click", () => showPromptPreview("outline"));

    // ---- 大纲右键菜单 ----
    const outlineEl = $("#outline");
    if (outlineEl) {
        outlineEl.addEventListener("contextmenu", (e) => showContextMenu(e, "outline", outlineEl));
    }

    // ---- 字数统计 ----
    try {
        $$(".textarea-main, .textarea-sm").forEach(el => {
            el.addEventListener("input", () => {
                const countEl = el.closest(".card")?.querySelector(".char-count");
                if (countEl) countEl.textContent = countChars(el.value) + " 字";
                updateStats();
                debouncedSave();
            });
        });
    } catch (e) {
        console.error("[Kealin] 字数统计绑定失败:", e);
    }

    // ---- AI 助手 ----
    bind("btn-send-ai", "click", sendAIMessage);
    bind("ai-input", "keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendAIMessage();
        }
    });
    bind("btn-clear-chat", "click", () => {
        AppState.aiConversation = [];
        const msgs = $("#ai-messages");
        if (msgs) msgs.innerHTML = '<div class="ai-msg ai-system">对话已清空</div>';
        saveState();
    });
    bind("btn-search-chat", "click", showConversationSearch);

    // ---- 导入导出 ----
    bind("btn-export", "click", exportAll);
    bind("btn-import", "click", importAll);
    bind("btn-export-txt", "click", exportTxt);
    bind("btn-export-md", "click", exportMarkdown);

    // ---- 书名简介生成 ----
    bind("btn-gen-title", "click", () => showBookInfoGen("title"));
    bind("btn-gen-summary", "click", () => showBookInfoGen("summary"));

    // ---- 提示词恢复默认 ----
    bind("btn-reset-outline-prompt", "click", () => {
        if (promptOutline) promptOutline.value = DEFAULT_PROMPTS.outline;
        saveState();
        toast("已恢复默认", "success");
    });
    bind("btn-reset-chapter-prompt", "click", () => {
        if (promptChapter) promptChapter.value = DEFAULT_PROMPTS.chapter;
        saveState();
        toast("已恢复默认", "success");
    });
    bind("btn-reset-content-prompt", "click", () => {
        if (promptContent) promptContent.value = DEFAULT_PROMPTS.content;
        saveState();
        toast("已恢复默认", "success");
    });
    bind("btn-reset-summary-prompt", "click", () => {
        const pSummary = $("#prompt-summary");
        if (pSummary) pSummary.value = DEFAULT_PROMPTS.summary;
        saveState();
        toast("已恢复默认", "success");
    });

    // ---- 菜单恢复默认 ----
    bind("btn-reset-menus", "click", () => {
        if (menuOutline) menuOutline.value = JSON.stringify(DEFAULT_MENUS.outline, null, 2);
        if (menuChapter) menuChapter.value = JSON.stringify(DEFAULT_MENUS.chapter, null, 2);
        if (menuContent) menuContent.value = JSON.stringify(DEFAULT_MENUS.content, null, 2);
        saveState();
        toast("菜单配置已恢复默认", "success");
    });

    // ---- 模型配置 ----
    try {
        loadModelConfig();
    } catch (e) {
        console.error("[Kealin] loadModelConfig 失败:", e);
    }
    bind("btn-save-primary", "click", () => saveModelConfig("primary"));
    bind("btn-save-secondary", "click", () => saveModelConfig("secondary"));

    // ---- 模态框关闭 ----
    bind("modal-close", "click", () => hideModal("modal"));
    try {
        $$(".modal-overlay").forEach(overlay => {
            overlay.addEventListener("click", (e) => {
                if (e.target === overlay) overlay.style.display = "none";
            });
        });
    } catch (e) {
        console.error("[Kealin] 模态框关闭绑定失败:", e);
    }

    // ---- 思维导图 ----
    bind("btn-mindmap", "click", () => {
        showModal("mindmap-modal");
        renderMindmap();
    });

    // ---- 键盘快捷键（第14轮）----
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            $$(".modal-overlay").forEach(m => m.style.display = "none");
            const ctx = $("#context-menu");
            if (ctx) ctx.style.display = "none";
        }
        if (e.ctrlKey && e.key === "s") {
            e.preventDefault();
            saveState();
            toast("已保存", "success");
        }
        if (e.ctrlKey && e.key === "e") {
            e.preventDefault();
            exportAll();
        }
        if (e.ctrlKey && e.key === "/") {
            e.preventDefault();
            const aiInput = $("#ai-input");
            if (aiInput) aiInput.focus();
        }
    });

    // ---- 新增功能按钮 ----
    bind("btn-add-character", "click", () => showCharacterEditor(-1));
    bind("btn-add-world-note", "click", () => showWorldNoteEditor(-1));
    bind("btn-add-inspiration", "click", showInspirationEditor);
    bind("btn-add-memory", "click", () => showMemoryEditor(-1));
    bind("btn-book-analysis", "click", showBookAnalysis);
    bind("btn-consistency", "click", checkConsistency);
    bind("btn-reader-review", "click", readerReview);
    bind("btn-versions", "click", showVersionHistory);
    bind("btn-calendar", "click", showWritingCalendar);

    // ---- World Info 关键词触发 ----
    bind("btn-add-world-info", "click", () => showWorldInfoEditor(-1));
    const worldInfoToggle = $("#world-info-enabled");
    if (worldInfoToggle) {
        worldInfoToggle.checked = AppState.worldInfo.enabled;
        worldInfoToggle.addEventListener("change", () => {
            AppState.worldInfo.enabled = worldInfoToggle.checked;
            saveState();
            toast(worldInfoToggle.checked ? "已启用关键词触发" : "已禁用关键词触发", "info");
        });
    }

    // ---- 初始化 World Info ----
    initDefaultWorldInfo();
    renderWorldInfo();

    // ---- 初始统计 ----
    try {
        updateStats();
    } catch (e) {
        console.error("[Kealin] updateStats 失败:", e);
    }

    console.log("[Kealin] 初始化完成 ✓");
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
            const prompt = `给一部${$("#bi-type").value || "网文"}起5个书名。故事：${$("#bi-summary").value || "无"}\n\n要求：\n- 能让人在一堆书里点进来\n- 别用"之"字连接\n- 别用"传奇""风云""天下"这种烂大街的词\n- 要有记忆点，看完能记住\n- 每个书名单独一行，带序号，简单说明为什么起这个名字`;
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
            const prompt = `给小说《${$("#bi-title-input").value || "未命名"}》写个简介。\n类型：${GENRE_CONFIGS[$("#genre-selector").value]?.name || "网文"}\n背景：${vars.background}\n人物：${vars.characters}\n剧情：${vars.plot}\n\n要求：\n- 开头一句话就要有钩子，让人想看下去\n- 别用"且看XX如何XX"这种套话\n- 别用"波澜壮阔""跌宕起伏"这种形容词\n- 写清楚主角是谁、要干什么、最大的障碍是什么\n- 200字以内\n- 结尾要留悬念`;
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
            const epEl = $("#cfg-primary-endpoint");
            const modelEl = $("#cfg-primary-model");
            const tempEl = $("#cfg-primary-temp");
            const tokensEl = $("#cfg-primary-tokens");
            if (epEl) epEl.value = config.primary.endpoint || "";
            if (modelEl) modelEl.value = config.primary.model || "";
            if (tempEl) tempEl.value = config.primary.temperature ?? 0.8;
            if (tokensEl) tokensEl.value = config.primary.max_tokens ?? 8192;
            const badge = $("#primary-status");
            if (badge && config.primary.has_key) {
                badge.textContent = "已配置";
                badge.className = "badge badge-ok";
            }
        }
        if (config.secondary) {
            const epEl = $("#cfg-secondary-endpoint");
            const modelEl = $("#cfg-secondary-model");
            if (epEl) epEl.value = config.secondary.endpoint || "";
            if (modelEl) modelEl.value = config.secondary.model || "";
            const badge = $("#secondary-status");
            if (badge && config.secondary.has_key) {
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
        model: $(`#${prefix}-model`).value,
    };
    // 仅在用户输入了新密钥时才发送，避免用空值覆盖已有密钥
    const keyVal = $(`#${prefix}-key`).value;
    if (keyVal) data.api_key = keyVal;
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
// 思维导图（第27轮增强）
// ============================================================

function renderMindmap() {
    const container = $("#mindmap-container");
    const outline = $("#outline").value;
    if (!outline.trim()) {
        container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);">请先生成大纲</div>';
        return;
    }

    // 解析大纲为树形结构
    const lines = outline.split("\n").filter(l => l.trim());
    let html = '<div style="padding:20px;font-size:13px;line-height:2;overflow:auto;">';
    html += '<div style="font-size:18px;font-weight:700;color:var(--accent-light);margin-bottom:16px;">📖 故事大纲</div>';

    let currentSection = "";
    lines.forEach(line => {
        const trimmed = line.trim();
        if (/^[一二三四五六七八九十]+[、.]/.test(trimmed) || /^\d+[、.]/.test(trimmed) || /^第[一二三四五六七八九十\d]+[章部]/.test(trimmed)) {
            html += `<div style="font-weight:600;color:var(--text-primary);margin-top:12px;padding-left:0;border-left:3px solid var(--accent);padding-left:8px;">${trimmed}</div>`;
        } else if (/^[-•·]/.test(trimmed) || /^\d+\)/.test(trimmed)) {
            html += `<div style="padding-left:24px;color:var(--text-secondary);border-left:1px solid var(--border);margin-left:4px;padding-left:12px;">• ${trimmed.replace(/^[-•·]\s*/, "").replace(/^\d+\)\s*/, "")}</div>`;
        } else if (trimmed.startsWith("【") || trimmed.startsWith("[")) {
            html += `<div style="font-weight:500;color:var(--accent-light);margin-top:8px;">${trimmed}</div>`;
        } else {
            html += `<div style="padding-left:12px;color:var(--text-secondary);">${trimmed}</div>`;
        }
    });

    html += '</div>';
    container.innerHTML = html;
}

// ============================================================
// AI对话历史搜索（第52轮）
// ============================================================

function searchConversation(query) {
    if (!query) return AppState.aiConversation;

    const lowerQuery = query.toLowerCase();
    return AppState.aiConversation.filter(msg =>
        msg.content.toLowerCase().includes(lowerQuery)
    );
}

function showConversationSearch() {
    const modal = $("#modal");
    $("#modal-title").textContent = "搜索对话历史";
    $("#modal-body").innerHTML = `
        <div class="field-group">
            <input type="text" id="search-query" class="input" placeholder="输入关键词搜索...">
        </div>
        <div id="search-results" style="max-height:400px;overflow-y:auto;"></div>
    `;
    $("#modal-footer").innerHTML = '<button class="btn btn-ghost" onclick="hideModal(\'modal\')">关闭</button>';

    const searchInput = $("#search-query");
    searchInput.addEventListener("input", () => {
        const results = searchConversation(searchInput.value);
        const resultsEl = $("#search-results");

        if (results.length === 0) {
            resultsEl.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:20px;">无搜索结果</div>';
            return;
        }

        resultsEl.innerHTML = results.map(msg => `
            <div style="padding:8px;border-bottom:1px solid var(--border);">
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">${msg.role === "user" ? "你" : "AI"}</div>
                <div style="font-size:13px;line-height:1.6;">${msg.content.slice(0, 200)}${msg.content.length > 200 ? "..." : ""}</div>
            </div>
        `).join("");
    });

    showModal("modal");
    searchInput.focus();
}

// ============================================================
// World Info 关键词触发管理 UI
// ============================================================

// 渲染 World Info 列表
function renderWorldInfo() {
    const container = $("#world-info-container");
    if (!container) return;

    if (AppState.worldInfo.entries.length === 0) {
        container.innerHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:12px;">暂无触发规则，点击下方按钮添加</div>';
        return;
    }

    container.innerHTML = AppState.worldInfo.entries.map((entry, i) => {
        const typeBadge = entry.constant ? '<span class="badge badge-accent">保底</span>' : '';
        const regexBadge = entry.useRegex ? '<span class="badge badge-info">正则</span>' : '';
        const groupBadge = entry.group ? `<span class="badge badge-warning">组:${entry.group}</span>` : '';
        const secondaryInfo = entry.secondaryKeywords && entry.secondaryKeywords.length > 0
            ? `<div class="world-info-secondary">次级：${entry.secondaryKeywords.join('、')}</div>`
            : '';

        return `
        <div class="world-info-item ${!entry.enabled ? 'world-info-disabled' : ''}" data-idx="${i}">
            <div class="world-info-header">
                <span class="world-info-name">${entry.name || '未命名'} ${typeBadge} ${regexBadge} ${groupBadge}</span>
                <div class="world-info-actions">
                    <button class="btn btn-xs btn-ghost" onclick="toggleWorldInfo(${i})">${entry.enabled ? '✅' : '⬜'}</button>
                    <button class="btn btn-xs btn-ghost" onclick="showWorldInfoEditor(${i})">编辑</button>
                    <button class="btn btn-xs btn-ghost btn-danger" onclick="deleteWorldInfo(${i})">删除</button>
                </div>
            </div>
            ${entry.constant ? '<div class="world-info-constant">📌 保底条目（每次生成都注入）</div>' : `<div class="world-info-keywords">主关键词：${(entry.keywords || []).join('、') || '（无）'}</div>`}
            ${secondaryInfo}
            <div class="world-info-preview">${(entry.content || '').slice(0, 80)}${(entry.content || '').length > 80 ? '...' : ''}</div>
        </div>`;
    }).join('');
}

// 切换 World Info 条目启用状态
function toggleWorldInfo(idx) {
    const entry = AppState.worldInfo.entries[idx];
    if (entry) {
        entry.enabled = !entry.enabled;
        saveState();
        renderWorldInfo();
        toast(entry.enabled ? `已启用「${entry.name}」` : `已禁用「${entry.name}」`, "info");
    }
}

// 删除 World Info 条目
function deleteWorldInfo(idx) {
    const entry = AppState.worldInfo.entries[idx];
    if (entry && confirm(`确定删除「${entry.name}」？`)) {
        AppState.worldInfo.entries.splice(idx, 1);
        saveState();
        renderWorldInfo();
        toast(`已删除「${entry.name}」`, "success");
    }
}

// 显示 World Info 编辑器（深度借鉴 SillyTavern World Info 设计）
function showWorldInfoEditor(idx) {
    const defaultEntry = createWorldInfoEntry();
    const entry = idx >= 0 ? { ...defaultEntry, ...AppState.worldInfo.entries[idx] } : defaultEntry;
    const isEdit = idx >= 0;

    const modal = $("#modal");
    $("#modal-title").textContent = isEdit ? "编辑世界设定触发" : "添加世界设定触发";
    $("#modal-body").innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="field-group">
                <label>名称/备注</label>
                <input type="text" id="wi-name" class="input" value="${entry.name}" placeholder="如：魔法系统、帝国历史...">
            </div>
            <div class="field-group">
                <label>互斥组（同组只激活一个）</label>
                <input type="text" id="wi-group" class="input" value="${entry.group || ''}" placeholder="如：魔法体系">
            </div>
        </div>

        <div class="field-group" style="margin-top:12px;">
            <label style="display:flex;align-items:center;gap:8px;">
                <input type="checkbox" id="wi-constant" ${entry.constant ? 'checked' : ''}>
                <span>保底条目（无需关键词，每次生成都注入）</span>
            </label>
        </div>

        <div id="wi-keywords-section" ${entry.constant ? 'style="display:none;"' : ''}>
            <div class="field-group">
                <label>主关键词（用逗号分隔，支持正则如 /魔法.*/）</label>
                <input type="text" id="wi-keywords" class="input" value="${(entry.keywords || []).join(', ')}" placeholder="如：魔法、法术、咒语、魔力">
            </div>
            <div class="field-group">
                <label>次级关键词（用逗号分隔，配合下方逻辑使用）</label>
                <input type="text" id="wi-secondary-keywords" class="input" value="${(entry.secondaryKeywords || []).join(', ')}" placeholder="如：战斗、施法、修炼（可选）">
            </div>
            <div class="field-group">
                <label>次级关键词逻辑</label>
                <select id="wi-selective-logic" class="select-input">
                    <option value="0" ${entry.selectiveLogic === 0 ? 'selected' : ''}>AND_ANY - 主key匹配 + 次级key任意一个匹配</option>
                    <option value="1" ${entry.selectiveLogic === 1 ? 'selected' : ''}>NOT_ALL - 主key匹配 + 次级key并非全部匹配</option>
                    <option value="2" ${entry.selectiveLogic === 2 ? 'selected' : ''}>NOT_ANY - 主key匹配 + 次级key全部不匹配</option>
                    <option value="3" ${entry.selectiveLogic === 3 ? 'selected' : ''}>AND_ALL - 主key匹配 + 次级key全部匹配</option>
                </select>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
                <div class="field-group">
                    <label style="display:flex;align-items:center;gap:8px;">
                        <input type="checkbox" id="wi-use-regex" ${entry.useRegex ? 'checked' : ''}>
                        <span>正则匹配</span>
                    </label>
                </div>
                <div class="field-group">
                    <label style="display:flex;align-items:center;gap:8px;">
                        <input type="checkbox" id="wi-case-sensitive" ${entry.caseSensitive ? 'checked' : ''}>
                        <span>大小写敏感</span>
                    </label>
                </div>
                <div class="field-group">
                    <label style="display:flex;align-items:center;gap:8px;">
                        <input type="checkbox" id="wi-match-whole" ${entry.matchWholeWords ? 'checked' : ''}>
                        <span>全词匹配</span>
                    </label>
                </div>
            </div>
        </div>

        <div class="field-group" style="margin-top:12px;">
            <label>世界设定内容</label>
            <textarea id="wi-content" class="textarea-sm" rows="6" placeholder="当文本中出现上述关键词时，会自动注入这段设定到AI上下文">${entry.content}</textarea>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="field-group">
                <label>插入优先级（数值越大越靠后，影响越大）</label>
                <input type="number" id="wi-priority" class="input" value="${entry.priority || 100}" min="1" max="1000">
            </div>
            <div class="field-group">
                <label>触发概率（0-100%）</label>
                <input type="number" id="wi-probability" class="input" value="${entry.probability || 100}" min="0" max="100">
            </div>
        </div>
    `;

    // 保底条目切换时显示/隐藏关键词区域
    const constantCheckbox = document.getElementById('wi-constant');
    constantCheckbox.addEventListener('change', () => {
        document.getElementById('wi-keywords-section').style.display = constantCheckbox.checked ? 'none' : '';
    });

    $("#modal-footer").innerHTML = `
        <button class="btn btn-ghost" onclick="hideModal('modal')">取消</button>
        <button class="btn btn-primary" onclick="saveWorldInfo(${idx})">${isEdit ? '保存' : '添加'}</button>
    `;

    showModal("modal");
}

// 保存 World Info 条目（支持 SillyTavern 核心功能）
function saveWorldInfo(idx) {
    const name = $("#wi-name").value.trim();
    const content = $("#wi-content").value.trim();
    const isConstant = $("#wi-constant").checked;

    if (!content) {
        toast("请输入世界设定内容", "error");
        return;
    }

    // 保底条目不需要关键词，非保底条目需要
    const keywordsStr = $("#wi-keywords")?.value.trim() || '';
    if (!isConstant && !keywordsStr) {
        toast("非保底条目需要输入触发关键词", "error");
        return;
    }

    const secondaryKeywordsStr = $("#wi-secondary-keywords")?.value.trim() || '';

    const entryData = {
        name: name || '未命名',
        keywords: keywordsStr ? keywordsStr.split(/[,，、\s]+/).filter(k => k.trim()) : [],
        secondaryKeywords: secondaryKeywordsStr ? secondaryKeywordsStr.split(/[,，、\s]+/).filter(k => k.trim()) : [],
        selectiveLogic: parseInt($("#wi-selective-logic")?.value) || 0,
        content,
        priority: parseInt($("#wi-priority").value) || 100,
        probability: parseInt($("#wi-probability").value) || 100,
        constant: isConstant,
        useRegex: $("#wi-use-regex")?.checked || false,
        caseSensitive: $("#wi-case-sensitive")?.checked || false,
        matchWholeWords: $("#wi-match-whole")?.checked || false,
        group: $("#wi-group")?.value.trim() || '',
        enabled: true
    };

    if (idx >= 0) {
        // 编辑现有条目
        AppState.worldInfo.entries[idx] = {
            ...AppState.worldInfo.entries[idx],
            ...entryData
        };
    } else {
        // 添加新条目
        const newEntry = createWorldInfoEntry(entryData);
        AppState.worldInfo.entries.push(newEntry);
    }

    saveState();
    renderWorldInfo();
    hideModal("modal");
    toast(`已${idx >= 0 ? '保存' : '添加'}「${entryData.name}」`, "success");
}

// ============================================================
// v2.2: Enhanced Memory System
// ============================================================

async function autoGenerateSummary(chapterIdx) {
    const ch = AppState.chapters[chapterIdx];
    if (!ch || !ch.content || ch.content.trim().length < 100) {
        toast("章节内容太短，无法生成摘要", "warning");
        return null;
    }
    try {
        const resp = await fetch("/api/memory/summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: ch.content, outline: ch.outline || "", chapter_idx: chapterIdx }),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let text = "";
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            text += decoder.decode(value, { stream: true });
        }
        ch.summary = text.trim();
        saveState();
        return ch.summary;
    } catch (e) {
        console.error("[Enhanced Memory] 摘要生成失败:", e);
        return null;
    }
}

async function extractChapterFacts(chapterIdx) {
    const ch = AppState.chapters[chapterIdx];
    if (!ch || !ch.content || ch.content.trim().length < 100) return null;
    try {
        const resp = await fetch("/api/memory/extract-facts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: ch.content }),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let text = "";
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            text += decoder.decode(value, { stream: true });
        }
        const facts = [];
        text.split('\n').filter(l => l.trim()).forEach(line => {
            const match = line.match(/\[(.+?)\]\s*(.+)/);
            if (match) facts.push({ type: match[1], content: match[2].trim() });
        });
        if (!AppState.semanticMemory) AppState.semanticMemory = [];
        facts.forEach(f => {
            AppState.semanticMemory.push({
                id: generateId(), content: f.content, entry_type: f.type,
                chapter_idx: chapterIdx, importance: f.type.includes('伏笔') ? 9 : 7,
                created_at: new Date().toISOString(),
            });
        });
        saveState();
        toast(`已提取 ${facts.length} 条关键事实`, "success");
        return facts;
    } catch (e) {
        toast("事实提取失败: " + e.message, "error");
        return null;
    }
}

async function searchSemanticMemory(query) {
    if (!AppState.semanticMemory || AppState.semanticMemory.length === 0) {
        toast("语义记忆为空，请先提取章节事实", "warning");
        return [];
    }
    try {
        const resp = await fetch("/api/memory/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                memories: {
                    permanent_memories: AppState.permanentMemory || [],
                    semantic_index: { entries: Object.fromEntries(AppState.semanticMemory.map(m => [m.id, m])) },
                },
                query, top_k: 10,
            }),
        });
        const result = await resp.json();
        return result.results || [];
    } catch (e) { console.error("语义搜索失败:", e); return []; }
}

function showEnhancedMemoryManager() {
    const modal = $("#modal");
    $("#modal-title").textContent = "增强记忆管理";
    const memoryCount = AppState.semanticMemory ? AppState.semanticMemory.length : 0;
    const summaryCount = AppState.chapters.filter(c => c.summary).length;
    $("#modal-body").innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
            <div style="padding:12px;background:var(--bg-secondary);border-radius:8px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:var(--accent);">${AppState.permanentMemory.length}</div>
                <div style="font-size:12px;color:var(--text-muted);">永久记忆</div>
            </div>
            <div style="padding:12px;background:var(--bg-secondary);border-radius:8px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:var(--accent);">${summaryCount}</div>
                <div style="font-size:12px;color:var(--text-muted);">章节摘要</div>
            </div>
            <div style="padding:12px;background:var(--bg-secondary);border-radius:8px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:var(--accent);">${memoryCount}</div>
                <div style="font-size:12px;color:var(--text-muted);">语义记忆</div>
            </div>
        </div>
        <div class="field-group">
            <label>语义搜索</label>
            <div style="display:flex;gap:8px;">
                <input type="text" id="memory-search-input" class="input" placeholder="输入关键词搜索记忆..." style="flex:1;">
                <button class="btn btn-primary btn-sm" id="btn-search-memory">搜索</button>
            </div>
            <div id="memory-search-results" style="margin-top:8px;max-height:200px;overflow-y:auto;"></div>
        </div>
        <div class="field-group" style="margin-top:16px;">
            <label>批量操作</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button class="btn btn-sm btn-outline" id="btn-batch-summary">批量生成摘要</button>
                <button class="btn btn-sm btn-outline" id="btn-batch-extract">批量提取事实</button>
                <button class="btn btn-sm btn-outline" id="btn-view-summaries">查看所有摘要</button>
            </div>
        </div>`;
    $("#modal-footer").innerHTML = '<button class="btn btn-ghost" onclick="hideModal(\'modal\')">关闭</button>';
    $("#btn-search-memory").addEventListener("click", async () => {
        const query = $("#memory-search-input").value.trim();
        if (!query) return;
        const results = await searchSemanticMemory(query);
        const el = $("#memory-search-results");
        el.innerHTML = results.length === 0
            ? '<div style="color:var(--text-muted);text-align:center;padding:8px;">无匹配结果</div>'
            : results.map(r => `<div style="padding:8px;border-bottom:1px solid var(--border);font-size:13px;"><span class="badge badge-sm">${r.entry.entry_type}</span> ${r.entry.content} <span style="color:var(--text-muted);font-size:11px;">(${r.score})</span></div>`).join("");
    });
    $("#memory-search-input").addEventListener("keydown", e => { if (e.key === "Enter") $("#btn-search-memory").click(); });
    $("#btn-batch-summary").addEventListener("click", async () => {
        hideModal("modal"); let count = 0;
        for (let i = 0; i < AppState.chapters.length; i++) {
            if (AppState.chapters[i].content && !AppState.chapters[i].summary) {
                toast(`正在生成第${i + 1}章摘要...`, "info");
                await autoGenerateSummary(i); count++;
                await new Promise(r => setTimeout(r, 500));
            }
        }
        toast(`批量摘要完成，共${count}个`, "success");
    });
    $("#btn-batch-extract").addEventListener("click", async () => {
        hideModal("modal"); let total = 0;
        for (let i = 0; i < AppState.chapters.length; i++) {
            if (AppState.chapters[i].content) {
                toast(`正在提取第${i + 1}章事实...`, "info");
                const facts = await extractChapterFacts(i);
                if (facts) total += facts.length;
                await new Promise(r => setTimeout(r, 500));
            }
        }
        toast(`事实提取完成，共${total}条`, "success");
    });
    $("#btn-view-summaries").addEventListener("click", () => { hideModal("modal"); showAllSummaries(); });
    showModal("modal");
}

function showAllSummaries() {
    const modal = $("#modal");
    $("#modal-title").textContent = "所有章节摘要";
    const html = AppState.chapters.map((ch, i) => ch.summary
        ? `<div style="padding:12px;border-bottom:1px solid var(--border);"><h4 style="color:var(--accent-light);margin-bottom:8px;">第${i + 1}章</h4><div style="white-space:pre-wrap;font-size:13px;line-height:1.8;color:var(--text-secondary);">${ch.summary}</div></div>`
        : `<div style="padding:12px;border-bottom:1px solid var(--border);"><h4 style="color:var(--text-muted);margin-bottom:4px;">第${i + 1}章</h4><div style="color:var(--text-muted);font-size:12px;">（无摘要）</div></div>`
    ).join("");
    $("#modal-body").innerHTML = html || '<div style="text-align:center;padding:20px;color:var(--text-muted);">暂无摘要</div>';
    $("#modal-footer").innerHTML = '<button class="btn btn-ghost" onclick="hideModal(\'modal\')">关闭</button>';
    showModal("modal");
}

// ============================================================
// v2.2: Scene Control
// ============================================================

async function generateScenePlan(chapterIdx) {
    const ch = AppState.chapters[chapterIdx];
    if (!ch) { toast("章节不存在", "error"); return; }
    const vars = getFieldVars();
    const prevSummary = chapterIdx > 0 ? (AppState.chapters[chapterIdx - 1]?.summary || "") : "";
    const modal = $("#modal");
    $("#modal-title").textContent = `第${chapterIdx + 1}章 - 场景规划`;
    $("#modal-body").innerHTML = '<div style="text-align:center;padding:20px;"><span class="spinner"></span> 正在生成场景方案...</div>';
    $("#modal-footer").innerHTML = "";
    showModal("modal");
    try {
        const resp = await fetch("/api/scene/plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ outline: ch.outline || "", characters: vars.characters, style: vars.style, previous_summary: prevSummary }),
        });
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let text = "";
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            text += decoder.decode(value, { stream: true });
        }
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            const plan = JSON.parse(jsonMatch[1]);
            AppState.chapters[chapterIdx].scenePlan = plan;
            saveState();
            displayScenePlan(plan, chapterIdx);
        } else {
            $("#modal-body").innerHTML = `<pre style="white-space:pre-wrap;font-size:13px;line-height:1.8;">${text}</pre>`;
        }
    } catch (e) {
        $("#modal-body").innerHTML = `<div style="color:var(--danger);padding:12px;">场景规划失败: ${e.message}</div>`;
    }
    $("#modal-footer").innerHTML = `<button class="btn btn-ghost" onclick="hideModal('modal')">关闭</button> <button class="btn btn-primary" id="btn-gen-scene-content">按场景生成正文</button>`;
    $("#btn-gen-scene-content")?.addEventListener("click", async () => { hideModal("modal"); await generateContentByScene(chapterIdx); });
}

function displayScenePlan(plan, chapterIdx) {
    const scenes = plan.scenes || [];
    const transitions = plan.transitions || [];
    const pacingLabels = {1:'极慢',2:'慢',3:'中',4:'快',5:'极快'};
    const typeColors = {action:'var(--danger)',dialogue:'var(--accent)',introspection:'var(--warning)',tension:'#e74c3c',climax:'#f39c12',hook:'#2ecc71'};
    let html = `<div style="margin-bottom:16px;font-size:13px;color:var(--text-muted);">情绪走向: ${plan.emotional_arc||'-'} | 节奏: ${plan.pacing_arc||'-'} | 主题: ${plan.theme||'-'}</div>`;
    scenes.forEach((scene, i) => {
        const tc = typeColors[scene.scene_type]||'var(--text-muted)';
        html += `<div style="padding:12px;margin-bottom:8px;background:var(--bg-secondary);border-radius:8px;border-left:3px solid ${tc};">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <strong>场景 ${i+1}: ${scene.title||'未命名'}</strong>
                <div style="display:flex;gap:6px;">
                    <span class="badge badge-sm" style="background:${tc};color:white;">${scene.scene_type}</span>
                    <span class="badge badge-sm">${scene.emotional_beat}</span>
                    <span class="badge badge-sm">节奏${pacingLabels[scene.pacing]||scene.pacing}</span>
                </div>
            </div>
            <div style="font-size:12px;color:var(--text-secondary);line-height:1.6;">
                <div>地点: ${scene.location||'-'} | 时间: ${scene.time_of_day||'-'} | 人物: ${(scene.characters_present||[]).join(', ')||'-'}</div>
                <div>目的: ${scene.purpose||'-'}</div>
                <div>核心事件: ${scene.key_action||'-'}</div>
                <div>开头钩子: ${scene.opening_hook||'-'}</div>
                <div>结尾钩子: ${scene.closing_hook||'-'}</div>
            </div></div>`;
        const t = transitions.find(t => t.from_scene_id === scene.scene_id);
        if (t) html += `<div style="text-align:center;padding:4px;font-size:11px;color:var(--text-muted);">↓ ${t.transition_type||'cut'} ${t.time_skip?'| '+t.time_skip:''} ${t.emotional_shift?'| '+t.emotional_shift:''}</div>`;
    });
    $("#modal-body").innerHTML = html;
}

async function generateContentByScene(chapterIdx) {
    const ch = AppState.chapters[chapterIdx];
    if (!ch || !ch.scenePlan || !ch.scenePlan.scenes) { toast("请先生成场景方案", "error"); return; }
    const vars = getFieldVars();
    const scenes = ch.scenePlan.scenes;
    let fullContent = "";
    for (let i = 0; i < scenes.length; i++) {
        toast(`正在生成场景 ${i+1}/${scenes.length}: ${scenes[i].title||''}`, "info");
        const prevCtx = chapterIdx > 0 ? getPreviousChaptersContextWithSummary(chapterIdx, 3) : "";
        const permMem = getPermanentMemoryContext();
        const wInfo = getWorldInfoContext(chapterIdx);
        try {
            const resp = await fetch("/gen", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: `你是一个网文写手。根据场景方案写正文。

场景类型: ${scenes[i].scene_type} | 情绪: ${scenes[i].emotional_beat} | 节奏: ${scenes[i].pacing}/5
地点: ${scenes[i].location} | 时间: ${scenes[i].time_of_day} | 人物: ${(scenes[i].characters_present||[]).join(', ')}
视角: ${scenes[i].pov_character} | 核心事件: ${scenes[i].key_action}
感官重点: ${scenes[i].sensory_focus} | 目标字数: ${scenes[i].word_count_target||'自然决定'}
开头钩子: ${scenes[i].opening_hook} | 结尾钩子: ${scenes[i].closing_hook}

大纲: ${$("#outline").value}
章节细纲: ${ch.outline}
人物: ${vars.characters}
风格: ${vars.style}

${permMem}
${prevCtx}
${wInfo}

禁止: 心中一凛、眼中闪过、嘴角勾起、不由得、仿佛XX一般、宛如XX、情不自禁、目光深邃、意味深长、若有所思、恍然大悟、不禁XX、眉头微蹙、嘴角上扬、心中暗道

直接写正文，不要加任何解释。` }),
            });
            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let sc = "";
            while (true) { const { value, done } = await reader.read(); if (done) break; sc += decoder.decode(value, { stream: true }); }
            fullContent += (fullContent ? "\n\n" : "") + sc;
            await new Promise(r => setTimeout(r, 500));
        } catch (e) { toast(`场景 ${i+1} 生成失败: ${e.message}`, "error"); }
    }
    const contentEl = $(`#chapters-container .ch-content[data-idx="${chapterIdx}"]`);
    if (contentEl) { contentEl.value = fullContent; contentEl.dispatchEvent(new Event("input")); }
    ch.content = fullContent; saveState();
    toast("场景化正文生成完成", "success");
}

async function analyzeChapterPacing(chapterIdx) {
    const ch = AppState.chapters[chapterIdx];
    if (!ch || !ch.content) { toast("章节内容为空", "error"); return; }
    try {
        const resp = await fetch("/api/scene/analyze-pacing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: ch.content }),
        });
        const result = await resp.json();
        const modal = $("#modal");
        $("#modal-title").textContent = `第${chapterIdx+1}章 - 节奏分析`;
        const pl = {1:'极慢',2:'慢',3:'中',4:'快',5:'极快'};
        const pc = {1:'#3498db',2:'#2ecc71',3:'#f1c40f',4:'#e67e22',5:'#e74c3c'};
        let html = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">
            <div style="text-align:center;padding:12px;background:var(--bg-secondary);border-radius:8px;"><div style="font-size:20px;font-weight:700;color:${pc[result.pacing.pacing_score]||'var(--text)'};">${pl[result.pacing.pacing_score]||'-'}</div><div style="font-size:11px;color:var(--text-muted);">节奏</div></div>
            <div style="text-align:center;padding:12px;background:var(--bg-secondary);border-radius:8px;"><div style="font-size:20px;font-weight:700;">${result.pacing.sentence_count||0}</div><div style="font-size:11px;color:var(--text-muted);">句子数</div></div>
            <div style="text-align:center;padding:12px;background:var(--bg-secondary);border-radius:8px;"><div style="font-size:20px;font-weight:700;">${result.pacing.avg_length||0}</div><div style="font-size:11px;color:var(--text-muted);">平均句长</div></div>
            <div style="text-align:center;padding:12px;background:var(--bg-secondary);border-radius:8px;"><div style="font-size:20px;font-weight:700;">${result.pacing.variance||0}</div><div style="font-size:11px;color:var(--text-muted);">方差</div></div></div>`;
        if (result.pacing.issues?.length) {
            html += '<div><strong>问题：</strong><ul style="margin:8px 0;padding-left:20px;">';
            result.pacing.issues.forEach(issue => { html += `<li style="color:var(--warning);margin-bottom:4px;">${issue}</li>`; });
            html += '</ul></div>';
        }
        if (result.scene_breaks?.length) {
            html += '<div><strong>场景切换：</strong>';
            result.scene_breaks.forEach(b => { html += `<div style="padding:4px 8px;margin:4px 0;background:var(--bg-secondary);border-radius:4px;font-size:12px;">行 ${b.line+1} [${b.type}] ${b.text}</div>`; });
            html += '</div>';
        }
        $("#modal-body").innerHTML = html;
        $("#modal-footer").innerHTML = '<button class="btn btn-ghost" onclick="hideModal(\'modal\')">关闭</button>';
        showModal("modal");
    } catch (e) { toast("节奏分析失败: " + e.message, "error"); }
}

// ============================================================
// v2.2: Character Card System
// ============================================================

function showStructuredCharacterEditor(idx) {
    const char = idx >= 0 ? AppState.characters[idx] : null;
    const isNew = idx < 0;
    const card = char?.cardData || (char ? { name:char.name,appearance:char.appearance,backstory:char.background,notes:char.notes,voice:{speech_style:"",catchphrases:char.catchphrase?[char.catchphrase]:[]},role:"supporting",age:"",gender:"",current_status:"alive",distinguishing_features:[],motivation:"",flaw:"",fear:"",desire:"",dialogue_rules:[],behavioral_rules:[],secrets:[] } : { name:"",role:"supporting",age:"",gender:"",current_status:"alive",appearance:"",distinguishing_features:[],motivation:"",flaw:"",fear:"",desire:"",voice:{speech_style:"",catchphrases:[]},dialogue_rules:[],behavioral_rules:[],backstory:"",secrets:[],notes:"" });
    const modal = $("#modal");
    $("#modal-title").textContent = isNew ? "添加角色卡" : "编辑角色卡";
    $("#modal-body").innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="field-group"><label>角色名称 *</label><input type="text" id="card-name" class="input" value="${card.name||''}" placeholder="角色名"></div>
            <div class="field-group"><label>角色定位</label><select id="card-role" class="select-input"><option value="protagonist" ${card.role==='protagonist'?'selected':''}>主角</option><option value="antagonist" ${card.role==='antagonist'?'selected':''}>反派</option><option value="supporting" ${card.role==='supporting'?'selected':''}>配角</option><option value="minor" ${card.role==='minor'?'selected':''}>龙套</option></select></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
            <div class="field-group"><label>年龄</label><input type="text" id="card-age" class="input" value="${card.age||''}" placeholder="如：25岁"></div>
            <div class="field-group"><label>性别</label><input type="text" id="card-gender" class="input" value="${card.gender||''}" placeholder="男/女"></div>
            <div class="field-group"><label>当前状态</label><select id="card-status" class="select-input"><option value="alive" ${card.current_status==='alive'?'selected':''}>存活</option><option value="dead" ${card.current_status==='dead'?'selected':''}>死亡</option><option value="missing" ${card.current_status==='missing'?'selected':''}>失踪</option></select></div>
        </div>
        <div class="field-group"><label>外貌特征</label><textarea id="card-appearance" class="textarea-sm">${card.appearance||''}</textarea></div>
        <div class="field-group"><label>显著特征（每行一个）</label><textarea id="card-features" class="textarea-sm" placeholder="左手缺一根小指\n总穿黑色衣服">${(card.distinguishing_features||[]).join('\n')}</textarea></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="field-group"><label>核心动机</label><textarea id="card-motivation" class="textarea-sm">${card.motivation||''}</textarea></div>
            <div class="field-group"><label>主要缺陷</label><textarea id="card-flaw" class="textarea-sm">${card.flaw||''}</textarea></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="field-group"><label>最深恐惧</label><input type="text" id="card-fear" class="input" value="${card.fear||''}"></div>
            <div class="field-group"><label>最渴望的东西</label><input type="text" id="card-desire" class="input" value="${card.desire||''}"></div>
        </div>
        <div class="field-group"><label>说话风格</label><textarea id="card-speech-style" class="textarea-sm" placeholder="简洁有力、啰嗦但真诚...">${card.voice?.speech_style||''}</textarea></div>
        <div class="field-group"><label>口头禅（逗号分隔）</label><input type="text" id="card-catchphrases" class="input" value="${(card.voice?.catchphrases||[]).join(', ')}"></div>
        <div class="field-group"><label>对话规则（每行一条）</label><textarea id="card-dialogue-rules" class="textarea-sm" placeholder="从不主动提起过去\n紧张时会摸耳朵">${(card.dialogue_rules||[]).join('\n')}</textarea></div>
        <div class="field-group"><label>行为规则（每行一条）</label><textarea id="card-behavioral-rules" class="textarea-sm" placeholder="遇到危险时先保护弱者">${(card.behavioral_rules||[]).join('\n')}</textarea></div>
        <div class="field-group"><label>背景故事</label><textarea id="card-backstory" class="textarea-tall">${card.backstory||''}</textarea></div>
        <div class="field-group"><label>秘密（每行一个）</label><textarea id="card-secrets" class="textarea-sm">${(card.secrets||[]).join('\n')}</textarea></div>
        <div class="field-group"><label>备注</label><textarea id="card-notes" class="textarea-sm">${card.notes||''}</textarea></div>`;
    $("#modal-footer").innerHTML = `<button class="btn btn-ghost" onclick="hideModal('modal')">取消</button> <button class="btn btn-primary" id="btn-save-card">保存角色卡</button>`;
    $("#btn-save-card").addEventListener("click", () => {
        const nc = {
            name: $("#card-name").value.trim(), role: $("#card-role").value,
            age: $("#card-age").value, gender: $("#card-gender").value,
            current_status: $("#card-status").value, appearance: $("#card-appearance").value,
            distinguishing_features: $("#card-features").value.split('\n').filter(l=>l.trim()),
            motivation: $("#card-motivation").value, flaw: $("#card-flaw").value,
            fear: $("#card-fear").value, desire: $("#card-desire").value,
            voice: { speech_style: $("#card-speech-style").value, catchphrases: $("#card-catchphrases").value.split(/[,，]/).filter(s=>s.trim()) },
            dialogue_rules: $("#card-dialogue-rules").value.split('\n').filter(l=>l.trim()),
            behavioral_rules: $("#card-behavioral-rules").value.split('\n').filter(l=>l.trim()),
            backstory: $("#card-backstory").value,
            secrets: $("#card-secrets").value.split('\n').filter(l=>l.trim()),
            notes: $("#card-notes").value,
        };
        if (!nc.name) { toast("角色名称不能为空", "error"); return; }
        if (isNew) {
            AppState.characters.push({ id:generateId(), name:nc.name, appearance:nc.appearance, personality:nc.motivation, catchphrase:(nc.voice.catchphrases||[])[0]||"", background:nc.backstory, notes:nc.notes, cardData:nc });
        } else {
            AppState.characters[idx] = { ...AppState.characters[idx], name:nc.name, appearance:nc.appearance, personality:nc.motivation, catchphrase:(nc.voice.catchphrases||[])[0]||"", background:nc.backstory, notes:nc.notes, cardData:nc };
        }
        renderCharacters(); saveState(); hideModal("modal");
        toast(isNew ? "角色卡已创建" : "角色卡已更新", "success");
    });
    showModal("modal");
}

async function generateCharacterCardAI() {
    const modal = $("#modal");
    $("#modal-title").textContent = "AI 生成角色卡";
    $("#modal-body").innerHTML = `<div class="field-group"><label>角色描述</label><textarea id="gen-char-desc" class="textarea-tall" placeholder="一个25岁的女刺客，外表冷漠但内心善良..."></textarea></div><div id="gen-char-result" style="display:none;"><h4 style="color:var(--accent-light);margin:12px 0 8px;">生成结果</h4><div id="gen-char-content" style="white-space:pre-wrap;font-size:13px;line-height:1.8;"></div></div>`;
    $("#modal-footer").innerHTML = `<button class="btn btn-ghost" onclick="hideModal('modal')">取消</button> <button class="btn btn-primary" id="btn-gen-char">生成角色卡</button>`;
    $("#btn-gen-char").addEventListener("click", async () => {
        const desc = $("#gen-char-desc").value.trim();
        if (!desc) { toast("请输入角色描述", "error"); return; }
        const btn = $("#btn-gen-char");
        btn.classList.add("loading"); btn.innerHTML = '<span class="spinner"></span> 生成中...';
        try {
            const resp = await fetch("/api/character/card", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({mode:"generate",description:desc}) });
            const reader = resp.body.getReader(); const decoder = new TextDecoder(); let text = "";
            while (true) { const {value,done} = await reader.read(); if (done) break; text += decoder.decode(value,{stream:true}); }
            $("#gen-char-result").style.display = "block"; $("#gen-char-content").textContent = text;
            const jm = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*"name"[\s\S]*\}/);
            if (jm) {
                try {
                    const cd = JSON.parse(jm[1]||jm[0]);
                    AppState.characters.push({ id:generateId(), name:cd.name||"未命名", appearance:cd.appearance||"", personality:cd.motivation||"", catchphrase:(cd.voice?.catchphrases||[])[0]||"", background:cd.backstory||"", notes:cd.notes||"", cardData:cd });
                    renderCharacters(); saveState(); toast(`角色卡「${cd.name}」已创建`, "success");
                } catch(e) { console.warn("JSON解析失败:",e); }
            }
        } catch(e) { toast("生成失败: "+e.message, "error"); }
        finally { btn.classList.remove("loading"); btn.textContent = "生成角色卡"; }
    });
    showModal("modal");
}

// ============================================================
// v2.2: Quality Check
// ============================================================

async function runLocalQualityCheck(chapterIdx) {
    const ch = AppState.chapters[chapterIdx];
    if (!ch || !ch.content) { toast("章节内容为空", "error"); return; }
    try {
        const resp = await fetch("/api/quality/check", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({text:ch.content,check_type:"local"}) });
        const report = await resp.json();
        displayQualityReport(report, chapterIdx);
    } catch(e) { toast("质量检查失败: "+e.message, "error"); }
}

async function runAIQualityCheck(chapterIdx, focus) {
    focus = focus || "full";
    const ch = AppState.chapters[chapterIdx];
    if (!ch || !ch.content) { toast("章节内容为空", "error"); return; }
    const modal = $("#modal");
    $("#modal-title").textContent = `第${chapterIdx+1}章 - AI质量检查`;
    $("#modal-body").innerHTML = '<div style="text-align:center;padding:20px;"><span class="spinner"></span> 正在分析...</div>';
    $("#modal-footer").innerHTML = "";
    showModal("modal");
    try {
        const resp = await fetch("/api/quality/check", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({text:ch.content,check_type:"ai",focus:focus}) });
        const reader = resp.body.getReader(); const decoder = new TextDecoder(); let text = "";
        while (true) { const {value,done} = await reader.read(); if (done) break; text += decoder.decode(value,{stream:true}); $("#modal-body").innerHTML = `<pre style="white-space:pre-wrap;font-size:13px;line-height:1.8;">${text}</pre>`; }
    } catch(e) { $("#modal-body").innerHTML = `<div style="color:var(--danger);">检查失败: ${e.message}</div>`; }
    $("#modal-footer").innerHTML = '<button class="btn btn-ghost" onclick="hideModal(\'modal\')">关闭</button>';
}

function displayQualityReport(report, chapterIdx) {
    const modal = $("#modal");
    $("#modal-title").textContent = `第${chapterIdx+1}章 - 质量报告`;
    const sc = (s) => s>=80?'#2ecc71':s>=60?'#f1c40f':s>=40?'#e67e22':'#e74c3c';
    let html = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">
        <div style="text-align:center;padding:12px;background:var(--bg-secondary);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:${sc(report.overall_score)};">${report.overall_score}</div><div style="font-size:11px;color:var(--text-muted);">综合</div></div>
        <div style="text-align:center;padding:12px;background:var(--bg-secondary);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:${sc(report.ai_taste_score)};">${report.ai_taste_score}</div><div style="font-size:11px;color:var(--text-muted);">人味</div></div>
        <div style="text-align:center;padding:12px;background:var(--bg-secondary);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:${sc(report.readability_score)};">${report.readability_score}</div><div style="font-size:11px;color:var(--text-muted);">可读性</div></div>
        <div style="text-align:center;padding:12px;background:var(--bg-secondary);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:${sc(report.engagement_score)};">${report.engagement_score}</div><div style="font-size:11px;color:var(--text-muted);">吸引力</div></div></div>`;
    if (report.issues?.length) {
        html += `<div style="margin-bottom:16px;"><strong>发现 ${report.issues.length} 个问题：</strong><div style="margin-top:8px;max-height:300px;overflow-y:auto;">`;
        const shc = {high:'#e74c3c',medium:'#f39c12',low:'#3498db'};
        const shl = {high:'严重',medium:'中等',low:'轻微'};
        report.issues.forEach(issue => {
            html += `<div style="padding:8px;margin-bottom:6px;background:var(--bg-secondary);border-radius:6px;border-left:3px solid ${shc[issue.severity]||'#999'};">
                <div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:12px;font-weight:600;">${issue.description}</span><span class="badge badge-sm" style="background:${shc[issue.severity]||'#999'};color:white;">${shl[issue.severity]||issue.severity}</span></div>
                ${issue.suggestion?`<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">建议: ${issue.suggestion}</div>`:''}</div>`;
        });
        html += '</div></div>';
    }
    if (report.recommendations?.length) {
        html += '<div><strong>改进建议：</strong><ul style="margin:8px 0;padding-left:20px;">';
        report.recommendations.forEach(r => { html += `<li style="color:var(--text-secondary);margin-bottom:4px;">${r}</li>`; });
        html += '</ul></div>';
    }
    $("#modal-body").innerHTML = html;
    $("#modal-footer").innerHTML = `<button class="btn btn-ghost" onclick="hideModal('modal')">关闭</button> <button class="btn btn-primary" onclick="runAIQualityCheck(${chapterIdx})">AI深度分析</button>`;
    showModal("modal");
}

async function batchQualityCheck() {
    if (AppState.chapters.length === 0) { toast("请先生成章节", "error"); return; }
    const modal = $("#modal");
    $("#modal-title").textContent = "全书质量检查";
    $("#modal-body").innerHTML = '<div style="text-align:center;padding:20px;"><span class="spinner"></span> 正在检查...</div>';
    $("#modal-footer").innerHTML = "";
    showModal("modal");
    try {
        const resp = await fetch("/api/quality/batch", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({chapters:AppState.chapters.map(ch=>ch.content||"")}) });
        const result = await resp.json();
        const sc = (s) => s>=80?'#2ecc71':s>=60?'#f1c40f':s>=40?'#e67e22':'#e74c3c';
        let html = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
            <div style="text-align:center;padding:12px;background:var(--bg-secondary);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:${sc(result.summary.avg_overall_score)};">${result.summary.avg_overall_score}</div><div style="font-size:11px;color:var(--text-muted);">平均综合分</div></div>
            <div style="text-align:center;padding:12px;background:var(--bg-secondary);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:${sc(result.summary.avg_ai_taste_score)};">${result.summary.avg_ai_taste_score}</div><div style="font-size:11px;color:var(--text-muted);">平均人味</div></div>
            <div style="text-align:center;padding:12px;background:var(--bg-secondary);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:var(--warning);">${result.summary.total_issues}</div><div style="font-size:11px;color:var(--text-muted);">总问题</div></div></div>`;
        html += '<div style="max-height:400px;overflow-y:auto;">';
        result.chapters.forEach(ch => {
            const r = ch.report;
            html += `<div style="padding:10px;margin-bottom:6px;background:var(--bg-secondary);border-radius:6px;cursor:pointer;" onclick="runLocalQualityCheck(${ch.chapter_idx});hideModal('modal');">
                <div style="display:flex;justify-content:space-between;"><span style="font-weight:600;">第${ch.chapter_idx+1}章</span><div style="display:flex;gap:8px;"><span style="color:${sc(r.overall_score)};">综合${r.overall_score}</span><span style="color:${sc(r.ai_taste_score)};">人味${r.ai_taste_score}</span><span style="color:var(--text-muted);">${r.issues.length}问题</span></div></div></div>`;
        });
        html += '</div>';
        $("#modal-body").innerHTML = html;
    } catch(e) { $("#modal-body").innerHTML = `<div style="color:var(--danger);padding:12px;">检查失败: ${e.message}</div>`; }
    $("#modal-footer").innerHTML = '<button class="btn btn-ghost" onclick="hideModal(\'modal\')">关闭</button>';
}
