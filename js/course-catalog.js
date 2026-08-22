/**
 * 课程体系 · 按年龄学段分类
 */
(function (global) {
    const SUBJECT_META = {
        '拼音启蒙': { icon: 'fa-font', color: '#f59e0b', desc: '声母韵母与拼读基础' },
        '趣味识字': { icon: 'fa-spell-check', color: '#eab308', desc: '汉字认读与书写入门' },
        '数字认知': { icon: 'fa-sort-numeric-up', color: '#84cc16', desc: '数数、比较与简单运算' },
        '英语启蒙': { icon: 'fa-language', color: '#22c55e', desc: '字母、单词与日常口语' },
        '绘本阅读': { icon: 'fa-book-open', color: '#14b8a6', desc: '图画书阅读与语言表达' },
        '习惯与礼仪': { icon: 'fa-heart', color: '#ec4899', desc: '生活自理与社交礼仪' },
        '音乐律动': { icon: 'fa-music', color: '#a855f7', desc: '节奏感知与儿歌学唱' },
        '美术涂鸦': { icon: 'fa-palette', color: '#f97316', desc: '色彩认知与创意表达' },
        '科学探索': { icon: 'fa-flask', color: '#06b6d4', desc: '观察自然与趣味实验' },
        '体能游戏': { icon: 'fa-running', color: '#ef4444', desc: '大肌肉协调与运动游戏' },
        '语言表达': { icon: 'fa-comments', color: '#8b5cf6', desc: '口头表达与故事复述' },
        '思维训练': { icon: 'fa-puzzle-piece', color: '#6366f1', desc: '观察、记忆与逻辑启蒙' },
        '语文': { icon: 'fa-book', color: '#dc2626', desc: '阅读、写作与古诗文' },
        '数学': { icon: 'fa-calculator', color: '#2563eb', desc: '运算、几何与应用题' },
        '英语': { icon: 'fa-globe', color: '#059669', desc: '词汇、语法与听说读写' },
        '科学': { icon: 'fa-microscope', color: '#0891b2', desc: '自然现象与科学探究' },
        '道德与法治': { icon: 'fa-balance-scale', color: '#7c3aed', desc: '品德修养与法治意识' },
        '音乐': { icon: 'fa-music', color: '#db2777', desc: '乐理、歌唱与鉴赏' },
        '美术': { icon: 'fa-paint-brush', color: '#ea580c', desc: '绘画、设计与审美' },
        '体育': { icon: 'fa-futbol', color: '#16a34a', desc: '体能训练与运动技能' },
        '信息技术': { icon: 'fa-laptop-code', color: '#4f46e5', desc: '计算机基础与数字素养' },
        '物理': { icon: 'fa-atom', color: '#0284c7', desc: '力学、电学与光学' },
        '化学': { icon: 'fa-vial', color: '#9333ea', desc: '物质变化与化学方程式' },
        '生物': { icon: 'fa-dna', color: '#059669', desc: '细胞、遗传与生态系统' },
        '历史': { icon: 'fa-landmark', color: '#b45309', desc: '中外历史与史料分析' },
        '地理': { icon: 'fa-globe-asia', color: '#0d9488', desc: '自然地理与人文地理' },
        '政治': { icon: 'fa-flag', color: '#be123c', desc: '思想政治与国情教育' },
        '自然地理': { icon: 'fa-mountain', color: '#0d9488', desc: '地形气候与自然资源' },
        '天文宇宙': { icon: 'fa-star', color: '#4338ca', desc: '太阳系与宇宙探索' },
        '生命科学': { icon: 'fa-leaf', color: '#15803d', desc: '动植物与人体奥秘' },
        '物理探秘': { icon: 'fa-magnet', color: '#0369a1', desc: '生活中的物理现象' },
        '化学趣味': { icon: 'fa-fire', color: '#c026d3', desc: '趣味化学与小实验' },
        '科技前沿': { icon: 'fa-rocket', color: '#4f46e5', desc: 'AI、航天与新技术' },
        '生态环境': { icon: 'fa-tree', color: '#166534', desc: '环保意识与生态保护' },
        '人文社科': { icon: 'fa-users', color: '#a16207', desc: '社会、文化与公民素养' },
        '科学实验': { icon: 'fa-flask', color: '#0891b2', desc: '动手实验与探究方法' },
        '创新发明': { icon: 'fa-lightbulb', color: '#d97706', desc: '创客思维与发明创造' }
    };

    function meta(name) {
        return SUBJECT_META[name] || { icon: 'fa-book', color: '#6366f1', desc: '精品课程' };
    }

    function course(name, stageId) {
        const m = meta(name);
        return {
            name: name,
            icon: m.icon,
            color: m.color,
            desc: m.desc,
            href: 'subject-detail.html?name=' + encodeURIComponent(name) + '&stage=' + stageId
        };
    }

    const STAGES = [
        {
            id: 'kindergarten',
            label: '幼儿园',
            age: '0～6 岁',
            badge: '小班～大班',
            icon: 'fa-child',
            theme: '#f59e0b',
            intro: '以拼音识字、数字启蒙和绘本阅读为主，培养语言表达与良好习惯。',
            featured: ['拼音启蒙', '趣味识字', '数字认知', '英语启蒙', '绘本阅读', '习惯与礼仪'],
            all: ['拼音启蒙', '趣味识字', '数字认知', '英语启蒙', '绘本阅读', '习惯与礼仪', '音乐律动', '美术涂鸦', '科学探索', '体能游戏', '语言表达', '思维训练']
        },
        {
            id: 'primary',
            label: '小学',
            age: '6～12 岁',
            badge: '一至六年级',
            icon: 'fa-school',
            theme: '#22c55e',
            intro: '覆盖语数英等主干学科，夯实阅读、运算与科学探究基础。',
            featured: ['语文', '数学', '英语', '科学', '道德与法治', '音乐'],
            all: ['语文', '数学', '英语', '科学', '道德与法治', '音乐', '美术', '体育', '信息技术']
        },
        {
            id: 'junior',
            label: '初中',
            age: '13～15 岁',
            badge: '初一～初三',
            icon: 'fa-user-graduate',
            theme: '#3b82f6',
            intro: '衔接小学与高中，系统学习九大学科，注重理解与综合运用。',
            featured: ['语文', '数学', '英语', '物理', '历史', '道德与法治'],
            all: ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '道德与法治', '信息技术']
        },
        {
            id: 'senior',
            label: '高中',
            age: '16～18 岁',
            badge: '高一～高三',
            icon: 'fa-graduation-cap',
            theme: '#6366f1',
            intro: '面向高考体系，六大学科核心课程与选科方向全覆盖。',
            featured: ['语文', '数学', '英语', '物理', '化学', '生物'],
            all: ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理', '信息技术']
        }
    ];

    const SCIENCE = {
        id: 'science',
        label: '科普课程',
        age: '全年龄段',
        badge: '独立分类',
        icon: 'fa-flask',
        theme: '#06b6d4',
        intro: '自然地理、人文科学与科技前沿，拓展课外科普视野。',
        featured: ['自然地理', '天文宇宙', '生命科学', '物理探秘', '化学趣味', '科技前沿'],
        all: ['自然地理', '天文宇宙', '生命科学', '物理探秘', '化学趣味', '科技前沿', '生态环境', '人文社科', '科学实验', '创新发明']
    };

    function getStage(id) {
        if (id === 'science') return SCIENCE;
        return STAGES.find(function (s) { return s.id === id; }) || null;
    }

    function buildCourses(names, stageId) {
        return names.map(function (n) { return course(n, stageId); });
    }

    function renderCourseCard(c) {
        return '<a href="' + c.href + '" class="catalog-course-card" style="--course-color:' + c.color + '">' +
            '<div class="catalog-course-icon"><i class="fas ' + c.icon + '"></i></div>' +
            '<div class="catalog-course-name">' + c.name + '</div>' +
            '<div class="catalog-course-desc">' + c.desc + '</div>' +
            '</a>';
    }

    function renderStageSection(stage, options) {
        options = options || {};
        const showMore = options.showMore !== false;
        const featured = buildCourses(stage.featured, stage.id);
        const cards = featured.map(renderCourseCard).join('');
        const moreBtn = showMore
            ? '<a href="courses-stage.html?stage=' + stage.id + '" class="catalog-more-btn">' +
              '<i class="fas fa-th-large"></i> 更多课程 <span>(' + stage.all.length + ' 门)</span></a>'
            : '';

        return '<section class="catalog-stage-section" id="stage-' + stage.id + '">' +
            '<div class="catalog-stage-head">' +
            '<div class="catalog-stage-title">' +
            '<span class="catalog-stage-icon" style="background:' + stage.theme + '"><i class="fas ' + stage.icon + '"></i></span>' +
            '<div><h2>' + stage.label + '</h2>' +
            '<p class="catalog-stage-age">' + stage.age + ' · ' + stage.badge + '</p></div></div>' +
            moreBtn +
            '</div>' +
            '<p class="catalog-stage-intro">' + stage.intro + '</p>' +
            '<div class="catalog-course-grid">' + cards + '</div>' +
            '</section>';
    }

    function renderScienceSection() {
        const stage = SCIENCE;
        const featured = buildCourses(stage.featured, stage.id);
        return '<section class="catalog-stage-section catalog-science-section" id="stage-science">' +
            '<div class="catalog-stage-head">' +
            '<div class="catalog-stage-title">' +
            '<span class="catalog-stage-icon" style="background:' + stage.theme + '"><i class="fas ' + stage.icon + '"></i></span>' +
            '<div><h2>' + stage.label + '</h2>' +
            '<p class="catalog-stage-age">' + stage.age + ' · ' + stage.badge + '</p></div></div>' +
            '<a href="courses-stage.html?stage=science" class="catalog-more-btn">' +
            '<i class="fas fa-th-large"></i> 更多课程 <span>(' + stage.all.length + ' 门)</span></a>' +
            '</div>' +
            '<p class="catalog-stage-intro">' + stage.intro + '</p>' +
            '<div class="catalog-course-grid">' + featured.map(renderCourseCard).join('') + '</div>' +
            '</section>';
    }

    function renderCatalogPage(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = STAGES.map(function (s) { return renderStageSection(s); }).join('') + renderScienceSection();
    }

    function renderStagePage(containerId, stageId) {
        const el = document.getElementById(containerId);
        const stage = getStage(stageId);
        if (!el || !stage) return;
        const all = buildCourses(stage.all, stage.id);
        el.innerHTML = '<div class="catalog-course-grid catalog-course-grid-full">' +
            all.map(renderCourseCard).join('') + '</div>';
    }

    global.CourseCatalog = {
        STAGES: STAGES,
        SCIENCE: SCIENCE,
        getStage: getStage,
        buildCourses: buildCourses,
        renderCatalogPage: renderCatalogPage,
        renderStagePage: renderStagePage,
        renderCourseCard: renderCourseCard
    };
})(typeof window !== 'undefined' ? window : global);
