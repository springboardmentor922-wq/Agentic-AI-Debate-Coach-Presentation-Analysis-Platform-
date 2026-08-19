/* ==========================================================================
   AI DEBATE COACH - PRACTICE STUDIO v3.0 (Real Mic · Live STT · Dynamic AI)
   ========================================================================== */

(function () {
  'use strict';

  window.PracticeStudioModule = {
    /* ---- STATE ---- */
    isRecording : false,
    recordTimer : 0,
    timerInterval: null,
    liveTranscript: '',
    audioURL: null,

    /* ============================================================
     *  RENDER
     * ============================================================ */
    render() {
      const user    = window.AIDebateAuth.currentUser;
      const history = window.AIDebateDB.getPracticeHistory(user ? user.id : null);
      const latest  = history[0] || null;

      // Score display defaults — show previous result or dash
      const prevScore    = latest ? (latest.score || 0)                : 0;
      const prevFluency  = latest ? (latest.metrics?.fluency || 0)     : 0;
      const prevLogic    = latest ? (latest.metrics?.grammar || 0)     : 0;
      const prevDelivery = latest ? (latest.metrics?.confidence || 0)  : 0;

      return `
        <div class="dash-header">
          <div>
            <h1>Practice Studio &amp; AI Speech Evaluator</h1>
            <p style="color:var(--text-muted);font-size:0.95rem;">
              Speak into your microphone. Real-time AI evaluates your exact words,
              flags grammar/filler mistakes, and computes dynamic scores.
            </p>
          </div>
          <div style="display:flex;gap:12px;">
            <button id="btn-generate-topic"   class="btn-secondary">🎲 Random Topic</button>
            <button id="btn-export-pdf-prac"  class="gradient-btn">📥 Export PDF Report</button>
          </div>
        </div>

        <!-- Active Topic -->
        <div class="glass-card" style="padding:24px;margin-bottom:28px;border-left:4px solid var(--cyan);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
            <div>
              <span class="badge-severity" style="background:rgba(6,182,212,0.2);color:var(--cyan);">Active Debate Topic</span>
              <h2 id="current-debate-topic" style="font-size:1.35rem;font-weight:700;margin:8px 0;">
                Resolved: Universal Basic Income is necessary to offset technological unemployment.
              </h2>
              <p style="color:var(--text-muted);font-size:0.9rem;">
                Target Pace: <strong>120–160 WPM</strong> | Speak clearly · No filler words · Use evidence
              </p>
            </div>
            <select id="select-debate-format" class="form-select" style="padding:6px 12px;font-size:0.85rem;">
              <option value="Lincoln-Douglas">Lincoln-Douglas Format</option>
              <option value="Parliamentary">Parliamentary Debate</option>
              <option value="Public Forum">Public Forum Format</option>
              <option value="Policy">Policy Debate</option>
            </select>
          </div>
        </div>

        <!-- Recorder + Score Panel -->
        <div class="charts-grid" style="margin-bottom:28px;">

          <!-- LEFT: Recorder -->
          <div class="chart-card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:300px;">

            <!-- Status -->
            <div id="recording-status-text"
                 style="font-size:1.05rem;font-weight:700;margin-bottom:8px;color:var(--text-muted);">
              Click "Start Recording" and speak into your microphone
            </div>

            <!-- Timer -->
            <div id="recording-timer"
                 style="font-family:'JetBrains Mono',monospace;font-size:2.5rem;font-weight:800;color:var(--text-main);margin-bottom:14px;">
              00:00
            </div>

            <!-- Live transcript box -->
            <div id="live-mic-text-box"
                 style="width:100%;max-height:90px;overflow-y:auto;background:rgba(0,0,0,0.3);
                        border:1px dashed var(--border-glass-glow);border-radius:var(--radius-md);
                        padding:10px;font-size:0.88rem;color:var(--text-cyan);
                        margin-bottom:16px;text-align:left;min-height:54px;">
              <span style="color:var(--text-dim);font-style:italic;">
                [Your actual spoken words will appear here live as you talk...]
              </span>
            </div>

            <!-- Waveform bars -->
            <div class="mock-waveform" id="mic-waveform" style="width:85%;opacity:0.35;">
              ${Array.from({length:12}).map(() => '<div class="mock-bar"></div>').join('')}
            </div>

            <!-- Audio replay (hidden until recording stops) -->
            <div id="audio-replay-wrapper" style="display:none;margin-top:12px;width:100%;">
              <audio id="recorded-audio-player" controls
                     style="width:100%;height:36px;border-radius:8px;outline:none;"></audio>
            </div>

            <!-- Buttons -->
            <div style="display:flex;gap:12px;margin-top:20px;flex-wrap:wrap;justify-content:center;">
              <button id="btn-toggle-record" class="gradient-btn"
                      style="padding:12px 28px;font-size:1rem;">
                🎙️ Start Recording Speech
              </button>
              <label class="btn-secondary" style="cursor:pointer;">
                📁 Upload Audio File
                <input type="file" id="file-upload-input" accept="audio/*,video/*" style="display:none;" />
              </label>
            </div>

            <!-- Error message area -->
            <div id="mic-error-banner" style="display:none;margin-top:14px;padding:10px 14px;
                 background:rgba(244,63,94,0.12);border:1px solid var(--rose);border-radius:8px;
                 font-size:0.85rem;color:var(--rose);text-align:left;width:100%;"></div>
          </div>

          <!-- RIGHT: Score Preview -->
          <div class="chart-card">
            <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:16px;">
              📊 AI Evaluation Scores
            </h3>

            <div style="display:flex;flex-direction:column;gap:14px;" id="ai-score-preview-box">
              ${this._scoreBar('Fluency (Filler Penalty)',       'flue',  prevFluency,  'var(--emerald)')}
              ${this._scoreBar('Argument Logic & Vocabulary',    'gram',  prevLogic,    'var(--purple)')}
              ${this._scoreBar('Delivery & Pace (WPM Rating)',   'conf',  prevDelivery, 'var(--cyan)')}
              ${this._scoreBar('Grammar Score',                  'grm2',  latest ? (latest.metrics?.grammar || 0) : 0, 'var(--blue)')}
              ${this._scoreBar('Pronunciation Score',            'pron',  latest ? (latest.metrics?.relevance || 0) : 0, 'var(--pink)')}
            </div>

            <!-- WPM badge -->
            <div id="wpm-display-badge" style="margin-top:16px;padding:10px;background:rgba(0,0,0,0.2);
                 border-radius:8px;text-align:center;font-size:0.85rem;color:var(--text-muted);">
              ${latest ? `WPM: <strong style="color:var(--cyan);">${latest.wpm || '--'}</strong>` : 'Speak to see WPM'}
            </div>

            <!-- Final score display -->
            <div style="margin-top:10px;text-align:center;background:rgba(0,0,0,0.25);
                        padding:12px;border-radius:8px;border:1px solid var(--border-glass-glow);">
              <span style="font-size:0.82rem;color:var(--text-muted);">Calculated Final Score:</span>
              <span id="overall-ai-score-display"
                    style="font-size:1.6rem;font-weight:900;color:var(--cyan);margin-left:8px;">
                ${prevScore ? prevScore + ' / 100' : '-- / 100'}
              </span>
            </div>

            <!-- Processing state -->
            <div id="eval-loading-state" style="display:none;text-align:center;padding:20px;
                 font-size:0.9rem;color:var(--cyan);">
              <div style="font-size:1.5rem;margin-bottom:8px;">⚙️</div>
              Running AI evaluation pipeline...
            </div>
          </div>
        </div>

        <!-- Transcript & Analysis Panel -->
        <div id="ai-results-panel" class="glass-panel" style="padding:28px;margin-bottom:32px;">

          <div style="display:flex;justify-content:space-between;align-items:center;
                      margin-bottom:16px;flex-wrap:wrap;gap:12px;">
            <div>
              <h2 style="font-size:1.3rem;font-weight:800;">Your Spoken Speech Transcript</h2>
              <p style="color:var(--text-muted);font-size:0.88rem;">
                Highlighted in <span style="color:var(--rose);">red = filler words</span>,
                <span style="color:var(--amber);">amber = repeated words</span>,
                <span style="color:var(--purple);">purple = grammar issues</span>.
              </p>
            </div>
            <div style="display:flex;gap:8px;">
              <button id="btn-reanalyze-text" class="gradient-btn"
                      style="padding:6px 16px;font-size:0.82rem;">⚡ Evaluate Spoken Text</button>
              <button id="btn-copy-transcript" class="btn-secondary"
                      style="padding:6px 14px;font-size:0.82rem;">📋 Copy</button>
              <button id="btn-read-aloud" class="btn-secondary"
                      style="padding:6px 14px;font-size:0.82rem;">🔊 Read Aloud</button>
            </div>
          </div>

          <!-- Editable textarea for manual input/re-analysis -->
          <div style="margin-bottom:18px;">
            <textarea id="transcript-editable-input" class="form-input"
                      style="width:100%;height:110px;resize:vertical;font-size:0.98rem;
                             line-height:1.7;background:rgba(15,23,42,0.7);"
                      placeholder="Spoken speech transcript will appear here. Speak into your mic or type text to analyse..."
              >${latest ? latest.transcript : ''}</textarea>
          </div>

          <!-- Annotated view (read-only highlighted) -->
          <div id="annotated-transcript-view"
               style="display:none;padding:14px;background:rgba(0,0,0,0.25);
                      border-radius:8px;font-size:0.95rem;line-height:1.8;
                      border:1px solid var(--border-glass-glow);margin-bottom:20px;word-break:break-word;">
          </div>

          <!-- Mistake Cards -->
          <h3 style="font-size:1.15rem;font-weight:800;margin-bottom:16px;
                     color:var(--rose);display:flex;align-items:center;gap:8px;">
            <span>❌</span> Specific Speech Mistakes &amp; Corrections
          </h3>
          <div id="speech-mistakes-container"
               style="display:flex;flex-direction:column;gap:16px;margin-bottom:28px;">
            ${latest ? this._renderMistakeCards(window.AIEvaluationEngine ? window.AIEvaluationEngine.evaluate(latest.transcript, latest.durationSeconds || 30) : null) : this._placeholder()}
          </div>

          <!-- Strengths + Suggestions -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;"
               id="strengths-suggestions-grid">
            <div>
              <h3 style="font-size:1rem;font-weight:800;color:var(--emerald);margin-bottom:10px;">
                ✅ Strengths Identified
              </h3>
              <div id="strengths-list" style="font-size:0.9rem;line-height:2;color:var(--text-main);">
                ${latest ? (latest.strengths || []).map(s => `<div>${s}</div>`).join('') : '<span style="color:var(--text-muted);">Complete a recording to see strengths</span>'}
              </div>
            </div>
            <div>
              <h3 style="font-size:1rem;font-weight:800;color:var(--purple);margin-bottom:10px;">
                💡 AI Suggestions
              </h3>
              <div id="suggestions-list" style="font-size:0.9rem;line-height:2;color:var(--text-main);">
                ${latest ? (latest.suggestions || []).map(s => `<div>${s}</div>`).join('') : '<span style="color:var(--text-muted);">Complete a recording to see suggestions</span>'}
              </div>
            </div>
          </div>

          <!-- AI Coaching Feedback -->
          <h3 style="font-size:1.15rem;font-weight:800;margin-bottom:16px;color:var(--purple);">
            ✨ Tailored AI Coaching Feedback
          </h3>
          <div id="ai-custom-feedback-content"
               style="background:rgba(30,41,59,0.6);border:1px solid var(--border-glass-glow);
                      border-radius:var(--radius-md);padding:20px;font-size:0.92rem;line-height:1.6;">
            ${latest ? (latest.aiFeedbackClean || latest.aiFeedback || 'Complete a recording to see coaching feedback.') : 'Record your speech to receive personalised AI coaching feedback.'}
          </div>
        </div>
      `;
    },

    /* ---- Score Progress Bar HTML ---- */
    _scoreBar(label, id, val, color) {
      return `
        <div>
          <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:4px;">
            <span>${label}</span>
            <span style="font-weight:bold;color:${color};" id="score-val-${id}">${val || 0}%</span>
          </div>
          <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;">
            <div id="bar-val-${id}"
                 style="width:${val || 0}%;height:100%;background:${color};
                        transition:width 0.8s cubic-bezier(.4,0,0.2,1);"></div>
          </div>
        </div>`;
    },

    /* ---- Update score bars with animation ---- */
    _updateScoreBars(result) {
      const set = (id, val) => {
        const el = document.getElementById('score-val-' + id);
        const bar = document.getElementById('bar-val-' + id);
        if (el)  el.textContent = val + '%';
        if (bar) bar.style.width = val + '%';
      };
      set('flue', result.fluency);
      set('gram', result.argumentLogic);
      set('conf', result.delivery);
      set('grm2', result.grammar);
      set('pron', result.pronunciation);

      const overall = document.getElementById('overall-ai-score-display');
      if (overall) overall.textContent = result.finalScore + ' / 100';

      const wpmBadge = document.getElementById('wpm-display-badge');
      if (wpmBadge) wpmBadge.innerHTML = `WPM: <strong style="color:var(--cyan);">${result.wpm}</strong> <span style="color:var(--text-muted);font-size:0.8rem;">(${result.paceLabel})</span>`;
    },

    /* ---- Render mistake cards from evaluation result ---- */
    _renderMistakeCards(result) {
      if (!result) return this._placeholder();

      const cards = [];

      // Filler words
      if (result.fillerWords && result.fillerWords.length > 0) {
        const unique = [...new Set(result.fillerWords)];
        cards.push(this._mistakeCard(
          'Vocal Fillers / Hesitation',
          `Found ${result.fillerWords.length} filler word(s): "${unique.join('", "')}"`,
          'Filler words disrupt speech flow and reduce your Fluency Score by 5 pts each.',
          'Replace filler sounds with a confident 2-second pause. Pause = Power.'
        ));
      }

      // Grammar errors
      if (result.grammarIssues && result.grammarIssues.length > 0) {
        result.grammarIssues.forEach(issue => {
          cards.push(this._mistakeCard(
            'Grammar Issue: ' + issue.type,
            `Incorrect usage detected`,
            `"${issue.type}" errors reduce clarity and academic credibility.`,
            `Correction: use "${issue.fix}" instead.`
          ));
        });
      }

      // Repeated words
      if (result.repeatedWords && result.repeatedWords.length > 0) {
        result.repeatedWords.forEach(r => {
          cards.push(this._mistakeCard(
            'Word Repetition',
            `"${r.word}" was used ${r.count} times`,
            'Excessive repetition reduces vocabulary score and impacts engagement.',
            'Use synonyms or restructure sentences to avoid overusing this word.'
          ));
        });
      }

      // WPM issues
      if (result.wpm < 100 && result.words > 5) {
        cards.push(this._mistakeCard(
          'Speaking Pace Too Slow',
          `Your pace was ${result.wpm} WPM (ideal: 120–160 WPM)`,
          'Slow pace can lose the audience\'s attention and reduce engagement.',
          'Project more energy and confidence. Speak with deliberate momentum.'
        ));
      } else if (result.wpm > 180) {
        cards.push(this._mistakeCard(
          'Speaking Pace Too Fast',
          `Your pace was ${result.wpm} WPM (ideal: 120–160 WPM)`,
          'Speaking too fast makes it difficult for judges to follow your reasoning.',
          'Pause at each comma and full stop. Allow your words to land.'
        ));
      }

      if (cards.length === 0) {
        return `
          <div class="glass-card" style="padding:16px;border-left:4px solid var(--emerald);">
            <div style="font-weight:700;color:var(--emerald);margin-bottom:4px;">✅ Outstanding Delivery!</div>
            <p style="font-size:0.88rem;color:var(--text-muted);">No filler words or major mistakes detected. Excellent performance!</p>
          </div>`;
      }
      return cards.join('');
    },

    _mistakeCard(type, found, why, fix) {
      return `
        <div class="glass-card" style="padding:18px;border-left:4px solid var(--rose);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <strong style="color:var(--rose);font-size:0.95rem;">⚠️ ${type}</strong>
            <span class="badge-severity" style="background:rgba(244,63,94,0.2);color:var(--rose);">Mistake Found</span>
          </div>
          <p style="font-size:0.88rem;color:var(--text-main);margin-bottom:6px;">
            <strong>Detected:</strong> <em>"${found}"</em>
          </p>
          <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:10px;">
            <strong>Why it matters:</strong> ${why}
          </p>
          <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);
                      padding:10px;border-radius:6px;font-size:0.86rem;color:var(--text-main);">
            ✨ <strong>AI Recommendation:</strong><br>
            <span style="color:var(--emerald);font-weight:500;">${fix}</span>
          </div>
        </div>`;
    },

    _placeholder() {
      return `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.9rem;">
        Record your speech to see mistake analysis.
      </div>`;
    },

    /* ============================================================
     *  BIND EVENTS
     * ============================================================ */
    bindEvents() {
      const toggleBtn       = document.getElementById('btn-toggle-record');
      const reanalyzeBtn    = document.getElementById('btn-reanalyze-text');
      const timerEl         = document.getElementById('recording-timer');
      const statusEl        = document.getElementById('recording-status-text');
      const liveTextBox     = document.getElementById('live-mic-text-box');
      const waveEl          = document.getElementById('mic-waveform');
      const randomTopicBtn  = document.getElementById('btn-generate-topic');
      const topicTitle      = document.getElementById('current-debate-topic');
      const fileInput       = document.getElementById('file-upload-input');
      const copyBtn         = document.getElementById('btn-copy-transcript');
      const pdfBtn          = document.getElementById('btn-export-pdf-prac');
      const transcriptInput = document.getElementById('transcript-editable-input');
      const errorBanner     = document.getElementById('mic-error-banner');
      const loadingEl       = document.getElementById('eval-loading-state');
      const readAloudBtn    = document.getElementById('btn-read-aloud');

      const topicsList = [
        "Resolved: Universal Basic Income is necessary to offset technological unemployment.",
        "Resolved: Governments should regulate frontier Generative AI models as public utilities.",
        "Resolved: Carbon tariffs are superior to internal cap-and-trade carbon markets.",
        "Resolved: Developing nations should prioritize digital infrastructure over heavy industry.",
        "Resolved: Artificial intelligence will create more jobs than it displaces by 2030.",
        "Resolved: Social media platforms should be held legally responsible for user content.",
        "Resolved: Nuclear energy is essential for achieving net-zero carbon emissions.",
        "Resolved: Universal healthcare is a fundamental human right."
      ];

      let waveAnimFrame = null;
      let waveAudioCtx  = null;
      let waveAnalyser  = null;

      /* ---- Show/hide error banner ---- */
      const showError = (msg) => {
        if (errorBanner) { errorBanner.textContent = '⚠️ ' + msg; errorBanner.style.display = 'block'; }
        if (window.showToast) window.showToast(msg, 'warning');
      };
      const clearError = () => { if (errorBanner) errorBanner.style.display = 'none'; };

      /* ---- Random topic ---- */
      if (randomTopicBtn) {
        randomTopicBtn.addEventListener('click', () => {
          const current = topicTitle.textContent;
          let next = current;
          while (next === current) next = topicsList[Math.floor(Math.random() * topicsList.length)];
          topicTitle.textContent = next;
          if (window.showToast) window.showToast('New debate topic loaded!', 'info');
        });
      }

      /* ---- Read Aloud ---- */
      if (readAloudBtn) {
        readAloudBtn.addEventListener('click', () => {
          const text = transcriptInput?.value || '';
          if (!text.trim()) { if (window.showToast) window.showToast('No transcript to read.', 'warning'); return; }
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utt = new SpeechSynthesisUtterance(text);
            utt.rate = 0.95; utt.pitch = 1; utt.lang = 'en-US';
            window.speechSynthesis.speak(utt);
          }
        });
      }

      /* ---- Start waveform animation using microphone stream ---- */
      const startWave = (stream) => {
        try {
          waveAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const source = waveAudioCtx.createMediaStreamSource(stream);
          waveAnalyser = waveAudioCtx.createAnalyser();
          waveAnalyser.fftSize = 32;
          source.connect(waveAnalyser);
          const data = new Uint8Array(waveAnalyser.frequencyBinCount);
          const bars = waveEl ? waveEl.querySelectorAll('.mock-bar') : [];
          const animate = () => {
            if (!this.isRecording) return;
            waveAnalyser.getByteFrequencyData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) sum += data[i];
            const avg = sum / data.length;
            bars.forEach((bar, idx) => {
              const v = data[idx % data.length] || avg;
              bar.style.height = Math.max(15, Math.min(100, (v / 255) * 100)) + '%';
            });
            waveAnimFrame = requestAnimationFrame(animate);
          };
          animate();
        } catch (_) {}
      };

      const stopWave = () => {
        if (waveAnimFrame) cancelAnimationFrame(waveAnimFrame);
        if (waveAudioCtx) { try { waveAudioCtx.close(); } catch (_) {} waveAudioCtx = null; }
        const bars = waveEl ? waveEl.querySelectorAll('.mock-bar') : [];
        bars.forEach(b => b.style.height = '30%');
      };

      /* ==============================================================
       *  CORE EVALUATION PIPELINE
       * ============================================================== */
      const runEvaluationPipeline = (textOverride) => {
        clearError();
        const spokenText = (textOverride || transcriptInput?.value || window.LiveSTT?.getFinalText() || '').trim();

        if (!spokenText || spokenText.length < 5) {
          showError('No spoken text detected. Please speak into the microphone or type your speech.');
          return;
        }

        if (loadingEl) loadingEl.style.display = 'block';
        if (statusEl) { statusEl.textContent = '⚡ AI evaluation pipeline running...'; statusEl.style.color = 'var(--cyan)'; }

        setTimeout(() => {
          const result = window.AIEvaluationEngine.evaluate(spokenText, this.recordTimer || 30);

          /* -- Update score bars -- */
          this._updateScoreBars(result);

          /* -- Update annotated transcript -- */
          const annotatedEl = document.getElementById('annotated-transcript-view');
          if (annotatedEl) {
            annotatedEl.style.display = 'block';
            annotatedEl.innerHTML = window.AIEvaluationEngine.buildAnnotatedHTML(spokenText, result.annotations);
          }

          /* -- Update mistake cards -- */
          const mistakesEl = document.getElementById('speech-mistakes-container');
          if (mistakesEl) mistakesEl.innerHTML = this._renderMistakeCards(result);

          /* -- Update strengths/suggestions -- */
          const strengthsEl = document.getElementById('strengths-list');
          const suggestionsEl = document.getElementById('suggestions-list');
          if (strengthsEl) strengthsEl.innerHTML = result.strengths.map(s => `<div>${s}</div>`).join('');
          if (suggestionsEl) suggestionsEl.innerHTML = result.suggestions.map(s => `<div>${s}</div>`).join('');

          /* -- Build clean coaching feedback HTML -- */
          const topic  = topicTitle?.textContent || 'Debate';
          const format = document.getElementById('select-debate-format')?.value || 'Lincoln-Douglas';
          const feedbackHTML = this._buildFeedbackHTML(result, topic, format);
          const feedbackEl = document.getElementById('ai-custom-feedback-content');
          if (feedbackEl) feedbackEl.innerHTML = feedbackHTML;

          /* -- Audio replay -- */
          const audioWrapper = document.getElementById('audio-replay-wrapper');
          const audioPlayer  = document.getElementById('recorded-audio-player');
          if (this.audioURL && audioPlayer && audioWrapper) {
            audioPlayer.src = this.audioURL;
            audioWrapper.style.display = 'block';
          }

          /* -- Persist to DB -- */
          const user = window.AIDebateAuth.currentUser;
          if (user) {
            const durStr = `${Math.floor(this.recordTimer / 60)}m ${this.recordTimer % 60}s`;
            window.AIDebateDB.addPracticeSession({
              userId       : user.id,
              topic        : topic,
              debateType   : format,
              duration     : durStr,
              durationSeconds: this.recordTimer || 30,
              score        : result.finalScore,
              wpm          : result.wpm,
              metrics      : {
                confidence : result.confidence,
                fluency    : result.fluency,
                grammar    : result.argumentLogic,
                relevance  : result.pronunciation,
                overall    : result.finalScore
              },
              fallaciesFound: [],
              strengths    : result.strengths,
              suggestions  : result.suggestions,
              aiFeedback   : feedbackHTML,
              aiFeedbackClean: feedbackHTML,
              transcript   : spokenText,
              audioURL     : this.audioURL || null
            });

            if (window.showToast) window.showToast('✅ Speech evaluated & saved to Debate History!', 'success');
          }

          if (loadingEl) loadingEl.style.display = 'none';
          if (statusEl) { statusEl.textContent = '✅ Evaluation complete!'; statusEl.style.color = 'var(--emerald)'; }

        }, 400);
      };

      /* ==============================================================
       *  RECORD TOGGLE
       * ============================================================== */
      if (toggleBtn) {
        toggleBtn.addEventListener('click', async () => {
          if (!this.isRecording) {
            /* ---- START RECORDING ---- */
            this.isRecording = true;
            this.recordTimer = 0;
            this.audioURL    = null;
            clearError();

            toggleBtn.innerHTML = '⏹️ Stop &amp; Evaluate Speech';
            toggleBtn.style.background = 'linear-gradient(135deg, #dc2626, #9b1010)';
            if (statusEl) { statusEl.textContent = '🔴 Recording live from your microphone... Speak clearly!'; statusEl.style.color = 'var(--rose)'; }
            if (waveEl) waveEl.style.opacity = '1';
            if (liveTextBox) liveTextBox.innerHTML = '<span style="color:var(--cyan);font-weight:bold;">[Listening… speak into your microphone now!]</span>';
            if (transcriptInput) transcriptInput.value = '';
            const annotatedEl = document.getElementById('annotated-transcript-view');
            if (annotatedEl) annotatedEl.style.display = 'none';
            const audioWrapper = document.getElementById('audio-replay-wrapper');
            if (audioWrapper) audioWrapper.style.display = 'none';

            /* Start timer */
            this.timerInterval = setInterval(() => {
              this.recordTimer++;
              const m = String(Math.floor(this.recordTimer / 60)).padStart(2, '0');
              const s = String(this.recordTimer % 60).padStart(2, '0');
              if (timerEl) timerEl.textContent = `${m}:${s}`;
            }, 1000);

            /* Start MediaRecorder */
            try {
              const stream = await window.MicRecorder.start((err) => showError(err));
              startWave(stream);
            } catch (_) {
              /* MicRecorder already showed error */
              this.isRecording = false;
              clearInterval(this.timerInterval);
              toggleBtn.innerHTML = '🎙️ Start Recording Speech';
              toggleBtn.style.background = '';
              if (waveEl) waveEl.style.opacity = '0.35';
              return;
            }

            /* Start live STT */
            window.LiveSTT.start(
              (final, interim) => {
                this.liveTranscript = final;
                if (liveTextBox) liveTextBox.textContent = (final + interim) || 'Listening…';
                if (transcriptInput) transcriptInput.value = (final + interim).trim();
              },
              (err) => showError('Speech recognition: ' + err)
            );

          } else {
            /* ---- STOP RECORDING ---- */
            this.isRecording = false;
            clearInterval(this.timerInterval);

            toggleBtn.innerHTML = '🎙️ Start Recording Speech';
            toggleBtn.style.background = '';
            if (waveEl) waveEl.style.opacity = '0.35';
            if (statusEl) { statusEl.textContent = '⏳ Processing recording…'; statusEl.style.color = 'var(--text-muted)'; }

            /* Stop STT */
            const finalText = window.LiveSTT.stop();
            if (finalText && transcriptInput) transcriptInput.value = finalText;

            /* Stop audio recorder */
            const audioResult = await window.MicRecorder.stop();
            if (audioResult) this.audioURL = audioResult.url;
            stopWave();

            /* Run evaluation */
            runEvaluationPipeline(finalText || transcriptInput?.value || '');
          }
        });
      }

      /* ---- Re-analyse button (text typed manually) ---- */
      if (reanalyzeBtn) {
        reanalyzeBtn.addEventListener('click', () => runEvaluationPipeline(transcriptInput?.value || ''));
      }

      /* ---- File upload ---- */
      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          if (e.target.files.length > 0) {
            const file = e.target.files[0];
            this.audioURL = URL.createObjectURL(file);
            const audioPlayer = document.getElementById('recorded-audio-player');
            const audioWrapper = document.getElementById('audio-replay-wrapper');
            if (audioPlayer && audioWrapper) { audioPlayer.src = this.audioURL; audioWrapper.style.display = 'block'; }
            if (window.showToast) window.showToast(`Loaded "${file.name}". Type or speak your transcript then click Evaluate.`, 'info');
          }
        });
      }

      /* ---- Copy transcript ---- */
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const t = transcriptInput?.value || '';
          if (!t) { if (window.showToast) window.showToast('Nothing to copy.', 'warning'); return; }
          navigator.clipboard.writeText(t).then(() => {
            if (window.showToast) window.showToast('Transcript copied to clipboard!', 'success');
          });
        });
      }

      /* ---- PDF Export ---- */
      if (pdfBtn) {
        pdfBtn.addEventListener('click', () => window.print());
      }
    },

    /* ---- Build rich coaching feedback HTML ---- */
    _buildFeedbackHTML(result, topic, format) {
      const paceClass = result.paceLabel === 'Normal' ? 'var(--emerald)' : result.paceLabel === 'Too Slow' || result.paceLabel === 'Very Fast' ? 'var(--rose)' : 'var(--amber)';
      return `
        <strong>AI Coaching Report — ${format} | ${topic}</strong><br><br>
        📊 <strong>Performance Summary:</strong><br>
        &nbsp;&nbsp;• You spoke <strong>${result.words} words</strong> in
          <strong>${Math.floor(result.duration / 60)}m ${result.duration % 60}s</strong>
          at <strong style="color:${paceClass};">${result.wpm} WPM (${result.paceLabel})</strong>.<br>
        &nbsp;&nbsp;• Fluency: <strong style="color:var(--emerald);">${result.fluency}%</strong>
          &nbsp;|&nbsp; Grammar: <strong>${result.grammar}%</strong>
          &nbsp;|&nbsp; Vocabulary: <strong>${result.vocabulary}%</strong>
          &nbsp;|&nbsp; Argument Logic: <strong>${result.argumentLogic}%</strong>
          &nbsp;|&nbsp; Delivery: <strong>${result.delivery}%</strong><br><br>
        ${result.fillerWords.length > 0
          ? `<span style="color:var(--rose);">⚠️ ${result.fillerWords.length} filler word(s) detected. Replace with deliberate pauses to boost Fluency score by ~${result.fillerWords.length * 5} points.</span><br>`
          : `<span style="color:var(--emerald);">✅ Zero filler words — excellent vocal control!</span><br>`}
        <br>
        🎯 <strong>Strategy Recommendation:</strong><br>
        Strengthen your point by anchoring it to empirical evidence. For example:
        <em>"According to a 2025 World Economic Forum report, ${topic.length > 60 ? topic.substring(8, 60) + '…' : topic} — statistical models corroborate this with a 94% confidence interval."</em>
      `;
    }
  };

})();
