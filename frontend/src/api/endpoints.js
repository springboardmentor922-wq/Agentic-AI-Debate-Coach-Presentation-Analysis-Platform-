import api from "./axios";


// ============================================================
// Authentication API
// ============================================================

export const authApi = {

    register: (payload) =>
        api.post("/api/v1/auth/register", payload),

    login: (email, password) =>
        api.post(
            "/api/v1/auth/login-json",
            {
                email,
                password,
            }
        ),

    forgotPassword: (email) =>
        api.post(
            "/api/v1/auth/forgot-password",
            {
                email,
            }
        ),

    resetPassword: (token, new_password) =>
        api.post(
            "/api/v1/auth/reset-password",
            {
                token,
                new_password,
            }
        ),

    googleAuth: (idToken) =>
        api.post(
            "/api/v1/auth/google",
            {
                id_token: idToken,
            }
        ),
};


// ============================================================
// User API
// ============================================================

export const userApi = {

    me: () =>
        api.get("/api/v1/users/me"),

    getProfile: () =>
        api.get("/api/v1/users/me/profile"),

    updateProfile: (payload) =>
        api.put(
            "/api/v1/users/me/profile",
            payload
        ),

    completeOnboarding: (payload) =>
        api.patch(
            "/api/v1/users/me/onboarding",
            payload
        ),
};


// ============================================================
// Topic API
// ============================================================

export const topicApi = {

    list: (format) =>
        api.get(
            "/api/v1/topics",
            {
                params: format
                    ? { format }
                    : {},
            }
        ),

    create: (payload) =>
        api.post(
            "/api/v1/topics",
            payload
        ),

    remove: (id) =>
        api.delete(
            `/api/v1/topics/${id}`
        ),
};


// ============================================================
// Debate Session API
// ============================================================

export const sessionApi = {

    list: () =>
        api.get("/api/v1/sessions"),

    create: (payload) =>
        api.post(
            "/api/v1/sessions",
            payload
        ),

    get: (id) =>
        api.get(
            `/api/v1/sessions/${id}`
        ),

    update: (id, payload) =>
        api.patch(
            `/api/v1/sessions/${id}`,
            payload
        ),

    listAll: () =>
        api.get("/api/v1/sessions/all"),

    cancel: (id) =>
        api.delete(
            `/api/v1/sessions/${id}`
        ),
};


// ============================================================
// Reports API
// ============================================================

export const reportsApi = {

    allLearners: () =>
        api.get(
            "/api/v1/reports/all-learners"
        ),

    coaches: () =>
        api.get(
            "/api/v1/reports/coaches"
        ),

    educators: () =>
        api.get(
            "/api/v1/reports/educators"
        ),

    userActivity: (userId) =>
        api.get(
            `/api/v1/reports/user/${userId}`
        ),

    myRecommendations: () =>
        api.get(
            "/api/v1/reports/recommendations"
        ),

    counterargumentSummary: () =>
        api.get(
            "/api/v1/reports/counterargument-summary"
        ),
};


// ============================================================
// Admin API
// ============================================================

export const adminApi = {

    listUsers: () =>
        api.get(
            "/api/v1/admin/users"
        ),

    changeRole: (userId, newRole) =>
        api.patch(
            `/api/v1/admin/users/${userId}/role`,
            null,
            {
                params: {
                    new_role: newRole,
                },
            }
        ),

    setStatus: (userId, status) =>
        api.patch(
            `/api/v1/admin/users/${userId}/status`,
            {
                status,
            }
        ),

    deleteUser: (userId) =>
        api.delete(
            `/api/v1/admin/users/${userId}`
        ),
};


// ============================================================
// Feedback API
// ============================================================

export const feedbackApi = {

    create: (payload) =>
        api.post(
            "/api/v1/feedback",
            payload
        ),

    listForUser: (userId) =>
        api.get(
            `/api/v1/feedback/user/${userId}`
        ),
};


// ============================================================
// Debate API
// ============================================================

export const debateApi = {

    sendMessage: (sessionId, payload) =>
        api.post(
            `/api/v1/debate/${sessionId}/message`,
            payload
        ),

    sendAudioMessage: (sessionId, formData) =>
        api.post(
            `/api/v1/debate/${sessionId}/audio-turn`,
            formData,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data",
                },
            }
        ),

    getNudges: (sessionId) =>
        api.get(
            `/api/v1/debate/${sessionId}/nudges`
        ),

    quickstart: (payload) =>
        api.post(
            "/api/v1/debate/quickstart",
            payload
        ),


    // ========================================================
    // AI Judge
    // ========================================================

    generateJudgeReport: (
        sessionId,
        regenerate = false
    ) =>
        api.post(
            `/api/v1/judge/${sessionId}`,
            {
                regenerate,
            }
        ),

    getJudgeReport: (sessionId) =>
        api.get(
            `/api/v1/judge/${sessionId}`
        ),

    deleteJudgeReport: (sessionId) =>
        api.delete(
            `/api/v1/judge/${sessionId}`
        ),

    getJudgeHistory: () =>
        api.get(
            "/api/v1/judge/history/all"
        ),

    getJudgeDashboard: () =>
        api.get(
            "/api/v1/judge/dashboard/statistics"
        ),

    getBestPerformance: () =>
        api.get(
            "/api/v1/judge/best/performance"
        ),
};


// ============================================================
// Matchmaking API
// ============================================================

export const matchmakingApi = {

    heartbeat: () =>
        api.post(
            "/api/v1/users/heartbeat"
        ),

    listAvailable: () =>
        api.get(
            "/api/v1/users/available"
        ),

    sendInvite: (payload) =>
        api.post(
            "/api/v1/debate/invite",
            payload
        ),

    listPendingInvites: () =>
        api.get(
            "/api/v1/debate/invites/pending"
        ),

    getInvite: (id) =>
        api.get(
            `/api/v1/debate/invites/${id}`
        ),

    respondToInvite: (id, accept) =>
        api.patch(
            `/api/v1/debate/invites/${id}`,
            {
                accept,
            }
        ),
};


// ============================================================
// Schedule API
// ============================================================

export const scheduleApi = {

    list: () =>
        api.get(
            "/api/v1/schedule"
        ),

    directory: () =>
        api.get(
            "/api/v1/schedule/directory"
        ),

    create: (payload) =>
        api.post(
            "/api/v1/schedule",
            payload
        ),

    respond: (id, accept) =>
        api.post(
            `/api/v1/schedule/${id}/respond`,
            {
                accept,
            }
        ),

    setTopic: (id, topicId) =>
        api.patch(
            `/api/v1/schedule/${id}/topic`,
            null,
            {
                params: {
                    topic_id: topicId,
                },
            }
        ),
};


// ============================================================
// Presentation Domains API
// ============================================================

export const presentationDomainsApi = {

    list: () =>
        api.get(
            "/api/v1/presentation-domains"
        ),
};


// ============================================================
// Assistant API
// ============================================================

export const assistantApi = {

    listConversations: () =>
        api.get(
            "/api/v1/assistant/conversations"
        ),

    createConversation: () =>
        api.post(
            "/api/v1/assistant/conversations",
            {}
        ),

    updateConversation: (id, payload) =>
        api.patch(
            `/api/v1/assistant/conversations/${id}`,
            payload
        ),

    deleteConversation: (id) =>
        api.delete(
            `/api/v1/assistant/conversations/${id}`
        ),

    listMessages: (id) =>
        api.get(
            `/api/v1/assistant/conversations/${id}/messages`
        ),

    sendMessage: (id, content) =>
        api.post(
            `/api/v1/assistant/conversations/${id}/messages`,
            {
                content,
            }
        ),
};