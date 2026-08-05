export const ROLE_DASHBOARD_ROUTES = {
    Learner: "/learner/dashboard",
    "Debate Coach": "/coach/dashboard",
    Educator: "/educator/dashboard",
    Administrator: "/admin/dashboard",
};

export const getDashboardRouteForRole = (role) => {
    return ROLE_DASHBOARD_ROUTES[role] || "/login";
};

export const ROLES = Object.keys(ROLE_DASHBOARD_ROUTES);