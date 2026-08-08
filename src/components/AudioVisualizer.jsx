import React, { useEffect, useRef } from 'react';

export default function AudioVisualizer({ isRecording, audioStream, width = 300, height = 45 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrame;
    let audioContext;
    let analyser;
    let source;

    if (isRecording && audioStream) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        source = audioContext.createMediaStreamSource(audioStream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const drawSpectrum = () => {
          ctx.clearRect(0, 0, width, height);
          analyser.getByteFrequencyData(dataArray);

          const barWidth = (width / bufferLength) * 1.4;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * height;

            // Gradient color based on frequency magnitude
            const gradient = ctx.createLinearGradient(0, height, 0, 0);
            gradient.addColorStop(0, '#06b6d4');
            gradient.addColorStop(0.5, '#38bdf8');
            gradient.addColorStop(1, '#d946ef');

            ctx.fillStyle = gradient;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#06b6d4';
            ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);

            x += barWidth + 1;
          }

          animationFrame = requestAnimationFrame(drawSpectrum);
        };

        drawSpectrum();
      } catch (err) {
        console.error("Audio visualizer initialization error:", err);
      }
    } else {
      // Idle simulated visualizer line
      const drawIdle = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.lineWidth = 2;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      };
      drawIdle();
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (source) source.disconnect();
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
    };
  }, [isRecording, audioStream, width, height]);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          borderRadius: '8px',
          background: 'rgba(2, 6, 23, 0.6)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          boxShadow: isRecording ? '0 0 15px rgba(6, 182, 212, 0.3)' : 'none',
          transition: 'all 0.3s ease'
        }}
      />
    </div>
  );
}
