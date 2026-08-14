/* ==========================================================================
   AI DEBATE COACH - 60 FPS ANIMATED NEON ENERGY PLASMA BACKGROUND
   ========================================================================== */

(function () {
  class NeonEnergyEngine {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.width = 0;
      this.height = 0;
      this.time = 0;
      this.animFrameId = null;
      this.particles = [];
      this.ribbons = [];
    }

    init() {
      let canvas = document.getElementById('neon-energy-canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'neon-energy-canvas';
        canvas.className = 'neon-energy-canvas';
        document.body.prepend(canvas);
      }
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      this.resize();
      window.addEventListener('resize', () => this.resize());

      this.createRibbons();
      this.createParticles();
      
      if (!this.animFrameId) {
        this.animate();
      }
    }

    resize() {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
    }

    createRibbons() {
      // Swirling energy ribbons (Electric Blue, Cyan, Purple, Indigo, Teal, Golden Amber)
      this.ribbons = [
        { color1: 'rgba(6, 182, 212, ', color2: 'rgba(59, 130, 246, ', speed: 0.008, amplitude: 90, frequency: 0.002, yRatio: 0.25, width: 14, glow: 35 },
        { color1: 'rgba(139, 92, 246, ', color2: 'rgba(236, 72, 153, ', speed: 0.006, amplitude: 110, frequency: 0.0015, yRatio: 0.75, width: 16, glow: 40 },
        { color1: 'rgba(245, 158, 11, ', color2: 'rgba(6, 182, 212, ', speed: 0.011, amplitude: 70, frequency: 0.003, yRatio: 0.45, width: 8, glow: 25 },
        { color1: 'rgba(20, 184, 166, ', color2: 'rgba(99, 102, 241, ', speed: 0.007, amplitude: 130, frequency: 0.001, yRatio: 0.55, width: 18, glow: 45 },
        { color1: 'rgba(59, 130, 246, ', color2: 'rgba(168, 85, 247, ', speed: 0.009, amplitude: 85, frequency: 0.0025, yRatio: 0.85, width: 12, glow: 30 }
      ];
    }

    createParticles() {
      const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#14b8a6'];
      this.particles = Array.from({ length: 65 }, () => ({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        r: Math.random() * 2.5 + 1,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        alpha: Math.random() * 0.7 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
    }

    drawRibbon(ribbon) {
      const ctx = this.ctx;
      const t = this.time * ribbon.speed;
      const baseY = this.height * ribbon.yRatio;

      ctx.save();
      ctx.beginPath();
      
      const pointsCount = 6;
      const step = this.width / (pointsCount - 1);

      ctx.moveTo(0, baseY + Math.sin(t) * ribbon.amplitude);

      for (let i = 1; i < pointsCount; i++) {
        const x = i * step;
        const phase = t + i * 0.8;
        const y = baseY + Math.sin(phase) * ribbon.amplitude + Math.cos(t * 0.5 + i) * (ribbon.amplitude * 0.4);

        const prevX = (i - 1) * step;
        const prevY = baseY + Math.sin(t + (i - 1) * 0.8) * ribbon.amplitude + Math.cos(t * 0.5 + (i - 1)) * (ribbon.amplitude * 0.4);
        
        const cp1x = prevX + step * 0.5;
        const cp1y = prevY + Math.sin(t + i) * 30;
        const cp2x = x - step * 0.5;
        const cp2y = y - Math.cos(t + i) * 30;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
      }

      // Gradient stroke
      const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
      const alphaPulse = 0.5 + Math.sin(t * 2) * 0.2;
      grad.addColorStop(0, ribbon.color1 + alphaPulse + ')');
      grad.addColorStop(0.5, ribbon.color2 + alphaPulse + ')');
      grad.addColorStop(1, ribbon.color1 + alphaPulse + ')');

      ctx.strokeStyle = grad;
      ctx.lineWidth = ribbon.width;
      ctx.shadowColor = ribbon.color1 + '0.8)';
      ctx.shadowBlur = ribbon.glow;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.restore();
    }

    drawParticles() {
      const ctx = this.ctx;
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
        if (p.y < 0) p.y = this.height;
        if (p.y > this.height) p.y = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      });
    }

    animate() {
      this.time += 1;
      
      // Clear with dark space trail
      this.ctx.fillStyle = 'rgba(9, 13, 22, 0.28)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Render Ribbons & Plasma Waves
      this.ribbons.forEach(r => this.drawRibbon(r));

      // Render Floating Neon Sparks
      this.drawParticles();

      this.animFrameId = requestAnimationFrame(() => this.animate());
    }
  }

  window.initNeonEnergyBg = function() {
    if (!window.AIDebateNeonBg) {
      window.AIDebateNeonBg = new NeonEnergyEngine();
    }
    window.AIDebateNeonBg.init();
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.initNeonEnergyBg();
  });
})();
