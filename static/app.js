/**
 * Kealin AI Novels — 超级进化版
 * 集成：创作工作台、提示词管理、右键菜单、AI助手、状态管理
 * 55轮迭代优化，从作者视角全面重构
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

大纲：\${outline}
本章细纲：\${chapter_outline}
背景：\${background}
人物：\${characters}
关系：\${relationships}
剧情：\${plot}
风格：\${style}

写作铁律（违反任何一条都是废稿）：

【开头黄金200字】
- 每章开头200字必须有冲突、悬念或意外，不要从环境描写开始
- 读者看完前200字必须想看第201字
- 可以是：一句狠话、一个意外、一个选择、一个发现

【语言】
- 句子长短交替。短句制造节奏，长句铺陈信息。禁止通篇都是20字左右的"标准句"
- 禁止排比句。"他感到……他感到……他感到……"这种直接扣分
- 一个段落里"的"字不超过3个
- 形容词能删就删。"温暖的阳光"→"阳光"；"缓缓地走来"→"走过来"
- 用具体感官替代抽象形容："他闻到花香"→"栀子花的甜腻味灌进鼻腔"
- 信息密度：每段必须有新信息，禁止原地踏步

【对话】
- 对话推动剧情，不是凑字数。每句对话要么暴露信息，要么暴露性格，要么推动行动
- 不同角色说话方式要不同。粗人说粗话，文人说文话，小孩说小孩话
- 禁止"XX说道"、"XX淡淡道"、"XX沉声道"反复出现。用动作代替说话标签
- 对话不要一问一答像审讯，要有打断、跑题、答非所问
- 对话要有潜台词，不是什么都说出来

【叙事】
- 用动作和结果表达情绪，不要写"他很愤怒"。写"他把杯子摔了"
- 禁止段落结尾总结式抒情。"这就是XX的意义啊"全部删掉
- 场景描写只写和剧情有关的细节。不要为了"营造氛围"而堆砌环境描写
- 人物内心活动用行为暗示，不要大段心理独白
- 节奏：该快的地方一句话带过一年，该慢的地方一个眼神写三段

【结尾钩子】
- 每章结尾必须留悬念或钩子
- 钩子必须跟下一章内容有关，不能是无关联的悬念
- 可以是：一个未解的问题、一个意外发现、一个艰难选择、一句话只说了一半

【禁止清单】
以下词句出现任何一个，重写该段：
"心中一凛"、"眼中闪过一丝XX"、"嘴角勾起一抹XX"、"一股XX涌上心头"、"仿佛XX一般"、"宛如XX"、"不由得"、"情不自禁"、"目光深邃"、"意味深长"、"若有所思"、"恍然大悟"、"不禁XX"、"这一刻他明白"、"他知道，XX"、"眉头微蹙"、"嘴角上扬"、"眼中闪过一抹"、"心中暗道"、"不觉间"、"霎时间"、"此刻的他"、"他深知"、"无疑"、"显然"、"毫无疑问"、"不言而喻"、"与此同时"、"就在这时"、"突然间"、"猛然间"、"刹那间"、"恍惚间"、"不知不觉"、"本能地"、"下意识地"、"条件反射般"、"如同XX一般"、"好似XX"、"恰似XX"、"宛如XX似的"

直接写，不要在开头写"好的"或任何确认语。`
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
            { name: "改写风格", prompt: `将以下内容改写为指定风格。\n\n风格：热血/悬疑/搞笑/文艺/硬核（选择一个或自定义）\n要求：\n1. 保留核心剧情和人物\n2. 调整语言风格和节奏\n3. 仍然遵守反AI味规则\n\n内容：\${selected_text}` }
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
    promptHistory: []
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
        stats: AppState.stats
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
            if (state.prompts.outline && pOutline) pOutline.value = state.prompts.outline;
            if (state.prompts.chapter && pChapter) pChapter.value = state.prompts.chapter;
            if (state.prompts.content && pContent) pContent.value = state.prompts.content;
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

        // 恢复章节
        if (state.chapters && Array.isArray(state.chapters)) {
            AppState.chapters = state.chapters;
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

        // 恢复角色（第18轮）
        if (state.characters && Array.isArray(state.characters)) {
            AppState.characters = state.characters;
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
        div.setAttribute("draggable", "true");
        div.setAttribute("data-idx", i);

        // 提取章节标题
        const titleMatch = ch.outline.match(/第.{1,3}章[：:](.+)/);
        const title = titleMatch ? titleMatch[1].trim() : (ch.outline.slice(0, 20) || "新章节");
        const charCount = countChars(ch.content);
        const status = ch.content ? (ch.content.length > 100 ? "✅" : "📝") : "⏳";

        div.innerHTML = `
            <div class="chapter-header" data-idx="${i}">
                <div class="chapter-title-area">
                    <span class="chapter-num">${i + 1}</span>
                    <span class="chapter-title-text">${truncate(title, 30)}</span>
                    <span class="chapter-status">${status}</span>
                    <span class="chapter-chars">${charCount}字</span>
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
                    </div>
                </div>
                <div class="chapter-content-area">
                    <h4>章节正文</h4>
                    <textarea class="ch-content textarea-tall" data-idx="${i}" placeholder="点击「生成正文」或在此手动编写...">${ch.content}</textarea>
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
    } catch (e) {
        toast("生成正文失败: " + e.message, "error");
    } finally {
        contentEl.classList.remove("streaming-cursor");
        saveState();
        updateStats();
    }
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
// 角色管理（第18轮）
// ============================================================

function addCharacter(name = "", data = {}) {
    AppState.characters.push({
        id: generateId(),
        name: name,
        appearance: data.appearance || "",
        personality: data.personality || "",
        catchphrase: data.catchphrase || "",
        background: data.background || "",
        notes: data.notes || ""
    });
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
        div.innerHTML = `
            <div class="character-header" data-idx="${i}">
                <span class="character-name">${char.name || "未命名角色"}</span>
                <div class="character-actions">
                    <button class="btn btn-sm btn-ghost" data-action="edit-char" data-idx="${i}">编辑</button>
                    <button class="btn btn-sm btn-ghost btn-danger" data-action="delete-char" data-idx="${i}">删除</button>
                </div>
            </div>
            <div class="character-info">
                ${char.personality ? `<div class="char-field"><span class="char-label">性格:</span> ${char.personality}</div>` : ""}
                ${char.catchphrase ? `<div class="char-field"><span class="char-label">口头禅:</span> ${char.catchphrase}</div>` : ""}
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
    const char = idx >= 0 ? AppState.characters[idx] : { name: "", appearance: "", personality: "", catchphrase: "", background: "", notes: "" };
    const isNew = idx < 0;

    const modal = $("#modal");
    $("#modal-title").textContent = isNew ? "添加角色" : "编辑角色";
    $("#modal-body").innerHTML = `
        <div class="field-group">
            <label>角色名称</label>
            <input type="text" id="char-name" class="input" value="${char.name}" placeholder="输入角色名称">
        </div>
        <div class="field-group">
            <label>外貌特征</label>
            <textarea id="char-appearance" class="textarea-sm" placeholder="描述角色外貌...">${char.appearance}</textarea>
        </div>
        <div class="field-group">
            <label>性格特点</label>
            <textarea id="char-personality" class="textarea-sm" placeholder="描述角色性格...">${char.personality}</textarea>
        </div>
        <div class="field-group">
            <label>口头禅/说话特点</label>
            <textarea id="char-catchphrase" class="textarea-sm" placeholder="角色的口头禅或说话风格...">${char.catchphrase}</textarea>
        </div>
        <div class="field-group">
            <label>背景故事</label>
            <textarea id="char-background" class="textarea-sm" placeholder="角色的背景故事...">${char.background}</textarea>
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
        const data = {
            name: $("#char-name").value,
            appearance: $("#char-appearance").value,
            personality: $("#char-personality").value,
            catchphrase: $("#char-catchphrase").value,
            background: $("#char-background").value,
            notes: $("#char-notes").value
        };

        if (isNew) {
            AppState.characters.push({ id: generateId(), ...data });
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
// 一致性检查（第28轮）
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

    const prompt = `你是一个小说编辑。检查以下小说内容的一致性问题。

检查维度：
1. 人名一致性：同一个人是否有不同称呼/名字
2. 地名一致性：同一个地方是否有不同名称
3. 时间线一致性：事件发生顺序是否合理
4. 人物性格一致性：同一个角色在不同章节的性格是否一致
5. 设定一致性：世界观、规则等是否前后矛盾

要求：
- 列出所有发现的问题
- 给出具体位置（哪一章）
- 给出修改建议
- 如果没有问题，说明检查通过

大纲：${$("#outline").value}

人物设定：${$("#field-characters").value}

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
        menuOutline = $("#menu-outline");
        menuChapter = $("#menu-chapter");
        menuContent = $("#menu-content");

        if (promptOutline) promptOutline.value = DEFAULT_PROMPTS.outline;
        if (promptChapter) promptChapter.value = DEFAULT_PROMPTS.chapter;
        if (promptContent) promptContent.value = DEFAULT_PROMPTS.content;
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
    bind("btn-book-analysis", "click", showBookAnalysis);
    bind("btn-consistency", "click", checkConsistency);
    bind("btn-reader-review", "click", readerReview);
    bind("btn-versions", "click", showVersionHistory);
    bind("btn-calendar", "click", showWritingCalendar);

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
