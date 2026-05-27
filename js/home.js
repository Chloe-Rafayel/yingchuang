(function () {
    const testData = getTestAccountData();
    const user = getCurrentUser() || mockData.user;

    const featuredResources = [
        { title: '食物中的淀粉：碘液检测实验', type: '视频', subject: '化学', cover: 'img/0001.jpg', author: '萤窗教研组', verified: true, playCount: 2140, video: 'vid/化学检测食物中的淀粉.mp4' },
        { title: '含羞草为什么会动', type: '视频', subject: '生物', cover: 'img/0002.jpg', author: '萤窗教研组', verified: true, playCount: 1890, video: 'vid/生物含羞草为什么会动.mp4' },
        { title: '石油的生成过程', type: '视频', subject: '物理', cover: 'img/0003.jpg', author: '萤窗教研组', verified: true, playCount: 1650, video: 'vid/物理石油的生成过程.mp4' }
    ];
    const latestResources = [
        { title: '为什么鸡蛋不能放进微波炉', type: '视频', subject: '科普', cover: 'img/0004.jpg', author: '萤窗科普', verified: true, playCount: 3420, video: 'vid/科普为什么鸡蛋不能放进微波炉.mp4' },
        { title: '如何预防呼吸道疾病', type: '视频', subject: '科普', cover: 'img/0005.jpg', author: '萤窗科普', verified: true, playCount: 2960, video: 'vid/科普如何预防呼吸道疾病.mp4' },
        { title: '纸巾过滤小实验', type: '视频', subject: '科普', cover: 'img/0006.jpg', author: '萤窗科普', verified: true, playCount: 1780, video: 'vid/科普纸巾过滤.mp4' }
    ];

    let notifications = loadHomeState('notifications', testData.notifications.slice());
    let taskState = loadHomeState('tasks', {});
    let activeSubjectFilter = '全部';
    let activeScoreSubject = testData.subjectScores[0].subject;

    function greeting() {
        const h = new Date().getHours();
        if (h < 12) return '上午好';
        if (h < 18) return '下午好';
        return '晚上好';
    }

    function todayKey() {
        return formatDate(new Date(), 'date');
    }

    function renderResourceCard(r) {
        const href = r.video
            ? `video-play.html?src=${encodeURIComponent(r.video)}&title=${encodeURIComponent(r.title)}`
            : `resource-detail.html?id=${r.id}`;
        return `<a href="${href}" class="resource-card">
            <img class="cover" src="${r.cover}" alt="" onerror="this.src='img/0001.jpg'">
            <div class="info">
                <div class="title">${r.title}</div>
                <div class="meta">
                    <span>${r.type}</span>
                    <span>${r.subject}</span>
                    <span><i class="fas fa-play"></i> ${(r.playCount / 1000).toFixed(1)}k</span>
                </div>
            </div>
        </a>`;
    }

    function filterResources(list) {
        if (activeSubjectFilter === '全部') return list;
        return list.filter(r => r.subject === activeSubjectFilter);
    }

    function renderResourceLists() {
        const featuredEl = document.getElementById('featuredList');
        const latestEl = document.getElementById('latestList');
        if (featuredEl) {
            const list = filterResources(featuredResources);
            featuredEl.innerHTML = list.length
                ? list.map(renderResourceCard).join('')
                : '<div class="empty-state" style="grid-column:1/-1;padding:24px;"><i class="fas fa-inbox"></i><p>该学科暂无资源</p></div>';
        }
        if (latestEl) {
            latestEl.innerHTML = latestResources.map(renderResourceCard).join('');
        }
    }

    function initWelcome() {
        const name = user.nickname || testData.nickname;
        const greetEl = document.getElementById('welcomeGreet');
        const userEl = document.getElementById('welcomeUser');
        const metaEl = document.getElementById('welcomeMeta');
        const nameHeader = document.getElementById('userName');
        if (greetEl) greetEl.textContent = greeting();
        if (userEl) userEl.textContent = name;
        if (nameHeader) nameHeader.textContent = name;
        if (metaEl) {
            metaEl.textContent = `${testData.grade} · ${testData.className} · 测试账户 ${testData.phone}`;
        }
    }

    function getCheckinState() {
        return loadHomeState('checkin', { date: '', streak: testData.streak });
    }

    function saveCheckinState(state) {
        saveHomeState('checkin', state);
    }

    function initCheckin() {
        const btn = document.getElementById('checkinBtn');
        const streakEl = document.getElementById('statStreak');
        const state = getCheckinState();
        const today = todayKey();
        if (streakEl) streakEl.textContent = state.streak;
        if (!btn) return;
        if (state.date === today) {
            btn.classList.add('checked');
            btn.innerHTML = '<i class="fas fa-check"></i> 今日已签到';
        } else {
            btn.addEventListener('click', function () {
                const cur = getCheckinState();
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yKey = formatDate(yesterday, 'date');
                let streak = cur.streak || testData.streak;
                if (cur.date === yKey) streak += 1;
                else if (cur.date !== today) streak = Math.max(streak, 1);
                const next = { date: today, streak: streak };
                saveCheckinState(next);
                btn.classList.add('checked');
                btn.innerHTML = '<i class="fas fa-check"></i> 今日已签到';
                if (streakEl) streakEl.textContent = streak;
                showNotification('签到成功！连续学习 ' + streak + ' 天', 'success');
            });
        }
    }

    function initStats() {
        const weekTotal = testData.weeklyStudyHours.reduce((a, b) => a + b, 0).toFixed(1);
        document.getElementById('statWeekHours').textContent = weekTotal + 'h';
        document.getElementById('statOverallScore').textContent = testData.overallScore;
        document.getElementById('statRank').textContent = testData.overallRank.replace('班级第 ', '#').replace(' 名', '');
        document.getElementById('statCourses').textContent = mockData.myCourses.length;

        document.querySelectorAll('.home-stat-card').forEach(card => {
            card.addEventListener('click', function () {
                const type = this.dataset.stat;
                if (type === 'score') openReportModal();
                else if (type === 'week') document.getElementById('analyticsSection').scrollIntoView({ behavior: 'smooth' });
                else if (type === 'course') window.location.href = 'profile-courses.html';
                else if (type === 'streak') showNotification('已连续学习 ' + (getCheckinState().streak || testData.streak) + ' 天，继续保持！', 'info');
            });
        });
    }

    function initQuickLinks() {
        const grid = document.getElementById('quickLinksGrid');
        if (!grid) return;
        grid.innerHTML = testData.quickLinks.map(item =>
            `<a href="${item.href}" class="home-quick-item">
                <div class="home-quick-icon" style="background:${item.color};"><i class="fas ${item.icon}"></i></div>
                <span>${item.label}</span>
            </a>`
        ).join('');
    }

    function initContinueLearning() {
        const wrap = document.getElementById('continueLearningList');
        if (!wrap) return;
        wrap.innerHTML = mockData.myCourses.map(c =>
            `<div class="home-course-card" data-href="profile-courses.html">
                <div class="home-course-top">
                    <div class="home-course-title">${c.name}</div>
                    <span class="tag tag-primary">${c.progress}%</span>
                </div>
                <div style="font-size:12px;color:var(--text-muted);">下次学习：${c.nextDate} · 共 ${c.total} 讲</div>
                <div class="home-progress-bar"><div class="home-progress-fill" style="width:${c.progress}%;"></div></div>
            </div>`
        ).join('');
        wrap.querySelectorAll('.home-course-card').forEach(card => {
            card.addEventListener('click', () => window.location.href = card.dataset.href);
        });
    }

    function initChart() {
        const chart = document.getElementById('weeklyChart');
        const tip = document.getElementById('chartTip');
        if (!chart) return;
        const max = Math.max(...testData.weeklyStudyHours, 1);
        chart.innerHTML = testData.weekLabels.map((day, i) => {
            const hrs = testData.weeklyStudyHours[i];
            const pct = Math.max(8, (hrs / max) * 100);
            return `<div class="home-chart-bar" data-day="${day}" data-hrs="${hrs}">
                <span class="hrs">${hrs}h</span>
                <div class="bar" style="height:${pct}%;"></div>
                <span class="day">${day}</span>
            </div>`;
        }).join('');
        chart.querySelectorAll('.home-chart-bar').forEach(bar => {
            bar.addEventListener('click', function () {
                chart.querySelectorAll('.home-chart-bar').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                if (tip) tip.textContent = `${this.dataset.day} 学习 ${this.dataset.hrs} 小时（测试账户数据）`;
            });
        });
        if (tip) tip.textContent = '点击柱状图查看每日学习时长';
    }

    function renderScoreList() {
        const list = document.getElementById('scoreList');
        const detail = document.getElementById('scoreDetail');
        if (!list) return;
        list.innerHTML = testData.subjectScores.map(s => {
            const trendClass = s.trend.startsWith('+') ? 'up' : (s.trend.startsWith('-') ? 'down' : '');
            return `<div class="home-score-item ${s.subject === activeScoreSubject ? 'active' : ''}" data-subject="${s.subject}">
                <span class="subject">${s.subject}</span>
                <div class="bar-wrap"><div class="bar-fill" style="width:${s.score}%;"></div></div>
                <span class="score">${s.score}</span>
                <span class="trend ${trendClass}">${s.trend}</span>
            </div>`;
        }).join('');
        list.querySelectorAll('.home-score-item').forEach(item => {
            item.addEventListener('click', function () {
                activeScoreSubject = this.dataset.subject;
                renderScoreList();
            });
        });
        const cur = testData.subjectScores.find(s => s.subject === activeScoreSubject);
        if (detail && cur) {
            detail.innerHTML = `<strong>${cur.subject}</strong> · 得分 ${cur.score} 分 · ${cur.level}<br>
                <span style="color:var(--text-muted);font-size:13px;">${cur.rank} · 较上周 ${cur.trend} 分</span>`;
        }
    }

    function getTasks() {
        return testData.todayTasks.map(t => ({
            ...t,
            done: taskState[t.id] !== undefined ? taskState[t.id] : t.done
        }));
    }

    function saveTasks(tasks) {
        tasks.forEach(t => { taskState[t.id] = t.done; });
        saveHomeState('tasks', taskState);
    }

    function renderTasks() {
        const list = document.getElementById('taskList');
        const countEl = document.getElementById('taskProgress');
        if (!list) return;
        const tasks = getTasks();
        const doneCount = tasks.filter(t => t.done).length;
        if (countEl) countEl.textContent = `${doneCount}/${tasks.length} 已完成`;
        list.innerHTML = tasks.map(t =>
            `<li class="home-task-item ${t.done ? 'done' : ''}" data-id="${t.id}">
                <div class="home-task-check ${t.done ? 'checked' : ''}" data-id="${t.id}">${t.done ? '<i class="fas fa-check"></i>' : ''}</div>
                <div class="home-task-body">
                    <div class="home-task-title ${t.done ? 'done-text' : ''}">${t.title}</div>
                    <div class="home-task-meta">${t.subject}</div>
                </div>
                <span class="home-task-go" data-link="${t.link}">去学习 <i class="fas fa-chevron-right" style="font-size:10px;"></i></span>
            </li>`
        ).join('');

        list.querySelectorAll('.home-task-check').forEach(check => {
            check.addEventListener('click', function (e) {
                e.stopPropagation();
                const id = this.dataset.id;
                const tasks = getTasks();
                const task = tasks.find(x => x.id === id);
                if (task) {
                    task.done = !task.done;
                    saveTasks(tasks);
                    renderTasks();
                    showNotification(task.done ? '任务已完成' : '已取消完成', task.done ? 'success' : 'info');
                }
            });
        });
        list.querySelectorAll('.home-task-go').forEach(go => {
            go.addEventListener('click', function (e) {
                e.stopPropagation();
                window.location.href = this.dataset.link;
            });
        });
    }

    function initSubjectFilter() {
        const subjects = ['全部', '化学', '生物', '物理', '科普'];
        const wrap = document.getElementById('subjectFilterChips');
        if (!wrap) return;
        wrap.innerHTML = subjects.map(s =>
            `<button type="button" class="home-chip ${s === activeSubjectFilter ? 'active' : ''}" data-subject="${s}">${s}</button>`
        ).join('');
        wrap.querySelectorAll('.home-chip').forEach(chip => {
            chip.addEventListener('click', function () {
                activeSubjectFilter = this.dataset.subject;
                wrap.querySelectorAll('.home-chip').forEach(c => c.classList.toggle('active', c.dataset.subject === activeSubjectFilter));
                renderResourceLists();
            });
        });
    }

    function initSubjects() {
        const subjects = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理'];
        const grid = document.getElementById('subjectGrid');
        if (!grid) return;
        grid.innerHTML = subjects.map(s =>
            `<a href="subject-detail.html?name=${encodeURIComponent(s)}" class="card" style="text-align:center;padding:16px;">
                <i class="fas fa-book-open" style="font-size:28px;color:var(--primary);margin-bottom:8px;"></i>
                <div class="card-title">${s}</div>
            </a>`
        ).join('');
    }

    function initPlatformNews() {
        const list = document.getElementById('newsList');
        if (!list) return;
        list.innerHTML = testData.platformNews.map(n =>
            `<li class="home-news-item" data-id="${n.id}">
                <div class="home-news-top">
                    <div><span class="home-news-tag">${n.tag}</span><span class="home-news-title">${n.title}</span></div>
                    <span class="home-news-date">${n.date}</span>
                </div>
            </li>`
        ).join('');
        list.querySelectorAll('.home-news-item').forEach(item => {
            item.addEventListener('click', function () {
                const news = testData.platformNews.find(n => n.id === Number(this.dataset.id));
                if (!news) return;
                openNewsModal(news);
            });
        });
    }

    function openNewsModal(news) {
        const modal = document.getElementById('newsModal');
        document.getElementById('newsModalTitle').textContent = news.title;
        document.getElementById('newsModalBody').innerHTML = `
            <p style="color:var(--text-muted);font-size:13px;margin-bottom:12px;">${news.date} · ${news.tag}</p>
            <p>${news.content}</p>`;
        const actionBtn = document.getElementById('newsModalAction');
        actionBtn.textContent = news.action;
        actionBtn.onclick = function () {
            if (news.tag === '活动') showNotification('报名成功！测试账户「学海启航」已登记参赛', 'success');
            else if (news.tag === '功能') window.location.href = 'assistant.html';
            else showNotification('已设置活动提醒，开始前将通知测试账户', 'success');
            closeModal('newsModal');
        };
        modal.classList.add('active');
    }

    function buildReportHtml() {
        const checkin = getCheckinState();
        const tasks = getTasks();
        const weekTotal = testData.weeklyStudyHours.reduce((a, b) => a + b, 0).toFixed(1);
        const doneTasks = tasks.filter(t => t.done).length;
        const rows = testData.subjectScores.map(s =>
            `<tr><td>${s.subject}</td><td>${s.score}</td><td>${s.level}</td><td>${s.rank}</td><td>${s.trend}</td></tr>`
        ).join('');
        return `
            <div class="home-report-body">
                <p><strong>账户：</strong>${testData.nickname}（测试账户 ${testData.phone}）</p>
                <p><strong>班级：</strong>${testData.grade} · ${testData.className}</p>
                <p><strong>报告周期：</strong>${formatDate(new Date(), 'date')} 周学习报告</p>
                <div style="display:flex;align-items:center;gap:16px;margin:12px 0;">
                    <div class="home-report-grade">A-</div>
                    <div>
                        <div style="font-size:18px;font-weight:700;">综合评定 A-</div>
                        <div style="font-size:13px;color:var(--text-muted);">综合得分 ${testData.overallScore} · ${testData.overallRank}</div>
                    </div>
                </div>
                <h4>本周学习概况</h4>
                <ul style="padding-left:18px;font-size:13px;color:var(--text-muted);">
                    <li>本周累计学习 ${weekTotal} 小时</li>
                    <li>连续签到 ${checkin.streak || testData.streak} 天</li>
                    <li>今日任务完成 ${doneTasks}/${tasks.length} 项</li>
                    <li>进行中课程 ${mockData.myCourses.length} 门</li>
                </ul>
                <h4>各科成绩明细</h4>
                <table class="home-report-table">
                    <thead><tr><th>学科</th><th>分数</th><th>等级</th><th>排名</th><th>变化</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                <h4>学习建议</h4>
                <p style="font-size:13px;color:var(--text-muted);">英语较上周略有下降，建议增加每日 15 分钟听力练习；化学、物理实验表现优秀，可继续通过 AR 实验巩固；数学、生物保持当前学习节奏即可。</p>
            </div>`;
    }

    function openReportModal() {
        document.getElementById('reportModalBody').innerHTML = buildReportHtml();
        document.getElementById('reportModal').classList.add('active');
    }

    function downloadReport() {
        const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>学海启航-周学习报告</title>
            <style>body{font-family:Microsoft YaHei,sans-serif;padding:32px;color:#1e293b;line-height:1.7;}
            table{border-collapse:collapse;width:100%;margin-top:12px;} th,td{border:1px solid #e2e8f0;padding:8px;text-align:left;}
            th{background:#f1f5f9;} h2{color:#4f46e5;}</style></head><body>
            <h2>萤窗星途 · 周学习报告</h2>${buildReportHtml()}</body></html>`;
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `学海启航-周学习报告-${todayKey()}.html`;
        a.click();
        URL.revokeObjectURL(a.href);
        showNotification('报告已下载（HTML 格式）', 'success');
    }

    function closeModal(id) {
        document.getElementById(id).classList.remove('active');
    }

    function initModals() {
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', function () {
                closeModal(this.dataset.closeModal);
            });
        });
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', function (e) {
                if (e.target === this) this.classList.remove('active');
            });
        });
        const reportBtn = document.getElementById('btnGenerateReport');
        const heroReport = document.getElementById('heroReportBtn');
        const downloadBtn = document.getElementById('btnDownloadReport');
        if (reportBtn) reportBtn.addEventListener('click', openReportModal);
        if (heroReport) heroReport.addEventListener('click', openReportModal);
        if (downloadBtn) downloadBtn.addEventListener('click', downloadReport);

        const heroStart = document.getElementById('heroStartBtn');
        if (heroStart) heroStart.addEventListener('click', () => {
            document.getElementById('continueSection').scrollIntoView({ behavior: 'smooth' });
        });
    }

    function getUnreadCount() {
        return notifications.filter(n => !n.read).length;
    }

    function updateNotifyBadge() {
        const badge = document.getElementById('notifyBadge');
        const count = getUnreadCount();
        if (!badge) return;
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    function renderNotifications() {
        const list = document.getElementById('notifyList');
        if (!list) return;
        list.innerHTML = notifications.length ? notifications.map(n =>
            `<div class="home-notify-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
                <div class="ntitle">${n.title}</div>
                <div class="ncontent">${n.content}</div>
                <div class="ntime">${n.time}</div>
            </div>`
        ).join('') : '<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px;">暂无通知</div>';

        list.querySelectorAll('.home-notify-item').forEach(item => {
            item.addEventListener('click', function () {
                const id = Number(this.dataset.id);
                const n = notifications.find(x => x.id === id);
                if (n) {
                    n.read = true;
                    saveHomeState('notifications', notifications);
                    updateNotifyBadge();
                    renderNotifications();
                    if (n.type === 'report') openReportModal();
                    else if (n.type === 'course') window.location.href = featuredResources[0].video
                        ? `video-play.html?src=${encodeURIComponent(featuredResources[0].video)}&title=${encodeURIComponent(featuredResources[0].title)}`
                        : 'profile-courses.html';
                    else showNotification(n.title, 'info');
                }
            });
        });
    }

    function initNotifications() {
        const icon = document.getElementById('notifyIcon');
        const panel = document.getElementById('notifyPanel');
        const clearBtn = document.getElementById('notifyClearAll');
        updateNotifyBadge();
        renderNotifications();

        if (icon && panel) {
            icon.addEventListener('click', function (e) {
                e.stopPropagation();
                panel.classList.toggle('show');
                document.getElementById('searchDropdown').classList.remove('show');
            });
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                notifications.forEach(n => { n.read = true; });
                saveHomeState('notifications', notifications);
                updateNotifyBadge();
                renderNotifications();
                showNotification('已全部标记为已读', 'success');
            });
        }
    }

        function initSearch() {
            const input = document.getElementById('globalSearch');
            const dropdown = document.getElementById('searchDropdown');
            if (!input || !dropdown) return;

            function getKnowledgeItems(keyword) {
                if (typeof KnowledgeBase === 'undefined') return [];
                return KnowledgeBase.searchKnowledgePoints({ q: keyword, pageSize: 5 }).items.map(k => ({
                    title: k.name, subject: k.subject, kind: '知识点', link: `knowledge-detail.html?id=${k.id}`
                }));
            }

            function buildAllItems(keyword) {
                return [
                    ...featuredResources.map(r => ({ ...r, kind: '视频' })),
                    ...latestResources.map(r => ({ ...r, kind: '视频' })),
                    ...mockData.resources.map(r => ({ ...r, kind: r.type })),
                    ...getKnowledgeItems(keyword)
                ];
            }

            function doSearch(keyword) {
                const kw = keyword.trim().toLowerCase();
                if (!kw) {
                    dropdown.classList.remove('show');
                    return;
                }
                const allItems = buildAllItems(kw);
                const results = allItems.filter(item =>
                    (item.title && item.title.toLowerCase().includes(kw)) ||
                    (item.subject && item.subject.toLowerCase().includes(kw))
                ).slice(0, 8);

            if (!results.length) {
                dropdown.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:13px;">未找到相关内容</div>';
            } else {
                dropdown.innerHTML = results.map(item => {
                    const href = item.video
                        ? `video-play.html?src=${encodeURIComponent(item.video)}&title=${encodeURIComponent(item.title)}`
                        : (item.link || `resource-detail.html?id=${item.id}`);
                    return `<div class="home-search-item" data-href="${href}">
                        <div class="icon"><i class="fas fa-${item.video ? 'play' : (item.kind === '知识点' ? 'lightbulb' : 'book')}"></i></div>
                        <div><div class="title">${item.title}</div><div class="meta">${item.kind} · ${item.subject || ''}</div></div>
                    </div>`;
                }).join('');
                dropdown.querySelectorAll('.home-search-item').forEach(el => {
                    el.addEventListener('click', () => window.location.href = el.dataset.href);
                });
            }
            dropdown.classList.add('show');
        }

        input.addEventListener('input', function () { doSearch(this.value); });
        input.addEventListener('focus', function () { if (this.value.trim()) doSearch(this.value); });
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const first = dropdown.querySelector('.home-search-item');
                if (first) window.location.href = first.dataset.href;
                else if (this.value.trim()) window.location.href = 'assistant.html?q=' + encodeURIComponent(this.value.trim());
            }
        });
    }

    function initGlobalClickClose() {
        document.addEventListener('click', function (e) {
            const panel = document.getElementById('notifyPanel');
            const dropdown = document.getElementById('searchDropdown');
            if (panel && !e.target.closest('#notifyIcon') && !e.target.closest('#notifyPanel')) {
                panel.classList.remove('show');
            }
            if (dropdown && !e.target.closest('.search-box')) {
                dropdown.classList.remove('show');
            }
        });
    }

    function initLearningTools() {
        // Tab 切换
        const tabMap = {
            timer: 'toolPanelTimer',
            wrongbook: 'toolPanelWrongbook',
            countdown: 'toolPanelCountdown',
            quiz: 'toolPanelQuiz',
            notes: 'toolPanelNotes'
        };
        document.querySelectorAll('.home-tools-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                document.querySelectorAll('.home-tools-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.home-tools-panel').forEach(p => p.classList.remove('active'));
                this.classList.add('active');
                const panel = document.getElementById(tabMap[this.dataset.tool]);
                if (panel) panel.classList.add('active');
            });
        });

        // 1. 学习计时器
        let timerMinutes = 25;
        let timerSeconds = 0;
        let timerTotalSec = 25 * 60;
        let timerRemaining = timerTotalSec;
        let timerInterval = null;
        let timerRunning = false;

        function formatTimer(sec) {
            const m = Math.floor(sec / 60);
            const s = sec % 60;
            return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        }

        function updateTimerDisplay() {
            document.getElementById('timerDisplay').textContent = formatTimer(timerRemaining);
        }

        function getTimerLogState() {
            return loadHomeState('timerLog', { date: '', minutes: 0 });
        }

        function saveTimerLog(minutes) {
            const today = todayKey();
            const state = getTimerLogState();
            if (state.date !== today) state.minutes = 0;
            state.date = today;
            state.minutes += minutes;
            saveHomeState('timerLog', state);
            document.getElementById('timerLog').textContent =
                '今日已累计专注 ' + state.minutes + ' 分钟（测试账户）';
        }

        function renderTimerLog() {
            const state = getTimerLogState();
            const mins = state.date === todayKey() ? state.minutes : 0;
            document.getElementById('timerLog').textContent =
                '今日已累计专注 ' + mins + ' 分钟（测试账户）';
        }

        function resetTimer() {
            clearInterval(timerInterval);
            timerInterval = null;
            timerRunning = false;
            timerRemaining = timerTotalSec;
            updateTimerDisplay();
            document.getElementById('timerStartBtn').innerHTML = '<i class="fas fa-play"></i> 开始';
        }

        document.querySelectorAll('.timer-preset').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.timer-preset').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                timerMinutes = Number(this.dataset.min);
                timerTotalSec = timerMinutes * 60;
                resetTimer();
            });
        });

        document.getElementById('timerStartBtn').addEventListener('click', function () {
            if (timerRunning) return;
            if (timerRemaining <= 0) timerRemaining = timerTotalSec;
            timerRunning = true;
            this.innerHTML = '<i class="fas fa-play"></i> 进行中';
            timerInterval = setInterval(function () {
                timerRemaining--;
                updateTimerDisplay();
                if (timerRemaining <= 0) {
                    clearInterval(timerInterval);
                    timerRunning = false;
                    saveTimerLog(timerMinutes);
                    showNotification('专注时间到！已记录 ' + timerMinutes + ' 分钟', 'success');
                    document.getElementById('timerStartBtn').innerHTML = '<i class="fas fa-play"></i> 开始';
                    timerRemaining = timerTotalSec;
                    updateTimerDisplay();
                }
            }, 1000);
        });

        document.getElementById('timerPauseBtn').addEventListener('click', function () {
            if (!timerRunning) return;
            clearInterval(timerInterval);
            timerRunning = false;
            document.getElementById('timerStartBtn').innerHTML = '<i class="fas fa-play"></i> 继续';
        });

        document.getElementById('timerResetBtn').addEventListener('click', resetTimer);
        renderTimerLog();
        updateTimerDisplay();

        // 2. 错题本
        function getWrongBook() {
            return loadHomeState('wrongBook', [
                { id: 'w1', subject: '数学', title: '勾股定理求边长', reason: '忘记开平方', reviewed: false, time: '2026-03-10' },
                { id: 'w2', subject: '英语', title: '一般过去时填空', reason: '不规则动词拼写错误', reviewed: true, time: '2026-03-09' }
            ]);
        }

        function saveWrongBook(list) {
            saveHomeState('wrongBook', list);
        }

        function renderWrongBook() {
            const list = getWrongBook();
            const el = document.getElementById('wrongBookList');
            if (!list.length) {
                el.innerHTML = '<li style="text-align:center;color:var(--text-muted);font-size:13px;padding:16px;">暂无错题，可在上方表单添加</li>';
                return;
            }
            el.innerHTML = list.map(function (w) {
                return `<li class="home-wrong-item ${w.reviewed ? 'reviewed' : ''}" data-id="${w.id}">
                    <div class="top">
                        <span class="title"><span class="tag tag-primary">${w.subject}</span> ${w.title}</span>
                        <span style="font-size:11px;color:var(--text-muted);">${w.time || ''}</span>
                    </div>
                    <div class="reason">错误原因：${w.reason || '未填写'}</div>
                    <div class="actions">
                        <button type="button" data-action="review" data-id="${w.id}">${w.reviewed ? '取消复习' : '标记已复习'}</button>
                        <button type="button" data-action="delete" data-id="${w.id}">删除</button>
                    </div>
                </li>`;
            }).join('');
            el.querySelectorAll('button').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    let items = getWrongBook();
                    const id = this.dataset.id;
                    if (this.dataset.action === 'delete') {
                        items = items.filter(x => x.id !== id);
                        saveWrongBook(items);
                        showNotification('已从错题本删除', 'info');
                    } else {
                        items = items.map(x => x.id === id ? { ...x, reviewed: !x.reviewed } : x);
                        saveWrongBook(items);
                        showNotification('复习状态已更新', 'success');
                    }
                    renderWrongBook();
                });
            });
        }

        document.getElementById('wrongBookForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const items = getWrongBook();
            items.unshift({
                id: 'w' + Date.now(),
                subject: document.getElementById('wrongSubject').value.trim(),
                title: document.getElementById('wrongTitle').value.trim(),
                reason: document.getElementById('wrongReason').value.trim(),
                reviewed: false,
                time: todayKey()
            });
            saveWrongBook(items);
            this.reset();
            renderWrongBook();
            showNotification('已加入错题本', 'success');
        });
        renderWrongBook();

        // 3. 考试倒计时
        function getCountdown() {
            return loadHomeState('examCountdown', {
                name: '初二期中数学',
                date: '2026-06-15'
            });
        }

        function saveCountdown(data) {
            saveHomeState('examCountdown', data);
        }

        function renderCountdown() {
            const data = getCountdown();
            const display = document.getElementById('countdownDisplay');
            if (!data || !data.date) {
                display.innerHTML = '<p class="home-tools-desc">设置考试日期后，将在此显示倒计时</p>';
                return;
            }
            document.getElementById('examName').value = data.name || '';
            document.getElementById('examDate').value = data.date || '';
            const target = new Date(data.date + 'T00:00:00');
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const diffMs = target - now;
            const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            if (days < 0) {
                display.innerHTML = `<div class="home-countdown-big">已结束</div>
                    <p style="font-size:14px;color:var(--text-muted);">${data.name} · ${data.date}</p>`;
            } else if (days === 0) {
                display.innerHTML = `<div class="home-countdown-big">就是今天</div>
                    <p style="font-size:14px;color:var(--text-muted);">${data.name} · 加油！</p>`;
            } else {
                display.innerHTML = `<div class="home-countdown-big">${days} 天</div>
                    <p style="font-size:14px;color:var(--text-muted);">距离「${data.name}」还有 ${days} 天</p>
                    <p style="font-size:12px;color:var(--text-muted);margin-top:6px;">考试日期：${data.date}</p>`;
            }
        }

        document.getElementById('countdownForm').addEventListener('submit', function (e) {
            e.preventDefault();
            saveCountdown({
                name: document.getElementById('examName').value.trim(),
                date: document.getElementById('examDate').value
            });
            renderCountdown();
            showNotification('考试倒计时已保存', 'success');
        });
        renderCountdown();

        // 4. 随机刷题
        function drawRandomQuiz() {
            if (typeof KnowledgeBase === 'undefined') {
                showNotification('知识库加载中，请稍后重试', 'warning');
                return;
            }
            const all = KnowledgeBase.generateAll();
            const kp = all[Math.floor(Math.random() * all.length)];
            document.getElementById('quizMeta').textContent =
                `${kp.grade} · ${kp.subject} · 难度${kp.difficulty} · ID ${kp.id}`;
            document.getElementById('quizTitle').textContent = kp.name;
            document.getElementById('quizDesc').textContent = kp.desc;
            document.getElementById('quizExamTypes').innerHTML = (kp.examTypes || []).map(function (e, i) {
                return `<div class="home-quiz-exam"><strong>题型 ${i + 1} · ${e.type}</strong><br>${e.stem}</div>`;
            }).join('');
            const link = document.getElementById('quizDetailLink');
            link.href = 'knowledge-detail.html?id=' + kp.id;
            link.style.display = 'inline-flex';
        }

        document.getElementById('btnDrawQuiz').addEventListener('click', drawRandomQuiz);

        // 5. 学习笔记
        function getNotes() {
            return loadHomeState('studyNotes', [
                { id: 'n1', title: '化学实验要点', content: '淀粉遇碘变蓝，实验前需控制变量。', time: '2026-03-11 09:00' }
            ]);
        }

        function saveNotes(list) {
            saveHomeState('studyNotes', list);
        }

        function renderNotes() {
            const list = getNotes();
            const el = document.getElementById('notesList');
            if (!list.length) {
                el.innerHTML = '<li style="text-align:center;color:var(--text-muted);font-size:13px;padding:16px;">暂无笔记</li>';
                return;
            }
            el.innerHTML = list.map(function (n) {
                return `<li class="home-note-item" data-id="${n.id}">
                    <div class="top">
                        <span class="title">${n.title}</span>
                        <span style="font-size:11px;color:var(--text-muted);">${n.time || ''}</span>
                    </div>
                    <div class="content">${n.content}</div>
                    <div class="actions">
                        <button type="button" data-action="edit" data-id="${n.id}">编辑</button>
                        <button type="button" data-action="delete" data-id="${n.id}">删除</button>
                    </div>
                </li>`;
            }).join('');
            el.querySelectorAll('button').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    let items = getNotes();
                    const id = this.dataset.id;
                    if (this.dataset.action === 'delete') {
                        items = items.filter(x => x.id !== id);
                        saveNotes(items);
                        renderNotes();
                        showNotification('笔记已删除', 'info');
                    } else {
                        const note = items.find(x => x.id === id);
                        if (note) {
                            document.getElementById('noteTitle').value = note.title;
                            document.getElementById('noteContent').value = note.content;
                            items = items.filter(x => x.id !== id);
                            saveNotes(items);
                            renderNotes();
                            showNotification('笔记已载入编辑区，修改后重新保存', 'info');
                        }
                    }
                });
            });
        }

        document.getElementById('notesForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const items = getNotes();
            items.unshift({
                id: 'n' + Date.now(),
                title: document.getElementById('noteTitle').value.trim(),
                content: document.getElementById('noteContent').value.trim(),
                time: formatDate(new Date())
            });
            saveNotes(items);
            this.reset();
            renderNotes();
            showNotification('笔记已保存', 'success');
        });
        renderNotes();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initWelcome();
        initCheckin();
        initStats();
        initQuickLinks();
        initLearningTools();
        initContinueLearning();
        initChart();
        renderScoreList();
        renderTasks();
        initSubjectFilter();
        renderResourceLists();
        initSubjects();
        initPlatformNews();
        initModals();
        initNotifications();
        initSearch();
        initGlobalClickClose();
    });
})();
