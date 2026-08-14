/* ==========================================================================
   AI DEBATE COACH - CLEAN ANIMATED LOGIN & REGISTER MODAL
   ========================================================================== */

(function () {
  window.openAuthModal = function (initialTab = 'login') {
    let overlay = document.getElementById('auth-modal-overlay');
    if (overlay) overlay.remove();

    if (typeof window.initNeonEnergyBg === 'function') {
      window.initNeonEnergyBg();
    }

    overlay = document.createElement('div');
    overlay.id = 'auth-modal-overlay';
    overlay.className = 'auth-overlay';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    overlay.innerHTML = `
      <!-- Centered Glassmorphic Modal Card -->
      <div class="auth-modal motion-card ${prefersReducedMotion ? '' : 'animate-card-entrance'}">
        
        <!-- Close (X) Icon -->
        <button id="close-auth-modal" class="motion-close-btn" aria-label="Close modal">✕</button>

        <!-- Top Tabs with Sliding Underline Indicator -->
        <div class="auth-tabs relative-tab-container">
          <button class="auth-tab ${initialTab === 'login' ? 'active' : ''}" id="tab-login" data-tab="login">Sign In</button>
          <button class="auth-tab ${initialTab === 'register' ? 'active' : ''}" id="tab-register" data-tab="register">Register Account</button>
          <div class="motion-tab-indicator" id="motion-tab-indicator" style="left: ${initialTab === 'register' ? '50%' : '0%'};"></div>
        </div>

        <!-- Quick Demo Accessibility Role Chips -->
        <div class="quick-demo-wrapper motion-stagger-container">
          <div class="quick-demo-label">QUICK DEMO ACCESSIBILITY</div>
          <div class="quick-demo-chips">
            <button class="role-btn motion-chip" data-email="alex.chen@stanford.edu" data-pass="password123">Learner</button>
            <button class="role-btn motion-chip" data-email="elena@oxford.ac.uk" data-pass="password123">Educator</button>
            <button class="role-btn motion-chip" data-email="rthorne@harvard.edu" data-pass="password123">Coach</button>
            <button class="role-btn motion-chip" data-email="admin@aidebatecoach.com" data-pass="adminpassword123">Admin</button>
          </div>
        </div>

        <!-- Form Body for Sign In / Register Account -->
        <form id="auth-form" onsubmit="event.preventDefault(); window.handleAuthSubmitWithMotion();" class="motion-form-body">
          
          <!-- Full Name Field (Displayed in Register Account tab) -->
          <div class="floating-input-group motion-field" id="reg-name-group" style="display: ${initialTab === 'register' ? 'block' : 'none'};">
            <div class="relative-input-wrapper">
              <input type="text" id="auth-name" class="floating-input" placeholder=" " />
              <label for="auth-name" class="floating-label">Full Name</label>
              <div class="input-glowing-underline"></div>
            </div>
          </div>

          <!-- Email Field -->
          <div class="floating-input-group motion-field field-1" style="margin-top: 14px;">
            <div class="relative-input-wrapper">
              <input type="email" id="auth-email" class="floating-input" placeholder=" " value="alex.chen@stanford.edu" required />
              <label for="auth-email" class="floating-label">Email Address</label>
              <div class="input-glowing-underline"></div>
            </div>
          </div>

          <!-- Password Field -->
          <div class="floating-input-group motion-field field-2" style="margin-top: 14px;">
            <div class="relative-input-wrapper">
              <input type="password" id="auth-pass" class="floating-input" placeholder=" " value="password123" required />
              <label for="auth-pass" class="floating-label">Password</label>
              <div class="input-glowing-underline"></div>
            </div>
          </div>

          <!-- Role Select Field (Displayed in Register Account tab) -->
          <div class="floating-input-group motion-field" id="reg-role-group" style="display: ${initialTab === 'register' ? 'block' : 'none'}; margin-top: 14px;">
            <label style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; margin-bottom: 4px; display: block;">Select User Role Portal</label>
            <select class="form-select motion-input" id="auth-role">
              <option value="learner">Learner (Debater)</option>
              <option value="educator">Educator / Teacher</option>
              <option value="coach">Debate Coach</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          <!-- Shimmer Gradient CTA Button -->
          <button type="submit" id="auth-submit-btn" class="gradient-btn motion-cta-btn" style="margin-top: 24px; width: 100%;">
            <span id="cta-btn-label">${initialTab === 'register' ? 'Create Account' : 'Continue to Portal'}</span>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.style.display = 'flex';

    // Close Button Event
    document.getElementById('close-auth-modal').addEventListener('click', () => {
      const card = overlay.querySelector('.auth-modal');
      if (card && !prefersReducedMotion) {
        card.style.transform = 'scale(0.92) translateY(20px)';
        card.style.opacity = '0';
        card.style.transition = 'all 0.25s ease';
        setTimeout(() => overlay.remove(), 250);
      } else {
        overlay.remove();
      }
    });

    // Tab Switching Logic (Sign In vs Register Account)
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const tabIndicator = document.getElementById('motion-tab-indicator');
    const regNameGroup = document.getElementById('reg-name-group');
    const regRoleGroup = document.getElementById('reg-role-group');
    const ctaLabel = document.getElementById('cta-btn-label');

    const updateTabIndicator = (isRegister) => {
      if (isRegister) {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        tabIndicator.style.left = '50%';
        regNameGroup.style.display = 'block';
        regRoleGroup.style.display = 'block';
        if (ctaLabel) ctaLabel.textContent = 'Create Account';
      } else {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        tabIndicator.style.left = '0%';
        regNameGroup.style.display = 'none';
        regRoleGroup.style.display = 'none';
        if (ctaLabel) ctaLabel.textContent = 'Continue to Portal';
      }
    };

    tabLogin.addEventListener('click', () => updateTabIndicator(false));
    tabRegister.addEventListener('click', () => updateTabIndicator(true));

    // Staggered Role Chips Click
    document.querySelectorAll('.motion-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const email = e.target.getAttribute('data-email');
        const pass = e.target.getAttribute('data-pass');
        document.getElementById('auth-email').value = email;
        document.getElementById('auth-pass').value = pass;
        window.handleAuthSubmitWithMotion();
      });
    });
  };

  // Submit Handler
  window.handleAuthSubmitWithMotion = function () {
    const btn = document.getElementById('auth-submit-btn');
    const label = document.getElementById('cta-btn-label');
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;
    const isRegister = document.getElementById('tab-register').classList.contains('active');

    if (btn && label) {
      btn.disabled = true;
      label.innerHTML = `<span class="motion-spinner"></span> Authenticating...`;
    }

    setTimeout(() => {
      try {
        if (isRegister) {
          const name = document.getElementById('auth-name').value || 'New User';
          const role = document.getElementById('auth-role').value || 'learner';
          window.AIDebateAuth.register(name, email, pass, role);
        } else {
          window.AIDebateAuth.login(email, pass);
        }

        if (label) {
          label.innerHTML = `✓ Authenticated! Redirecting...`;
          btn.style.background = 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)';
        }

        setTimeout(() => {
          const overlay = document.getElementById('auth-modal-overlay');
          if (overlay) overlay.remove();
          window.AIDebateState.currentView = 'dashboard';
          window.initAIDebateApp();
          if (window.showToast) window.showToast(`Logged in as ${window.AIDebateAuth.currentUser.name}`, 'success');
        }, 550);

      } catch (err) {
        if (btn && label) {
          btn.disabled = false;
          label.innerHTML = isRegister ? `Create Account` : `Continue to Portal`;
        }
        if (window.showToast) window.showToast(err.message, 'warning');
      }
    }, 650);
  };
})();
