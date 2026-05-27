// 萤窗星途智慧教育平台 - 通用脚本

const EDU = {
    // 学科列表
    subjects: ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '道德与法治', '科学'],
    grades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三'],
    resourceTypes: ['视频', 'AR实验', '微课', '课件', '习题', '3D模型', 'VR全景']
};

// 模拟数据
const mockData = {
    user: {
        id: 1,
        nickname: '学海启航',
        avatar: '',
        bio: '热爱学习，探索知识星途',
        isTeacher: true,
        verified: true,
        likesCount: 1280,
        favCount: 356,
        followCount: 42,
        fansCount: 518,
        friendsCount: 28
    },
    resources: [
        { id: 1, title: '勾股定理的证明与应用', type: '微课', subject: '数学', grade: '初二', cover: 'img/1.jpg', author: '张老师', verified: true, playCount: 3200, likes: 256 },
        { id: 2, title: '牛顿第二定律AR实验', type: 'AR实验', subject: '物理', grade: '高一', cover: 'img/2.jpg', author: '李老师', verified: true, playCount: 1890, likes: 189 },
        { id: 3, title: '光合作用全过程', type: '视频', subject: '生物', grade: '初一', cover: 'img/3.jpg', author: '王老师', verified: false, playCount: 2100, likes: 312 },
        { id: 4, title: '古代文明遗址VR探秘', type: 'VR全景', subject: '历史', grade: '初一', cover: 'img/4.jpg', author: '陈老师', verified: true, playCount: 980, likes: 156 },
        { id: 5, title: '氧化还原反应方程式', type: '微课', subject: '化学', grade: '高一', cover: 'img/5.jpg', author: '刘老师', verified: true, playCount: 1650, likes: 203 },
        { id: 6, title: '地球运动与昼夜交替', type: 'AR实验', subject: '地理', grade: '初一', cover: 'img/6.jpg', author: '赵老师', verified: true, playCount: 1100, likes: 98 }
    ],
    myLikes: [1, 2, 4],
    myFav: [1, 3, 5],
    cart: [],
    coupons: [
        { id: 1, name: '新人满减券', value: '满50减10', expire: '2026-04-30', used: false },
        { id: 2, name: '精品课折扣', value: '9折', expire: '2026-05-15', used: false }
    ],
    myCourses: [
        { id: 1, name: '高一物理必修一精讲', progress: 35, nextDate: '2026-03-15', total: 20 },
        { id: 2, name: '初二几何证明专题', progress: 80, nextDate: '2026-03-16', total: 12 }
    ],
    knowledgePoints: [
        { id: 1, name: '勾股定理', subject: '数学', grade: '初二', difficulty: '中', prev: ['直角三角形'], next: ['勾股定理逆定理'] },
        { id: 2, name: '牛顿第二定律', subject: '物理', grade: '高一', difficulty: '中', prev: ['牛顿第一定律'], next: ['力学综合'] }
    ],
    // 完整知识库由 js/knowledge-base.js 动态生成（7800 知识点 + 23400 常考题型）
    // 测试账户（手机号 000000）专属学习数据
    testAccount: {
        phone: '000000',
        nickname: '学海启航',
        grade: '初二',
        className: '初二（3）班',
        streak: 5,
        totalStudyHours: 128,
        weeklyStudyHours: [2.5, 1.8, 3.2, 2.0, 2.8, 4.5, 1.2],
        weekLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        subjectScores: [
            { subject: '语文', score: 88, rank: '班级第 12 名', trend: '+2', level: '良好' },
            { subject: '数学', score: 92, rank: '班级第 5 名', trend: '+3', level: '优秀' },
            { subject: '英语', score: 85, rank: '班级第 18 名', trend: '-1', level: '良好' },
            { subject: '物理', score: 90, rank: '班级第 7 名', trend: '+4', level: '优秀' },
            { subject: '化学', score: 87, rank: '班级第 10 名', trend: '+1', level: '良好' },
            { subject: '生物', score: 91, rank: '班级第 6 名', trend: '+2', level: '优秀' }
        ],
        overallScore: 89,
        overallRank: '班级第 8 名',
        notifications: [
            { id: 1, title: '化学实验课提醒', content: '明天 14:00 有「检测食物中的淀粉」实验课，请提前预习相关视频。', time: '今天 09:30', read: false, type: 'course' },
            { id: 2, title: '周学习报告已生成', content: '测试账户「学海启航」本周学习 18.0 小时，综合评定 A-，点击查看详情。', time: '今天 08:00', read: false, type: 'report' },
            { id: 3, title: 'AR 实验创意大赛', content: '全国 AR 实验创意大赛报名已开启，截止日期 04-15，欢迎提交作品。', time: '03-10', read: true, type: 'event' },
            { id: 4, title: '智学助手新功能', content: '智学助手已支持 24 小时答疑与知识点图谱推荐。', time: '03-08', read: true, type: 'system' }
        ],
        todayTasks: [
            { id: 't1', title: '观看「检测食物中的淀粉」实验视频', subject: '化学', done: false, link: 'video-play.html?src=vid%2F化学检测食物中的淀粉.mp4&title=%E9%A3%9F%E7%89%A9%E4%B8%AD%E7%9A%84%E6%B7%80%E7%B2%89%EF%BC%9A%E7%A2%B0%E6%B6%B2%E6%A3%80%E6%B5%8B%E5%AE%9E%E9%AA%8C' },
            { id: 't2', title: '完成初二几何证明专题第 8 讲', subject: '数学', done: true, link: 'profile-courses.html' },
            { id: 't3', title: '复习「含羞草为什么会动」知识点', subject: '生物', done: false, link: 'knowledge-detail.html?id=2' },
            { id: 't4', title: '向智学助手提问：牛顿第二定律应用', subject: '物理', done: false, link: 'assistant.html' }
        ],
        platformNews: [
            { id: 1, title: '全国 AR 实验创意大赛报名开启', date: '03-10', tag: '活动', content: '面向全体测试账户开放报名，提交 AR 实验创意方案即可参与评选，优秀作品将获得平台推荐位展示。', action: '立即报名' },
            { id: 2, title: '智学助手 24 小时答疑上线', date: '03-08', tag: '功能', content: '智学助手现已支持全天候智能答疑，可结合知识点图谱给出个性化学习建议。', action: '去体验' },
            { id: 3, title: '知识秘境多人探秘活动预告', date: '03-05', tag: '游戏', content: '多人协作探秘模式即将上线，与同学组队闯关，赢取学习勋章与积分奖励。', action: '预约提醒' }
        ],
        quickLinks: [
            { icon: 'fa-robot', label: '智学助手', href: 'assistant.html', color: '#4f46e5' },
            { icon: 'fa-vr-cardboard', label: 'AR 学习', href: 'ar-learning.html', color: '#7c3aed' },
            { icon: 'fa-gamepad', label: '知识秘境', href: 'game.html', color: '#db2777' },
            { icon: 'fa-book', label: '我的课程', href: 'profile-courses.html', color: '#0891b2' },
            { icon: 'fa-calendar-alt', label: '学习日历', href: 'profile-calendar.html', color: '#059669' },
            { icon: 'fa-chart-line', label: '智能规划', href: 'profile-plan.html', color: '#d97706' },
            { icon: 'fa-upload', label: '资源上传', href: 'resource-upload.html', color: '#6366f1' },
            { icon: 'fa-user', label: '个人中心', href: 'profile.html', color: '#475569' }
        ]
    }
};

function getTestAccountData() {
    return mockData.testAccount;
}

function getHomeStorageKey(key) {
    const user = getCurrentUser();
    const uid = user && user.id ? user.id : 'guest';
    return 'eduHome_' + uid + '_' + key;
}

function loadHomeState(key, fallback) {
    try {
        const raw = localStorage.getItem(getHomeStorageKey(key));
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
        return fallback;
    }
}

function saveHomeState(key, value) {
    localStorage.setItem(getHomeStorageKey(key), JSON.stringify(value));
}

function showNotification(message, type) {
    type = type || 'info';
    const el = document.createElement('div');
    el.className = `notification ${type} active`;
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    el.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;
    if (type === 'error') {
        const btn = document.createElement('button');
        btn.className = 'notification-close';
        btn.textContent = '×';
        btn.onclick = () => el.remove();
        el.appendChild(btn);
    }
    document.body.appendChild(el);
    if (type !== 'error') {
        setTimeout(() => {
            el.classList.remove('active');
            setTimeout(() => el.remove(), 300);
        }, 2500);
    }
}

function getCurrentUser() {
    const s = sessionStorage.getItem('eduUser');
    return s ? JSON.parse(s) : null;
}

function setCurrentUser(user) {
    sessionStorage.setItem('eduUser', JSON.stringify(user));
}

function logout() {
    sessionStorage.removeItem('eduUser');
    showNotification('已退出登录', 'info');
    setTimeout(() => { window.location.href = 'index.html'; }, 800);
}

function formatDate(d, fmt) {
    if (typeof d === 'string') d = new Date(d);
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0'), min = String(d.getMinutes()).padStart(2, '0');
    if (fmt === 'date') return `${y}-${m}-${day}`;
    return `${y}-${m}-${day} ${h}:${min}`;
}

function getUrlParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function toggleUserMenu() {
    const d = document.getElementById('userDropdown');
    if (d) d.classList.toggle('show');
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.user-menu') && !e.target.closest('.user-dropdown')) {
        const d = document.getElementById('userDropdown');
        if (d) d.classList.remove('show');
    }
});

// 页面加载时：非登录页检查登录状态（登录页、关于页可免登录）
document.addEventListener('DOMContentLoaded', function() {
    const path = (window.location.pathname || '').toLowerCase();
    const isPublic = path.includes('index.html') || path.endsWith('/') || path === '' || path.includes('about.html');
    if (!isPublic && !getCurrentUser()) {
        window.location.href = 'index.html';
    }
});
