/**
 * 前端 Agent 配置（可提交仓库，不含 API Key）
 * 统一走同源代理 /api/chat，本地与线上架构一致
 */
window.EDU_AGENT_CONFIG = {
    apiProvider: 'zhipu',
    apiModel: 'glm-4-flash',
    /** 必须为 true：Key 只在 Cloudflare Function 服务端 */
    useProxy: true,
    proxyUrl: '/api/chat',
    apiKey: ''
};
