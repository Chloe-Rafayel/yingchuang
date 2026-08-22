/**
 * 教育智能体 · 聊天界面逻辑
 */
(function () {
    let pendingImage = null;
    let pendingImageUrl = '';
    let isSending = false;
    let selectedStage = null;

    function $(id) { return document.getElementById(id); }

    function scrollToBottom() {
        const box = $('chatMessages');
        if (box) box.scrollTop = box.scrollHeight;
    }

    function renderToolbar(apiReady) {
        const settings = EduAgent.getSettings();
        const stageEl = $('toolbarStage');
        const bookEl = $('toolbarTextbook');
        if (!settings) return;
        if (stageEl) {
            const s = EduAgent.STAGES.find(x => x.id === settings.stage);
            stageEl.textContent = s ? s.label + '（' + s.grades + '）' : '未设置';
        }
        if (bookEl) bookEl.textContent = settings.textbook || '暂不指定';
        const metaEl = $('toolbarMeta');
        if (metaEl) {
            if (apiReady === true) {
                metaEl.textContent = 'AI 已连接 · 多轮记忆 · 本地保存';
                metaEl.style.color = '';
            } else if (EduAgent.hasApiConfigured && EduAgent.hasApiConfigured()) {
                metaEl.textContent = '本地引擎（AI 未连通，请用 npm run dev 启动）';
                metaEl.style.color = 'var(--warning, #e67e22)';
            } else {
                metaEl.textContent = '本地引擎 · 多轮记忆 · 本地保存';
                metaEl.style.color = '';
            }
        }
    }

    async function refreshApiStatus() {
        if (!EduAgent.checkApiHealth) {
            renderToolbar(false);
            return false;
        }
        const ok = await EduAgent.checkApiHealth(true);
        renderToolbar(ok);
        return ok;
    }

    function renderMessage(msg) {
        const isUser = msg.role === 'user';
        let extraHtml = '';
        if (msg.extra && msg.extra.imageUrl) {
            extraHtml = '<img class="agent-msg-image" src="' + msg.extra.imageUrl + '" alt="题目图片">';
        }
        if (msg.extra && msg.extra.ocrText) {
            extraHtml += '<div style="font-size:12px;color:var(--text-muted);margin-top:6px;">识别文字：' +
                EduAgent.formatMessageHtml(msg.extra.ocrText) + '</div>';
        }

        let feedbackHtml = '';
        if (!isUser) {
            feedbackHtml = `<div class="agent-msg-feedback" data-msg-id="${msg.id}">
                <button type="button" data-fb="helpful">👍 有帮助</button>
                <button type="button" data-fb="unhelpful">👎 没帮助</button>
                <button type="button" data-fb="error">⚠ 报错</button>
            </div>`;
        }

        return `<div class="agent-msg ${isUser ? 'user' : 'assistant'}" data-id="${msg.id}">
            <div class="agent-msg-avatar"><i class="fas fa-${isUser ? 'user' : 'robot'}"></i></div>
            <div>
                <div class="agent-msg-bubble">${isUser ? EduAgent.formatMessageHtml(msg.content) + extraHtml : EduAgent.renderAssistantBubble(msg) + extraHtml}</div>
                ${feedbackHtml}
            </div>
        </div>`;
    }

    function renderAllMessages() {
        const messages = EduAgent.getMessages();
        const box = $('chatMessages');
        if (!messages.length) {
            box.innerHTML = `<div class="agent-welcome">
                <i class="fas fa-graduation-cap"></i>
                <p><strong>你好！我是教育智能体</strong></p>
                <p style="font-size:13px;margin-top:8px;">解答幼儿园～高中<strong>学校课程</strong>相关问题<br>
                问什么答什么 · 作文提供 300～500 字范文片段</p>
            </div>`;
            return;
        }
        box.innerHTML = messages.map(renderMessage).join('');
        bindFeedbackButtons();
        bindCardFollowups();
        scrollToBottom();
    }

    function bindCardFollowups() {
        document.querySelectorAll('.agent-card-followup').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const text = this.dataset.followup;
                const input = $('chatInput');
                if (input && text) {
                    input.value = text;
                    input.focus();
                    sendMessage(text);
                }
            });
        });
    }

    function bindFeedbackButtons() {
        document.querySelectorAll('.agent-msg-feedback button').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const wrap = this.closest('.agent-msg-feedback');
                const msgId = wrap.dataset.msgId;
                const type = this.dataset.fb;
                EduAgent.saveFeedback(msgId, type);
                wrap.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const labels = { helpful: '感谢反馈！', unhelpful: '已记录，我们会改进', error: '已提交报错' };
                showNotification(labels[type] || '已记录', 'success');
            });
        });
    }

    function showTyping() {
        const box = $('chatMessages');
        const el = document.createElement('div');
        el.className = 'agent-msg assistant';
        el.id = 'typingIndicator';
        el.innerHTML = `<div class="agent-msg-avatar"><i class="fas fa-robot"></i></div>
            <div class="agent-msg-bubble"><div class="agent-typing"><span></span><span></span><span></span></div></div>`;
        box.appendChild(el);
        scrollToBottom();
    }

    function hideTyping() {
        const el = $('typingIndicator');
        if (el) el.remove();
    }

    async function runOcr(file) {
        if (typeof Tesseract === 'undefined') {
            return '（OCR 未加载，请直接输入题目文字）';
        }
        showNotification('正在识别图片文字…', 'info');
        try {
            const result = await Tesseract.recognize(file, 'chi_sim+eng', {
                logger: function () {}
            });
            return (result.data && result.data.text) ? result.data.text.trim() : '';
        } catch (e) {
            return '';
        }
    }

    async function sendMessage(text) {
        const input = $('chatInput');
        const userText = (text || (input && input.value.trim()) || '').trim();

        if (!EduAgent.getSettings() || !EduAgent.getSettings().stage) {
            $('setupOverlay').classList.remove('hidden');
            showNotification('请先选择学段', 'warning');
            return;
        }

        if (!userText && !pendingImage) {
            showNotification('请输入问题或上传题目图片', 'warning');
            return;
        }

        if (isSending) return;
        isSending = true;
        $('btnSend').disabled = true;

        let finalText = userText;
        let extra = null;

        if (pendingImage) {
            const ocrText = await runOcr(pendingImage);
            extra = { imageUrl: pendingImageUrl, ocrText: ocrText };
            if (ocrText) {
                finalText = (userText ? userText + '\n\n' : '') + '【拍照题目】\n' + ocrText;
            } else if (!userText) {
                finalText = '请帮我解答这道题目（图片已上传）';
            }
            pendingImage = null;
        }

        if (input) {
            input.value = '';
            input.style.height = 'auto';
        }
        clearPendingImage();

        if (finalText) {
            EduAgent.appendMessage('user', finalText, extra);
            renderAllMessages();
        }

        showTyping();
        try {
            const result = await EduAgent.chat(finalText, { extra: extra, skipUserAppend: true });
            hideTyping();
            if (result.needSetup) {
                $('setupOverlay').classList.remove('hidden');
            } else {
                renderAllMessages();
            }
        } catch (e) {
            hideTyping();
            showNotification('回复失败：' + (e.message || '请重试'), 'error');
            console.error(e);
        }

        isSending = false;
        $('btnSend').disabled = false;
    }

    function clearPendingImage() {
        if (pendingImageUrl) URL.revokeObjectURL(pendingImageUrl);
        pendingImage = null;
        pendingImageUrl = '';
        const preview = $('photoPreviewBar');
        if (preview) preview.style.display = 'none';
    }

    function handleImageSelect(file) {
        if (!file || !file.type.startsWith('image/')) {
            showNotification('请选择图片文件', 'warning');
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            showNotification('图片不能超过 8MB', 'warning');
            return;
        }
        clearPendingImage();
        pendingImage = file;
        pendingImageUrl = URL.createObjectURL(file);
        const preview = $('photoPreviewBar');
        if (preview) {
            preview.style.display = 'flex';
            preview.querySelector('img').src = pendingImageUrl;
            preview.querySelector('.name').textContent = file.name;
        }
    }

    function initSetup() {
        const overlay = $('setupOverlay');
        document.querySelectorAll('.agent-stage-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.agent-stage-btn').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                selectedStage = this.dataset.stage;
            });
        });

        const btnConfirm = $('btnConfirmSetup');
        if (btnConfirm) btnConfirm.addEventListener('click', async function () {
            if (!selectedStage) {
                showNotification('请选择学段', 'warning');
                return;
            }
            const stage = EduAgent.STAGES.find(s => s.id === selectedStage);
            EduAgent.saveSettings({
                stage: selectedStage,
                tone: stage.tone,
                textbook: $('setupTextbook').value,
                setupAt: new Date().toISOString()
            });
            overlay.classList.add('hidden');
            renderToolbar();
            await refreshApiStatus();
            EduAgent.appendMessage('assistant', JSON.stringify({
                answer: '你好！我已了解你是 **' + stage.label + '** 阶段的同学。我会直接回答你的课内问题；若是命题作文，则提供思路与 300～500 字范文片段（不代写完整全文）。有什么学校课程上的问题，尽管问我吧！',
                cards: [{
                    title: '你可以这样问',
                    summary: '课内问题示例',
                    detail: '· 马说的原文\n· 离骚的全文是什么？\n· 议论文的三要素是什么？',
                    followup: '马说的原文'
                }]
            }), {
                parsed: {
                    answer: '你好！我已了解你是 **' + stage.label + '** 阶段的同学。我会直接回答你的课内问题；若是命题作文，则提供思路与 300～500 字范文片段。',
                    cards: [{
                        title: '你可以这样问',
                        summary: '课内问题示例',
                        detail: '· 马说的原文\n· 离骚的全文是什么？\n· 议论文的三要素是什么？',
                        followup: '马说的原文'
                    }]
                }
            });
            renderAllMessages();
            showNotification('学段设置已保存', 'success');
        });

        if (!EduAgent.getSettings() || !EduAgent.getSettings().stage) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
            selectedStage = EduAgent.getSettings().stage;
        }
    }

    function initToolbar() {
        const btnChange = $('btnChangeStage');
        if (btnChange) {
            btnChange.addEventListener('click', function () {
                selectedStage = EduAgent.getSettings() ? EduAgent.getSettings().stage : null;
                if (EduAgent.getSettings()) {
                    $('setupTextbook').value = EduAgent.getSettings().textbook || '暂不指定';
                }
                document.querySelectorAll('.agent-stage-btn').forEach(function (btn) {
                    btn.classList.toggle('selected', btn.dataset.stage === selectedStage);
                });
                $('setupOverlay').classList.remove('hidden');
            });
        }

        renderToolbar(false);
    }

    function initClearChat() {
        document.addEventListener('click', function (e) {
            const btn = e.target.closest('#btnClearChat');
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();
            EduAgent.clearMessages();
            renderAllMessages();
            showNotification('对话已清空', 'info');
        });
    }

    function initInput() {
        const input = $('chatInput');
        const photoInput = $('photoInput');

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        input.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });

        $('btnSend').addEventListener('click', function () { sendMessage(); });
        $('btnPhoto').addEventListener('click', function () { photoInput.click(); });
        photoInput.addEventListener('change', function () {
            if (this.files && this.files[0]) handleImageSelect(this.files[0]);
            this.value = '';
        });
        $('btnRemovePhoto').addEventListener('click', clearPendingImage);
    }

    document.addEventListener('DOMContentLoaded', async function () {
        initSetup();
        initToolbar();
        initClearChat();
        initInput();
        renderAllMessages();
        await refreshApiStatus();
        if (EduAgent.hasApiConfigured && EduAgent.hasApiConfigured() && !EduAgent.isApiReady()) {
            showNotification('AI 未连通：请用 npm run dev 启动（serve 不支持 API）', 'warning');
        }
    });
})();
