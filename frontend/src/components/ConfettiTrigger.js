import confetti from 'canvas-confetti';

export const triggerCelebration = () => {
  try {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#06b6d4', '#38bdf8']
    });
    fire(0.2, {
      spread: 60,
      colors: ['#d946ef', '#f43f5e']
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#10b981', '#fbbf24']
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      colors: ['#38bdf8', '#d946ef']
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#ffffff', '#06b6d4']
    });
  } catch (err) {
    console.warn("Confetti trigger failed:", err);
  }
};
