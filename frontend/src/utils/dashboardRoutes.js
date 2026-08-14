// ===============================================
// Dashboard Route Helper
// ===============================================

export const getDashboardRoute = (role) => {

    switch (role) {

        case "Administrator":
            return "/admin/dashboard";

        case "Coach":
        case "Debate Coach":
            return "/coach/dashboard";

        case "Educator":
            return "/educator/dashboard";

        case "Learner":
        default:
            return "/learner/dashboard";

    }

};