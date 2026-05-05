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
    ]
};

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
