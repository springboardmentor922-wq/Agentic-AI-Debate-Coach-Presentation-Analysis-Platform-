export const toArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

export const safeNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const formatDate = (value) => {
    if (!value) return "--";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);

    return parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export const formatDateTime = (value) => {
    if (!value) return "--";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);

    return parsed.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const formatTime = (value) => {
    if (!value) return "--";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);

    return parsed.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const capitalize = (value = "") => {
    const text = String(value).trim();
    if (!text) return "";

    return text.charAt(0).toUpperCase() + text.slice(1);
};

export const normalizeStatus = (value = "") => String(value).trim().toLowerCase();

export const computeProfileCompletion = (profile = {}, user = {}) => {
    const fields = [
        profile.full_name || user.full_name,
        profile.email || user.email,
        profile.phone_number,
        profile.institution,
        profile.location,
        profile.gender,
        profile.bio,
        profile.experience_level,
        profile.learning_goals,
        profile.preferred_debate_topics,
        profile.presentation_domains,
        profile.coaching_preferences,
    ];

    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
};

export const computeAverageScore = (skill = {}) => {
    const metrics = [
        skill.communication_score,
        skill.critical_thinking_score,
        skill.presentation_score,
        skill.argument_score,
        skill.confidence_score,
    ];

    const numericMetrics = metrics.map((metric) => safeNumber(metric, 0));
    const total = numericMetrics.reduce((sum, metric) => sum + metric, 0);

    return Math.round(total / metrics.length) || 0;
};

export const groupReportsByInputType = (reports = []) => {
    const counts = reports.reduce((accumulator, report) => {
        const key = report.input_type || "unknown";
        accumulator[key] = (accumulator[key] || 0) + 1;
        return accumulator;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

export const extractReportScore = (report) => {
    const analysis = report?.argument_analysis || {};
    const score = analysis?.argument_scoring?.overall_score ?? analysis?.overall_score ?? analysis?.score ?? 0;
    return safeNumber(score, 0);
};
