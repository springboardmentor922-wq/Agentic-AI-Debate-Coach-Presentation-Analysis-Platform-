/* ==========================================================================
   AI DEBATE COACH - AUTHENTICATION & ROLE-BASED ACCESS CONTROL (auth.js)
   ========================================================================== */

(function () {
  const SESSION_KEY = 'AI_DEBATE_CURRENT_SESSION';

  class AuthManager {
    constructor() {
      this.currentUser = this.loadSession();
    }

    loadSession() {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (raw) {
          const user = JSON.parse(raw);
          // Verify user still exists in DB
          const dbUser = window.AIDebateDB.getUserById(user.id);
          return dbUser || user;
        }
      } catch (e) {
        console.error('Error loading session:', e);
      }
      return null; // Null means unauthenticated / guest view
    }

    saveSession(user) {
      this.currentUser = user;
      if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }

    login(email, password) {
      const dbUser = window.AIDebateDB.getUserByEmail(email);
      if (!dbUser) {
        throw new Error('No user account found with this email address.');
      }
      if (dbUser.password !== password) {
        throw new Error('Invalid password. Please check your credentials.');
      }
      if (dbUser.status !== 'Active') {
        throw new Error('This account has been deactivated by an administrator.');
      }
      this.saveSession(dbUser);
      return dbUser;
    }

    register(name, email, password, role = 'learner', institution = '') {
      if (window.AIDebateDB.getUserByEmail(email)) {
        throw new Error('An account with this email already exists.');
      }
      const newUser = window.AIDebateDB.addUser({
        name,
        email,
        password,
        role,
        institution: institution || 'Debate Institute'
      });
      this.saveSession(newUser);
      return newUser;
    }

    logout() {
      this.saveSession(null);
    }

    isAuthenticated() {
      return !!this.currentUser;
    }

    getUserRole() {
      return this.currentUser ? this.currentUser.role : null;
    }

    // Role-based Access Guard Matrix
    routeExists(viewName) {
      if (viewName === 'landing') return true;
      const allViews = new Set([
        'dashboard', 'practice', 'assignments', 'history', 'reports', 'feedback', 'profile', 'coach-feedback', 'improvement-trends', 'recommended-exercises',
        'reviews', 'evaluation', 'topics', 'class-analytics', 'student-ranking', 'debate-report',
        'students', 'analytics', 'learner-directory', 'evaluated-vault', 'skill-gap-analysis',
        'users', 'stats', 'settings', 'logs', 'ai-monitoring', 'system-reports'
      ]);
      return allViews.has(viewName);
    }

    canAccessRoute(viewName) {
      if (!this.currentUser) {
        // Guests can view landing page
        return viewName === 'landing';
      }

      const role = (this.currentUser.role || '').toLowerCase();

      // Master matrix mapping allowed views per role
      const allowedViews = {
        learner: ['landing', 'dashboard', 'practice', 'assignments', 'history', 'reports', 'feedback', 'profile', 'coach-feedback', 'improvement-trends', 'recommended-exercises'],
        educator: ['landing', 'dashboard', 'assignments', 'reviews', 'evaluation', 'reports', 'feedback', 'topics', 'profile', 'class-analytics', 'student-ranking', 'debate-report'],
        coach: ['landing', 'dashboard', 'students', 'evaluation', 'analytics', 'reports', 'profile', 'learner-directory', 'evaluated-vault', 'skill-gap-analysis'],
        admin: ['landing', 'dashboard', 'users', 'topics', 'stats', 'settings', 'logs', 'profile', 'ai-monitoring', 'system-reports']
      };

      const userAllowed = allowedViews[role] || [];
      return userAllowed.includes(viewName);
    }

    hasPermission(permission) {
      if (!this.currentUser) return false;
      const role = (this.currentUser.role || '').toLowerCase();
      const rolePermissions = {
        learner: [
          'VIEW_DASHBOARD', 'VIEW_DEBATE_HISTORY', 'VIEW_AI_EVALUATIONS', 
          'CREATE_FEEDBACK', 'VIEW_PERFORMANCE'
        ],
        coach: [
          'VIEW_EVALUATION_QUEUE', 'VIEW_LEARNER_DIRECTORY', 'VIEW_LEARNER_PROFILE',
          'VIEW_DEBATE_HISTORY', 'VIEW_AI_EVALUATIONS', 'VIEW_PERFORMANCE',
          'VIEW_ANALYTICS', 'VIEW_EVALUATED_VAULT', 'CREATE_COACH_FEEDBACK',
          'UPDATE_COACH_FEEDBACK', 'PUBLISH_COACH_FEEDBACK', 'VIEW_REPORTS',
          'EXPORT_REPORTS'
        ],
        educator: [
          'VIEW_DASHBOARD', 'VIEW_ASSIGNMENTS', 'VIEW_REVIEWS',
          'VIEW_REPORTS', 'VIEW_FEEDBACK'
        ],
        admin: [
          'VIEW_DASHBOARD', 'VIEW_USERS', 'VIEW_TOPICS', 'VIEW_STATS', 'VIEW_SETTINGS', 'VIEW_LOGS'
        ]
      };
      const permissions = rolePermissions[role] || [];
      return permissions.includes(permission);
    }
  }

  window.AIDebateAuth = new AuthManager();
})();
