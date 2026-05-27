// 萤窗星途 · 智学助手知识库（程序化生成）
// 小学 6 年级 × 语数英 × 100；初高 6 年级 × 10 科 × 100；每点 3 道常考题型

(function (global) {
    const PRIMARY_GRADES = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];
    const SECONDARY_GRADES = ['初一', '初二', '初三', '高一', '高二', '高三'];
    const PRIMARY_SUBJECTS = ['语文', '数学', '英语'];
    const SECONDARY_SUBJECTS = ['语文', '数学', '英语', '物理', '化学', '生物', '道德与法治', '历史', '地理'];
    const POINTS_PER_COMBO = 100;
    const EXAM_TYPES_PER_POINT = 3;

    const TOPIC_BANK = {
        '语文': [
            '拼音与声调', '汉字书写', '词语积累', '近义词辨析', '反义词运用', '句子成分', '标点符号', '修辞手法', '段落大意', '中心思想',
            '记叙文阅读', '说明文阅读', '议论文阅读', '文言文实词', '文言文虚词', '古诗词鉴赏', '名著导读', '写作素材', '病句修改', '口语交际',
            '综合性学习', '文学常识', '成语运用', '对联文化', '默写背诵', '非连续性文本', '语言运用', '表达与交流', '梳理与探究', '整本书阅读'
        ],
        '数学': [
            '数的认识', '四则运算', '运算律', '方程基础', '不等式', '函数概念', '一次函数', '二次函数', '几何图形', '三角形',
            '四边形', '圆的性质', '统计图表', '概率初步', '平面直角坐标系', '相似三角形', '勾股定理', '三角函数', '数列', '向量',
            '导数应用', '积分初步', '排列组合', '立体几何', '解析几何', '数学建模', '综合应用', '逻辑推理', '计算技巧', '错题归因'
        ],
        '英语': [
            '字母与音标', '名词单复数', '冠词用法', '代词辨析', '动词时态', '被动语态', '非谓语动词', '从句结构', '词汇辨析', '固定搭配',
            '完形填空', '阅读理解', '七选五', '短文改错', '书面表达', '听力技巧', '口语表达', '词形变化', '情景交际', '语法填空',
            '应用文写作', '读后续写', '概要写作', '词汇拓展', '文化背景', '语音语调', '翻译技巧', '语篇结构', '学习策略', '综合技能'
        ],
        '物理': [
            '长度测量', '密度计算', '力的概念', '牛顿定律', '压强', '浮力', '简单机械', '功和能', '热学基础', '物态变化',
            '声现象', '光现象', '透镜成像', '电路基础', '欧姆定律', '电功率', '磁场', '电磁感应', '运动学', '动力学',
            '曲线运动', '万有引力', '机械振动', '机械波', '电场', '电路分析', '磁场力', '电磁感应应用', '原子物理', '实验探究'
        ],
        '化学': [
            '物质分类', '化学用语', '离子反应', '氧化还原', '化学键', '元素周期律', '化学平衡', '反应速率', '电解质', '溶液浓度',
            '酸碱盐', '金属性质', '非金属', '有机基础', '烃类', '醇酚醛', '羧酸酯', '糖类', '蛋白质', '高分子',
            '实验基本操作', '气体制备', '物质检验', '分离提纯', '原电池', '电解池', '化学与生活', '环境保护', '工业流程', '综合推断'
        ],
        '生物': [
            '细胞结构', '细胞膜', '细胞器', '细胞分裂', '酶与 ATP', '光合作用', '呼吸作用', '细胞分化', '有丝分裂', '减数分裂',
            '遗传规律', '基因表达', 'DNA 复制', '生物进化', '内环境', '神经调节', '体液调节', '免疫', '植物激素', '生态系统',
            '种群群落', '生物多样性', '生物技术', '基因工程', '胚胎工程', '实验设计', '显微镜使用', '代谢综合', '稳态调节', '生物与环境'
        ],
        '道德与法治': [
            '认识自己', '交往礼仪', '家庭美德', '学校生活', '宪法基础', '公民权利', '公民义务', '法律意识', '国情教育', '文化自信',
            '经济生活', '政治生活', '文化生活', '社会建设', '生态文明', '民族团结', '国家安全', '网络素养', '劳动教育', '法治精神',
            '社会主义核心价值观', '民主政治', '市场经济', '哲学思维', '价值选择', '国际视野', '人类命运共同体', '道德实践', '案例分析', '综合探究'
        ],
        '历史': [
            '史前文明', '夏商周', '春秋战国', '秦汉统一', '三国两晋', '隋唐盛世', '宋元经济', '明清政治', '鸦片战争', '洋务运动',
            '戊戌变法', '辛亥革命', '新文化', '抗日战争', '解放战争', '新中国', '改革开放', '世界古代', '文艺复兴', '工业革命',
            '一战二战', '冷战', '当代世界', '史料实证', '时空观念', '历史解释', '家国情怀', '专题复习', '比较分析', '综合论述'
        ],
        '地理': [
            '地球形状', '经纬网', '地图三要素', '地形判读', '气候类型', '河流水文', '人口分布', '城市化', '农业区位', '工业区位',
            '交通布局', '区域差异', '资源开发', '环境保护', '自然灾害', '人口迁移', '产业转移', '国际合作', '中国地形', '中国气候',
            '中国河流', '中国资源', '世界地理', '大洋洲', '欧洲', '美洲', '非洲', '亚洲', '极地地区', '地理实践'
        ]
    };

    const EXAM_TYPE_NAMES = {
        '语文': ['选择题', '阅读理解', '写作/默写'],
        '数学': ['选择题', '填空题', '解答题'],
        '英语': ['单项选择', '完形/阅读', '书面表达'],
        '物理': ['选择题', '实验题', '计算题'],
        '化学': ['选择题', '实验探究', '推断/计算'],
        '生物': ['选择题', '填空简答', '实验分析'],
        '道德与法治': ['选择题', '辨析题', '材料分析'],
        '历史': ['选择题', '材料题', '论述题'],
        '地理': ['选择题', '读图分析', '综合题']
    };

    let _cache = null;
    let _wikiMap = null;

    function topicName(subject, index) {
        const bank = TOPIC_BANK[subject] || TOPIC_BANK['数学'];
        const base = bank[(index - 1) % bank.length];
        const chapter = Math.ceil(index / 10);
        const section = ((index - 1) % 10) + 1;
        return `第${chapter}章·${base}（${section}）`;
    }

    function difficultyFor(index) {
        if (index <= 35) return '易';
        if (index <= 75) return '中';
        return '难';
    }

    function buildDesc(grade, subject, name) {
        return `${grade}${subject}核心知识点「${name}」，涵盖概念理解、典型例题与常考题型归纳，适用于同步复习与备考训练。`;
    }

    function buildExamTypes(subject, grade, name, index) {
        const types = EXAM_TYPE_NAMES[subject] || EXAM_TYPE_NAMES['数学'];
        const short = name.replace(/第\d+章·/, '').replace(/（\d+）$/, '');
        return types.map(function (type, i) {
            const patterns = [
                `考查「${short}」的基本概念与教材原文表述`,
                `结合${grade}典型情境，分析${short}的应用与易错点`,
                `综合运用${short}，完成${grade}${subject}常考综合题`
            ];
            return {
                type: type,
                title: `${grade}${subject}·${type}·${short}`,
                stem: patterns[i],
                tip: `建议先复习${name}，再完成同类${type}专项练习。`
            };
        });
    }

    function generateCombo(grade, subject, startId) {
        const list = [];
        for (let i = 1; i <= POINTS_PER_COMBO; i++) {
            const name = topicName(subject, i);
            const id = startId + i - 1;
            const prevId = i > 1 ? id - 1 : null;
            const nextId = i < POINTS_PER_COMBO ? id + 1 : null;
            list.push({
                id: id,
                name: name,
                subject: subject,
                grade: grade,
                difficulty: difficultyFor(i),
                module: Math.ceil(i / 10),
                desc: buildDesc(grade, subject, name),
                prev: prevId ? [`${grade}${subject}·${topicName(subject, i - 1)}`] : [],
                next: nextId ? [`${grade}${subject}·${topicName(subject, i + 1)}`] : [],
                examTypes: buildExamTypes(subject, grade, name, i)
            });
        }
        return list;
    }

    function generateAll() {
        if (_cache) return _cache;
        const all = [];
        let id = 1;
        PRIMARY_GRADES.forEach(function (grade) {
            PRIMARY_SUBJECTS.forEach(function (subject) {
                const batch = generateCombo(grade, subject, id);
                all.push.apply(all, batch);
                id += POINTS_PER_COMBO;
            });
        });
        SECONDARY_GRADES.forEach(function (grade) {
            SECONDARY_SUBJECTS.forEach(function (subject) {
                const batch = generateCombo(grade, subject, id);
                all.push.apply(all, batch);
                id += POINTS_PER_COMBO;
            });
        });
        _cache = all;
        return _cache;
    }

    function buildWikiMap() {
        if (_wikiMap) return _wikiMap;
        _wikiMap = {};
        generateAll().forEach(function (kp) {
            _wikiMap[kp.name] = kp.desc + ' 常考题型：' + kp.examTypes.map(function (e) { return e.type; }).join('、') + '。';
            const shortKey = kp.name.replace(/第\d+章·/, '').replace(/（\d+）$/, '');
            if (!_wikiMap[shortKey]) _wikiMap[shortKey] = _wikiMap[kp.name];
        });
        return _wikiMap;
    }

    function getKnowledgePointById(id) {
        return generateAll().find(function (k) { return String(k.id) === String(id); }) || null;
    }

    function getStats() {
        const all = generateAll();
        return {
            total: all.length,
            primary: PRIMARY_GRADES.length * PRIMARY_SUBJECTS.length * POINTS_PER_COMBO,
            secondary: SECONDARY_GRADES.length * SECONDARY_SUBJECTS.length * POINTS_PER_COMBO,
            examTypesTotal: all.length * EXAM_TYPES_PER_POINT,
            combos: PRIMARY_GRADES.length * PRIMARY_SUBJECTS.length + SECONDARY_GRADES.length * SECONDARY_SUBJECTS.length
        };
    }

    function searchKnowledgePoints(options) {
        options = options || {};
        const q = (options.q || '').trim().toLowerCase();
        const subject = options.subject || '';
        const grade = options.grade || '';
        const difficulty = options.difficulty || '';
        const page = Math.max(1, options.page || 1);
        const pageSize = Math.min(100, Math.max(10, options.pageSize || 20));

        let list = generateAll();
        if (subject) list = list.filter(function (k) { return k.subject === subject; });
        if (grade) list = list.filter(function (k) { return k.grade === grade; });
        if (difficulty) list = list.filter(function (k) { return k.difficulty === difficulty; });
        if (q) {
            list = list.filter(function (k) {
                return k.name.toLowerCase().indexOf(q) >= 0 ||
                    k.desc.toLowerCase().indexOf(q) >= 0 ||
                    k.subject.indexOf(q) >= 0 ||
                    k.grade.indexOf(q) >= 0;
            });
        }
        const total = list.length;
        const start = (page - 1) * pageSize;
        return {
            items: list.slice(start, start + pageSize),
            total: total,
            page: page,
            pageSize: pageSize,
            totalPages: Math.ceil(total / pageSize) || 1
        };
    }

    function searchWiki(query) {
        const q = (query || '').trim();
        if (!q) return null;
        const map = buildWikiMap();
        const keys = Object.keys(map);
        const exact = keys.find(function (k) { return k === q || k.indexOf(q) >= 0 || q.indexOf(k) >= 0; });
        if (exact) return { key: exact, content: map[exact] };
        const result = searchKnowledgePoints({ q: q, pageSize: 1 });
        if (result.items.length) {
            const kp = result.items[0];
            return { key: kp.name, content: map[kp.name] || kp.desc, point: kp };
        }
        return null;
    }

    function getGradesForFilter() {
        return PRIMARY_GRADES.concat(SECONDARY_GRADES);
    }

    function getSubjectsForFilter(stage) {
        if (stage === 'primary') return PRIMARY_SUBJECTS.slice();
        if (stage === 'secondary') return SECONDARY_SUBJECTS.slice();
        return PRIMARY_SUBJECTS.concat(SECONDARY_SUBJECTS.filter(function (s, i, arr) { return arr.indexOf(s) === i; }));
    }

    const KnowledgeBase = {
        generateAll: generateAll,
        getKnowledgePointById: getKnowledgePointById,
        getStats: getStats,
        searchKnowledgePoints: searchKnowledgePoints,
        searchWiki: searchWiki,
        buildWikiMap: buildWikiMap,
        getGradesForFilter: getGradesForFilter,
        getSubjectsForFilter: getSubjectsForFilter,
        PRIMARY_GRADES: PRIMARY_GRADES,
        SECONDARY_GRADES: SECONDARY_GRADES,
        PRIMARY_SUBJECTS: PRIMARY_SUBJECTS,
        SECONDARY_SUBJECTS: SECONDARY_SUBJECTS
    };

    global.KnowledgeBase = KnowledgeBase;

    if (typeof mockData !== 'undefined') {
        Object.defineProperty(mockData, 'knowledgePoints', {
            get: function () { return generateAll(); },
            configurable: true
        });
    }
})(typeof window !== 'undefined' ? window : global);
