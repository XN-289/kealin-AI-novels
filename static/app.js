/**
 * Kealin AI Novels — 超级进化版 v3.0.0
 * 集成：创作工作台、提示词管理、右键菜单、AI助手、状态管理
 * 60轮迭代优化，从作者视角全面重构
 */

// ============================================================
// 全局 AbortController — 支持请求取消（Fix #2）
// ============================================================
let currentAbortController = null;

// ============================================================
// 默认提示词配置 — 全面重写（第21-23轮、第51轮）
// ============================================================

const DEFAULT_PROMPTS = {
    outline: `你是一个资深的小说策划，擅长把简短的故事构思扩充成长篇小说大纲。作者给了你一个200-300字的故事描述，你的任务是把它扩充成一个完整的200章长篇小说大纲。

【核心任务】
把作者的简短故事描述扩充成200章的完整大纲。这不是优化，是扩充——从种子长成大树。

【输入材料】
作者的故事描述：\${existing_outline}

【参考设定】
背景设定：\${background}
人物设定：\${characters}
角色关系：\${relationships}
核心剧情：\${plot}
写作风格：\${style}

【扩充规则——必须遵守】

一、规模要求：
- 总章节数：200章左右（不少于180章，不超过220章）
- 每章都要有明确的事件，不能是填充物
- 按"卷"或"篇"组织，每卷20-40章，每卷有独立的小高潮

二、长篇结构（不是15节拍，是200章的长篇节奏）：

【第一卷：起步篇（第1-40章）】
- 黄金三章：前三章必须完成"建立冲突 + 展示主角特质 + 第一个小高潮"
- 前10章：建立世界观、人物关系、主角的日常世界和致命缺陷
- 第11-20章：催化剂事件，主角被迫进入新世界/新状态
- 第21-30章：适应期，主角学习新规则，建立第一批盟友和对手
- 第31-40章：第一卷高潮，主角证明自己，但发现更大的秘密

【第二卷：成长篇（第41-80章】
- 第41-50章：新挑战，主角的能力和关系都要升级
- 第51-60章：副线启动（感情线/导师线/暗线），承载主题
- 第61-70章：中点反转，stakes升级，假胜利或假失败
- 第71-80章：第二卷高潮，主角失去重要的东西，被迫面对真正的敌人

【第三卷：危机篇（第81-120章）】
- 第81-90章：反派逼近，内外压力同时加剧
- 第91-100章：一切尽失，最低谷，必须有"死亡气息"（字面或隐喻）
- 第101-110章：灵魂暗夜，主角面对自我，找到新的方向
- 第111-120章：第三卷高潮，主角重组力量，准备最终对决

【第四卷：决战篇（第121-160章）】
- 第121-130章：集结盟友，准备最终计划
- 第131-140章：最终对决的第一阶段，双方试探
- 第141-150章：最终对决的高潮，主角运用新认知解决核心冲突
- 第151-160章：第四卷高潮，核心冲突解决，但故事还没完

【第五卷：收尾篇（第161-200章）】
- 第161-170章：新秩序建立，主角处理后遗症
- 第171-180章：副线收束，感情线/关系线都要有交代
- 第181-190章：最终考验，主角证明自己真正成长了
- 第191-200章：结尾画面，与开场形成对比，展示主角成长，留下余味

三、每章必须有的元素：
- 一句话概括：这章到底发生了什么（读完能说清）
- 情绪基调：紧张/轻松/悲伤/热血/悬疑/温馨（连续3章不能同一种）
- 钩子强度：1-5星（每章结尾要在最关键的地方断开）
- 事件链：起因→经过→结果/悬念
- 伏笔：本章埋了什么，在哪章收；本章收了什么，在哪章埋的

四、人物弧线要求：
- 主角：从A状态到B状态，每5章要有明显变化
- 配角：每个人都要有独立动机，不能是工具人
- 反派：要有真实动机，不能是纯恶
- 关系线：要有起伏，不能一直好或一直坏

五、节奏控制：
- 每5章一个小高潮或大转折，给读者留下来的理由
- 每20章一个大高潮，改变故事走向
- 高潮和日常要交替，不能一直紧绷
- 伏笔回收要有节奏，不能堆在一起

【输出格式】
用讲故事的方式写大纲——让我读完就知道这本书"读起来是什么感觉"。

按卷组织，每卷这样写：

【第一卷：卷名（第1-40章）】
卷的核心冲突：[一句话]
卷的情绪走向：[从XX到XX]

第1章：[章节标题]
一句话概括：[这章发生了什么]
情绪基调：[XX]
钩子强度：[X星]
核心事件：[用场景思维写，不要概括]
伏笔：[埋/收]

第2章：[章节标题]
...

【注意事项】
- 不要加开场白、寒暄、对话式回复，直接输出大纲
- 保留作者原稿中好的部分，在此基础上扩充
- 每个转折必须有因果链，不能"突然冒出"
- 每个关键行为必须有真实动机，人物不是推剧情的工具人
- 设计 3-5 个"名场面"——写清楚为什么读者会记住
- 结局要有余味，不是大团圆糊弄`,

    chapter: `根据下面的大纲，直接拆分成章节细纲。大纲已经规划好了200章的内容，你的任务是把每章的细纲写出来，让后续写正文时有明确的方向。

【核心任务】
把大纲中的章节描述扩充成详细的细纲。每章都要有明确的事件、场景、人物状态变化。

【上下文】
大纲：\${outline}
背景：\${background}
人物：\${characters}
关系：\${relationships}
剧情：\${plot}
风格：\${style}

【扩充规则——必须遵守】

一、规模要求：
- 按大纲中的章节数量输出，不要增减章节
- 每章细纲要详细到能直接写正文，不能太笼统
- 保持大纲中的章节顺序和结构

二、每章细纲必须包含：

1. 章节标题：简洁有力，能概括本章核心
2. 一句话概括：这章到底发生了什么（读完能说清）
3. 情绪基调：紧张/轻松/悲伤/热血/悬疑/温馨（连续3章不能同一种）
4. 钩子强度：1-5星（每章结尾要在最关键的地方断开）

5. 场景列表（每章2-4个场景）：
   - 场景1：[地点]
     在场的人：[角色列表]
     发生了什么：[核心事件，用场景思维写，不要概括]
     情绪走向：[从XX到XX]
     关键对话：[如果有重要对话，写出要点]
     关键动作：[如果有重要动作，写清楚]
   - 场景2：...

6. 主要事件链：起因→经过→结果/悬念

7. 人物状态变化：
   - 主角：从A状态到B状态
   - 配角：哪些关系发生了变化，变了多少
   - 新出场人物：[如果有，写清楚身份和作用]

8. 伏笔管理：
   - 本章埋的伏笔：[具体，标注预设在第几章收]
   - 本章收的伏笔：[具体，标注原来在哪章埋的]
   - 为下一章留的线：[具体]

9. 写作要点：
   - 开头怎么切入：[感官切入/动作切入/对话切入/内心独白切入]
   - 结尾怎么断：[在哪个关键时刻断开]
   - 需要避免的问题：[根据前文，这章要注意什么]

【输出格式】
用 ###fenge 分隔章节，每章这么写：

###fenge
第X章：[章节标题]

一句话概括：[这章到底发生了什么]

情绪基调：[紧张/轻松/悲伤/热血/悬疑/温馨]
钩子强度：[1-5星]

场景1：[地点]
  在场的人：[角色列表]
  发生了什么：[核心事件，用场景思维写，不要概括]
  情绪走向：[从XX到XX]
  关键对话：[对话要点，不是完整对话]
  关键动作：[重要动作描写要点]

场景2：...

主要事件链：
  起因→经过→结果/悬念

人物状态变化：
  主角：[从A到B]
  配角：[变化]

本章埋的伏笔：[具体，标注预设在第几章收]
本章收的伏笔：[具体，标注原来在哪章埋的]
为下一章留的线：[具体]

写作要点：
  开头切入：[方式]
  结尾断点：[位置]
  注意事项：[避免什么]
###fenge

【注意事项】
- 不要加开场白、寒暄、对话式回复，直接输出细纲
- 保持大纲中的核心事件，不要自己发挥新剧情
- 每章都要有明确的事件驱动，不能是流水账
- 场景思维：对话和行动推动剧情，不要用旁白解说
- 人物状态要清晰：这章结束时主角在哪、什么心情、手上有什么筹码
- 伏笔要具体：不能写"有伏笔"，要写清楚伏笔是什么、在哪章收`,

    content: `根据下面的章节大纲写正文。写作的核心原则就一条：让读者忘了自己在看小说，觉得这就是真实发生的事。

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
【前面章节 - 保持连贯性】
═══════════════════════════════════════════
\${previous_chapters}

\${world_info}

═══════════════════════════════════════════
【风格进化 - 每章只能更好，不能退步】
═══════════════════════════════════════════

这是写好本章最重要的一步。在动笔之前，先读上一章的正文，想清楚三件事：

1. 上一章写得好的地方是什么？
   - 句式节奏：是长短交替得舒服，还是某段的短句特别有冲击力？
   - 情感密度：哪些地方让读者"进去了"？是某个动作细节，还是某句没说完的话？
   - 描写手法：环境描写是不是跟情绪贴合？有没有哪句描写特别有画面感？
   - 对话风格：角色说话是不是各有特点？有没有哪段对话特别自然？

2. 本章要继承什么？
   - 把上一章写得好的手法、节奏、语气继承下来。
   - 如果上一章用了某种切入方式（比如从感官切入），本章可以换一种，但整体风格要连贯。

3. 本章要避免什么？
   - 如果上一章有用户改过的地方，那些问题本章不能再犯。
   - 如果上一章某些表达重复了，本章要换新的写法。

核心原则：写作只能越来越好，不能回归AI默认风格。上一章的实际风格就是最准确的参考——比任何设定都准。

═══════════════════════════════════════════
【怎么写才像人写的】
═══════════════════════════════════════════

一、开头要抓人
- 前200字必须有冲突、悬念或意外。读者看完前200字必须想看第201字。
- 可以是一句狠话、一个意外、一个选择、一个发现。就是不能从"阳光透过窗帘"开始。
- 好的开头像钩子——一钩住就不放。

二、语言要像人说话，不像机器在输出
- 句子长短交替：短句3-8字，长句20+字，像呼吸一样有节奏。全是15-25字的"标准句"？那就是AI。
- 一个段落里"的"字不超过3个。"温暖的阳光"→"阳光"；"缓缓地走来"→"走过来"。
- 形容词能删就删。用具体感官替代抽象描写："她很漂亮"→"她低头时一缕头发垂下来遮住半边脸"。
- 段落长度要不规则：有的1句话（强调），有的5-6句（铺陈），不要每段都3-4句。
- 每段开头不能都用角色名或代词，要有变化。
- 偶尔用不完整的句子、省略句、倒装句。真实写作里有大量语法"瑕疵"。

三、对话要像真人聊天
- 每句对话必须做到至少一件事：暴露信息 / 暴露性格 / 推动剧情。做不到就删。
- 不同角色说话方式要不同——粗人说粗话，文人说文话，急脾气的人说话像机关枪。
- 禁止反复用"XX说道"、"XX淡淡道"。用动作代替标签："他点了一根烟，'你说吧。'"
- 对话要有打断、犹豫、没说完的句子、口头禅、答非所问。真实的对话从来不是一问一答。
- 潜台词比明说好看十倍。角色说的话和想的不一样，张力就出来了。

四、用行为说故事，别说破（冰山理论）
- "他很愤怒"→"他把杯子摔了"。让读者自己感受，别替读者感受。
- 禁止段落结尾来一句"这就是XX的意义啊"——删掉。
- 场景描写只写跟剧情有关的细节，不要为了"营造氛围"堆砌环境。
- 心理活动用行为暗示。大段内心独白是偷懒——让读者从动作、眼神、沉默里去读。
- 节奏该快就快（一句话带过一年），该慢就慢（一个眼神写三段）。

五、每章结尾留个钩子
- 钩子跟下一章内容要有关，不能是无关联的悬念。
- 可以是：一个未解的问题、一个意外发现、一个艰难选择、一句话只说了一半。
- 在最关键的地方断开，让读者心里痒痒的。

六、前后要对得上
- 人物性格不能突然变脸（除非有铺垫）。
- 前面埋的伏笔，本章要呼应或推进。
- 世界观设定不能前后矛盾。
- 角色关系的发展要有因果链，不能突变。

═══════════════════════════════════════════
【绝对不能出现的东西——出现就重写】
═══════════════════════════════════════════

禁用词（AI高频废话）：
"心中一凛"、"眼中闪过一丝XX"、"嘴角勾起一抹XX"、"一股XX涌上心头"、"仿佛XX一般"、"宛如XX"、"不由得"、"情不自禁"、"目光深邃"、"意味深长"、"若有所思"、"恍然大悟"、"不禁XX"、"这一刻他明白"、"他知道，XX"、"眉头微蹙"、"嘴角上扬"、"心中暗道"、"不觉间"、"霎时间"、"此刻的他"、"他深知"、"无疑"、"显然"、"毫无疑问"、"不言而喻"、"就在这时"、"突然间"、"猛然间"、"刹那间"、"恍惚间"、"本能地"、"下意识地"、"条件反射般"

结构性问题（出现就扣分）：
- 排比句："有时候……有时候……有时候……"——直接删
- 结构化对比："不是XX而是XX"、"不是XX是XX"——改成自然说法
- 议论文式过渡："首先……其次……最后……"、"一方面……另一方面"——删
- 段尾总结抒情："这就是XX的意义啊"、"或许这就是XX吧"——删
- 公文腔翻译腔："尽管……但是……"、"与此同时"、"综上所述"——删

场景切入要多样化：
- 不要每段都用"时间状语+主句"开头："有一天……""再后来……""那天……"
- 换着来：感官切入（从声音、气味开始）、动作直接切入、对话跳入、内心独白切入

直接写正文，不要在开头写"好的"或任何确认语。`,

    // 章节摘要生成 — 故事圣经条目
    summary: `你是小说的故事圣经管理员。你的工作是把每章的核心信息提炼出来，让后续写作时不会"失忆"。这是给AI看的记忆锚点，不是给读者看的读后感——只记事实，不抒情。

【章节内容】
\${chapter_content}

【摘要要记什么——每条都不能少】

1. 本章发生了什么（50-100字）：第三人称，只写干货。什么人做了什么事，导致了什么结果。不要写"本章展现了XX的内心挣扎"这种空话。

2. 谁出场了，状态怎么变了：每个出场角色写"角色名：从A状态到B状态"。比如"林远：从信任妻子变成怀疑妻子"。如果状态没变，就写"未变"。

3. 角色弧线推了哪一步：本章推进了哪些角色的 Want vs Need 矛盾？他以为自己想要的东西和真正需要的东西之间的错位，有没有往前走？

4. 本章埋了什么伏笔：具体是什么，在哪一章预设回收。如果没有就写"无"。

5. 本章收了什么伏笔：回收了前面哪章的什么伏笔。如果没有就写"无"。

6. 跟前文的关联：本章呼应了前面哪些事件或设定。不能写"无"——每章都得跟前文有关系。

7. 情绪走向：用箭头表示本章的情绪变化。比如"平静→紧张→震惊→压抑→决绝"。

8. 结尾状态：本章结束时，主角在哪、什么心情、手上有什么筹码、面对什么困境。这是下一章的起点。

9. 世界观有没有变：本章是否新增或修改了世界观设定（新的规则、新的地点、新的势力）。如果没有就写"无"。`,
};

// ============================================================
// 右键菜单配置 — 大幅扩展（第4-10轮、第25-26轮）
// ============================================================

const DEFAULT_MENUS = {
    outline: {
        menu: [
            { name: "AI评分", prompt: `帮我看一下这个大纲写得怎么样（0-100分），说人话，别用表格。\n\n主要看这几件事：\n1. 核心矛盾够不够尖锐——是不是那种误会一下就和好的弱冲突\n2. 转折有没有因果链——能不能追溯到前因，还是突然冒出来的\n3. 人物有没有缺陷和成长——是不是推剧情的工具人\n4. 有没有3-5个读者会记住的"名场面"\n5. 结局有没有余味\n6. 前三章能不能钩住读者\n7. 跟同类题材比有什么不一样的地方\n\n扣分项：情节靠巧合推进-20，人物动机不合理-15，模板化三幕式结构-10，没有留存钩子-15\n\n大纲：\${selected_text}` },
            { name: "加强冲突", prompt: `这个大纲的冲突太弱了，帮我改尖锐一点。\n\n冲突不能是善恶对立那种简单的——得是两难选择：两个都想要，只能选一个。选择必须有代价，不能轻飘飘地过关。\n\n背景：\${background}\n人物：\${characters}\n大纲：\${selected_text}` },
            { name: "加因果链", prompt: `这个大纲的转折缺因果，帮我补上。\n\n每个转折都得有前因——不能"突然冒出一个XX"。要让读者回头看的时候觉得"原来是这样"。\n大纲：\${selected_text}` },
            { name: "修人物动机", prompt: `这个大纲里人物动机不够真实，帮我修一下。\n\n人不是为了推动剧情而存在的——每个关键行为都得有真实的动机，跟他的性格、过往经历、当前处境有关。\n\n人物：\${characters}\n关系：\${relationships}\n大纲：\${selected_text}` },
            { name: "砍废话", prompt: `这个大纲废话太多，帮我砍一砍。\n\n删掉所有正确的废话、套话、说了等于没说的话。只留核心情节节点和关键转折。删完后字数至少减少30%。\n大纲：\${selected_text}` },
            { name: "加暗线", prompt: `在这个大纲里帮我加1-2条暗线/伏笔线。\n\n暗线要有明确的埋设点和回收点，跟主线有交叉，揭开的时候要有反转效果——不能是独立于主线的闲笔。\n大纲：\${selected_text}` },
            { name: "砍冗余人物", prompt: `帮我看看这个大纲里哪些人物是多余的。\n\n标准：\n1. 只出场一次且没有独立动机→考虑合并\n2. 只是为了传话或解释信息→考虑删除\n3. 功能跟别人重复→考虑合并\n\n给出具体建议。\n大纲：\${selected_text}` },
            { name: "加黄金三章", prompt: `帮我优化前三章的设计。\n\n第一章必须埋下核心冲突的种子，第二章必须展示主角是什么样的人，第三章必须有一个小高潮。三章之内让读者知道"这本书讲什么"和"主角是什么人"。\n大纲：\${selected_text}` }
        ]
    },
    chapter: {
        menu: [
            { name: "AI评分", prompt: `帮我看一下这个章节细纲写得怎么样（0-100分）。\n\n核心标准就一条：每章能不能用一句话概括"这章发生了什么"。概括不出来说明剧情散了，扣大分。\n\n其他维度：\n1. 每章有没有明确事件驱动\n2. 情节有没有起伏（不是流水账）\n3. 钩子强度——读者看完想不想看下一章\n4. 跟前文有没有因果关联\n5. 连续3章有没有重复情绪\n\n扣分项：没有明确事件-30，情节流水账-20，没有钩子-15\n\n章节细纲：\${selected_text}` },
            { name: "加事件驱动", prompt: `这个章节细纲没有明确事件，帮我补上。\n\n每章必须有一个核心事件——用行动和对话推进，不要用旁白"然后XX做了XX"。事件要有起因、经过、结果。\n细纲：\${selected_text}` },
            { name: "理因果链", prompt: `这些章节之间缺乏因果联系，帮我理一下。\n\n上一章的果要成为下一章的因——不能断裂式跳跃。让我能回答"为什么这个事件发生在这里"。\n大纲：\${outline}\n细纲：\${selected_text}` },
            { name: "砍流水账", prompt: `这个细纲是流水账，帮我砍掉废话。\n\n删掉所有"然后XX"、"接着XX"式的平铺直叙，只留有转折、有冲突、有信息量的节点。\n细纲：\${selected_text}` },
            { name: "加悬念钩子", prompt: `在每章结尾帮我加悬念钩子。\n\n钩子必须跟下一章内容有关，不能是无关联的悬念。在最关键的地方断开，标注钩子强度（1-5星）。\n细纲：\${selected_text}` },
            { name: "补对话要点", prompt: `在这个细纲里帮我补充关键对话的要点。\n\n对话要么传递信息，要么制造冲突，要么揭示关系——三选一。不同角色的说话方式要有区别。\n\n人物：\${characters}\n细纲：\${selected_text}` },
            { name: "加情绪曲线", prompt: `帮我给这个细纲标注情绪曲线。\n\n每章标注主要情绪（紧张/轻松/悲伤/热血/悬疑/温馨）和情绪走向。确保连续3章不会有相同情绪，避免读者审美疲劳。\n细纲：\${selected_text}` }
        ]
    },
    content: {
        menu: [
            { name: "AI味检测", prompt: `帮我检测一下这段内容的AI味有多重（0-100分，100=完全人写，0=纯AI垃圾）。\n\n逐项检查，说人话：\n\n1. 禁用词：有没有"心中一凛"、"眼中闪过"、"嘴角勾起"、"眉头微蹙"、"不禁"、"仿佛XX一般"、"宛如"、"若有所思"、"恍然大悟"、"此刻的他"、"他深知"这些模板句\n2. 排比句：有没有"有时候…有时候…有时候…"这种同句式重复三次以上的\n3. 段尾抒情：有没有"这就是XX的意义啊"这种总结式结尾\n4. 结构化对比：有没有"不是XX而是XX"这种议论文句式\n5. 对话标签：是不是都在"XX说道"后面接完整句子\n6. 心理独白：有没有大段内心独白代替行为描写\n7. "的"字密度：每段超过5个扣分\n8. 句子长度：全在15-25字=AI味重\n9. 句式多样性：有没有过多相同句式开头\n10. 词汇重复：有没有高频重复词\n11. 场景切入：是不是每段都用"时间状语+主句"开头\n12. 议论文过渡词：有没有"首先…其次…最后…"、"一方面…另一方面"\n\n逐项打分，最后给总分。列出所有有问题的句子。\n\n内容：\${selected_text}` },
            { name: "去AI味重写", prompt: `这段内容AI味太重了，帮我重写。\n\n重写要点：\n- 删掉所有禁用词\n- 打破排比句\n- 删掉段尾的总结抒情\n- "的"字每段不超过3个\n- 形容词能删就删\n- "他很愤怒"→用动作表达（"他把杯子摔了"）\n- "XX说道"→用动作代替\n- 句子长短交替\n- 用具体感官替代抽象描写\n- 场景切入方式要多样化\n- 不能出现"不是XX而是XX"结构\n\n风格：\${style}\n内容：\${selected_text}` },
            { name: "压缩精简", prompt: `这段内容太啰嗦了，帮我砍到精华。\n\n砍掉：\n1. 不推动剧情的环境描写\n2. 重复表达同一个意思的句子\n3. "的"字超过3个的形容词堆砌\n4. 没有信息量的过渡句\n5. 总结式抒情\n6. 大段心理独白\n\n目标：字数减少40%，信息量不减。关键剧情和人物行为都保留。\n内容：\${selected_text}` },
            { name: "改对话", prompt: `这段对话太假了，帮我改得像真人说话。\n\n要求：\n- 不同角色说话方式要不同\n- 别一问一答像审讯，要有打断、跑题、答非所问\n- 删掉"XX说道"、"XX淡淡道"，用动作代替\n- 对话要有潜台词，不是什么都说出来\n- 加入沉默、转移话题、没说完的句子\n\n人物：\${characters}\n内容：\${selected_text}` },
            { name: "砍形容词", prompt: `这段内容形容词太多了，帮我砍掉。\n\n"温暖的阳光"→"阳光"，"缓缓地走来"→"走过来"，"美丽的花朵"→"花"。删掉所有不改变意思的修饰词，一个段落里"的"字不超过3个。\n\n直接输出改后的文本。\n内容：\${selected_text}` },
            { name: "加动作写情绪", prompt: `这段内容在直接说情绪，帮我改成用动作表达。\n\n"他很紧张"→写他手指敲桌子、反复看手机。"她心如刀割"→写她攥紧拳头、转身不让人看见眼泪。"气氛很尴尬"→写谁说了什么做了什么（沉默、找话题、假装看手机）。\n\n不要加内心独白解释，让读者自己从行为中感受。\n内容：\${selected_text}` },
            { name: "加口语感", prompt: `这段内容读着像机器写的，帮我改成有口语感的写法。\n\n短句为主，偶尔一个长句。可以用不完整的句子、省略号。像在跟朋友讲故事，不是在写作文。\n内容：\${selected_text}` },
            { name: "加伏笔", prompt: `在这段内容里帮我加伏笔。\n\n伏笔要自然，不能太刻意——可以是一个细节、一句话、一个物件、一个表情。标注埋设点和预设的回收点。\n大纲：\${outline}\n内容：\${selected_text}` },
            { name: "改节奏", prompt: `帮我调整这段内容的节奏。\n\n如果太拖沓：压缩句子，删掉不推动剧情的描写。如果太快：扩写关键场景，放慢重要时刻。紧张的地方用短句，重要的地方用慢镜头。\n内容：\${selected_text}` },
            { name: "加感官描写", prompt: `这段内容缺少感官细节，帮我补上。\n\n用视觉/听觉/嗅觉/触觉/味觉的具体细节替代抽象描述。比如："他闻到花香"→"栀子花的甜腻味灌进鼻腔，混着雨后泥土的腥气"。不要过度描写，只加跟剧情有关的。\n内容：\${selected_text}` },
            { name: "续写", prompt: `根据已有内容，帮我续写500-1000字。\n\n要求：\n1. 保持人物性格一致\n2. 保持情节连贯\n3. 保持语言风格一致\n4. 续写要有新信息或新冲突\n5. 结尾要留钩子\n\n大纲：\${outline}\n背景：\${background}\n人物：\${characters}\n已有内容：\${selected_text}` },
            { name: "改写风格", prompt: `把这段内容改写成指定风格。\n\n风格：热血/悬疑/搞笑/文艺/硬核（选一个或自定义）\n保留核心剧情和人物，调整语言风格和节奏，仍然遵守反AI味规则。\n内容：\${selected_text}` },
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
            background: "（参考）现代都市，可以是重生、穿越、或回到过去。具体设定你自己定。",
            characters: "（参考）人物你自己设计，这里只提供方向：可以有一个带着某种'信息差'的主角，身边有信任他和不信他的人。",
            relationships: "（参考）你来定。可以是信任与背叛、利益纠葛、或者情感拉扯——哪种好看写哪种。",
            plot: "（参考）主线你自己想。核心是：主角知道一些别人不知道的事，他怎么用这个优势，以及这个优势什么时候失效。",
            style: "节奏紧凑，对话要有信息量，不要废话。具体风格以你写的大纲为准。"
        }
    },
    xianxia: {
        name: "仙侠修真",
        fields: {
            background: "（参考）修真世界，具体世界观你自己搭。宗门、散修、妖兽、秘境——用多少你自己定。",
            characters: "（参考）人物你自己设计。可以有师徒、同门、对手、红颜——但不要写成模板，每个人得有自己的理由。",
            relationships: "（参考）你来定。修真世界里好看的关系：师徒之间的传承与反叛、道友之间的信任与猜忌、正邪之间的灰色地带。",
            plot: "（参考）主线你自己想。核心是：主角为什么要修仙？不是'因为天赋好所以修仙'，得有一个真实的驱动力。",
            style: "语言可以古典一点但别端着，战斗描写要有画面感，日常要有烟火气。具体以你的大纲为准。"
        }
    },
    fantasy: {
        name: "东方玄幻",
        fields: {
            background: "（参考）玄幻世界，万族林立。具体设定你自己来，不用全写出来，先想清楚核心矛盾发生在哪个层面。",
            characters: "（参考）人物你自己设计。主角不要写成'天选之人'模板——得有缺陷，有不想面对的东西。",
            relationships: "（参考）你来定。兄弟情、宿敌、亦师亦友——哪种关系能推动剧情就写哪种。",
            plot: "（参考）主线你自己想。核心是：主角想要什么？他愿意付出什么代价？谁在挡他的路？",
            style: "大气但不空洞，热血但不无脑。具体风格以你的大纲为准。"
        }
    },
    system: {
        name: "系统流",
        fields: {
            background: "（参考）主角获得某种'外挂'。可以是系统、面板、异能、金手指——形式不限，关键是怎么用。",
            characters: "（参考）人物你自己设计。主角可以是普通人，也可以是有基础的人——但他的性格要跟他的选择对得上。",
            relationships: "（参考）你来定。系统流好看的不是打怪升级，是主角跟周围人的关系变化——变强之后谁靠近、谁疏远、谁嫉妒。",
            plot: "（参考）主线你自己想。核心是：这个'外挂'的代价是什么？没有代价的爽文不好看。",
            style: "节奏明快，爽点密集但要有铺垫。具体风格以你的大纲为准。"
        }
    },
    apocalypse: {
        name: "末日求生",
        fields: {
            background: "（参考）末日降临，具体原因你自己定。病毒、灾变、外星入侵、未知现象——选一个你写得动的。",
            characters: "（参考）人物你自己设计。末日故事好看的是人性——绝境下谁暴露本性，谁出乎意料。",
            relationships: "（参考）你来定。生死关头建立的信任、资源紧缺时的背叛、废墟里的温情——你来选。",
            plot: "（参考）主线你自己想。核心是：末日只是一个壳，里面装的是什么？生存？寻找？重建？回归？",
            style: "紧张但要有喘息，残酷但要有温度。具体风格以你的大纲为准。"
        }
    },
    romance: {
        name: "现代言情",
        fields: {
            background: "（参考）现代都市，职场、校园、或任何你熟悉的场景。背景越真实越好。",
            characters: "（参考）人物你自己设计。男女主不要写成'完美人设'——有毛病的人谈恋爱才好看。",
            relationships: "（参考）你来定。言情好看的不是'在一起'，是'为什么不能在一起'——把那个障碍想清楚。",
            plot: "（参考）主线你自己想。核心是：两个人各自想要什么？对方是阻碍还是救赎？",
            style: "对话要像真人说话，情感要克制不要肉麻。具体风格以你的大纲为准。"
        }
    },
    history: {
        name: "历史架空",
        fields: {
            background: "（参考）架空历史，可以基于真实朝代改编，也可以完全虚构。关键是世界观要自洽。",
            characters: "（参考）人物你自己设计。帝王将相也好，贩夫走卒也好——关键是他在这个时代里想做什么。",
            relationships: "（参考）你来定。权谋故事好看的是利益联盟的建立和瓦解——谁跟谁是一伙的，什么时候翻脸。",
            plot: "（参考）主线你自己想。核心是：主角在历史的洪流里想改变什么？他有没有这个能力？代价是什么？",
            style: "语言可以有古韵但别晦涩，权谋要写得像下棋不像念经。具体风格以你的大纲为准。"
        }
    },
    scifi: {
        name: "科幻末世",
        fields: {
            background: "（参考）未来世界或末世。科技设定不用太硬核，关键是这个设定能产生什么矛盾。",
            characters: "（参考）人物你自己设计。科幻故事里好看的是人在极端环境下的选择——技术只是背景，人是核心。",
            relationships: "（参考）你来定。信任与背叛、人与AI的关系、幸存者之间的博弈——你来选。",
            plot: "（参考）主线你自己想。核心是：这个世界怎么了？主角能做什么？他愿意付出什么？",
            style: "设定要有说服力但别写成说明书，紧张感要持续但要有节奏。具体风格以你的大纲为准。"
        }
    },
    gaming: {
        name: "游戏竞技",
        fields: {
            background: "（参考）电竞、虚拟游戏、或游戏世界。具体是哪种你自己定。",
            characters: "（参考）人物你自己设计。竞技故事好看的是团队化学反应——不是一个人carry，是一群人怎么磨合。",
            relationships: "（参考）你来定。队友之间的默契与摩擦、对手之间的尊重与敌意、选手与观众的关系。",
            plot: "（参考）主线你自己想。核心是：主角想证明什么？赢了比赛之后他真正得到了什么？",
            style: "热血但要有技术细节支撑，团队戏要有群像感。具体风格以你的大纲为准。"
        }
    },
    mystery: {
        name: "悬疑推理",
        fields: {
            background: "（参考）现代都市、封闭空间、或任何适合发生案件的场景。关键是场景要能制造信息差。",
            characters: "（参考）人物你自己设计。每个人都要有嫌疑，每个人都要有秘密——但不能为了反转而反转。",
            relationships: "（参考）你来定。悬疑好看的是人物之间的隐藏关系——表面一套背后一套，揭开的时候要有冲击力。",
            plot: "（参考）主线你自己想。核心是：真相是什么？为什么现在才揭开？谁在撒谎？为什么撒谎？",
            style: "逻辑要严密，氛围要压迫，节奏要一张一弛。具体风格以你的大纲为准。"
        }
    }
};

// ============================================================
// 应用状态 — 大幅扩展（第13、18-20、36、41、46轮）
// ============================================================

const AppState = {
    chapters: [],
    masterOutline: '',  // 故事大纲（顶层设计）
    storyDescription: '',  // 故事描述（200-300字的构思）
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

    // v2.2: 语义记忆（自动提取的关键事实）
    semanticMemory: [],

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

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showModal(id) { document.getElementById(id).style.display = "flex"; }
function hideModal(id) { document.getElementById(id).style.display = "none"; }

// 流式读取（第39轮：增强错误处理，Fix #2：AbortController，Fix #4：精细错误处理）
async function streamFetch(url, body, onChunk) {
    // 取消上一个未完成的请求
    if (currentAbortController) {
        currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    let resp;
    try {
        resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: currentAbortController.signal,
        });
    } catch (e) {
        if (e.name === 'AbortError') {
            throw new Error('请求已取消');
        }
        throw new Error('网络连接失败，请检查网络');
    }

    if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${errorText}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            text += decoder.decode(value, { stream: true });
            onChunk(text);
        }
    } catch (e) {
        // 流式传输中断 — 抛出更清晰的错误
        if (e.name === 'AbortError') {
            throw new Error('请求已取消');
        }
        if (text.length > 0) {
            // 已收到部分内容，返回已收到的部分而非抛错
            console.warn('[streamFetch] 流式传输中断，已接收部分内容:', text.length, '字符');
            return text;
        }
        throw new Error('流式传输中断，请重试');
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
        promptVersion: 3,
        fields: {
            background: $("#field-background")?.value || "",
            characters: $("#field-characters")?.value || "",
            relationships: $("#field-relationships")?.value || "",
            plot: $("#field-plot")?.value || "",
            style: $("#field-style")?.value || "",
        },
        outline: $("#outline")?.value || "",
        masterOutline: AppState.masterOutline || '',
        storyDescription: AppState.storyDescription || '',
        chapters: AppState.chapters,
        prompts: {
            outline: $("#prompt-outline")?.value || "",
            chapter: $("#prompt-chapter")?.value || "",
            content: $("#prompt-content")?.value || "",
            summary: $("#prompt-summary")?.value || "",
        },
        menus: {
            outline: $("#menu-outline")?.value || "",
            chapter: $("#menu-chapter")?.value || "",
            content: $("#menu-content")?.value || "",
        },
        genre: $("#genre-selector")?.value || "",
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
        semanticMemory: AppState.semanticMemory,
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

    // v4.0: 保存画布节点位置
    if (typeof CanvasEngine !== 'undefined') {
        CanvasEngine.saveNodePositions();
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

        // 恢复故事大纲（顶层设计）
        if (state.masterOutline && typeof state.masterOutline === "string") {
            AppState.masterOutline = state.masterOutline;
            const masterEl = document.getElementById("master-outline-textarea");
            if (masterEl) masterEl.value = state.masterOutline;
        }

        // 恢复故事描述
        if (state.storyDescription && typeof state.storyDescription === "string") {
            AppState.storyDescription = state.storyDescription;
            const storyDescEl = document.getElementById("master-story-description");
            if (storyDescEl) storyDescEl.value = state.storyDescription;
        }

        // 恢复提示词（版本不匹配时跳过，使用新默认值）
        if (state.promptVersion === 3 && state.prompts && typeof state.prompts === "object") {
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

        // 恢复语义记忆（v2.2）
        if (state.semanticMemory && Array.isArray(state.semanticMemory)) {
            AppState.semanticMemory = state.semanticMemory;
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
    const title = ($("#field-plot")?.value || '').slice(0, 20) || "未命名小说";
    content += `《${title}》\n\n`;

    // 大纲
    if ($("#outline")?.value) {
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
    const title = ($("#field-plot")?.value || '').slice(0, 20) || "未命名小说";
    content += `# ${title}\n\n`;

    // 大纲
    if ($("#outline")?.value) {
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
    if (!container) return;
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
                        <button class="btn btn-sm btn-accent" data-action="scene-plan" data-idx="${i}" title="AI场景规划">场景规划</button>
                        <button class="btn btn-sm btn-ghost" data-action="quality-check" data-idx="${i}" title="质量检查">质量检查</button>
                        <button class="btn btn-sm btn-ghost" data-action="analyze-pacing" data-idx="${i}" title="节奏分析">节奏</button>
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

    // 更新章节画布
    if (typeof renderChapterCards === 'function') {
        renderChapterCards();
    }
}

function bindChapterEvents() {
    const container = $("#chapters-container");
    if (!container) return;

    container.querySelectorAll(".chapter-header").forEach(el => {
        el.addEventListener("click", (e) => {
            if (e.target.closest("[data-action]")) return;
            const idx = parseInt(el.dataset.idx);
            // 打开浮动详情面板
            ChapterDetailPanel.open(idx);
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

    // v2.2: 场景规划按钮
    container.querySelectorAll("[data-action='scene-plan']").forEach(el => {
        el.addEventListener("click", async (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            await generateScenePlan(idx);
        });
    });

    // v2.2: 质量检查按钮
    container.querySelectorAll("[data-action='quality-check']").forEach(el => {
        el.addEventListener("click", async (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            await runLocalQualityCheck(idx);
        });
    });

    // v2.2: 节奏分析按钮
    container.querySelectorAll("[data-action='analyze-pacing']").forEach(el => {
        el.addEventListener("click", async (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx);
            await analyzeChapterPacing(idx);
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
    if (!container) return;
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
    let total = countChars($("#outline")?.value || '');
    AppState.chapters.forEach(ch => {
        total += countChars(ch.content);
    });

    // Update stat items — preserve SVG icon, only update text node
    const totalEl = $("#total-chars");
    if (totalEl) {
        const svg = totalEl.querySelector("svg");
        totalEl.textContent = "";
        if (svg) totalEl.appendChild(svg);
        totalEl.appendChild(document.createTextNode(total.toLocaleString()));
    }

    const chapterEl = $("#chapter-count");
    if (chapterEl) {
        const svg = chapterEl.querySelector("svg");
        chapterEl.textContent = "";
        if (svg) chapterEl.appendChild(svg);
        chapterEl.appendChild(document.createTextNode(AppState.chapters.length.toString()));
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
    const safe = (sel) => { const el = $(sel); return el ? el.value : ''; };
    return {
        background: safe("#field-background"),
        characters: safe("#field-characters"),
        relationships: safe("#field-relationships"),
        plot: safe("#field-plot"),
        style: safe("#field-style"),
    };
}

async function generateOutline() {
    const vars = getFieldVars();
    const prompt = fillTemplate($("#prompt-outline")?.value || '', vars);

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
    const templateVars = { ...vars, outline: $("#outline")?.value || '' };
    const prompt = fillTemplate($("#prompt-chapter")?.value || '', templateVars);

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
        outline: $("#outline")?.value || '',
        chapter_outline: ch.outline,
        previous_chapters: previousChapters,
        permanent_memory: permanentMemory,
        world_info: worldInfoContext
    };

    let prompt = fillTemplate($("#prompt-content")?.value || '', templateVars);

    // 追加场景级指令
    if (sceneAddon) {
        prompt += `\n\n═══════════════════════════════════════════\n【场景级控制】\n═══════════════════════════════════════════\n${sceneAddon}`;
    }

    // 获取正文编辑区域（优先详情面板，回退到隐藏的 workspace textarea）
    const contentEl = $(`#chapters-container .ch-content[data-idx="${idx}"]`);
    const panelContentEl = document.getElementById('cdp-content');
    const usePanel = (typeof ChapterDetailPanel !== 'undefined' && ChapterDetailPanel.currentIdx === idx && panelContentEl);

    // 保存版本（第36轮）
    saveVersion(`生成第${idx + 1}章前`);

    if (contentEl) { contentEl.value = ""; contentEl.classList.add("streaming-cursor"); }
    if (usePanel) { panelContentEl.value = ""; panelContentEl.classList.add("streaming-cursor"); }

    try {
        await streamFetch("/gen", { prompt }, (text) => {
            if (contentEl) { contentEl.value = text; contentEl.scrollTop = contentEl.scrollHeight; }
            if (usePanel) { panelContentEl.value = text; panelContentEl.scrollTop = panelContentEl.scrollHeight; }
            ch.content = text;
        });

        // 自动生成章节摘要（Fix #5: 改为 fire-and-forget，不阻塞 UI 更新）
        if (ch.content && ch.content.trim().length > 100) {
            toast("正在后台生成章节摘要...", "info");
            generateChapterSummary(idx)
                .then(() => console.log(`[摘要] 第${idx + 1}章摘要生成完成`))
                .catch(e => console.warn(`[摘要] 第${idx + 1}章摘要生成失败:`, e));
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
        if (contentEl) contentEl.classList.remove("streaming-cursor");
        if (usePanel) panelContentEl.classList.remove("streaming-cursor");
        saveState();
        updateStats();
    }
}

// 微观控制：重写选中文本（第57轮）
async function rewriteSelection(chapterIdx, selectedText, startPos, endPos, mode = "rewrite") {
    const ch = AppState.chapters[chapterIdx];
    if (!ch) return;

    // 优先使用详情面板的正文区域（因为用户在那里选中的文本）
    const panelContentEl = document.getElementById('cdp-content');
    const usePanel = (typeof ChapterDetailPanel !== 'undefined' && ChapterDetailPanel.currentIdx === chapterIdx && panelContentEl);
    const contentEl = usePanel ? panelContentEl : $(`#chapters-container .ch-content[data-idx="${chapterIdx}"]`);
    if (!contentEl) return;

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
        await streamFetch("/gen2", { prompt }, (text) => {
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

// 从后端同步反AI味配置（Fix #8: 唯一数据源，不再维护前端硬编码副本）
async function syncAntiAIConfig() {
    try {
        const resp = await fetch("/api/anti-ai/config");
        if (!resp.ok) return;
        const config = await resp.json();

        // 清空现有映射，完全以后端为准
        for (const key of Object.keys(AI_WORD_MAPPINGS)) {
            delete AI_WORD_MAPPINGS[key];
        }

        // 填充 AI 词映射表（后端 config.py 为唯一数据源）
        if (config.ai_word_mappings) {
            Object.assign(AI_WORD_MAPPINGS, config.ai_word_mappings);
        }

        // 将仅有检测功能的禁用词也加入映射表（标记为无替代词）
        if (config.banned_words && Array.isArray(config.banned_words)) {
            for (const word of config.banned_words) {
                if (!AI_WORD_MAPPINGS[word]) {
                    AI_WORD_MAPPINGS[word] = [""];
                }
            }
        }

        console.log("[Kealin] 反AI味配置已从后端同步，共", Object.keys(AI_WORD_MAPPINGS).length, "条映射");
    } catch (e) {
        console.warn("[Kealin] 反AI味配置同步失败:", e.message);
    }
}

// AI高频词映射表（Fix #8: 由后端 /api/anti-ai/config 统一提供，启动时加载）
// 硬编码副本已删除，避免与后端 config.py 维护两份数据导致不一致
const AI_WORD_MAPPINGS = {};

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
            const result = await streamFetch("/gen2", { prompt: stylePrompt }, () => {});
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
            const result = await streamFetch("/gen2", { prompt: deTemplatePrompt }, () => {});
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
            const result = await streamFetch("/gen2", { prompt: humanizePrompt }, () => {});
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
            const result = await streamFetch("/gen2", { prompt: polishPrompt }, () => {});
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
        const summary = await streamFetch("/gen2", { prompt }, () => {});
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
    const origHTML = btn ? btn.innerHTML : '';
    if (btn) {
        btn.classList.add("loading");
        btn.innerHTML = '<span class="spinner"></span> 生成中...';
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
        btn.innerHTML = origHTML;
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
        outline: $("#outline")?.value || '',
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
            const result = await streamFetch("/gen2", { prompt: finalPrompt }, (text) => {
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

当前小说背景：${$("#field-background")?.value || '（未设置）'}
人物：${$("#field-characters")?.value || '（未设置）'}
大纲：${$("#outline")?.value ? $("#outline").value.slice(0, 500) + "..." : "（未生成）"}
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
        await streamFetch("/gen2", { prompt: context }, (text) => {
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

// 获取当前展开的章节索引（优先从浮动详情面板获取）
function getCurrentChapterIdx() {
    // 优先使用 ChapterDetailPanel 的当前索引
    if (typeof ChapterDetailPanel !== 'undefined' && ChapterDetailPanel.currentIdx >= 0) {
        return ChapterDetailPanel.currentIdx;
    }
    // 回退：查找 expanded class（兼容旧逻辑）
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
        template = $("#prompt-outline")?.value || '';
        templateVars = vars;
    } else if (type === "chapter") {
        template = $("#prompt-chapter")?.value || '';
        templateVars = { ...vars, outline: $("#outline")?.value || '' };
    } else {
        template = $("#prompt-content")?.value || '';
        templateVars = { ...vars, outline: $("#outline")?.value || '', chapter_outline: "（当前章节细纲）" };
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
    const chapterIdx = getCurrentChapterIdx();
    if (chapterIdx < 0) {
        toast("请先打开一个章节（点击章节标题）", "error");
        return;
    }

    // 插入到章节内容
    const ch = AppState.chapters[chapterIdx];
    if (ch) {
        ch.content = (ch.content || '') + "\n\n" + note.content;
        saveState();
        // 如果详情面板打开且显示正文 tab，同步更新
        const contentEl = document.getElementById('cdp-content');
        if (contentEl && ChapterDetailPanel.currentIdx === chapterIdx) {
            contentEl.value = ch.content;
        }
        toast("灵感已插入到第" + (chapterIdx + 1) + "章", "success");
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
        outline: $("#outline")?.value || '',
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
                const outlineEl = $("#outline");
                if (outlineEl) outlineEl.value = version.outline || "";
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
            await streamFetch("/gen2", { prompt }, (text) => {
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

大纲：${$("#outline")?.value || '（未设置）'}

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
        await streamFetch("/gen2", { prompt }, (text) => {
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

    // 收集前一章内容用于风格对比
    let prevChapterContent = "";
    if (chapterIdx > 0) {
        const prevCh = AppState.chapters[chapterIdx - 1];
        if (prevCh && prevCh.content) {
            prevChapterContent = prevCh.content.slice(0, 2000);
        }
    }

    const prompt = `帮我看一下这段内容写得怎么样，做一致性检查。说人话，别用表格。

【检查文本】
${ch.content}

【前文内容 - 用于风格一致性对比】
${prevChapterContent || "（这是第一章，暂无前文）"}

【角色设定】
${charInfo}

【大纲】
${$("#outline")?.value || '（未设置）'}

【检查维度——像一个挑剔的读者一样读】

1. 风格一致性
   - 与前文的句式节奏是否一致（长短句比例、段落长度变化）
   - 与前文的描写手法是否一致（环境描写比重、心理描写方式）
   - 与前文的对话风格是否一致（语气词使用、对话标签方式）
   - 是否存在跨章自我复制（同一段话几乎原封不动重复出现）

2. 人设一致性
   - 本章中角色的言行是否与设定一致
   - 性格是否突变（需有合理铺垫）
   - 口头禅、说话方式是否一致

3. 时间线一致性
   - 事件发生的先后顺序是否合理
   - 日期/年份是否前后矛盾

4. 情节逻辑
   - 因果关系是否成立
   - 角色动机是否充分
   - 行为是否符合常识和情境

5. 对话合理性
   - 说话方式是否符合人设
   - 对话中引用的前文事件是否准确
   - 是否有足够铺垫避免"忽然知情"式的突兀对话

6. 伏笔闭环
   - 已埋伏笔是否有回收
   - 是否有悬而未决的线索

7. 场景/环境一致性
   - 地点描述是否前后一致
   - 空间布局是否合理
   - 天气、时间段是否与情节匹配

8. 情感逻辑
   - 情绪反应的强度是否与刺激匹配
   - 情绪转变是否有合理过渡

9. 文风自然度
   - 是否有"结构化输出"问题（编号式、模板化句式）
   - 同一意思是否在短时间内反复表达但表述几乎相同
   - 特定词汇/表达是否过度使用（超过5-6次且分布集中）

【输出要求】
说人话，给我一个整体评价，然后按严重程度列出问题。每个问题说清楚：是什么问题、在哪里、怎么改。不需要打分表格。`;

    const contentEl = document.createElement("div");
    contentEl.style.whiteSpace = "pre-wrap";
    contentEl.style.lineHeight = "1.8";
    $("#modal-body").innerHTML = "";
    $("#modal-body").appendChild(contentEl);

    try {
        await streamFetch("/gen2", { prompt }, (text) => {
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

大纲：${$("#outline")?.value || '（未设置）'}

章节内容：
${allContent}`;

    const contentEl = document.createElement("div");
    contentEl.style.whiteSpace = "pre-wrap";
    contentEl.style.lineHeight = "1.8";
    $("#modal-body").innerHTML = "";
    $("#modal-body").appendChild(contentEl);

    try {
        await streamFetch("/gen2", { prompt }, (text) => {
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

        // 从后端同步反AI味配置（统一数据源）
        syncAntiAIConfig();

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

    // ---- 系统设置子标签 ----
    try {
        $$(".system-subtab").forEach(tab => {
            tab.addEventListener("click", () => {
                $$(".system-subtab").forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                $$(".system-subtab-content").forEach(c => c.classList.remove("active"));
                const content = $(`#subtab-${tab.dataset.subtab}`);
                if (content) content.classList.add("active");
            });
        });
    } catch (e) {
        console.error("[Kealin] 系统子标签绑定失败:", e);
    }

    // ---- 创作资源侧栏导航 ----
    try {
        // 故事大纲 → 打开故事大纲浮动面板
        bind("btn-res-outline", "click", () => {
            MasterOutlinePanel.open();
        });
        // 小说书名生成 → 打开书名生成弹窗
        bind("btn-res-title", "click", () => {
            showBookInfoGen("title");
        });
        // 世界观基础设定 → 打开世界观笔记编辑
        bind("btn-res-world", "click", () => {
            showWorldNoteEditor(-1);
        });
        // 记忆 → 打开记忆管理器
        bind("btn-res-memory", "click", () => {
            showEnhancedMemoryManager();
        });
        // 角色 → 打开角色管理面板
        bind("btn-res-characters", "click", () => {
            showCharacterManager();
        });
    } catch (e) {
        console.error("[Kealin] 创作资源导航绑定失败:", e);
    }

    // 画布节点导航函数
    function navigateToNode(nodeId) {
        // 确保在画布面板
        const workspaceTab = $('.nav-tab[data-panel="workspace"]');
        if (workspaceTab && !workspaceTab.classList.contains("active")) {
            workspaceTab.click();
        }
        // 等面板切换完成后执行动画
        setTimeout(() => {
            if (typeof CanvasEngine !== "undefined" && CanvasEngine.animateTo) {
                const nodeEl = document.getElementById(nodeId);
                if (nodeEl) {
                    const nx = parseInt(nodeEl.style.left) || 0;
                    const ny = parseInt(nodeEl.style.top) || 0;
                    const nw = nodeEl.offsetWidth;
                    const nh = nodeEl.offsetHeight;
                    // 动画到节点中心，保持当前缩放
                    // transform: translate(panX, panY) scale(zoom)，origin 0 0
                    // 屏幕坐标 = panX + worldX * zoom
                    const vp = document.getElementById("canvas-viewport");
                    if (vp) {
                        const st = CanvasEngine.getState();
                        const zoom = st.zoom;
                        const targetPanX = vp.clientWidth / 2 - (nx + nw / 2) * zoom;
                        const targetPanY = vp.clientHeight / 2 - (ny + nh / 2) * zoom;
                        CanvasEngine.animateTo(targetPanX, targetPanY, zoom);
                    }
                    // 高亮闪烁
                    nodeEl.classList.add("node-highlight");
                    setTimeout(() => nodeEl.classList.remove("node-highlight"), 1500);
                }
            }
        }, 100);
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
    bind("btn-add-chapter", "click", () => {
        addChapter();
        if (typeof renderChapterCards === 'function') renderChapterCards();
    });
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
        $$(".textarea-main, .textarea-sm, .node-textarea").forEach(el => {
            el.addEventListener("input", () => {
                const countEl = el.closest(".card, .canvas-node, .pyramid-node")?.querySelector(".char-count");
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

    // v2.2: Enhanced features
    bind("btn-enhanced-memory", "click", showEnhancedMemoryManager);
    bind("btn-batch-gen-summaries", "click", async () => {
        let count = 0;
        for (let i = 0; i < AppState.chapters.length; i++) {
            if (AppState.chapters[i].content && !AppState.chapters[i].summary) {
                toast(`正在生成第${i + 1}章摘要...`, "info");
                await autoGenerateSummary(i);
                count++;
                await new Promise(r => setTimeout(r, 500));
            }
        }
        toast(`批量摘要完成，共${count}个`, "success");
    });
    bind("btn-add-character-card", "click", () => showStructuredCharacterEditor(-1));
    bind("btn-gen-character-ai", "click", generateCharacterCardAI);
    bind("btn-quality-batch", "click", batchQualityCheck);

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

    // ============================================================
    // Canvas UI (v3.0)
    // ============================================================

    // ---- AI Sidebar Toggle ----
    const aiSidebar = $("#ai-sidebar");
    const aiToggleBtn = $("#btn-toggle-ai");
    const closeAiBtn = $("#btn-close-ai");

    function toggleAISidebar() {
        if (!aiSidebar) return;
        const isHidden = aiSidebar.classList.contains("hidden");
        aiSidebar.classList.toggle("hidden");
        if (aiToggleBtn) aiToggleBtn.classList.toggle("active", isHidden);
    }

    if (aiToggleBtn) aiToggleBtn.addEventListener("click", toggleAISidebar);
    if (closeAiBtn) closeAiBtn.addEventListener("click", () => {
        aiSidebar?.classList.add("hidden");
        if (aiToggleBtn) aiToggleBtn.classList.remove("active");
    });

    // ---- Canvas Pan & Zoom: 已由 CanvasEngine v4.0 接管（transform-based），旧版 scrollLeft/scrollTop 代码已移除 ----

    // ---- v4.0: 初始化无限画布引擎（章节卡片模式） ----
    if (typeof CanvasEngine !== 'undefined') {
        CanvasEngine.init('canvas-viewport', 'canvas-world', 'chapter-connectors');

        // ---- 选区工具栏 ----
        const selToolbar = document.getElementById('selection-toolbar');
        const selCount = document.getElementById('selection-count');
        const selDeleteBtn = document.getElementById('selection-delete-btn');

        // 缓存当前选中节点，避免点击删除时选区已被清空
        let cachedSelectedNodes = [];

        function updateSelectionToolbar(selectedIds) {
            cachedSelectedNodes = [...selectedIds];
            if (!selToolbar || !selCount) return;
            if (selectedIds.length > 0) {
                selCount.textContent = `已选 ${selectedIds.length} 项`;
                selToolbar.style.display = 'flex';
            } else {
                selToolbar.style.display = 'none';
            }
        }

        CanvasEngine.onSelectionChange(updateSelectionToolbar);

        // 防止工具栏的鼠标事件穿透到画布视口，导致选区被清空
        if (selToolbar) {
            selToolbar.addEventListener('mousedown', (e) => e.stopPropagation());
        }

        // 删除选中的节点
        function deleteSelectedNodes(nodeIds) {
            // 从 nodeIds 中提取章节索引和元素 ID
            const chapterIndices = [];
            const elemIds = [];
            nodeIds.forEach(id => {
                const chMatch = id.match(/^ch-card-(\d+)$/);
                if (chMatch) {
                    chapterIndices.push(parseInt(chMatch[1]));
                } else if (id.startsWith('elem-')) {
                    elemIds.push(id);
                }
            });

            if (chapterIndices.length === 0 && elemIds.length === 0) return;

            const total = chapterIndices.length + elemIds.length;
            if (!confirm(`确定删除选中的 ${total} 个卡片？`)) return;

            // 从大到小排序删除章节，避免索引偏移
            chapterIndices.sort((a, b) => b - a);
            chapterIndices.forEach(idx => {
                AppState.chapters.splice(idx, 1);
                // 清理该章节的画布卡片位置
                ChapterCanvasState.cards.splice(idx, 1);
                // 清理指向该章节的连接
                ChapterCanvasState.connections = (ChapterCanvasState.connections || []).filter(c => {
                    if (c.fromIdx === idx || c.toIdx === idx) return false;
                    return true;
                });
                // 修正其他连接的索引
                ChapterCanvasState.connections.forEach(c => {
                    if (c.fromIdx > idx) c.fromIdx--;
                    if (c.toIdx > idx) c.toIdx--;
                });
            });

            // 删除元素卡片
            elemIds.forEach(eid => {
                CanvasElements.elements = CanvasElements.elements.filter(e => e.id !== eid);
                // 清理指向该元素的连接
                ChapterCanvasState.connections = (ChapterCanvasState.connections || []).filter(c => c.toElemId !== eid);
            });

            // 保存并重绘
            saveChapterCardLayout();
            saveCanvasElements();
            saveState();
            CanvasEngine.clearSelection();
            renderChapterCards();
            // 显式重绘连线：先强制清空 SVG，再延迟重绘，防止 requestRedraw 时序竞争
            CanvasEngine.drawConnections();
            requestAnimationFrame(() => CanvasEngine.drawConnections());
            toast(`已删除 ${total} 个卡片`, 'success');
        }

        CanvasEngine.onDeleteSelected(deleteSelectedNodes);

        // 工具栏删除按钮 — 使用缓存的选区，而非实时查询
        if (selDeleteBtn) {
            selDeleteBtn.addEventListener('click', () => {
                if (cachedSelectedNodes.length > 0) {
                    deleteSelectedNodes(cachedSelectedNodes);
                }
            });
        }

        // 绑定缩放按钮
        bind("btn-zoom-in", "click", () => CanvasEngine.zoomIn());
        bind("btn-zoom-out", "click", () => CanvasEngine.zoomOut());
        bind("btn-zoom-fit", "click", () => CanvasEngine.zoomFit());

        // btn-add-chapter, btn-gen-chapters, btn-export-txt 已在上方统一绑定
        bind("btn-auto-layout", "click", () => autoLayoutChapterCards());

        // 首次渲染章节卡片
        setTimeout(() => {
            loadCanvasElements();
            renderChapterCards();  // 内部会自动调用 renderCanvasElements()
            if (!localStorage.getItem('canvas-state')) {
                CanvasEngine.zoomFit();
            }
        }, 300);
    }

    // 切换到画布标签时重新绘制连线
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.dataset.panel === 'workspace') {
                if (typeof CanvasEngine !== 'undefined') {
                    setTimeout(() => CanvasEngine.drawConnections(), 100);
                }
            }
        });
    });

    // 初始化章节详情浮动面板
    ChapterDetailPanel.init();

    // ============================================================
    // 故事大纲浮动面板
    // ============================================================
    const MasterOutlinePanel = {
        panel: null,
        textarea: null,
        storyDescription: null,  // 新增：故事描述输入框
        backdrop: null,

        init() {
            this.panel = document.getElementById('master-outline-panel');
            this.textarea = document.getElementById('master-outline-textarea');
            this.storyDescription = document.getElementById('master-story-description');
            if (!this.panel || !this.textarea) return;

            // 关闭按钮
            document.getElementById('mop-btn-close').addEventListener('click', () => this.close());

            // AI 生成大纲
            document.getElementById('mop-btn-gen-outline').addEventListener('click', () => this.generateOutline());

            // 从大纲生成章节细纲
            document.getElementById('mop-btn-gen-chapters').addEventListener('click', () => this.generateChapters());

            // 输入时自动保存
            this.textarea.addEventListener('input', () => {
                AppState.masterOutline = this.textarea.value;
                debouncedSave();
            });

            // 故事描述输入时自动保存
            if (this.storyDescription) {
                this.storyDescription.addEventListener('input', () => {
                    AppState.storyDescription = this.storyDescription.value;
                    debouncedSave();
                });
            }
        },

        open() {
            // 恢复内容
            this.textarea.value = AppState.masterOutline || '';
            if (this.storyDescription) {
                this.storyDescription.value = AppState.storyDescription || '';
            }

            // 移到 body 避免裁剪
            if (this.panel.parentNode !== document.body) {
                document.body.appendChild(this.panel);
            }
            this.panel.style.display = 'flex';
            this.createBackdrop();
            this.textarea.focus();
        },

        close() {
            this.panel.style.display = 'none';
            this.removeBackdrop();
            // 保存
            AppState.masterOutline = this.textarea.value;
            if (this.storyDescription) {
                AppState.storyDescription = this.storyDescription.value;
            }
            saveState();
        },

        createBackdrop() {
            this.removeBackdrop();
            this.backdrop = document.createElement('div');
            this.backdrop.className = 'cdp-backdrop';
            this.backdrop.addEventListener('click', () => this.close());
            document.body.appendChild(this.backdrop);
        },

        removeBackdrop() {
            if (this.backdrop) {
                this.backdrop.remove();
                this.backdrop = null;
            }
        },

        async generateOutline() {
            const vars = typeof getFieldVars === 'function' ? getFieldVars() : {};

            // 优先使用故事描述，如果没有则使用大纲
            const storyDesc = this.storyDescription ? this.storyDescription.value.trim() : '';
            const outline = this.textarea.value.trim();
            vars.existing_outline = storyDesc || outline;

            if (!vars.existing_outline) {
                toast('请先输入故事描述或大纲', 'warning');
                return;
            }

            const promptTemplate = document.getElementById('prompt-outline');
            if (!promptTemplate) {
                toast('未找到大纲提示词配置', 'error');
                return;
            }
            const prompt = typeof fillTemplate === 'function'
                ? fillTemplate(promptTemplate.value, vars)
                : promptTemplate.value;
            this.textarea.classList.add('streaming-cursor');
            const btn = document.getElementById('mop-btn-gen-outline');
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> 生成中...';

            try {
                await streamFetch('/gen', { prompt }, (text) => {
                    this.textarea.value = text;
                    this.textarea.scrollTop = this.textarea.scrollHeight;
                });
                AppState.masterOutline = this.textarea.value;
                saveState();
                toast('大纲生成完成', 'success');
            } catch (e) {
                toast('生成大纲失败: ' + e.message, 'error');
            } finally {
                this.textarea.classList.remove('streaming-cursor');
                btn.disabled = false;
                btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg> AI 生成大纲';
            }
        },

        async generateChapters() {
            const outline = this.textarea.value.trim();
            if (!outline) {
                toast('请先写好故事大纲', 'warning');
                return;
            }

            const vars = typeof getFieldVars === 'function' ? getFieldVars() : {};
            const promptTemplate = document.getElementById('prompt-chapter');
            if (!promptTemplate) {
                toast('未找到章节提示词配置', 'error');
                return;
            }
            const templateVars = { ...vars, outline };
            const prompt = typeof fillTemplate === 'function'
                ? fillTemplate(promptTemplate.value, templateVars)
                : promptTemplate.value;

            const btn = document.getElementById('mop-btn-gen-chapters');
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> 生成中...';

            // 保存版本
            if (typeof saveVersion === 'function') saveVersion('从大纲生成章节前');

            try {
                const text = await streamFetch('/gen', { prompt }, () => {});
                const parts = text.split('###fenge').map(s => s.trim()).filter(s => s.length > 0);
                if (parts.length === 0) {
                    toast('未能解析出章节，请检查大纲后重试', 'error');
                    return;
                }
                parts.forEach(p => addChapter(p, ''));
                toast(`成功生成 ${parts.length} 个章节`, 'success');

                // 保存大纲
                AppState.masterOutline = outline;
                saveState();

                // 关闭面板，刷新画布
                this.close();
                renderChapterCards();
            } catch (e) {
                toast('生成章节失败: ' + e.message, 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg> 从大纲生成章节细纲';
            }
        },
    };

    // 初始化故事大纲面板
    MasterOutlinePanel.init();

    // ============================================================
    // 章节卡片渲染（替代旧的 ChapterCanvas + 金字塔节点）
    // ============================================================
    const ChapterCanvasState = {
        cards: [],           // { idx, x, y }
        connections: [],     // { id, fromIdx, toIdx, color }
        layoutLoaded: false,
    };

    function getDefaultCardX(i) {
        const col = i % 3;
        return 60 + col * 260;
    }

    function getDefaultCardY(i) {
        const row = Math.floor(i / 3);
        return 60 + row * 200;
    }

    function loadChapterCardLayout() {
        try {
            const saved = JSON.parse(localStorage.getItem('chapter-canvas-layout') || '{}');
            if (saved.cards) ChapterCanvasState.cards = saved.cards;
            if (saved.connections) ChapterCanvasState.connections = saved.connections;
        } catch {}
        ChapterCanvasState.layoutLoaded = true;
    }

    function saveChapterCardLayout() {
        try {
            localStorage.setItem('chapter-canvas-layout', JSON.stringify({
                cards: ChapterCanvasState.cards,
                connections: ChapterCanvasState.connections || []
            }));
        } catch {}
    }

    function renderChapterCards() {
        const container = document.getElementById('canvas-chapters-container');
        const svgLayer = document.getElementById('chapter-connectors');
        if (!container) return;

        if (!ChapterCanvasState.layoutLoaded) loadChapterCardLayout();

        const chapters = AppState.chapters || [];

        // 同步卡片位置数据
        while (ChapterCanvasState.cards.length < chapters.length) {
            const i = ChapterCanvasState.cards.length;
            ChapterCanvasState.cards.push({ idx: i, x: getDefaultCardX(i), y: getDefaultCardY(i) });
        }
        ChapterCanvasState.cards.length = chapters.length; // 截断多余的

        // 提前清除 CanvasEngine 旧节点，防止 chapters.length === 0 时跳过清理
        if (typeof CanvasEngine !== 'undefined') {
            CanvasEngine.getState().nodes.clear();
        }

        if (chapters.length === 0) {
            container.innerHTML = `
                <div class="canvas-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <path d="M9 3v18"/>
                        <path d="M13 8h5"/><path d="M13 12h5"/><path d="M13 16h5"/>
                    </svg>
                    <p>暂无章节</p>
                    <p class="hint">点击左上角 + 按钮添加章节，或从大纲生成</p>
                </div>`;
            renderCanvasElements();  // 内部会调用 drawConnections
            return;
        }

        container.innerHTML = chapters.map((ch, i) => {
            const card = ChapterCanvasState.cards[i] || { x: getDefaultCardX(i), y: getDefaultCardY(i) };
            const title = ch.title || `第${i + 1}章`;
            const outline = ch.outline || '';
            const contentLen = countChars(ch.content);
            const outlineLen = countChars(outline);
            const charCount = contentLen > 0 ? contentLen : outlineLen;
            const status = contentLen > 0 ? 'done' : outlineLen > 0 ? 'outline' : 'empty';
            const statusText = contentLen > 0 ? '已写' : outlineLen > 0 ? '有纲' : '空白';

            return `
                <div class="canvas-chapter-card" id="ch-card-${i}" data-idx="${i}"
                     style="position:absolute;left:${card.x}px;top:${card.y}px;">
                    <div class="ch-card-header">
                        <span class="ch-card-num">${i + 1}</span>
                        <span class="ch-card-title">${escapeHtml(title)}</span>
                        <button class="ch-card-port ch-card-port-add" data-idx="${i}" title="添加连接或元素">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                    </div>
                    <div class="ch-card-body">
                        <div class="ch-card-outline">${escapeHtml(outline) || '暂无大纲'}</div>
                    </div>
                    <div class="ch-card-footer">
                        <span class="ch-card-chars">${charCount} 字</span>
                        <span class="ch-card-status ch-status-${status}">${statusText}</span>
                    </div>
                </div>`;
        }).join('');

        // 注册到 CanvasEngine
        if (typeof CanvasEngine !== 'undefined') {
            const state = CanvasEngine.getState();

            chapters.forEach((ch, i) => {
                const el = document.getElementById(`ch-card-${i}`);
                const card = ChapterCanvasState.cards[i];
                if (el && card) {
                    CanvasEngine.registerNode(el, card.x, card.y);
                }
            });

            // 设置连线：章节之间顺序连接 + 自定义连接
            for (let i = 0; i < chapters.length - 1; i++) {
                CanvasEngine.setNodeConnections(`ch-card-${i}`, [
                    { targetId: `ch-card-${i + 1}`, color: '#5856D6' }
                ]);
            }
            if (chapters.length > 0) {
                CanvasEngine.setNodeConnections(`ch-card-${chapters.length - 1}`, []);
            }

            // 过滤掉指向已删除章节/元素的连接（防护章节列表删除等场景）
            ChapterCanvasState.connections = (ChapterCanvasState.connections || []).filter(conn => {
                if (conn.toElemId) {
                    return CanvasElements.elements.some(e => e.id === conn.toElemId);
                }
                return conn.fromIdx < chapters.length && conn.toIdx < chapters.length;
            });

            // 添加自定义连接
            ChapterCanvasState.connections.forEach(conn => {
                const sourceNode = CanvasEngine.getState().nodes.get(`ch-card-${conn.fromIdx}`);
                if (!sourceNode) return;
                // 目标可以是章节卡片 (toIdx) 或非章节元素 (toElemId)
                const targetId = conn.toElemId || `ch-card-${conn.toIdx}`;
                if (targetId) {
                    sourceNode.connections.push({
                        targetId,
                        color: conn.color || '#007AFF'
                    });
                }
            });

            // drawConnections 延迟到 renderCanvasElements 之后调用
            // 以确保元素节点也已注册，chapter→element 连线能正确绘制
        }

        // 绑定卡片点击事件 → 打开章节详情面板
        container.querySelectorAll('.canvas-chapter-card').forEach(cardEl => {
            // 拖拽判定：mousedown 记录位置，mouseup 判断是否为点击
            let mouseDownPos = null;
            cardEl.addEventListener('mousedown', (e) => {
                mouseDownPos = { x: e.clientX, y: e.clientY };
            });
            cardEl.addEventListener('mouseup', (e) => {
                if (!mouseDownPos) return;
                // 点击端口按钮时不打开详情面板
                if (e.target.closest('.ch-card-port')) { mouseDownPos = null; return; }
                const dx = Math.abs(e.clientX - mouseDownPos.x);
                const dy = Math.abs(e.clientY - mouseDownPos.y);
                if (dx < 5 && dy < 5) {
                    // 点击（非拖拽）→ 打开详情面板
                    const idx = parseInt(cardEl.dataset.idx);
                    ChapterDetailPanel.open(idx);
                }
                mouseDownPos = null;
            });
        });

        // 绑定端口按钮点击事件 → 弹出菜单
        container.querySelectorAll('.ch-card-port-add').forEach(portEl => {
            portEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(portEl.dataset.idx);
                showPortMenu(portEl, idx);
            });
        });

        saveChapterCardLayout();

        // 重新渲染非章节元素卡片（因为 innerHTML 被替换）
        renderCanvasElements();
    }

    // ============================================================
    // 端口菜单 & 连接模式
    // ============================================================

    function showPortMenu(anchorEl, cardIdx) {
        // 移除已有菜单
        document.querySelectorAll('.port-popup-menu').forEach(m => m.remove());

        const menu = document.createElement('div');
        menu.className = 'port-popup-menu';
        menu.innerHTML = `
            <div class="port-menu-item" data-action="connect">
                <span class="port-menu-icon">🔗</span> 连接到其他卡片
            </div>
            <div class="port-menu-divider"></div>
            <div class="port-menu-item" data-action="new-plot">
                <span class="port-menu-icon">📖</span> 新建剧情线
            </div>
            <div class="port-menu-item" data-action="new-character">
                <span class="port-menu-icon">👤</span> 新建角色
            </div>
            <div class="port-menu-item" data-action="new-setting">
                <span class="port-menu-icon">🌍</span> 新建设定
            </div>
        `;

        // 定位到按钮旁边
        const rect = anchorEl.getBoundingClientRect();
        menu.style.cssText = `position:fixed;left:${rect.right + 6}px;top:${rect.top - 20}px;z-index:1000;`;
        document.body.appendChild(menu);

        // 边界检测：如果超出右边界，改为左侧弹出
        requestAnimationFrame(() => {
            const menuRect = menu.getBoundingClientRect();
            if (menuRect.right > window.innerWidth - 10) {
                menu.style.left = (rect.left - menuRect.width - 6) + 'px';
            }
            if (menuRect.bottom > window.innerHeight - 10) {
                menu.style.top = (window.innerHeight - menuRect.height - 10) + 'px';
            }
        });

        // 菜单项点击
        menu.querySelectorAll('.port-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                menu.remove();

                if (action === 'connect') {
                    if (typeof CanvasEngine !== 'undefined') {
                        CanvasEngine.startConnectMode(`ch-card-${cardIdx}`);
                        toast('点击目标卡片完成连接，按 Escape 取消', 'info');
                    }
                } else {
                    const type = action.replace('new-', '');
                    showNewElementModal(type, cardIdx);
                }
            });
        });

        // 点击外部关闭（使用 once 避免旧菜单的监听器干扰新菜单）
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!menu.contains(e.target)) {
                    menu.remove();
                }
            };
            document.addEventListener('click', closeHandler, { once: true });
        }, 50);
    }

    // 注册连接回调
    if (typeof CanvasEngine !== 'undefined') {
        CanvasEngine.onConnect((fromId, toId) => {
            // 源必须是章节卡片
            const fromMatch = fromId.match(/^ch-card-(\d+)$/);
            if (!fromMatch) return;

            const fromIdx = parseInt(fromMatch[1]);

            // 目标可以是章节卡片或元素卡片
            const toChapterMatch = toId.match(/^ch-card-(\d+)$/);
            const toElemMatch = toId.match(/^elem-/);

            if (toChapterMatch) {
                // 章节 → 章节
                const toIdx = parseInt(toChapterMatch[1]);
                if (fromIdx === toIdx) {
                    toast('不能连接到自身', 'warning');
                    return;
                }
                const exists = (ChapterCanvasState.connections || []).some(
                    c => c.fromIdx === fromIdx && c.toIdx === toIdx && !c.toElemId
                );
                if (exists) {
                    toast('连接已存在', 'warning');
                    return;
                }
                if (!ChapterCanvasState.connections) ChapterCanvasState.connections = [];
                ChapterCanvasState.connections.push({
                    id: 'conn-' + Date.now(),
                    fromIdx,
                    toIdx,
                    color: '#007AFF'
                });
            } else if (toElemMatch) {
                // 章节 → 元素
                const exists = (ChapterCanvasState.connections || []).some(
                    c => c.fromIdx === fromIdx && c.toElemId === toId
                );
                if (exists) {
                    toast('连接已存在', 'warning');
                    return;
                }
                if (!ChapterCanvasState.connections) ChapterCanvasState.connections = [];
                const elem = CanvasElements.elements.find(e => e.id === toId);
                const elemConfig = elem ? ElementTypes[elem.type] : null;
                ChapterCanvasState.connections.push({
                    id: 'conn-' + Date.now(),
                    fromIdx,
                    toElemId: toId,
                    color: elemConfig ? elemConfig.color : '#007AFF'
                });
            } else {
                return; // 未知目标类型
            }

            saveChapterCardLayout();
            renderChapterCards();
            toast('连接已创建', 'success');
        });
    }

    // Escape 取消连接模式
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && typeof CanvasEngine !== 'undefined') {
            const ceState = CanvasEngine.getState();
            if (ceState.connecting) {
                CanvasEngine.cancelConnectMode();
                toast('连接已取消', 'info');
            }
        }
    });

    // 点击连线删除连接
    if (typeof CanvasEngine !== 'undefined') {
        CanvasEngine.onConnectionClick((fromId, toId) => {
            // 只允许删除自定义连接（存储在 ChapterCanvasState.connections 中）
            const fromMatch = fromId.match(/^ch-card-(\d+)$/);
            if (!fromMatch) return;
            const fromIdx = parseInt(fromMatch[1]);

            const toChapterMatch = toId.match(/^ch-card-(\d+)$/);
            const toElemMatch = toId.match(/^elem-/);

            let connIndex = -1;
            if (toChapterMatch) {
                const toIdx = parseInt(toChapterMatch[1]);
                connIndex = (ChapterCanvasState.connections || []).findIndex(
                    c => c.fromIdx === fromIdx && c.toIdx === toIdx && !c.toElemId
                );
            } else if (toElemMatch) {
                connIndex = (ChapterCanvasState.connections || []).findIndex(
                    c => c.fromIdx === fromIdx && c.toElemId === toId
                );
            }

            if (connIndex === -1) {
                toast('章节顺序连接不可删除', 'info');
                return;
            }

            // 确认删除
            if (confirm('确定删除这条连接线？')) {
                ChapterCanvasState.connections.splice(connIndex, 1);
                saveChapterCardLayout();
                renderChapterCards();
                toast('连接已删除', 'success');
            }
        });
    }

    // 卡片拖拽后同步位置
    function syncChapterCardPositions() {
        if (typeof CanvasEngine === 'undefined') return;
        const state = CanvasEngine.getState();
        state.nodes.forEach((nodeData, id) => {
            const match = id.match(/^ch-card-(\d+)$/);
            if (match) {
                const idx = parseInt(match[1]);
                if (ChapterCanvasState.cards[idx]) {
                    ChapterCanvasState.cards[idx].x = nodeData.x;
                    ChapterCanvasState.cards[idx].y = nodeData.y;
                }
            }
            // 同步元素卡片位置
            if (id.startsWith('elem-')) {
                const elem = CanvasElements.elements.find(e => e.id === id);
                if (elem) {
                    elem.x = nodeData.x;
                    elem.y = nodeData.y;
                }
            }
        });
        saveChapterCardLayout();
        saveCanvasElements();
    }

    // 自动排列章节卡片
    function autoLayoutChapterCards() {
        ChapterCanvasState.cards = (AppState.chapters || []).map((ch, i) => ({
            idx: i,
            x: getDefaultCardX(i),
            y: getDefaultCardY(i)
        }));
        renderChapterCards();
        if (typeof CanvasEngine !== 'undefined') {
            setTimeout(() => CanvasEngine.zoomFit(), 100);
        }
    }

    // 监听 CanvasEngine 节点拖拽结束，同步位置
    document.addEventListener('mouseup', () => {
        setTimeout(syncChapterCardPositions, 50);
    });

    // 暴露到全局（供 renderChapters 等外部函数调用）
    window.renderChapterCards = renderChapterCards;

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
                <textarea id="bi-summary" class="textarea-sm" placeholder="简要描述你的故事...">${$("#field-plot")?.value || ''}</textarea>
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
                await streamFetch("/gen2", { prompt }, (text) => {
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
                await streamFetch("/gen2", { prompt }, (text) => {
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

// Redraw connectors on resize
window.addEventListener('resize', () => {
    clearTimeout(window._connectorTimer);
    window._connectorTimer = setTimeout(() => {
        if (typeof CanvasEngine !== 'undefined') {
            CanvasEngine.drawConnections();
        }
    }, 100);
});

// ============================================================
// 章节画布 (Chapter Canvas) — 已整合到无限画布，由 renderChapterCards() 替代
// ============================================================

const ChapterCanvas_LEGACY_REMOVED = {
    // ---- 画布状态（CanvasEngine 风格） ----
    zoom: 1,
    panX: 0,
    panY: 0,
    minZoom: 0.15,
    maxZoom: 3,
    isPanning: false,
    panStartX: 0,
    panStartY: 0,
    panStartPanX: 0,
    panStartPanY: 0,
    cards: [],       // { id, idx, x, y }
    connections: [],  // { from, to }
    subCards: [],     // { id, parentIdx, type: 'character'|'memory'|'setting', x, y, data: {} }
    dragState: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    rafId: null,
    _minimapTimer: null,

    // ==================== 初始化 ====================
    init() {
        this.viewport = document.getElementById('cc-viewport');
        this.world = document.getElementById('cc-world');
        this.svg = document.getElementById('cc-connectors');
        this.container = document.getElementById('cc-cards-container');

        if (!this.viewport) return;

        // 设置 transform origin（与 CanvasEngine 一致）
        this.world.style.transformOrigin = '0 0';

        this.bindEvents();
        this.syncSettings();
        this.restoreCanvasState();
        this.render();
    },

    // ==================== 事件绑定 ====================
    bindEvents() {
        // ---- 滚轮缩放（以鼠标为中心，无需 Ctrl） ----
        this.viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = this.viewport.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const delta = e.deltaY > 0 ? 0.92 : 1.08;
            const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * delta));

            // 以鼠标位置为中心缩放
            const ratio = newZoom / this.zoom;
            this.panX = mouseX - (mouseX - this.panX) * ratio;
            this.panY = mouseY - (mouseY - this.panY) * ratio;
            this.zoom = newZoom;

            this.applyTransform();
            this.updateZoomDisplay();
            this.saveCanvasState();
        }, { passive: false });

        // ---- 鼠标按下 — 开始平移或拖拽卡片 ----
        this.viewport.addEventListener('mousedown', (e) => {
            const cardEl = e.target.closest('.cc-card');
            const subCardEl = e.target.closest('.cc-sub-card');
            if (cardEl) {
                if (e.target.closest('.cc-card-action') || e.target.closest('.cc-card-connector') || e.target.closest('.cc-add-sub-btn')) return;
                this.startDragCard(cardEl, e);
                return;
            }
            if (subCardEl) {
                if (e.target.closest('.cc-sub-card-del')) return;
                this.startDragSubCard(subCardEl, e);
                return;
            }
            this.startPan(e);
        });

        // ---- 触摸支持 ----
        this.viewport.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const cardEl = touch.target.closest('.cc-card');
                const subCardEl = touch.target.closest('.cc-sub-card');
                if (cardEl) {
                    if (touch.target.closest('.cc-card-action') || touch.target.closest('.cc-card-connector') || touch.target.closest('.cc-add-sub-btn')) return;
                    this.startDragCard(cardEl, { clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
                    return;
                }
                if (subCardEl) {
                    if (touch.target.closest('.cc-sub-card-del')) return;
                    this.startDragSubCard(subCardEl, { clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
                    return;
                }
                this.startPan({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
            }
        }, { passive: false });

        this.viewport.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                if (this.isPanning) {
                    this.doPan({ clientX: touch.clientX, clientY: touch.clientY });
                    e.preventDefault();
                } else if (this.dragState) {
                    if (this.dragState.type === 'subcard') {
                        this.doDragSubCard({ clientX: touch.clientX, clientY: touch.clientY });
                    } else {
                        this.doDragCard({ clientX: touch.clientX, clientY: touch.clientY });
                    }
                    e.preventDefault();
                }
            }
        }, { passive: false });

        this.viewport.addEventListener('touchend', () => {
            this.endPan();
            this.endDragCard();
        });

        // ---- 全局 mousemove/mouseup ----
        document.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                this.doPan(e);
            } else if (this.dragState) {
                if (this.dragState.type === 'subcard') {
                    this.doDragSubCard(e);
                } else {
                    this.doDragCard(e);
                }
            }
        });

        document.addEventListener('mouseup', () => {
            this.endPan();
            this.endDragCard();
        });

        // ---- 双击重置视图 ----
        this.viewport.addEventListener('dblclick', (e) => {
            if (e.target.closest('.cc-card') || e.target.closest('.cc-sub-card')) return;
            this.animateTo(0, 0, 1);
        });

        // ---- 缩放按钮 ----
        document.getElementById('cc-btn-zoom-in')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('cc-btn-zoom-out')?.addEventListener('click', () => this.zoomOut());
        document.getElementById('cc-btn-zoom-fit')?.addEventListener('click', () => this.zoomFit());

        // ---- 小地图点击导航 ----
        document.getElementById('cc-minimap')?.addEventListener('click', (e) => this.minimapNavigate(e));

        // ---- 工具栏按钮 ----
        document.getElementById('cc-btn-add-chapter')?.addEventListener('click', () => {
            if (!AppState.chapters) AppState.chapters = [];
            const newChapter = {
                title: `第${AppState.chapters.length + 1}章`,
                outline: '',
                content: '',
                emotion: '',
                hookStrength: '',
                chars: 0,
                expanded: false
            };
            AppState.chapters.push(newChapter);
            this.render();
            this.saveLayout();
            debouncedSave();
        });

        document.getElementById('cc-btn-auto-layout')?.addEventListener('click', () => this.autoLayout());

        document.getElementById('cc-btn-gen-chapters')?.addEventListener('click', () => {
            const btn = document.getElementById('btn-gen-chapters');
            if (btn) btn.click();
        });

        document.getElementById('cc-btn-export-json')?.addEventListener('click', () => this.saveLayout());

        // ---- 设置侧栏同步 ----
        ['cc-field-background', 'cc-field-characters', 'cc-field-relationships', 'cc-field-plot', 'cc-field-style', 'cc-field-outline'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => this.syncSettingsToMain());
        });
    },

    // ==================== 平移（CanvasEngine 风格） ====================
    startPan(e) {
        e.preventDefault?.();
        this.isPanning = true;
        this.panStartX = e.clientX;
        this.panStartY = e.clientY;
        this.panStartPanX = this.panX;
        this.panStartPanY = this.panY;
        this.viewport.style.cursor = 'grabbing';
    },

    doPan(e) {
        this.panX = this.panStartPanX + (e.clientX - this.panStartX);
        this.panY = this.panStartPanY + (e.clientY - this.panStartY);
        this.applyTransform();
    },

    endPan() {
        if (this.isPanning) {
            this.isPanning = false;
            this.viewport.style.cursor = '';
            this.saveCanvasState();
        }
    },

    // ==================== 卡片拖拽（考虑缩放+平移） ====================
    startDragCard(cardEl, e) {
        e.preventDefault?.();
        const idx = parseInt(cardEl.dataset.idx);
        const card = this.cards.find(c => c.idx === idx);
        if (!card) return;

        this.dragState = { card, cardEl };

        // 计算鼠标在卡片内的偏移（考虑缩放）
        const rect = cardEl.getBoundingClientRect();
        this.dragOffsetX = (e.clientX - rect.left) / this.zoom;
        this.dragOffsetY = (e.clientY - rect.top) / this.zoom;

        cardEl.style.zIndex = '100';
        cardEl.classList.add('dragging');
    },

    doDragCard(e) {
        if (!this.dragState || this.dragState.type === 'subcard') return;
        const { card, cardEl } = this.dragState;

        // 计算新位置（鼠标位置 - 画布偏移 - 卡片内偏移）
        const viewportRect = this.viewport.getBoundingClientRect();
        let newX = (e.clientX - viewportRect.left - this.panX) / this.zoom - this.dragOffsetX;
        let newY = (e.clientY - viewportRect.top - this.panY) / this.zoom - this.dragOffsetY;

        // 网格吸附（20px）
        newX = Math.round(newX / 20) * 20;
        newY = Math.round(newY / 20) * 20;
        card.x = Math.max(0, newX);
        card.y = Math.max(0, newY);

        cardEl.style.left = card.x + 'px';
        cardEl.style.top = card.y + 'px';

        this.requestRedraw();
    },

    endDragCard() {
        if (this.dragState) {
            // 兼容卡片（cardEl）和子卡片（el）两种拖拽状态
            const targetEl = this.dragState.cardEl || this.dragState.el;
            if (targetEl) {
                targetEl.style.zIndex = '';
                targetEl.classList.remove('dragging');
            }
            this.dragState = null;
            this.saveCanvasState();
        }
    },

    // ---- 子卡片拖拽 ----
    startDragSubCard(el, e) {
        e.preventDefault?.();
        const subId = el.dataset.subId;
        const sc = this.subCards.find(s => s.id === subId);
        if (!sc) return;

        this.dragState = { type: 'subcard', sc, el };

        // 计算鼠标在子卡片内的偏移（考虑缩放），与 startDragCard 一致
        const rect = el.getBoundingClientRect();
        this.dragOffsetX = (e.clientX - rect.left) / this.zoom;
        this.dragOffsetY = (e.clientY - rect.top) / this.zoom;

        el.style.zIndex = '100';
        el.classList.add('dragging');
    },

    doDragSubCard(e) {
        if (!this.dragState || this.dragState.type !== 'subcard') return;
        const { sc, el } = this.dragState;

        const viewportRect = this.viewport.getBoundingClientRect();
        let newX = (e.clientX - viewportRect.left - this.panX) / this.zoom - this.dragOffsetX;
        let newY = (e.clientY - viewportRect.top - this.panY) / this.zoom - this.dragOffsetY;

        newX = Math.round(newX / 20) * 20;
        newY = Math.round(newY / 20) * 20;
        sc.x = Math.max(0, newX);
        sc.y = Math.max(0, newY);

        el.style.left = sc.x + 'px';
        el.style.top = sc.y + 'px';

        this.requestRedraw();
    },

    // ==================== 缩放控制 ====================
    zoomIn() {
        this.animateTo(this.panX, this.panY, Math.min(this.maxZoom, this.zoom * 1.2));
    },

    zoomOut() {
        this.animateTo(this.panX, this.panY, Math.max(this.minZoom, this.zoom / 1.2));
    },

    zoomFit() {
        if (this.cards.length === 0) {
            this.animateTo(0, 0, 1);
            return;
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        this.cards.forEach(c => {
            const el = document.getElementById(`cc-card-${c.idx}`);
            minX = Math.min(minX, c.x);
            minY = Math.min(minY, c.y);
            maxX = Math.max(maxX, c.x + 220);
            maxY = Math.max(maxY, c.y + (el?.offsetHeight || 160));
        });
        // 也包含子卡片的边界
        this.subCards.forEach(sc => {
            const el = document.getElementById(sc.id);
            minX = Math.min(minX, sc.x);
            minY = Math.min(minY, sc.y);
            maxX = Math.max(maxX, sc.x + 140);
            maxY = Math.max(maxY, sc.y + (el?.offsetHeight || 36));
        });

        const vpW = this.viewport.clientWidth;
        const vpH = this.viewport.clientHeight;
        const contentW = maxX - minX + 80;
        const contentH = maxY - minY + 80;

        const zoom = Math.min(vpW / contentW, vpH / contentH, 1.5);
        const panX = (vpW - contentW * zoom) / 2 - minX * zoom + 40;
        const panY = (vpH - contentH * zoom) / 2 - minY * zoom + 40;

        this.animateTo(panX, panY, zoom);
    },

    animateTo(targetPanX, targetPanY, targetZoom, duration = 400) {
        const startPanX = this.panX, startPanY = this.panY, startZoom = this.zoom;
        const startTime = performance.now();

        const step = (now) => {
            const t = Math.min(1, (now - startTime) / duration);
            const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic

            this.panX = startPanX + (targetPanX - startPanX) * ease;
            this.panY = startPanY + (targetPanY - startPanY) * ease;
            this.zoom = startZoom + (targetZoom - startZoom) * ease;

            this.applyTransform();
            this.updateZoomDisplay();

            if (t < 1) requestAnimationFrame(step);
            else this.saveCanvasState();
        };
        requestAnimationFrame(step);
    },

    // ==================== 变换应用 ====================
    applyTransform() {
        if (this.world) {
            this.world.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
        }
        // 节流更新小地图
        clearTimeout(this._minimapTimer);
        this._minimapTimer = setTimeout(() => this.renderMinimap(), 50);
    },

    requestRedraw() {
        if (!this.rafId) {
            this.rafId = requestAnimationFrame(() => {
                this.renderConnections();
                this.renderMinimap();
                this.rafId = null;
            });
        }
    },

    updateZoomDisplay() {
        const el = document.getElementById('cc-zoom-level');
        if (el) el.textContent = Math.round(this.zoom * 100) + '%';
    },

    // ==================== 连线绘制 ====================
    renderConnections() {
        if (!this.svg) return;
        // 清除旧连线（保留 defs）
        this.svg.querySelectorAll('path:not(defs path), circle:not(defs circle), animateMotion, mpath').forEach(el => el.remove());

        // ① 章节之间的顺序连线
        for (let i = 0; i < this.cards.length - 1; i++) {
            const fromCard = this.cards[i];
            const toCard = this.cards[i + 1];
            if (!fromCard || !toCard) continue;

            const fromEl = document.getElementById(`cc-card-${fromCard.idx}`);
            const toEl = document.getElementById(`cc-card-${toCard.idx}`);
            if (!fromEl || !toEl) continue;

            const fromX = fromCard.x + 110;
            const fromY = fromCard.y + fromEl.offsetHeight;
            const toX = toCard.x + 110;
            const toY = toCard.y;

            this._drawBezier(fromX, fromY, toX, toY, '#5856D6');
        }

        // ② 章节卡片 → 子卡片的连线
        const subColors = { character: '#34C759', memory: '#FF9500', setting: '#8E8E93' };
        this.subCards.forEach(sc => {
            const parentCard = this.cards.find(c => c.idx === sc.parentIdx);
            if (!parentCard) return;
            const parentEl = document.getElementById(`cc-card-${parentCard.idx}`);
            const subEl = document.getElementById(sc.id);
            if (!parentEl || !subEl) return;

            const fromX = parentCard.x + 220;
            const fromY = parentCard.y + parentEl.offsetHeight / 2;
            const toX = sc.x;
            const toY = sc.y + subEl.offsetHeight / 2;

            this._drawBezier(fromX, fromY, toX, toY, subColors[sc.type] || '#8E8E93');
        });
    },

    _drawBezier(x1, y1, x2, y2, color) {
        const ns = 'http://www.w3.org/2000/svg';
        const cpOffset = Math.max(40, Math.abs(x2 - x1) * 0.4);
        const pathId = 'cc-conn-' + Math.random().toString(36).substr(2, 8);

        const path = document.createElementNS(ns, 'path');
        path.setAttribute('id', pathId);
        path.setAttribute('d', `M${x1},${y1} C${x1 + cpOffset},${y1} ${x2 - cpOffset},${y2} ${x2},${y2}`);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-opacity', '0.5');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-dasharray', '6 3');
        path.style.animation = 'dash-flow 1s linear infinite';
        this.svg.appendChild(path);

        // 流动点动画
        const circle = document.createElementNS(ns, 'circle');
        circle.setAttribute('r', '3');
        circle.setAttribute('fill', color);
        circle.setAttribute('opacity', '0.6');
        const animateMotion = document.createElementNS(ns, 'animateMotion');
        animateMotion.setAttribute('dur', '3s');
        animateMotion.setAttribute('repeatCount', 'indefinite');
        const mpath = document.createElementNS(ns, 'mpath');
        mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + pathId);
        animateMotion.appendChild(mpath);
        circle.appendChild(animateMotion);
        this.svg.appendChild(circle);

        // 中点脉冲圆
        const dot = document.createElementNS(ns, 'circle');
        dot.setAttribute('cx', (x1 + x2) / 2);
        dot.setAttribute('cy', (y1 + y2) / 2);
        dot.setAttribute('r', '3');
        dot.setAttribute('fill', color);
        dot.setAttribute('opacity', '0.6');
        dot.classList.add('connector-dot-pulse');
        this.svg.appendChild(dot);
    },

    // ==================== 设置同步 ====================
    syncSettings() {
        const mapping = {
            'field-background': 'cc-field-background',
            'field-characters': 'cc-field-characters',
            'field-relationships': 'cc-field-relationships',
            'field-plot': 'cc-field-plot',
            'field-style': 'cc-field-style',
            'outline': 'cc-field-outline'
        };
        Object.entries(mapping).forEach(([srcId, dstId]) => {
            const src = document.getElementById(srcId);
            const dst = document.getElementById(dstId);
            if (src && dst) dst.value = src.value;
        });
    },

    syncSettingsToMain() {
        const mapping = {
            'cc-field-background': 'field-background',
            'cc-field-characters': 'field-characters',
            'cc-field-relationships': 'field-relationships',
            'cc-field-plot': 'field-plot',
            'cc-field-style': 'field-style',
            'cc-field-outline': 'outline'
        };
        Object.entries(mapping).forEach(([srcId, dstId]) => {
            const src = document.getElementById(srcId);
            const dst = document.getElementById(dstId);
            if (src && dst && dst.value !== src.value) {
                dst.value = src.value;
                dst.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    },

    // ==================== 状态持久化 ====================
    saveCanvasState() {
        try {
            localStorage.setItem('cc-canvas-state', JSON.stringify({
                zoom: this.zoom,
                panX: this.panX,
                panY: this.panY
            }));
        } catch (e) { /* ignore */ }
    },

    restoreCanvasState() {
        try {
            const saved = JSON.parse(localStorage.getItem('cc-canvas-state') || '{}');
            if (saved.zoom) {
                this.zoom = saved.zoom;
                this.panX = saved.panX || 0;
                this.panY = saved.panY || 0;
                this.applyTransform();
                this.updateZoomDisplay();
            }
        } catch (e) { /* ignore */ }
    },

    getLayout() {
        try {
            return JSON.parse(localStorage.getItem('cc-layout') || '{}');
        } catch { return {}; }
    },

    saveLayout() {
        const layout = {};
        this.cards.forEach(c => {
            layout[c.idx] = { x: c.x, y: c.y };
        });
        localStorage.setItem('cc-layout', JSON.stringify(layout));
        localStorage.setItem('cc-subcards', JSON.stringify(this.subCards));
        toast('布局已保存', 'success');
    },

    loadLayout() {
        const layout = this.getLayout();
        const chapters = AppState.chapters || [];
        this.cards = chapters.map((ch, i) => ({
            id: `cc-card-${i}`,
            idx: i,
            x: layout[i]?.x ?? this.getDefaultX(i),
            y: layout[i]?.y ?? this.getDefaultY(i)
        }));
        try {
            this.subCards = JSON.parse(localStorage.getItem('cc-subcards') || '[]');
        } catch { this.subCards = []; }
    },

    getDefaultX(i) {
        const col = i % 3;
        return 60 + col * 260;
    },

    getDefaultY(i) {
        const row = Math.floor(i / 3);
        return 60 + row * 200;
    },

    autoLayout() {
        const chapters = AppState.chapters || [];
        this.cards = chapters.map((ch, i) => ({
            id: `cc-card-${i}`,
            idx: i,
            x: this.getDefaultX(i),
            y: this.getDefaultY(i)
        }));
        // 重新排列子卡片
        const typeCounters = {};
        this.subCards.forEach(sc => {
            const parentCard = this.cards.find(c => c.idx === sc.parentIdx);
            if (!parentCard) return;
            const key = `${sc.parentIdx}-${sc.type}`;
            typeCounters[key] = (typeCounters[key] || 0);
            sc.x = parentCard.x + 250;
            sc.y = parentCard.y + typeCounters[key] * 80;
            typeCounters[key]++;
        });
        this.renderCards();
        this.renderSubCards();
        this.requestRedraw();
    },

    // ==================== 渲染 ====================
    render() {
        this.loadLayout();
        this.renderCards();
        this.renderSubCards();
        this.renderConnections();
        this.renderMinimap();
    },

    renderCards() {
        if (!this.container) return;
        const chapters = AppState.chapters || [];

        if (chapters.length === 0) {
            this.container.innerHTML = `
                <div class="cc-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <path d="M9 3v18"/>
                        <path d="M13 8h5"/><path d="M13 12h5"/><path d="M13 16h5"/>
                    </svg>
                    <p>暂无章节</p>
                    <p class="hint">点击上方 + 按钮添加章节，或从大纲生成</p>
                </div>`;
            return;
        }

        this.container.innerHTML = chapters.map((ch, i) => {
            const card = this.cards.find(c => c.idx === i) || { x: this.getDefaultX(i), y: this.getDefaultY(i) };
            const title = ch.title || `第${i + 1}章`;
            const outline = ch.outline || '';
            const emotion = ch.emotion || '';
            const hookStrength = ch.hookStrength || '';
            const contentLen = countChars(ch.content);
            const outlineLen = countChars(outline);
            const charCount = contentLen > 0 ? contentLen : outlineLen;
            const status = contentLen > 0 ? 'done' : outlineLen > 0 ? 'outline' : 'empty';
            const statusText = contentLen > 0 ? '已写' : outlineLen > 0 ? '有纲' : '空白';

            return `
                <div class="cc-card" id="cc-card-${i}" data-idx="${i}"
                     style="left:${card.x}px;top:${card.y}px;">
                    <div class="cc-card-connector top" data-idx="${i}" data-pos="top"></div>
                    <div class="cc-card-connector bottom" data-idx="${i}" data-pos="bottom"></div>
                    <div class="cc-card-header">
                        <div class="cc-card-num">${i + 1}</div>
                        <div class="cc-card-title" title="${title}">${title}</div>
                        <div class="cc-card-actions">
                            <button class="cc-card-action" data-action="expand" data-idx="${i}" title="编辑">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="cc-card-action danger" data-action="delete" data-idx="${i}" title="删除">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </div>
                    <div class="cc-card-body">
                        <div class="cc-card-meta">
                            ${emotion ? `<span class="cc-card-tag emotion">${emotion}</span>` : ''}
                            ${hookStrength ? `<span class="cc-card-tag hook">钩子 ${hookStrength}</span>` : ''}
                        </div>
                        <div class="cc-card-summary">${outline || '暂无大纲'}</div>
                    </div>
                    <div class="cc-card-footer">
                        <span class="cc-card-chars">${charCount} 字</span>
                        <span class="cc-card-status ${status}">${statusText}</span>
                        <button class="cc-add-sub-btn" data-idx="${i}" title="添加子卡片">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                    </div>
                </div>`;
        }).join('');

        // 绑定操作按钮（拖拽在 bindEvents 的 mousedown 中统一处理）
        this.container.querySelectorAll('.cc-card-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const idx = parseInt(btn.dataset.idx);
                if (action === 'delete') {
                    if (confirm('确定删除此章节？')) {
                        AppState.chapters.splice(idx, 1);
                        // 清理画布卡片位置和连接
                        ChapterCanvasState.cards.splice(idx, 1);
                        ChapterCanvasState.connections = (ChapterCanvasState.connections || []).filter(c => {
                            if (c.fromIdx === idx || c.toIdx === idx) return false;
                            return true;
                        });
                        ChapterCanvasState.connections.forEach(c => {
                            if (c.fromIdx > idx) c.fromIdx--;
                            if (c.toIdx > idx) c.toIdx--;
                        });
                        this.subCards = this.subCards.filter(sc => sc.parentIdx !== idx);
                        this.subCards.forEach(sc => { if (sc.parentIdx > idx) sc.parentIdx--; });
                        saveChapterCardLayout();
                        this.render();
                        debouncedSave();
                        // 触发画布重绘连线
                        if (typeof CanvasEngine !== 'undefined') {
                            CanvasEngine.drawConnections();
                        }
                    }
                } else if (action === 'expand') {
                    // 切到工作台并打开浮动详情面板
                    document.querySelector('.nav-tab[data-panel="workspace"]')?.click();
                    setTimeout(() => {
                        ChapterDetailPanel.open(idx);
                    }, 200);
                }
            });
        });

        // 绑定添加子卡片按钮
        this.container.querySelectorAll('.cc-add-sub-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx);
                this.showSubCardPicker(idx, btn);
            });
        });
    },

    // ==================== 子卡片系统 ====================
    showSubCardPicker(parentIdx, anchorEl) {
        document.querySelectorAll('.cc-sub-picker').forEach(el => el.remove());

        const picker = document.createElement('div');
        picker.className = 'cc-sub-picker';
        picker.innerHTML = `
            <div class="cc-sub-picker-item" data-type="character">
                <span class="cc-sub-picker-dot" style="background:#34C759"></span>
                <span>角色卡</span>
            </div>
            <div class="cc-sub-picker-item" data-type="memory">
                <span class="cc-sub-picker-dot" style="background:#FF9500"></span>
                <span>记忆卡</span>
            </div>
            <div class="cc-sub-picker-item" data-type="setting">
                <span class="cc-sub-picker-dot" style="background:#8E8E93"></span>
                <span>设定卡</span>
            </div>
        `;

        const rect = anchorEl.getBoundingClientRect();
        picker.style.position = 'fixed';
        picker.style.left = rect.left + 'px';
        picker.style.top = (rect.bottom + 4) + 'px';
        picker.style.zIndex = '9999';
        document.body.appendChild(picker);

        picker.querySelectorAll('.cc-sub-picker-item').forEach(item => {
            item.addEventListener('click', () => {
                this.addSubCard(parentIdx, item.dataset.type);
                picker.remove();
            });
        });

        const closePicker = (e) => {
            if (!picker.contains(e.target)) {
                picker.remove();
                document.removeEventListener('click', closePicker);
            }
        };
        setTimeout(() => document.addEventListener('click', closePicker), 50);
    },

    addSubCard(parentIdx, type) {
        const parentCard = this.cards.find(c => c.idx === parentIdx);
        if (!parentCard) return;

        const existingSameType = this.subCards.filter(sc => sc.parentIdx === parentIdx && sc.type === type);
        const offsetIdx = existingSameType.length;
        const baseX = parentCard.x + 250;
        const baseY = parentCard.y + offsetIdx * 80;

        const labels = { character: '角色', memory: '记忆', setting: '设定' };
        const newSub = {
            id: `cc-sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            parentIdx,
            type,
            x: baseX,
            y: baseY,
            data: { name: `${labels[type]}${offsetIdx + 1}`, content: '' }
        };

        this.subCards.push(newSub);
        this.renderSubCards();
        this.requestRedraw();
        localStorage.setItem('cc-subcards', JSON.stringify(this.subCards));
    },

    deleteSubCard(subId) {
        this.subCards = this.subCards.filter(sc => sc.id !== subId);
        const el = document.getElementById(subId);
        if (el) el.remove();
        this.requestRedraw();
        localStorage.setItem('cc-subcards', JSON.stringify(this.subCards));
    },

    renderSubCards() {
        if (!this.container) return;
        this.container.querySelectorAll('.cc-sub-card').forEach(el => el.remove());

        const typeColors = { character: '#34C759', memory: '#FF9500', setting: '#8E8E93' };
        const typeLabels = { character: '角色', memory: '记忆', setting: '设定' };
        const typeIcons = {
            character: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
            memory: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>',
            setting: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
        };

        this.subCards.forEach(sc => {
            const color = typeColors[sc.type] || '#8E8E93';
            const el = document.createElement('div');
            el.className = `cc-sub-card cc-sub-${sc.type}`;
            el.id = sc.id;
            el.style.left = sc.x + 'px';
            el.style.top = sc.y + 'px';
            el.style.position = 'absolute';
            el.dataset.subId = sc.id;
            el.innerHTML = `
                <div class="cc-sub-card-dot" style="background:${color}"></div>
                <div class="cc-sub-card-icon">${typeIcons[sc.type] || ''}</div>
                <div class="cc-sub-card-info">
                    <div class="cc-sub-card-label">${typeLabels[sc.type]}</div>
                    <div class="cc-sub-card-name">${this._escapeHtml(sc.data?.name || '')}</div>
                </div>
                <button class="cc-sub-card-del" data-sub-id="${sc.id}" title="删除">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            `;
            this.container.appendChild(el);

            // 子卡片双击编辑
            el.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                this._editSubCard(sc);
            });

            // 删除按钮
            el.querySelector('.cc-sub-card-del').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`删除此${typeLabels[sc.type]}卡？`)) {
                    this.deleteSubCard(sc.id);
                }
            });
        });
    },

    _editSubCard(sc) {
        const labels = { character: '角色卡', memory: '记忆卡', setting: '设定卡' };
        const newName = prompt(`${labels[sc.type]}名称：`, sc.data?.name || '');
        if (newName === null) return;
        sc.data = sc.data || {};
        sc.data.name = newName;
        this.renderSubCards();
        this.renderConnections();
        localStorage.setItem('cc-subcards', JSON.stringify(this.subCards));
    },

    _escapeHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    },

    // ==================== 小地图（CanvasEngine 风格） ====================
    _getWorldBounds(padding = 50) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        this.cards.forEach(c => {
            const el = document.getElementById(`cc-card-${c.idx}`);
            minX = Math.min(minX, c.x);
            minY = Math.min(minY, c.y);
            maxX = Math.max(maxX, c.x + 220);
            maxY = Math.max(maxY, c.y + (el?.offsetHeight || 160));
        });
        this.subCards.forEach(sc => {
            const el = document.getElementById(sc.id);
            minX = Math.min(minX, sc.x);
            minY = Math.min(minY, sc.y);
            maxX = Math.max(maxX, sc.x + 140);
            maxY = Math.max(maxY, sc.y + (el?.offsetHeight || 36));
        });
        if (!isFinite(minX)) return null;
        minX -= padding; minY -= padding;
        maxX += padding; maxY += padding;
        return { minX, minY, maxX, maxY, worldW: maxX - minX, worldH: maxY - minY };
    },

    renderMinimap() {
        const minimap = document.getElementById('cc-minimap');
        const minimapVP = document.getElementById('cc-minimap-viewport');
        if (!minimap || !minimapVP || !this.viewport) return;

        const mapW = minimap.offsetWidth || 160;
        const mapH = minimap.offsetHeight || 100;

        const bounds = this._getWorldBounds();
        if (!bounds) return;
        const { minX, minY, worldW, worldH } = bounds;

        const scaleX = mapW / worldW;
        const scaleY = mapH / worldH;

        // 清除旧的点
        minimap.querySelectorAll('.cc-minimap-card, .cc-minimap-subcard').forEach(d => d.remove());

        // 绘制卡片点
        this.cards.forEach(card => {
            const el = document.getElementById(`cc-card-${card.idx}`);
            const dot = document.createElement('div');
            dot.className = 'cc-minimap-card';
            dot.style.cssText = `
                position: absolute;
                background: rgba(88,86,214,0.3);
                border-radius: 2px;
                left: ${(card.x - minX) * scaleX}px;
                top: ${(card.y - minY) * scaleY}px;
                width: ${220 * scaleX}px;
                height: ${(el?.offsetHeight || 160) * scaleY}px;
            `;
            minimap.appendChild(dot);
        });

        // 绘制子卡片点
        const subColors = { character: '#34C759', memory: '#FF9500', setting: '#8E8E93' };
        this.subCards.forEach(sc => {
            const el = document.getElementById(sc.id);
            const dot = document.createElement('div');
            dot.className = 'cc-minimap-subcard';
            dot.style.cssText = `
                position: absolute;
                border-radius: 2px;
                left: ${(sc.x - minX) * scaleX}px;
                top: ${(sc.y - minY) * scaleY}px;
                width: ${140 * scaleX}px;
                height: ${(el?.offsetHeight || 36) * scaleY}px;
                background: ${subColors[sc.type] || '#8E8E93'};
                opacity: 0.3;
            `;
            minimap.appendChild(dot);
        });

        // 更新视口指示器
        const vpLeft = (-this.panX / this.zoom - minX) * scaleX;
        const vpTop = (-this.panY / this.zoom - minY) * scaleY;
        const vpWidth = (this.viewport.clientWidth / this.zoom) * scaleX;
        const vpHeight = (this.viewport.clientHeight / this.zoom) * scaleY;

        minimapVP.style.left = Math.max(0, vpLeft) + 'px';
        minimapVP.style.top = Math.max(0, vpTop) + 'px';
        minimapVP.style.width = Math.min(mapW, vpWidth) + 'px';
        minimapVP.style.height = Math.min(mapH, vpHeight) + 'px';
    },

    minimapNavigate(e) {
        const minimap = document.getElementById('cc-minimap');
        if (!minimap) return;

        const rect = minimap.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const mapW = rect.width;
        const mapH = rect.height;

        const bounds = this._getWorldBounds();
        if (!bounds) return;
        const { minX, minY, worldW, worldH } = bounds;

        const targetX = minX + (x / mapW) * worldW;
        const targetY = minY + (y / mapH) * worldH;

        this.panX = -targetX * this.zoom + this.viewport.clientWidth / 2;
        this.panY = -targetY * this.zoom + this.viewport.clientHeight / 2;

        this.applyTransform();
        this.saveCanvasState();
        this.renderMinimap();
    }
};

// ============================================================
// 章节详情浮动面板 (Figma-style)
// ============================================================

const ChapterDetailPanel = {
    currentIdx: -1,
    panel: null,
    backdrop: null,
    isDragging: false,
    _originalParent: null,

    init() {
        this.panel = document.getElementById('chapter-detail-panel');
        if (!this.panel) return;
        this._originalParent = this.panel.parentNode;

        this.bindTabs();
        this.bindClose();
        this.bindActions();
        this.bindDrag();
        this.bindKeyboard();
    },

    open(idx) {
        if (idx < 0 || idx >= AppState.chapters.length) return;
        this.currentIdx = idx;
        const ch = AppState.chapters[idx];

        // 更新标题
        const titleMatch = (ch.outline || '').match(/第.{1,3}章[：:](.+)/);
        const title = titleMatch ? titleMatch[1].trim() : (ch.outline.slice(0, 20) || '新章节');
        document.getElementById('cdp-chapter-num').textContent = idx + 1;
        document.getElementById('cdp-chapter-title').textContent = title;

        // 填充细纲
        document.getElementById('cdp-outline').value = ch.outline || '';

        // 填充正文
        document.getElementById('cdp-content').value = ch.content || '';

        // 填充场景配置
        this.renderSceneForm(idx);

        // 清空工具结果
        const toolResult = document.getElementById('cdp-tool-result');
        toolResult.classList.remove('has-content');
        toolResult.innerHTML = '';

        // 重置到第一个 tab
        this.switchTab('outline');

        // 将面板移到 body 以避免被 overflow: hidden 裁剪
        if (this.panel.parentNode !== document.body) {
            document.body.appendChild(this.panel);
        }

        // 显示面板
        this.panel.style.display = 'flex';
        this.createBackdrop();

        // 绑定输入事件
        this.bindInputs();
    },

    close() {
        this.panel.style.display = 'none';
        this.removeBackdrop();
        // 重置拖拽产生的内联样式，恢复 CSS 居中定位
        this.panel.style.transform = '';
        this.panel.style.left = '';
        this.panel.style.top = '';
        // 将面板移回原始父元素
        if (this._originalParent && this.panel.parentNode !== this._originalParent) {
            this._originalParent.appendChild(this.panel);
        }
        this.currentIdx = -1;
    },

    createBackdrop() {
        this.removeBackdrop();
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'cdp-backdrop';
        this.backdrop.addEventListener('click', () => this.close());
        // 插入到 body 以确保覆盖整个视口
        document.body.appendChild(this.backdrop);
    },

    removeBackdrop() {
        if (this.backdrop) {
            this.backdrop.remove();
            this.backdrop = null;
        }
    },

    switchTab(tabName) {
        // 切换 tab 按钮
        this.panel.querySelectorAll('.cdp-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.cdptab === tabName);
        });
        // 切换内容
        this.panel.querySelectorAll('.cdp-tab-content').forEach(c => {
            c.classList.toggle('active', c.id === `cdp-tab-${tabName}`);
        });
    },

    bindTabs() {
        this.panel.querySelectorAll('.cdp-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.cdptab);
            });
        });
    },

    bindClose() {
        document.getElementById('cdp-btn-close')?.addEventListener('click', () => this.close());
        // 上一章/下一章
        document.getElementById('cdp-btn-prev')?.addEventListener('click', () => {
            if (this.currentIdx > 0) this.open(this.currentIdx - 1);
        });
        document.getElementById('cdp-btn-next')?.addEventListener('click', () => {
            if (this.currentIdx < AppState.chapters.length - 1) this.open(this.currentIdx + 1);
        });
    },

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.panel.style.display !== 'none') {
                this.close();
            }
        });
    },

    bindDrag() {
        const header = this.panel.querySelector('.cdp-header');
        if (!header) return;

        let startX, startY, origLeft, origTop;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('button')) return;
            this.isDragging = true;
            this.panel.classList.add('cdp-dragging');
            startX = e.clientX;
            startY = e.clientY;
            const rect = this.panel.getBoundingClientRect();
            origLeft = rect.left;
            origTop = rect.top;
            // 切换为绝对定位（左上角基准）
            this.panel.style.transform = 'none';
            this.panel.style.left = origLeft + 'px';
            this.panel.style.top = origTop + 'px';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            this.panel.style.left = (origLeft + dx) + 'px';
            this.panel.style.top = (origTop + dy) + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.panel.classList.remove('cdp-dragging');
            }
        });
    },

    bindInputs() {
        // 细纲输入
        const outlineEl = document.getElementById('cdp-outline');
        outlineEl.oninput = () => {
            if (this.currentIdx < 0) return;
            AppState.chapters[this.currentIdx].outline = outlineEl.value;
            debouncedSave();
            // 更新标题
            const titleMatch = outlineEl.value.match(/第.{1,3}章[：:](.+)/);
            const title = titleMatch ? titleMatch[1].trim() : (outlineEl.value.slice(0, 20) || '新章节');
            document.getElementById('cdp-chapter-title').textContent = title;
        };
        outlineEl.oncontextmenu = (e) => showContextMenu(e, 'chapter', outlineEl);

        // 正文输入
        const contentEl = document.getElementById('cdp-content');
        contentEl.oninput = () => {
            if (this.currentIdx < 0) return;
            AppState.chapters[this.currentIdx].content = contentEl.value;
            debouncedSave();
            updateTodayWritten(contentEl.value.length);
            updateStats();
        };
        contentEl.oncontextmenu = (e) => showContextMenu(e, 'content', contentEl);
    },

    bindActions() {
        // 生成正文
        document.getElementById('cdp-btn-gen-content')?.addEventListener('click', async () => {
            if (this.currentIdx < 0) return;
            await generateContent(this.currentIdx);
            // 刷新面板数据
            document.getElementById('cdp-content').value = AppState.chapters[this.currentIdx].content || '';
        });

        // 复制正文
        document.getElementById('cdp-btn-copy-content')?.addEventListener('click', () => {
            const content = document.getElementById('cdp-content').value;
            if (content) {
                navigator.clipboard.writeText(content);
                toast('正文已复制', 'success');
            }
        });

        // 复制细纲
        document.getElementById('cdp-btn-copy-outline')?.addEventListener('click', () => {
            const outline = document.getElementById('cdp-outline').value;
            if (outline) {
                navigator.clipboard.writeText(outline);
                toast('细纲已复制', 'success');
            }
        });

        // 预览
        document.getElementById('cdp-btn-preview')?.addEventListener('click', () => {
            if (this.currentIdx < 0) return;
            showChapterPreview(this.currentIdx);
        });

        // 一致性检查
        document.getElementById('cdp-btn-consistency')?.addEventListener('click', async () => {
            if (this.currentIdx < 0) return;
            await checkChapterConsistency(this.currentIdx);
            this.showToolResult('一致性检查完成，请查看弹窗结果');
        });

        // 场景规划
        document.getElementById('cdp-btn-scene-plan')?.addEventListener('click', async () => {
            if (this.currentIdx < 0) return;
            await generateScenePlan(this.currentIdx);
            this.showToolResult('场景规划完成，请查看弹窗结果');
        });

        // 质量检查
        document.getElementById('cdp-btn-quality')?.addEventListener('click', async () => {
            if (this.currentIdx < 0) return;
            await runLocalQualityCheck(this.currentIdx);
            this.showToolResult('质量检查完成，请查看弹窗结果');
        });

        // 节奏分析
        document.getElementById('cdp-btn-pacing')?.addEventListener('click', async () => {
            if (this.currentIdx < 0) return;
            await analyzeChapterPacing(this.currentIdx);
            this.showToolResult('节奏分析完成，请查看弹窗结果');
        });

        // 微观控制按钮
        this.panel.querySelectorAll('[data-cdp-action]').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (this.currentIdx < 0) return;
                const mode = btn.dataset.cdpAction;
                const contentEl = document.getElementById('cdp-content');
                const start = contentEl.selectionStart;
                const end = contentEl.selectionEnd;
                const selectedText = contentEl.value.substring(start, end);
                if (!selectedText || selectedText.trim().length === 0) {
                    toast('请先选中要操作的文本', 'warning');
                    return;
                }
                await rewriteSelection(this.currentIdx, selectedText, start, end, mode);
                // 刷新正文
                contentEl.value = AppState.chapters[this.currentIdx].content || '';
            });
        });
    },

    showToolResult(text) {
        const el = document.getElementById('cdp-tool-result');
        el.textContent = text;
        el.classList.add('has-content');
    },

    renderSceneForm(idx) {
        const ch = AppState.chapters[idx];
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

        // 角色复选框
        const charCheckboxes = AppState.characters.map(c => {
            const checked = sc.characters.includes(c.id) ? 'checked' : '';
            return `<label><input type="checkbox" class="cdp-scene-char" data-char-id="${c.id}" ${checked}> ${c.name || '未命名'}</label>`;
        }).join('') || '<span style="font-size:11px;color:var(--text-muted);">暂无角色</span>';

        const form = document.getElementById('cdp-scene-form');
        form.innerHTML = `
            <div class="field-group">
                <label>出场角色</label>
                <div class="char-checkboxes">${charCheckboxes}</div>
            </div>
            <div class="field-row-3">
                <div class="field-group">
                    <label>上下文范围</label>
                    <select id="cdp-scene-context">
                        <option value="minimal" ${sc.contextRange === 'minimal' ? 'selected' : ''}>精简(2章)</option>
                        <option value="summary" ${sc.contextRange === 'summary' ? 'selected' : ''}>摘要(5章)</option>
                        <option value="full" ${sc.contextRange === 'full' ? 'selected' : ''}>完整(10章)</option>
                    </select>
                </div>
                <div class="field-group">
                    <label>场景类型</label>
                    <select id="cdp-scene-type">
                        <option value="narrative" ${sc.sceneType === 'narrative' ? 'selected' : ''}>叙事</option>
                        <option value="action" ${sc.sceneType === 'action' ? 'selected' : ''}>动作</option>
                        <option value="dialogue" ${sc.sceneType === 'dialogue' ? 'selected' : ''}>对话</option>
                        <option value="transition" ${sc.sceneType === 'transition' ? 'selected' : ''}>过渡</option>
                    </select>
                </div>
                <div class="field-group">
                    <label>节奏</label>
                    <select id="cdp-scene-pacing">
                        <option value="slow" ${sc.pacing === 'slow' ? 'selected' : ''}>慢节奏</option>
                        <option value="normal" ${sc.pacing === 'normal' ? 'selected' : ''}>正常</option>
                        <option value="fast" ${sc.pacing === 'fast' ? 'selected' : ''}>快节奏</option>
                    </select>
                </div>
            </div>
            <div class="field-row">
                <div class="field-group">
                    <label>情绪基调</label>
                    <input type="text" id="cdp-scene-tone" value="${sc.emotionalTone}" placeholder="如：紧张、温馨">
                </div>
                <div class="field-group">
                    <label>风格覆盖</label>
                    <input type="text" id="cdp-scene-style" value="${sc.styleOverride}" placeholder="本场景特殊风格">
                </div>
            </div>
            <div class="field-group">
                <label>场景目标</label>
                <textarea id="cdp-scene-goal" rows="2" placeholder="本场景要达成的目标">${sc.sceneGoal}</textarea>
            </div>
        `;

        // 绑定场景配置事件
        form.querySelectorAll('.cdp-scene-char').forEach(cb => {
            cb.addEventListener('change', () => {
                const charId = cb.dataset.charId;
                if (cb.checked) {
                    if (!sc.characters.includes(charId)) sc.characters.push(charId);
                } else {
                    sc.characters = sc.characters.filter(id => id !== charId);
                }
                debouncedSave();
            });
        });

        ['cdp-scene-context', 'cdp-scene-type', 'cdp-scene-pacing'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                const key = { 'cdp-scene-context': 'contextRange', 'cdp-scene-type': 'sceneType', 'cdp-scene-pacing': 'pacing' }[id];
                sc[key] = e.target.value;
                debouncedSave();
            });
        });

        ['cdp-scene-tone', 'cdp-scene-style'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', (e) => {
                const key = id === 'cdp-scene-tone' ? 'emotionalTone' : 'styleOverride';
                sc[key] = e.target.value;
                debouncedSave();
            });
        });

        document.getElementById('cdp-scene-goal')?.addEventListener('input', (e) => {
            sc.sceneGoal = e.target.value;
            debouncedSave();
        });
    }
};

// ============================================================
// 新建元素系统 (剧情 / 角色 / 设定)
// ============================================================

const ElementTypes = {
    plot: {
        label: '剧情线',
        color: '#FF9500',
        icon: '📖',
        fields: [
            { key: 'title', label: '标题', type: 'text', required: true },
            { key: 'description', label: '描述', type: 'textarea' },
            { key: 'notes', label: '备注', type: 'textarea' },
        ]
    },
    character: {
        label: '角色',
        color: '#34C759',
        icon: '👤',
        fields: [
            { key: 'name', label: '姓名', type: 'text', required: true },
            { key: 'personality', label: '性格', type: 'textarea' },
            { key: 'background', label: '背景故事', type: 'textarea' },
            { key: 'relationships', label: '人物关系', type: 'textarea' },
        ]
    },
    setting: {
        label: '基础设定',
        color: '#5856D6',
        icon: '🌍',
        fields: [
            { key: 'title', label: '设定名称', type: 'text', required: true },
            { key: 'description', label: '描述', type: 'textarea' },
            { key: 'notes', label: '备注', type: 'textarea' },
        ]
    }
};

// 画布上的非章节元素
const CanvasElements = {
    elements: [],  // { id, type, data, x, y }
};

function showNewElementModal(type, sourceCardIdx) {
    const config = ElementTypes[type];
    if (!config) return;

    const modal = document.getElementById('new-element-modal');
    if (!modal) return;

    document.getElementById('new-elem-title').textContent = `新建${config.label}`;

    const body = document.getElementById('new-elem-body');
    body.innerHTML = buildElementForm(config, type);

    const footer = document.getElementById('new-elem-footer');
    footer.innerHTML = `
        <button class="btn btn-ghost" onclick="document.getElementById('new-element-modal').style.display='none'">取消</button>
        <button class="btn btn-primary" id="btn-create-element">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            创建
        </button>
    `;

    modal.style.display = 'flex';

    // 绑定素材复用
    const reuseSelect = document.getElementById('new-elem-reuse-source');
    if (reuseSelect) {
        reuseSelect.addEventListener('change', () => handleMaterialReuse(reuseSelect.value, type));
    }

    document.getElementById('btn-create-element').addEventListener('click', () => {
        const data = collectElementFormData(config);
        if (!validateElementFormData(config, data)) return;

        createElement(type, data, sourceCardIdx);
        modal.style.display = 'none';
    });
}

function buildElementForm(config, type) {
    let html = '';

    config.fields.forEach(field => {
        if (field.type === 'text') {
            html += `
                <div class="field-group">
                    <label>${field.label}${field.required ? ' <span class="required-star">*</span>' : ''}</label>
                    <input type="text" id="new-elem-${field.key}" class="input" placeholder="请输入${field.label}">
                </div>`;
        } else if (field.type === 'textarea') {
            html += `
                <div class="field-group">
                    <label>${field.label}</label>
                    <textarea id="new-elem-${field.key}" class="input" rows="3" placeholder="请输入${field.label}"></textarea>
                </div>`;
        }
    });

    // 素材复用区域
    const reuseOptions = buildReuseOptions(type);
    html += `
        <div class="field-group">
            <label>📎 复用已有素材</label>
            <div class="material-reuse-section">
                <select id="new-elem-reuse-source" class="input">
                    <option value="">选择素材来源...</option>
                    ${reuseOptions}
                </select>
                <div id="new-elem-reuse-preview" class="reuse-preview"></div>
            </div>
        </div>`;

    return html;
}

function buildReuseOptions(type) {
    let opts = '';
    // 从已有章节大纲
    const chapters = AppState.chapters || [];
    if (chapters.length > 0) {
        opts += '<optgroup label="从章节大纲">';
        chapters.forEach((ch, i) => {
            const title = ch.title || `第${i + 1}章`;
            if (ch.outline) {
                opts += `<option value="chapter-outline-${i}">${escapeHtml(title)} - 大纲</option>`;
            }
            if (ch.content) {
                opts += `<option value="chapter-content-${i}">${escapeHtml(title)} - 正文</option>`;
            }
        });
        opts += '</optgroup>';
    }
    // 从已有角色
    if (AppState.characters && AppState.characters.length > 0) {
        opts += '<optgroup label="从角色库">';
        AppState.characters.forEach(c => {
            opts += `<option value="char-${c.id}">${escapeHtml(c.name || '未命名角色')}</option>`;
        });
        opts += '</optgroup>';
    }
    // 从世界观笔记
    if (AppState.worldNotes) {
        opts += '<optgroup label="从世界观笔记">';
        opts += '<option value="worldNotes">世界观笔记全文</option>';
        opts += '</optgroup>';
    }
    return opts;
}

function handleMaterialReuse(value, type) {
    const preview = document.getElementById('new-elem-reuse-preview');
    if (!preview) return;
    if (!value) { preview.innerHTML = ''; return; }

    let content = '';
    if (value.startsWith('chapter-outline-')) {
        const idx = parseInt(value.replace('chapter-outline-', ''));
        content = (AppState.chapters[idx] || {}).outline || '';
    } else if (value.startsWith('chapter-content-')) {
        const idx = parseInt(value.replace('chapter-content-', ''));
        content = (AppState.chapters[idx] || {}).content || '';
    } else if (value.startsWith('char-')) {
        const charId = value.replace('char-', '');
        const char = (AppState.characters || []).find(c => c.id === charId);
        if (char) {
            content = [char.name, char.personality, char.background].filter(Boolean).join('\n');
        }
    } else if (value === 'worldNotes') {
        content = AppState.worldNotes || '';
    }

    if (content) {
        // 截取前500字作为预览
        const preview_text = content.slice(0, 500) + (content.length > 500 ? '...' : '');
        preview.innerHTML = `
            <div class="reuse-preview-content">${escapeHtml(preview_text)}</div>
            <button class="btn btn-xs btn-ghost reuse-apply-btn" type="button">填入描述框</button>
        `;
        preview.querySelector('.reuse-apply-btn').addEventListener('click', () => {
            const descEl = document.getElementById('new-elem-description');
            if (descEl) {
                descEl.value = content.slice(0, 2000);
                toast('已填入', 'success');
            }
        });
    }
}

function collectElementFormData(config) {
    const data = {};
    config.fields.forEach(field => {
        const el = document.getElementById(`new-elem-${field.key}`);
        data[field.key] = el ? el.value.trim() : '';
    });
    return data;
}

function validateElementFormData(config, data) {
    for (const field of config.fields) {
        if (field.required && !data[field.key]) {
            toast(`请填写「${field.label}」`, 'warning');
            const el = document.getElementById(`new-elem-${field.key}`);
            if (el) el.focus();
            return false;
        }
    }
    return true;
}

function createElement(type, data, sourceCardIdx) {
    const config = ElementTypes[type];
    const id = 'elem-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);

    // 定位到源卡片旁边
    const sourceCard = ChapterCanvasState.cards[sourceCardIdx];
    const offsetX = 280 + Math.random() * 60;
    const offsetY = (Math.random() - 0.5) * 200;
    const x = sourceCard ? sourceCard.x + offsetX : 100;
    const y = sourceCard ? Math.max(20, sourceCard.y + offsetY) : 100;

    const element = { id, type, data, x, y };
    CanvasElements.elements.push(element);

    // 如果是角色，同步到 AppState.characters
    if (type === 'character' && typeof addCharacter === 'function') {
        addCharacter(data.name || '新角色', {
            personality: data.personality || '',
            background: data.background || '',
            relationships: data.relationships || ''
        });
    }

    // 创建从源卡片到新元素的连接
    if (sourceCardIdx >= 0) {
        if (!ChapterCanvasState.connections) ChapterCanvasState.connections = [];
        ChapterCanvasState.connections.push({
            id: 'conn-' + Date.now(),
            fromIdx: sourceCardIdx,
            toElemId: id,
            color: config.color
        });
    }

    saveCanvasElements();
    saveChapterCardLayout();
    renderChapterCards();  // 会自动调用 renderCanvasElements 并重建所有连线
    toast(`${config.label}「${data.title || data.name}」已创建`, 'success');
}

function renderCanvasElements() {
    // 移除已有元素卡片
    document.querySelectorAll('.canvas-elem-card').forEach(el => el.remove());

    const container = document.getElementById('canvas-chapters-container');
    if (!container) return;

    CanvasElements.elements.forEach(elem => {
        const config = ElementTypes[elem.type];
        if (!config) return;
        const card = document.createElement('div');
        card.className = `canvas-elem-card canvas-elem-${elem.type}`;
        card.id = elem.id;
        card.style.cssText = `position:absolute;left:${elem.x}px;top:${elem.y}px;`;
        card.innerHTML = `
            <div class="elem-card-header">
                <span class="elem-card-icon">${config.icon}</span>
                <span class="elem-card-title">${escapeHtml(elem.data.title || elem.data.name || config.label)}</span>
            </div>
            <div class="elem-card-body">
                <span class="elem-card-type" style="color:${config.color}">${config.label}</span>
            </div>
        `;
        container.appendChild(card);

        // 注册到 CanvasEngine
        if (typeof CanvasEngine !== 'undefined') {
            CanvasEngine.registerNode(card, elem.x, elem.y);
        }
    });

    // 连接数据由 renderChapterCards 统一设置，此处只负责绘制
    // 必须在所有节点（章节+元素）都注册完之后再绘制，否则 chapter→element 连线丢失
    if (typeof CanvasEngine !== 'undefined') {
        CanvasEngine.drawConnections();
    }
}

function saveCanvasElements() {
    try {
        localStorage.setItem('canvas-elements', JSON.stringify(CanvasElements.elements));
    } catch {}
}

function loadCanvasElements() {
    try {
        const saved = JSON.parse(localStorage.getItem('canvas-elements') || '[]');
        if (Array.isArray(saved)) CanvasElements.elements = saved;
    } catch {}
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

大纲: ${$("#outline")?.value || '（未设置）'}
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
    // 同步到详情面板
    if (typeof ChapterDetailPanel !== 'undefined' && ChapterDetailPanel.currentIdx === chapterIdx) {
        const panelContentEl = document.getElementById('cdp-content');
        if (panelContentEl) panelContentEl.value = fullContent;
    }
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

function showCharacterManager() {
    const modal = $("#modal");
    $("#modal-title").textContent = "角色管理";

    function renderList() {
        const chars = AppState.characters || [];
        if (chars.length === 0) {
            $("#modal-body").innerHTML = `
                <div style="text-align:center;padding:40px 0;color:var(--text-muted);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48" style="margin-bottom:12px;">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <p>暂无角色</p>
                    <p style="font-size:12px;">点击下方按钮添加角色</p>
                </div>`;
        } else {
            let html = '<div style="display:flex;flex-direction:column;gap:8px;max-height:60vh;overflow-y:auto;">';
            chars.forEach((char, i) => {
                const relKeys = char.relationships ? Object.keys(char.relationships) : [];
                const relSummary = relKeys.length > 0 ? relKeys.map(k => `${k}(${char.relationships[k]})`).join('、') : '';
                const fields = [
                    char.personality ? `性格: ${char.personality}` : '',
                    char.current_state ? `状态: ${char.current_state}` : '',
                    relSummary ? `关系: ${relSummary}` : '',
                ].filter(Boolean);
                html += `
                    <div style="display:flex;align-items:flex-start;gap:12px;padding:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;">
                        <div style="flex:1;min-width:0;">
                            <div style="font-weight:600;font-size:14px;">${escapeHtml(char.name || '未命名角色')}</div>
                            ${fields.length > 0 ? `<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">${escapeHtml(fields.join(' · '))}</div>` : ''}
                        </div>
                        <div style="display:flex;gap:4px;flex-shrink:0;">
                            <button class="btn btn-sm btn-ghost" data-char-edit="${i}">编辑</button>
                            <button class="btn btn-sm btn-ghost btn-danger" data-char-delete="${i}">删除</button>
                        </div>
                    </div>`;
            });
            html += '</div>';
            $("#modal-body").innerHTML = html;
        }

        $("#modal-footer").innerHTML = `
            <button class="btn btn-ghost" onclick="hideModal('modal')">关闭</button>
            <button class="btn btn-primary" id="btn-char-add">+ 添加角色</button>
        `;

        // 绑定事件
        $("#btn-char-add")?.addEventListener("click", () => {
            hideModal("modal");
            showStructuredCharacterEditor(-1);
        });
        document.querySelectorAll("[data-char-edit]").forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.dataset.charEdit);
                hideModal("modal");
                showStructuredCharacterEditor(idx);
            });
        });
        document.querySelectorAll("[data-char-delete]").forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.dataset.charDelete);
                const name = AppState.characters[idx]?.name || '未命名角色';
                if (confirm(`确定删除角色「${name}」？`)) {
                    AppState.characters.splice(idx, 1);
                    saveState();
                    renderList(); // 重新渲染列表
                    toast(`已删除角色「${name}」`, 'success');
                }
            });
        });
    }

    renderList();
    showModal("modal");
}

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

// Fix #9: 逐章发送质量检查，避免单次请求过大，带进度反馈
async function batchQualityCheck() {
    if (AppState.chapters.length === 0) { toast("请先生成章节", "error"); return; }
    const modal = $("#modal");
    $("#modal-title").textContent = "全书质量检查";
    $("#modal-body").innerHTML = '<div style="text-align:center;padding:20px;"><span class="spinner"></span> 正在检查...</div>';
    $("#modal-footer").innerHTML = "";
    showModal("modal");

    const chapters = AppState.chapters;
    const reports = [];
    const total = chapters.length;

    try {
        // 逐章检查，带进度反馈
        for (let i = 0; i < total; i++) {
            const content = chapters[i].content || "";
            if (!content.trim()) continue;

            // 更新进度
            $("#modal-body").innerHTML = `<div style="text-align:center;padding:20px;">
                <span class="spinner"></span>
                <div style="margin-top:12px;font-size:14px;">正在检查第 ${i + 1}/${total} 章...</div>
                <div style="margin-top:8px;height:4px;background:var(--bg-secondary);border-radius:2px;overflow:hidden;">
                    <div style="height:100%;width:${Math.round((i / total) * 100)}%;background:var(--accent);transition:width 0.3s;"></div>
                </div>
            </div>`;

            const resp = await fetch("/api/quality/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: content, check_type: "local" })
            });
            const report = await resp.json();
            reports.push({ chapter_idx: i, report });
        }

        // 汇总结果
        const sc = (s) => s >= 80 ? '#2ecc71' : s >= 60 ? '#f1c40f' : s >= 40 ? '#e67e22' : '#e74c3c';
        const avgOverall = reports.length ? Math.round(reports.reduce((s, r) => s + r.report.overall_score, 0) / reports.length) : 0;
        const avgAI = reports.length ? Math.round(reports.reduce((s, r) => s + r.report.ai_taste_score, 0) / reports.length) : 0;
        const totalIssues = reports.reduce((s, r) => s + r.report.issues.length, 0);

        let html = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
            <div style="text-align:center;padding:12px;background:var(--bg-secondary);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:${sc(avgOverall)};">${avgOverall}</div><div style="font-size:11px;color:var(--text-muted);">平均综合分</div></div>
            <div style="text-align:center;padding:12px;background:var(--bg-secondary);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:${sc(avgAI)};">${avgAI}</div><div style="font-size:11px;color:var(--text-muted);">平均人味</div></div>
            <div style="text-align:center;padding:12px;background:var(--bg-secondary);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:var(--warning);">${totalIssues}</div><div style="font-size:11px;color:var(--text-muted);">总问题</div></div></div>`;
        html += '<div style="max-height:400px;overflow-y:auto;">';
        reports.forEach(ch => {
            const r = ch.report;
            html += `<div style="padding:10px;margin-bottom:6px;background:var(--bg-secondary);border-radius:6px;cursor:pointer;" onclick="runLocalQualityCheck(${ch.chapter_idx});hideModal('modal');">
                <div style="display:flex;justify-content:space-between;"><span style="font-weight:600;">第${ch.chapter_idx + 1}章</span><div style="display:flex;gap:8px;"><span style="color:${sc(r.overall_score)};">综合${r.overall_score}</span><span style="color:${sc(r.ai_taste_score)};">人味${r.ai_taste_score}</span><span style="color:var(--text-muted);">${r.issues.length}问题</span></div></div></div>`;
        });
        html += '</div>';
        $("#modal-body").innerHTML = html;
    } catch (e) {
        $("#modal-body").innerHTML = `<div style="color:var(--danger);padding:12px;">检查失败: ${e.message}</div>`;
    }
    $("#modal-footer").innerHTML = '<button class="btn btn-ghost" onclick="hideModal(\'modal\')">关闭</button>';
}
