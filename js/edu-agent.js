/**
 * 萤窗星途 · 教育智能体（轻量 Agent）
 * 输出结构化 JSON · 课标护栏 · 知识库 + 内置课内模板
 */
(function (global) {
    const STORAGE_KEY = 'eduAgent_v1';
    const OUT_OF_SCOPE_ANSWER = '该内容属于大学及更高阶段的知识，超出当前学校课程范围。你可以通过大学教材、专业课程等渠道进一步了解。如有幼儿园至高中的课程问题，欢迎继续问我。';

    const STAGES = [
        { id: 'kindergarten', label: '幼儿园', grades: '小班～大班', tone: 'kindergarten' },
        { id: 'primary', label: '小学', grades: '一至六年级', tone: 'primary' },
        { id: 'junior', label: '初中', grades: '初一～初三', tone: 'junior' },
        { id: 'senior', label: '高中', grades: '高一～高三', tone: 'senior' }
    ];

    /** 学段可访问的内容范围（向下包含） */
    const STAGE_SCOPE = {
        kindergarten: ['幼儿园'],
        primary: ['幼儿园', '小学'],
        junior: ['幼儿园', '小学', '初中'],
        senior: ['幼儿园', '小学', '初中', '高中']
    };

    const STAGE_GRADES = {
        kindergarten: [],
        primary: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
        junior: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三'],
        senior: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三']
    };

    const TEXTBOOKS = [
        '暂不指定', '人教版', '北师大版', '苏教版', '外研版', '沪教版',
        '鲁教版', '湘教版', '粤教版', '浙教版', '冀教版'
    ];

    /** 大学/成人超纲 */
    const OUT_OF_SCOPE_KEYWORDS = [
        '考研', '高考志愿', '职教', '专科', '专升本', '成人高考', '公务员',
        '竞赛奥数', '奥数竞赛', '大学课程', '大学物理', '高等数学', '线性代数',
        '早教机构', '兴趣班推销', '培训班招生', '微商', 'http://', 'https://'
    ];

    /** 未成年人不宜行为（非课内科普语境） */
    const HARMFUL_BEHAVIOR_KEYWORDS = [
        '抽烟', '吸烟', '喝酒', '饮酒', '酗酒', '吸毒', '嗑药', '纹身',
        '去酒吧', '泡吧', '打架斗殴', '校园霸凌', '欺凌同学', '欺负同学',
        '网恋', '私奔', '看黄', '色情', '赌博'
    ];

    const HARMFUL_BEHAVIOR_EXCEPTIONS = [
        '危害', '禁止', '健康', '预防', '科普', '化学', '实验', '乙醇', '酒精的',
        '酒精在', '课文', '阅读理解', '历史', '法治', '道法', '为什么不', '不应'
    ];

    /** 娱乐/游戏/明星/广告等非学习话题 */
    const ENTERTAINMENT_KEYWORDS = [
        '明星', '偶像', '饭圈', '综艺', '娱乐圈', '粉丝', '应援', '打投',
        '游戏攻略', '游戏推荐', '哪个游戏好玩', '王者荣耀', '原神', '和平精英',
        '蛋仔派对', '第五人格', '英雄联盟', 'minecraft', '我的世界模组',
        '抖音', '快手', '直播带货', '网红', '博主推荐', '平台哪个好', '平台比较',
        '代购', '广告', '推广', '代言'
    ];

    const ENTERTAINMENT_GAME_PATTERNS = [
        /游戏.*(攻略|推荐|好玩|怎么玩|充值|皮肤)/,
        /(王者|原神|吃鸡|蛋仔|第五人格).*(怎么|攻略|强|厉害)/
    ];

    const ENTERTAINMENT_EXCEPTIONS = [
        '历史', '地理', '科普', '物理', '化学', '生物', '课文', '作文', '数学',
        '学习', '课程', '实验', '自然', '人文', '科学', '阅读'
    ];

    const HARMFUL_BEHAVIOR_ANSWER = '作为面向未成年人的学习助手，我不能支持或指导这类行为。';
    const ENTERTAINMENT_ANSWER = '我是专注学校课程的学习智能助手，暂不解答娱乐、游戏、明星、平台比较、广告等与课内学习无关的话题。你可以问我语文、数学、英语等学科问题，或自然地理、人文科学方面的课内知识。';

    const SCHOOL_SIGNALS = [
        '语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '道法',
        '科学', '拼音', '组词', '造句', '作文', '阅读', '文言文', '古诗', '默写', '翻译',
        '议论文', '说明文', '记叙文', '论点', '论据', '论证', '桃花源', '方程式', '函数',
        '几何', '定理', '公式', '定律', '力学', '电学', '光学', '实验', '元素', '细胞',
        '朝代', '革命', '宪法', '公民', '什么是', '是什么', '为什么', '怎么', '如何',
        '解释', '讲解', '翻译', '分析', '概括', '计算', '证明', '化简', '求解'
    ];

    const SYSTEM_PROMPT = `你是面向未成年学生（幼儿园至高中）的课程学习智能体，所有回答须积极正面、符合未成年人身心健康。

# 核心原则：问什么，完整答什么
- 除命题作文外，必须直接、完整、准确回答，不省略、不截断、不用「节选」「略」代替全文。
- 问全文/原文 → 给出完整原文；问翻译 → 给出完整译文；问解题 → 给出完整过程与最终答案。
- 自然地理、人文历史、科学科普等课内相关内容均可完整解答。
- 不要为了节省篇幅而删减内容。

# 学段范围（向下包含）
- 幼儿园：仅幼儿园；小学：含幼儿园+小学；初中：含幼儿园+小学+初中；高中：含全部中小学内容。

# 作文类（唯一篇幅例外）
- 可给审题思路、结构框架；可给 300～500 字范文片段；禁止代写 600 字以上完整作文。

# 未成年人保护与正面引导
- 服务对象均为未成年人，语气积极、健康、鼓励学习。
- 不涉及、不推荐：抽烟、喝酒、赌博、暴力、色情、早恋等不良行为。
- 不涉及：娱乐明星、粉丝文化、游戏攻略/推荐、短视频平台比较、广告推销等与学习无关内容。
- 若被问及以上内容，礼貌拒绝并引导回到学习话题。

# 安全约束
- 不提供违法有害内容；不收集隐私；不发外链广告；不协助作弊。

# 超纲（大学/成人）
- 大学课程、考研、竞赛奥赛、职业培训等：说明超出中小学范围，建议通过大学教材等渠道了解。

# 输出格式（必须 JSON，无 JSON 外文字）
{
  "answer": "简短引导语，纯文本",
  "cards": [{ "title": "标题", "summary": "摘要", "detail": "正文", "followup": "追问" }]
}

# 排版规则（极其重要）
- 正文必须是纯文本，禁止 Markdown 符号：不要用 #、##、###、**、*、\`、>、[]() 等。
- 标题直接用文字，分段用换行 \\n，强调用「」或 plain text，列表用「1. 2. 3.」或「· 」。
- 卡片 title/summary/detail 均不得出现 ###、** 等符号。

# 卡片
- 内容很长时可分多张卡片（如原文一张、翻译一张），务必保证完整，不截断。

# 语气
亲切、清晰、积极，适合未成年人。`;

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : { settings: null, messages: [], feedback: [] };
        } catch (e) {
            return { settings: null, messages: [], feedback: [] };
        }
    }

    function saveState(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function getSettings() { return loadState().settings; }
    function saveSettings(settings) { const s = loadState(); s.settings = settings; saveState(s); }
    function getMessages() { return loadState().messages || []; }
    function setMessages(messages) { const s = loadState(); s.messages = messages.slice(-40); saveState(s); }

    function appendMessage(role, content, extra) {
        const messages = getMessages();
        const msg = {
            id: 'm' + Date.now() + Math.random().toString(36).slice(2, 6),
            role: role,
            content: content,
            time: new Date().toISOString(),
            extra: extra || null
        };
        messages.push(msg);
        setMessages(messages);
        return msg;
    }

    function clearMessages() { const s = loadState(); s.messages = []; saveState(s); }

    function saveFeedback(messageId, type) {
        const s = loadState();
        s.feedback.push({ messageId, type, time: new Date().toISOString() });
        saveState(s);
    }

    function stageLabel(settings) {
        const s = STAGES.find(x => x.id === settings.stage);
        return s ? s.label : '小学';
    }

    function isOutOfScope(text) {
        const t = (text || '').toLowerCase();
        for (let i = 0; i < OUT_OF_SCOPE_KEYWORDS.length; i++) {
            if (t.indexOf(OUT_OF_SCOPE_KEYWORDS[i].toLowerCase()) >= 0) return true;
        }
        if (/\b大学\b/.test(text) && !/大学生/.test(text)) return true;
        if (/竞赛|奥赛|奥数/.test(text) && !/知识竞赛/.test(text)) return true;
        return false;
    }

    function hasException(text, exceptions) {
        for (let i = 0; i < exceptions.length; i++) {
            if (text.indexOf(exceptions[i]) >= 0) return true;
        }
        return false;
    }

    function isHarmfulBehaviorQuestion(text) {
        if (!text || hasException(text, HARMFUL_BEHAVIOR_EXCEPTIONS)) return false;
        for (let i = 0; i < HARMFUL_BEHAVIOR_KEYWORDS.length; i++) {
            if (text.indexOf(HARMFUL_BEHAVIOR_KEYWORDS[i]) >= 0) return true;
        }
        return false;
    }

    function isEntertainmentQuestion(text) {
        if (!text || hasException(text, ENTERTAINMENT_EXCEPTIONS)) return false;
        for (let i = 0; i < ENTERTAINMENT_KEYWORDS.length; i++) {
            if (text.indexOf(ENTERTAINMENT_KEYWORDS[i]) >= 0) return true;
        }
        for (let j = 0; j < ENTERTAINMENT_GAME_PATTERNS.length; j++) {
            if (ENTERTAINMENT_GAME_PATTERNS[j].test(text)) return true;
        }
        return false;
    }

    function buildHarmfulBehaviorJson(text) {
        let detail = '你提到的话题可能涉及未成年人不宜的行为。作为学习助手，我要提醒你：\n\n';
        if (/抽烟|吸烟/.test(text)) {
            detail += '· 吸烟有害健康，未成年人禁止吸烟。吸烟会损害肺部发育、影响记忆力，也不符合学生行为规范。';
        } else if (/喝酒|饮酒|酗酒/.test(text)) {
            detail += '· 饮酒有害未成年人身心发育，我国法律禁止向未成年人售酒。请以学习为重，远离酒精。';
        } else if (/赌博/.test(text)) {
            detail += '· 赌博违法且危害巨大，未成年人应远离赌博，培养正确金钱观。';
        } else if (/霸凌|欺凌|欺负/.test(text)) {
            detail += '· 校园欺凌是错误行为，可能违法。遇到欺凌请告诉家长或老师，也可寻求法律帮助。';
        } else {
            detail += '· 这类行为不利于身心健康和学业成长，未成年人应遵守校规校纪，做积极阳光的学生。';
        }
        detail += '\n\n如果你有学习上的困惑，或想了解相关健康/法治课内知识，我很乐意帮助你。';
        return buildJsonResponse(HARMFUL_BEHAVIOR_ANSWER, [{
            title: '正面引导',
            summary: '未成年人应健康成长',
            detail: detail,
            followup: '吸烟对青少年有什么危害？（从健康课角度）'
        }]);
    }

    function buildEntertainmentJson() {
        return buildJsonResponse(ENTERTAINMENT_ANSWER, [{
            title: '我能帮你什么',
            summary: '专注课内学习与科普',
            detail: '我可以解答：\n· 语数英等各科课内知识\n· 文言文、古诗、作文\n· 理科公式与解题\n· 自然地理、人文历史等科普与课内内容\n\n请告诉我你的学科或课文篇目吧！',
            followup: '帮我讲解《岳阳楼记》'
        }]);
    }

    function sanitizeMarkdown(text) {
        if (!text) return '';
        return String(text)
            .replace(/^#{1,6}\s*/gm, '')
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\*(.+?)\*/g, '$1')
            .replace(/__(.+?)__/g, '$1')
            .replace(/_(.+?)_/g, '$1')
            .replace(/`(.+?)`/g, '$1')
            .replace(/^\s*>\s?/gm, '')
            .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
            .replace(/^[-*+]\s+/gm, '· ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    function sanitizeParsedResponse(parsed) {
        if (!parsed) return { answer: '', cards: [] };
        parsed.answer = sanitizeMarkdown(parsed.answer);
        if (parsed.cards && parsed.cards.length) {
            parsed.cards = parsed.cards.map(function (c) {
                return {
                    title: sanitizeMarkdown(c.title),
                    summary: sanitizeMarkdown(c.summary),
                    detail: sanitizeMarkdown(c.detail),
                    followup: sanitizeMarkdown(c.followup || '')
                };
            });
        }
        return parsed;
    }

    function getStageGrades(stage) {
        return STAGE_GRADES[stage] || STAGE_GRADES.senior;
    }

    function getStageScopeLabel(stage) {
        const scopes = STAGE_SCOPE[stage] || STAGE_SCOPE.senior;
        return scopes.join('、');
    }

    function isSchoolQuestion(text) {
        if (!text || text.length < 2) return false;
        for (let i = 0; i < SCHOOL_SIGNALS.length; i++) {
            if (text.indexOf(SCHOOL_SIGNALS[i]) >= 0) return true;
        }
        if (/[\u4e00-\u9fa5]{2,}/.test(text) && text.length <= 80) return true;
        if (/[\d+\-×÷=√]/.test(text)) return true;
        return false;
    }

    function buildJsonResponse(answer, cards) {
        return JSON.stringify({ answer: answer, cards: cards || [] });
    }

    function outOfScopeJson() {
        return buildJsonResponse(OUT_OF_SCOPE_ANSWER, []);
    }

    function toneAnswer(settings, juniorText, primaryText, seniorText) {
        const tone = settings.tone || 'primary';
        if (tone === 'kindergarten' || tone === 'primary') return primaryText || juniorText;
        if (tone === 'senior') return seniorText || juniorText;
        return juniorText;
    }

    /** 内置课内模板（优先匹配，问什么答什么） */
    const CURRICULUM_HANDLERS = [
        {
            test: function (t) { return /议论文/.test(t) && /三要素|3要素/.test(t); },
            build: function (settings) {
                return buildJsonResponse(
                    '议论文三要素是：**论点、论据、论证**。下面逐一说明：',
                    [{
                        title: '议论文三要素（直接回答）',
                        summary: '论点 · 论据 · 论证',
                        detail: '**1. 论点**\n作者的观点或主张，必须正确、鲜明、有针对性。例如：「诚信是立身之本」。\n\n**2. 论据**\n用来证明论点的事实或道理。\n· 事实论据：真实事例、数据\n· 道理论据：名言、公理、俗语\n\n**3. 论证**\n运用论据证明论点的过程与方法。\n常见方法：举例论证、道理论证、对比论证、比喻论证。\n\n三者关系：论点是要证明的观点 → 论据是材料 → 论证是联系二者的桥梁。',
                        followup: '怎么在一篇议论文里找出论点？'
                    }]
                );
            }
        },
        {
            test: function (t) { return /桃花源记/.test(t) && /翻译|译文|全文/.test(t); },
            build: function (settings) {
                return buildJsonResponse(
                    '以下是《桃花源记》课内标准全文翻译：',
                    [{
                        title: '《桃花源记》全文翻译',
                        summary: '陶渊明 · 逐段译文',
                        detail: '**【第1段】**\n东晋太元年间，武陵郡有个以捕鱼为业的人。有一天，他沿着溪水行船，忘记了路的远近。忽然遇到一片桃花林，在溪两岸几百步之内，没有别的树，花草鲜艳，落花纷纷。渔人对此感到非常惊奇，继续往前走，想走到林子的尽头。\n\n**【第2段】**\n林子的尽头就是溪水的源头，于是出现一座山，山上有个小洞口，好像有光亮。渔人就从小口进去。起初非常狭窄，仅容一人通过。又走了几十步，突然变得开阔明亮。土地平坦开阔，房屋整齐，有良田、美池和桑竹。田间小路交错相通，村落间能互相听到鸡鸣狗叫。人们在来来往往，男女都穿得像外面的人，老人小孩都自得其乐。\n\n**【第3段】**\n渔人看见这些人，十分震惊，问他们从哪里来。他们回答：「为了躲避战乱，带领妻子儿女和同乡来到这与世隔绝的地方，不再出去，因此就和外面的人断绝了来往。问现在是什么时代，竟然不知道有汉朝，更不必说魏朝和晋朝了。」渔人把听到的话一一告诉了他们，他们都感叹惋惜。其余的人又逐一邀请渔人到自己家，都拿出酒食招待。停留了几天，告辞离开。临走时，里面的人嘱咐：「不要对外面的人说。」\n\n**【第4段】**\n渔人出来后，把发现告诉了郡太守，太守派人随他寻找，却再也找不到原来的路径了。\n\n**【第5段】**\n南阳人刘子骥，是品德高尚的人，听说了这件事，高兴地计划前往，但没有实现，不久就病死了。此后就再也没有探寻桃花源的人了。',
                        followup: '《桃花源记》的重点字词有哪些？'
                    }, {
                        title: '主题思想',
                        summary: '理想社会与对现实的感慨',
                        detail: '通过虚构与世隔绝的「世外桃源」，描绘没有战乱、和平安宁、自给自足的理想社会，寄托作者对美好生活的向往，也暗含对当时社会动荡的批判。',
                        followup: '《桃花源记》用了哪些写作手法？'
                    }]
                );
            }
        },
        {
            test: function (t) { return /桃花源记/.test(t); },
            build: function (settings) {
                return buildJsonResponse(
                    '《桃花源记》是陶渊明名篇。你需要全文翻译、字词解释还是主题分析？',
                    [{
                        title: '重点字词',
                        summary: '课内常考实词虚词',
                        detail: '**缘**（沿着） **异**（不同，感到惊奇） **穷**（尽） **乃**（竟然/就） **津**（渡口） **要**（同「邀」，邀请） **遂**（于是） **无论**（不要说，更不必说） **叹惋**（感叹惋惜） **不足**（不值得） **外人**（指桃花源以外的人）',
                        followup: '桃花源记全文翻译'
                    }]
                );
            }
        },
        {
            test: function (t) { return /勾股定理/.test(t); },
            build: function (settings, text) {
                const isProblem = /题|求|计算|多少|怎么做|第一步|怎么解/.test(text);
                const cards = [{
                    title: '勾股定理（先掌握内容）',
                    summary: 'a² + b² = c²',
                    detail: '**内容**：直角三角形两直角边的平方和等于斜边的平方。\n即若两直角边长为 a、b，斜边长为 c，则 **a² + b² = c²**。\n\n**适用条件**：必须是**直角三角形**。\n\n**逆定理**：若 a² + b² = c²，则该三角形为直角三角形。\n\n**常见用途**：已知两边求第三边；证明垂直；求距离。',
                    followup: '勾股定理怎么用来求边长？'
                }];
                if (isProblem) {
                    cards.push({
                        title: '这类题怎么做（思路与过程）',
                        summary: '识别直角边与斜边 → 列式 → 变形',
                        detail: '**Step 1 审题**：找出直角三角形，标出直角边 a、b 和斜边 c（斜边对着直角）。\n\n**Step 2 列式**：a² + b² = c²\n\n**Step 3 代入**：3² + 4² = c² → 9 + 16 = c² → c² = 25\n\n**Step 4 开方**：c = √25 = **5 cm**\n\n**答案：斜边长为 5 cm**',
                        followup: '请出一道勾股定理的应用题让我练'
                    });
                }
                return buildJsonResponse(
                    isProblem
                        ? '先回顾勾股定理内容，再按步骤解这类题：'
                        : '勾股定理是直角三角形最重要的定理之一：',
                    cards
                );
            }
        },
        {
            test: function (t) { return /命题作文|写一篇|以.*为题|作文题|材料作文/.test(t) && !/全文|代写|800字|1000字/.test(t); },
            build: function (settings, text) {
                return buildJsonResponse(
                    '下面给你审题思路、结构框架，以及一段 300～500 字的写法范例（非完整全文）：',
                    [{
                        title: '审题与结构',
                        summary: '先立意，再布局',
                        detail: '**审题**：抓住题目关键词，确定文体（记叙/议论）和中心思想。\n**结构**：\n· 开头（约 100 字）：点题 + 引入\n· 主体（2～3 段）：事例或论述 + 分析\n· 结尾（约 80 字）：升华主题\n\n⚠️ 以下范例仅示范写法，请在此基础上完成属于你自己的完整作文。',
                        followup: '帮我把开头再写具体一点'
                    }, {
                        title: '范例片段（约 400 字，供参考）',
                        summary: '示范开头 + 主体一段 + 结尾方向',
                        detail: '【示例题目：以「坚持」为题】\n\n（开头）路漫漫其修远兮。成长路上，我们总会遇到看似无法跨越的障碍。然而，正是那份看似普通却无比珍贵的坚持，让无数平凡的人走出了不平凡的路。坚持，不是固执地重复，而是在每一次跌倒后仍选择向前。\n\n（主体）记得初学骑自行车时，我摔了无数次，膝盖上的伤疤成了最直观的记忆。母亲没有替我扶住车尾，只是站在一旁说：「再试一次。」那个下午，我从黄昏练到暮色四合，终于在没有搀扶的情况下骑行了十米。那十米很短，却让我明白：坚持不是天赋，是把「我不会」变成「我可以」的过程。学习中亦是如此，一道数学题解不出，便多换一种思路；一篇作文写不好，便多读一篇范文、多改一遍。\n\n（结尾方向）坚持未必立刻带来成功，但放弃一定无法抵达。愿我们都能在自己的赛道上，把坚持走成风景。\n\n——以上约 400 字，为片段示范，完整作文需你自行补全中间段落并达到要求字数。',
                        followup: '议论文版本的坚持怎么写？'
                    }]
                );
            }
        },
        {
            test: function (t) { return /作文|写作/.test(t) && !/代写|全文|800|1000/.test(t); },
            build: function (settings) {
                return buildJsonResponse(
                    '写作方面我可以帮你：审题思路、结构框架，或 300～500 字范例片段。请告诉我具体题目。',
                    [{
                        title: '通用写作框架',
                        summary: '开头 · 主体 · 结尾',
                        detail: '**记叙文**：写人/写事/写景，要有细节描写和真情实感。\n**议论文**：提出论点 → 列举论据 → 分析论证 → 总结。\n**说明文**：说明对象 + 特征 + 顺序 + 方法。\n\n如需范例，请发具体作文题目，我会给 300～500 字片段示范（非完整全文）。',
                        followup: '以「成长」为题写一篇作文，给我思路和范例'
                    }]
                );
            }
        },
        {
            test: function (t) { return isScienceProblem(t); },
            build: function (settings, text) {
                return buildJsonResponse(
                    '下面是这道理科题的完整解答：',
                    [{
                        title: '解题过程与答案',
                        summary: '审题 → 选规律/公式 → 列式 → 结果',
                        detail: buildScienceProcess(text, settings),
                        followup: '请出一道类似的练习题'
                    }, {
                        title: '易错提醒',
                        summary: '单位、符号、适用条件',
                        detail: '① 确认公式适用条件\n② 统一单位后再计算\n③ 检查结果是否合理',
                        followup: '这类题还有别的解法吗？'
                    }]
                );
            }
        }
    ];

    function isScienceProblem(text) {
        return /[\d+\-×÷=√]|方程|函数|几何|证明|计算|求解|化简|牛顿|定律|浓度|反应|电路|受力/.test(text)
            && /求|多少|怎么|如何|解|算|证明/.test(text);
    }

    function buildScienceProcess(text, settings) {
        let hint = '';
        if (typeof KnowledgeBase !== 'undefined') {
            const hit = KnowledgeBase.searchKnowledgePoints({ q: text, pageSize: 1 });
            if (hit.items.length) hint = '\n关联知识点：' + hit.items[0].name;
        }
        if (/勾股|直角三角形/.test(text)) {
            return '**Step 1** 确认直角三角形，标出 a、b、c。\n**Step 2** 列 a²+b²=c²，代入已知边。\n**Step 3** 化简求未知边。\n**Step 4** 开方得结果。\n\n例：直角边 3、4，求斜边 c → c²=25 → **c=5**' + hint;
        }
        if (/牛顿|F=ma|受力/.test(text)) {
            return '**Step 1** 受力分析，画受力图。\n**Step 2** 选正方向，列 F=ma 或平衡方程。\n**Step 3** 代入已知量，解未知量。\n**Step 4** 写出最终答案（含单位）。' + hint;
        }
        return '**Step 1 审题**：列出已知量和未知量。' + hint + '\n**Step 2 选公式**：根据章节选择规律。\n**Step 3 列式变形**：逐步推导。\n**Step 4 计算**：得出最终答案（含单位）。';
    }

    function isMathLike(text) {
        return /[\d+\-×÷=√]|方程|函数|几何|证明|计算|求解|化简|勾股|牛顿|定律/.test(text);
    }

    function matchCurriculum(text, settings) {
        for (let i = 0; i < CURRICULUM_HANDLERS.length; i++) {
            if (CURRICULUM_HANDLERS[i].test(text)) {
                const result = CURRICULUM_HANDLERS[i].build(settings, text);
                if (result) return result;
            }
        }
        return null;
    }

    function buildKnowledgeJson(text, settings) {
        if (typeof KnowledgeBase === 'undefined') return null;
        if (settings.stage === 'kindergarten') return null;
        const gradesInScope = getStageGrades(settings.stage);
        const searchOpts = { q: text, pageSize: 5 };
        if (gradesInScope.length) searchOpts.gradesInScope = gradesInScope;

        const wiki = KnowledgeBase.searchWiki(text, searchOpts);
        const list = KnowledgeBase.searchKnowledgePoints(searchOpts);
        const kp = (wiki && wiki.point) || (list.items[0] || null);
        if (!kp && !wiki) return null;

        const name = (wiki && wiki.key) || kp.name;
        const desc = (wiki && wiki.content) || kp.desc;
        const cards = [{
            title: name,
            summary: kp.subject + ' · ' + kp.grade + ' · 难度' + kp.difficulty,
            detail: desc,
            followup: '能出一道相关的练习题引导我吗？'
        }];

        if (kp.examTypes && kp.examTypes.length) {
            cards.push({
                title: '常考题型',
                summary: kp.examTypes.map(e => e.type).join('、'),
                detail: kp.examTypes.map(function (e, i) {
                    return (i + 1) + '. 【' + e.type + '】' + e.stem;
                }).join('\n'),
                followup: '第一种题型怎么做？'
            });
        }

        return buildJsonResponse(
            '关于课内知识点「' + name + '」，详细解答如下：',
            cards.slice(0, 3)
        );
    }

    function matchClassicalText(text) {
        if (typeof CurriculumTexts === 'undefined' || !CurriculumTexts.find) return null;
        return CurriculumTexts.find(text);
    }

    function buildClassicalTextJson(item) {
        return buildJsonResponse(
            '以下是' + item.title + '原文（' + item.author + '）：',
            [{
                title: item.title + '原文',
                summary: item.author,
                detail: item.body,
                followup: item.title + '的主题思想是什么？'
            }]
        );
    }

    function buildLocalMissJson(text, apiError) {
        let answer = '本地课内库暂未收录「' + text.slice(0, 36) + (text.length > 36 ? '…' : '') + '」。';
        const cards = [];
        if (apiError) {
            answer = '⚠️ **AI 接口未连通**，当前无法调用智谱 API。\n\n' +
                '你很可能在使用 `npx serve` 静态服务——它**不支持** `/api/chat` 代理。\n\n' +
                '**请改用以下命令启动：**\nnpm install\nnpm run dev\n\n' +
                '然后访问 http://localhost:3000 ，即可使用 AI 回答任意课内问题。\n\n' + answer;
            cards.push({
                title: '如何启用 AI',
                summary: 'npm run dev',
                detail: '1. 在项目文件夹打开终端\n2. 运行 npm install（首次）\n3. 运行 npm run dev\n4. 确保 .dev.vars 中已配置 EDU_API_KEY\n5. 刷新本页面后重试',
                followup: '马说的原文'
            });
        }
        return buildJsonResponse(answer, cards);
    }

    function buildClarifyJson(settings) {
        return buildJsonResponse(
            '为了按课内标准准确回答，请先告诉我：你是几年级（或幼儿园哪个班）？问题出自哪一科、哪篇课文或哪类题目？',
            [{
                title: '请选择学段',
                summary: '可在页面顶部「修改学段」设置',
                detail: '幼儿园 / 小学 / 初中 / 高中\n设置后我会自动调整讲解语气和深度。',
                followup: '我是初中生，想问语文文言文'
            }]
        );
    }

    function localGenerate(userText, settings, apiError) {
        if (isOutOfScope(userText)) {
            return outOfScopeJson();
        }

        const classical = matchClassicalText(userText);
        if (classical) return buildClassicalTextJson(classical);

        const curated = matchCurriculum(userText, settings);
        if (curated) return curated;

        const kb = buildKnowledgeJson(userText, settings);
        if (kb) return kb;

        if (isSchoolQuestion(userText)) {
            return buildLocalMissJson(userText, apiError);
        }

        return buildClarifyJson(settings);
    }

    function getApiConfig() {
        const globalCfg = (typeof window !== 'undefined' && window.EDU_AGENT_CONFIG) ? window.EDU_AGENT_CONFIG : {};
        const settings = getSettings() || {};
        return {
            apiBase: globalCfg.apiBase || settings.apiBase || 'https://open.bigmodel.cn/api/paas/v4',
            apiKey: globalCfg.apiKey || settings.apiKey || '',
            apiModel: globalCfg.apiModel || settings.apiModel || 'glm-4-flash',
            useProxy: !!globalCfg.useProxy,
            proxyUrl: globalCfg.proxyUrl || ''
        };
    }

    function hasApiConfigured() {
        const cfg = getApiConfig();
        return !!(cfg.useProxy && cfg.proxyUrl) || !!(cfg.apiKey && cfg.apiKey.length > 8);
    }

    function hasApiKey() { return hasApiConfigured(); }

    let _apiReady = null;
    let _apiCheckPromise = null;

    async function checkApiHealth(force) {
        if (!hasApiConfigured()) {
            _apiReady = false;
            return false;
        }
        if (!force && _apiCheckPromise) return _apiCheckPromise;

        _apiCheckPromise = (async function () {
            const cfg = getApiConfig();
            try {
                if (cfg.useProxy && cfg.proxyUrl) {
                    const res = await fetch(cfg.proxyUrl, { method: 'OPTIONS' });
                    _apiReady = res.ok;
                    return _apiReady;
                }
                _apiReady = !!(cfg.apiKey && cfg.apiKey.length > 8);
                return _apiReady;
            } catch (e) {
                _apiReady = false;
                return false;
            }
        })();
        return _apiCheckPromise;
    }

    function isApiReady() {
        return _apiReady === true;
    }

    function parseResponse(raw) {
        if (!raw) return { answer: '', cards: [] };
        if (typeof raw === 'object' && raw.answer) return raw;
        const str = String(raw).trim();
        try {
            const obj = JSON.parse(str);
            if (obj && typeof obj.answer === 'string') return obj;
        } catch (e) { /* continue */ }
        const md = str.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (md) {
            try {
                const obj = JSON.parse(md[1].trim());
                if (obj && typeof obj.answer === 'string') return obj;
            } catch (e2) { /* continue */ }
        }
        const brace = str.match(/\{[\s\S]*"answer"[\s\S]*\}/);
        if (brace) {
            try {
                const obj = JSON.parse(brace[0]);
                if (obj && typeof obj.answer === 'string') return obj;
            } catch (e3) { /* continue */ }
        }
        return { answer: str, cards: [] };
    }

    function toStoredContent(parsed) {
        return JSON.stringify({ answer: parsed.answer, cards: parsed.cards || [] });
    }

    async function apiGenerate(userText, settings, history) {
        const apiCfg = getApiConfig();
        if (!hasApiKey()) return null;

        const stageInfo = STAGES.find(s => s.id === settings.stage);
        const scopeLabel = getStageScopeLabel(settings.stage);
        const messages = [{
            role: 'system',
            content: SYSTEM_PROMPT + '\n\n当前学段：' + (stageInfo ? stageInfo.label : '未指定') +
                '。可回答范围：' + scopeLabel + ' 的全部课内内容（向下包含低学段）。' +
                '教材：' + (settings.textbook || '暂不指定') + '。'
        }];
        history.slice(-16).forEach(function (m) {
            if (m.role === 'user') {
                messages.push({ role: 'user', content: m.content });
            } else if (m.role === 'assistant') {
                const parsed = (m.extra && m.extra.parsed) ? m.extra.parsed : parseResponse(m.content);
                messages.push({ role: 'assistant', content: parsed.answer || m.content });
            }
        });
        messages.push({ role: 'user', content: userText });

        const body = {
            model: apiCfg.apiModel,
            messages: messages,
            temperature: 0.5,
            max_tokens: 8192,
            response_format: { type: 'json_object' }
        };

        let res;
        if (apiCfg.useProxy && apiCfg.proxyUrl) {
            res = await fetch(apiCfg.proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } else {
            res = await fetch(apiCfg.apiBase.replace(/\/$/, '') + '/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiCfg.apiKey
                },
                body: JSON.stringify(body)
            });
        }

        if (!res.ok) {
            const errText = await res.text().catch(function () { return ''; });
            throw new Error('API ' + res.status + (errText ? ': ' + errText.slice(0, 120) : ''));
        }
        const data = await res.json();
        const content = data.choices && data.choices[0] && data.choices[0].message
            ? data.choices[0].message.content : null;
        if (!content) throw new Error('API 返回为空');

        const parsed = sanitizeParsedResponse(parseResponse(content));
        if (parsed.answer === OUT_OF_SCOPE_ANSWER && isSchoolQuestion(userText)) {
            return localGenerate(userText, settings, null);
        }
        return toStoredContent(parsed);
    }

    async function chat(userText, options) {
        options = options || {};
        const settings = getSettings();
        if (!settings || !settings.stage) {
            return { needSetup: true, content: buildClarifyJson(settings || {}) };
        }

        if (isHarmfulBehaviorQuestion(userText)) {
            if (!options.skipUserAppend) appendMessage('user', userText, options.extra || null);
            const json = buildHarmfulBehaviorJson(userText);
            const parsed = sanitizeParsedResponse(parseResponse(json));
            appendMessage('assistant', json, { parsed: parsed });
            return { content: json, parsed: parsed };
        }

        if (isEntertainmentQuestion(userText)) {
            if (!options.skipUserAppend) appendMessage('user', userText, options.extra || null);
            const json = buildEntertainmentJson();
            const parsed = sanitizeParsedResponse(parseResponse(json));
            appendMessage('assistant', json, { parsed: parsed });
            return { content: json, parsed: parsed };
        }

        if (isOutOfScope(userText)) {
            if (!options.skipUserAppend) appendMessage('user', userText, options.extra || null);
            const json = outOfScopeJson();
            appendMessage('assistant', json, { parsed: sanitizeParsedResponse(parseResponse(json)) });
            return { content: json, parsed: sanitizeParsedResponse(parseResponse(json)) };
        }

        if (!options.skipUserAppend) {
            appendMessage('user', userText, options.extra || null);
        }
        const history = getMessages();

        let content;
        let apiError = null;
        try {
            content = await apiGenerate(userText, settings, history);
        } catch (e) {
            apiError = e.message || 'API 失败';
            content = null;
        }
        if (!content) {
            content = localGenerate(userText, settings, apiError);
            if (apiError) {
                console.warn('[EduAgent] API 降级为本地引擎:', apiError);
            }
        }

        const parsed = sanitizeParsedResponse(parseResponse(content));
        const reply = appendMessage('assistant', toStoredContent(parsed), { parsed: parsed });
        return { content: toStoredContent(parsed), parsed: parsed, message: reply };
    }

    function formatMessageHtml(text) {
        const clean = sanitizeMarkdown(text || '');
        return clean
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
    }

    function renderCardsHtml(cards) {
        if (!cards || !cards.length) return '';
        return '<div class="agent-cards">' + cards.map(function (c, i) {
            const fu = (c.followup || '').replace(/"/g, '&quot;');
            return '<div class="agent-card">' +
                '<div class="agent-card-head"><strong>' + formatMessageHtml(c.title) + '</strong>' +
                '<span class="agent-card-summary">' + formatMessageHtml(c.summary) + '</span></div>' +
                '<div class="agent-card-detail">' + formatMessageHtml(c.detail) + '</div>' +
                (c.followup ? '<button type="button" class="agent-card-followup" data-followup="' + fu + '">' +
                '<i class="fas fa-reply"></i> ' + formatMessageHtml(c.followup) + '</button>' : '') +
                '</div>';
        }).join('') + '</div>';
    }

    function renderAssistantBubble(msg) {
        let parsed = msg.extra && msg.extra.parsed;
        if (!parsed) parsed = parseResponse(msg.content);
        let html = '<div class="agent-answer-text">' + formatMessageHtml(parsed.answer) + '</div>';
        html += renderCardsHtml(parsed.cards);
        return html;
    }

    global.EduAgent = {
        STAGES: STAGES,
        STAGE_SCOPE: STAGE_SCOPE,
        TEXTBOOKS: TEXTBOOKS,
        SYSTEM_PROMPT: SYSTEM_PROMPT,
        OUT_OF_SCOPE_MSG: OUT_OF_SCOPE_ANSWER,
        getStageGrades: getStageGrades,
        getStageScopeLabel: getStageScopeLabel,
        getSettings: getSettings,
        saveSettings: saveSettings,
        getMessages: getMessages,
        appendMessage: appendMessage,
        clearMessages: clearMessages,
        saveFeedback: saveFeedback,
        isOutOfScope: isOutOfScope,
        isHarmfulBehaviorQuestion: isHarmfulBehaviorQuestion,
        isEntertainmentQuestion: isEntertainmentQuestion,
        sanitizeMarkdown: sanitizeMarkdown,
        sanitizeParsedResponse: sanitizeParsedResponse,
        hasApiKey: hasApiKey,
        hasApiConfigured: hasApiConfigured,
        checkApiHealth: checkApiHealth,
        isApiReady: isApiReady,
        getApiConfig: getApiConfig,
        chat: chat,
        parseResponse: parseResponse,
        formatMessageHtml: formatMessageHtml,
        renderAssistantBubble: renderAssistantBubble
    };
})(typeof window !== 'undefined' ? window : global);
