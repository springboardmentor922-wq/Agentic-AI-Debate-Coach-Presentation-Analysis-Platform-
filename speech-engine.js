/* ==========================================================================
   AI DEBATE COACH — PRODUCTION SPEECH ENGINE v3.0
   Real Microphone · Live STT · Dynamic AI Evaluation · Mistake Highlighting
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
   *  CORE VOCABULARY LISTS
   * ------------------------------------------------------------------ */
  const FILLER_WORDS = [
    'um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'literally',
    'actually', 'honestly', 'obviously', 'right', 'okay', 'so', 'well',
    'kind of', 'sort of', 'i mean', 'you see', 'thing', 'stuff'
  ];

  const ADVANCED_VOCAB = [
    'furthermore', 'consequently', 'nevertheless', 'empirical', 'substantiate',
    'infrastructure', 'statistically', 'paradigm', 'rhetoric', 'coherent',
    'inevitably', 'demonstrably', 'correlates', 'ameliorate', 'categorical',
    'pragmatic', 'comprehensive', 'intrinsically', 'proliferation', 'mitigate',
    'nuanced', 'unprecedented', 'indisputable', 'corroborated', 'synthesis',
    'ramifications', 'culminate', 'exacerbate', 'delineate', 'juxtapose'
  ];

  const TRANSITION_WORDS = [
    'however', 'therefore', 'moreover', 'thus', 'hence', 'whereas', 'although',
    'despite', 'nonetheless', 'additionally', 'subsequently', 'consequently',
    'conversely', 'meanwhile', 'ultimately', 'initially', 'primarily', 'notably'
  ];

  const GRAMMAR_ERRORS = [
    { pattern: /\bi is\b/gi, fix: 'I am', type: 'Subject-Verb Agreement' },
    { pattern: /\bwe is\b/gi, fix: 'we are', type: 'Subject-Verb Agreement' },
    { pattern: /\bthey is\b/gi, fix: 'they are', type: 'Subject-Verb Agreement' },
    { pattern: /\bhe are\b/gi, fix: 'he is', type: 'Subject-Verb Agreement' },
    { pattern: /\bshe are\b/gi, fix: 'she is', type: 'Subject-Verb Agreement' },
    { pattern: /\bit are\b/gi, fix: 'it is', type: 'Subject-Verb Agreement' },
    { pattern: /\bwas not go\b/gi, fix: 'did not go', type: 'Tense Error' },
    { pattern: /\bmore better\b/gi, fix: 'better', type: 'Double Comparative' },
    { pattern: /\bmost best\b/gi, fix: 'best', type: 'Double Superlative' },
    { pattern: /\bless harder\b/gi, fix: 'less hard', type: 'Comparative Error' },
    { pattern: /\bgoed\b/gi, fix: 'went', type: 'Irregular Verb' },
    { pattern: /\bfeared of\b/gi, fix: 'afraid of', type: 'Word Choice' },
    { pattern: /\bcan able to\b/gi, fix: 'able to', type: 'Redundancy' },
    { pattern: /\bvery unique\b/gi, fix: 'unique', type: 'Redundant Modifier' },
    { pattern: /\ba ultimate\b/gi, fix: 'an ultimate', type: 'Article Error' },
    { pattern: /\ba honest\b/gi, fix: 'an honest', type: 'Article Error' },
    { pattern: /\ba hour\b/gi, fix: 'an hour', type: 'Article Error' },
    { pattern: /\ba answer\b/gi, fix: 'an answer', type: 'Article Error' }
  ];

  /* ------------------------------------------------------------------
   *  DETERMINISTIC AI EVALUATION ENGINE
   *  Input : transcript string + duration seconds
   *  Output: structured evaluation JSON
   * ------------------------------------------------------------------ */
  window.AIEvaluationEngine = {

    evaluate(transcript, durationSeconds) {
      if (!transcript || transcript.trim().length < 3) {
        return this._emptyResult();
      }

      const text    = transcript.trim();
      const lower   = text.toLowerCase();
      const words   = text.split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      const durSec  = Math.max(1, durationSeconds || 30);
      const wpm     = Math.round((wordCount / durSec) * 60);

      /* ---- FILLER ANALYSIS ---- */
      const fillerHits = [];
      FILLER_WORDS.forEach(fw => {
        const re = new RegExp('\\b' + fw.replace(/\s/g, '\\s') + '\\b', 'gi');
        const m = lower.match(re);
        if (m) fillerHits.push(...m.map(() => fw));
      });
      const fillerCount = fillerHits.length;

      /* ---- VOCABULARY ANALYSIS ---- */
      const uniqueWords    = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, '')));
      const lexicalDensity = wordCount > 0 ? uniqueWords.size / wordCount : 0;
      const advancedHits   = ADVANCED_VOCAB.filter(av => lower.includes(av));
      const transitionHits = TRANSITION_WORDS.filter(tw => lower.includes(tw));

      /* ---- GRAMMAR ANALYSIS ---- */
      const grammarIssues = [];
      GRAMMAR_ERRORS.forEach(rule => {
        if (rule.pattern.test(text)) {
          grammarIssues.push({ type: rule.type, fix: rule.fix });
          rule.pattern.lastIndex = 0;
        }
      });

      /* ---- ARGUMENT STRUCTURE ---- */
      const hasIntro      = /\b(i (will|want to|would like to)|today|ladies and gentlemen|honourable|my argument|resolved)\b/.test(lower);
      const hasConclusion = /\b(in conclusion|therefore|thus|to summarize|to conclude|in summary|for these reasons)\b/.test(lower);
      const hasEvidence   = /\b(research|study|data|statistic|evidence|according to|report|survey|percent|%)\b/.test(lower);
      const hasCounterArg = /\b(however|despite|although|while|whereas|on the other hand|critics|opponents)\b/.test(lower);

      /* ---- REPETITION DETECTION ---- */
      const repeatedWords = [];
      const wordFreq = {};
      words.forEach(w => {
        const clean = w.toLowerCase().replace(/[^a-z]/g, '');
        if (clean.length > 3) wordFreq[clean] = (wordFreq[clean] || 0) + 1;
      });
      Object.entries(wordFreq).forEach(([w, freq]) => {
        if (freq >= 4) repeatedWords.push({ word: w, count: freq });
      });

      /* ---- CALCULATE SCORES (fully deterministic, no randomness) ---- */

      // FLUENCY (base 95, penalise fillers, reward transitions)
      let fluency = 95;
      fluency -= fillerCount * 5;
      fluency += Math.min(transitionHits.length * 2, 8);
      if (repeatedWords.length > 2) fluency -= repeatedWords.length * 2;
      fluency = Math.max(30, Math.min(100, fluency));

      // GRAMMAR
      let grammar = 95;
      grammar -= grammarIssues.length * 8;
      if (wordCount < 10) grammar -= 20;
      grammar = Math.max(30, Math.min(100, grammar));

      // VOCABULARY
      let vocabulary = Math.round(50 + lexicalDensity * 30 + advancedHits.length * 4);
      vocabulary = Math.max(35, Math.min(100, vocabulary));

      // PRONUNCIATION (approximated from confidence of recognition — we use word count & length as proxy)
      let pronunciation = 80;
      if (wordCount > 50) pronunciation += 8;
      if (wordCount > 100) pronunciation += 5;
      if (fillerCount > 5) pronunciation -= 10;
      pronunciation = Math.max(40, Math.min(100, pronunciation));

      // ARGUMENT LOGIC
      let argumentLogic = 55;
      if (hasIntro)       argumentLogic += 10;
      if (hasConclusion)  argumentLogic += 10;
      if (hasEvidence)    argumentLogic += 12;
      if (hasCounterArg)  argumentLogic += 8;
      argumentLogic += Math.min(advancedHits.length * 2, 10);
      if (wordCount < 20) argumentLogic -= 15;
      argumentLogic = Math.max(30, Math.min(100, argumentLogic));

      // DELIVERY (WPM-based)
      let delivery = 80;
      if (wpm >= 120 && wpm <= 160) delivery = 92;
      else if (wpm >= 100 && wpm < 120) delivery = 82;
      else if (wpm > 160 && wpm <= 180) delivery = 78;
      else if (wpm > 180) delivery = 62;
      else if (wpm < 80) delivery = 65;
      if (wordCount < 15) delivery = Math.min(delivery, 60);
      delivery = Math.max(30, Math.min(100, delivery));

      // CONFIDENCE (composite)
      let confidence = Math.round((fluency * 0.3 + delivery * 0.3 + pronunciation * 0.2 + grammar * 0.2));
      confidence = Math.max(30, Math.min(100, confidence));

      // FINAL WEIGHTED SCORE
      const finalScore = Math.round(
        fluency       * 0.20 +
        grammar       * 0.15 +
        vocabulary    * 0.15 +
        pronunciation * 0.10 +
        argumentLogic * 0.20 +
        delivery      * 0.10 +
        confidence    * 0.10
      );

      /* ---- QUALITATIVE FEEDBACK ---- */
      const strengths  = this._buildStrengths({ fluency, grammar, vocabulary, argumentLogic, delivery, hasIntro, hasConclusion, hasEvidence, hasCounterArg, wpm, fillerCount, transitionHits, advancedHits });
      const mistakes   = this._buildMistakes({ fillerCount, fillerHits, grammarIssues, repeatedWords, hasIntro, hasConclusion, wpm, wordCount });
      const suggestions = this._buildSuggestions({ fillerCount, grammarIssues, hasConclusion, hasEvidence, wpm, vocabulary, argumentLogic });

      /* ---- MISTAKE ANNOTATIONS for transcript ---- */
      const annotations = this._buildAnnotations(text, { fillerHits: [...new Set(fillerHits)], grammarIssues, repeatedWords });

      /* ---- WPM CLASSIFICATION ---- */
      let paceLabel = 'Normal';
      if (wpm < 100) paceLabel = 'Too Slow';
      else if (wpm > 180) paceLabel = 'Very Fast';
      else if (wpm > 160) paceLabel = 'Fast';

      return {
        transcript,
        duration: durSec,
        words: wordCount,
        wpm,
        paceLabel,
        fluency,
        grammar,
        pronunciation,
        vocabulary,
        argumentLogic,
        delivery,
        confidence,
        finalScore,
        strengths,
        mistakes,
        suggestions,
        annotations,
        fillerWords: fillerHits,
        grammarIssues,
        repeatedWords,
        advancedVocab: advancedHits,
        transitions: transitionHits
      };
    },

    _buildStrengths({ fluency, grammar, vocabulary, argumentLogic, delivery, hasIntro, hasConclusion, hasEvidence, hasCounterArg, wpm, fillerCount, transitionHits, advancedHits }) {
      const s = [];
      if (fluency >= 85)       s.push('✔ Excellent fluency with minimal hesitation');
      if (fluency >= 75 && fluency < 85) s.push('✔ Reasonably smooth delivery');
      if (grammar >= 90)       s.push('✔ Strong grammatical accuracy');
      if (vocabulary >= 80)    s.push('✔ Rich and varied vocabulary');
      if (argumentLogic >= 80) s.push('✔ Well-structured logical argument');
      if (delivery >= 85)      s.push('✔ Excellent speaking pace');
      if (hasIntro)            s.push('✔ Clear and confident opening statement');
      if (hasConclusion)       s.push('✔ Effective conclusion that reinforces your argument');
      if (hasEvidence)         s.push('✔ Evidence-backed claims that strengthen credibility');
      if (hasCounterArg)       s.push('✔ Acknowledged opposing views — shows critical thinking');
      if (fillerCount === 0)   s.push('✔ Zero filler words — very clean delivery');
      if (transitionHits.length >= 3) s.push('✔ Good use of rhetorical transition connectors');
      if (advancedHits.length >= 3)   s.push('✔ Advanced academic vocabulary used effectively');
      if (wpm >= 120 && wpm <= 160) s.push(`✔ Ideal speaking pace (${wpm} WPM)`);
      if (s.length === 0) s.push('✔ Speech recorded and evaluated successfully');
      return s;
    },

    _buildMistakes({ fillerCount, fillerHits, grammarIssues, repeatedWords, hasIntro, hasConclusion, wpm, wordCount }) {
      const m = [];
      if (fillerCount > 0)    m.push(`✘ Used ${fillerCount} filler word(s): "${[...new Set(fillerHits)].join('", "')}"`);
      if (grammarIssues.length > 0) m.push(`✘ ${grammarIssues.length} grammar issue(s) detected (${grammarIssues.map(g => g.type).join(', ')})`);
      if (repeatedWords.length > 0) m.push(`✘ Repeated words: "${repeatedWords.map(r => r.word + ' ×' + r.count).join('", "')}"`);
      if (!hasIntro)          m.push('✘ Missing a clear opening statement or introduction');
      if (!hasConclusion)     m.push('✘ No conclusion or closing argument found');
      if (wpm < 100)          m.push(`✘ Speaking pace too slow (${wpm} WPM — aim for 120–160 WPM)`);
      if (wpm > 180)          m.push(`✘ Speaking too fast (${wpm} WPM — slow down to 120–160 WPM)`);
      if (wordCount < 20)     m.push('✘ Speech too short — develop your argument further');
      if (m.length === 0)     m.push('✔ No critical mistakes detected in this speech');
      return m;
    },

    _buildSuggestions({ fillerCount, grammarIssues, hasConclusion, hasEvidence, wpm, vocabulary, argumentLogic }) {
      const s = [];
      if (fillerCount > 2)    s.push('• Replace filler sounds ("um", "uh") with confident 2-second pauses');
      if (grammarIssues.length > 0) s.push('• Review subject-verb agreement and tense consistency');
      if (!hasConclusion)     s.push('• End your speech with: "For these reasons, I firmly believe..." to signal a conclusion');
      if (!hasEvidence)       s.push('• Cite research data or statistics to support your claims (e.g., "According to a 2025 study...")');
      if (wpm > 160)          s.push('• Slow down: pause naturally at commas and full stops');
      if (wpm < 100)          s.push('• Speak with more energy — project confidence and increase your pace slightly');
      if (vocabulary < 70)    s.push('• Expand vocabulary: use academic connectors like "consequently", "empirically", "substantiate"');
      if (argumentLogic < 70) s.push('• Structure your argument: Claim → Warrant → Impact (CWI framework)');
      if (s.length === 0)     s.push('• Continue practising at this level — your performance is strong');
      return s;
    },

    _buildAnnotations(text, { fillerHits, grammarIssues, repeatedWords }) {
      const annotations = [];

      fillerHits.forEach(fw => {
        const re = new RegExp('\\b' + fw.replace(/\s/g, '\\s') + '\\b', 'gi');
        let match;
        while ((match = re.exec(text)) !== null) {
          annotations.push({ start: match.index, end: match.index + match[0].length, type: 'filler', label: 'Filler Word', original: match[0] });
        }
      });

      repeatedWords.filter(r => r.count >= 4).forEach(({ word }) => {
        const re = new RegExp('\\b' + word + '\\b', 'gi');
        let match;
        while ((match = re.exec(text)) !== null) {
          annotations.push({ start: match.index, end: match.index + match[0].length, type: 'repeat', label: 'Repeated Word', original: match[0] });
        }
      });

      GRAMMAR_ERRORS.forEach(rule => {
        let match;
        const re = new RegExp(rule.pattern.source, 'gi');
        while ((match = re.exec(text)) !== null) {
          annotations.push({ start: match.index, end: match.index + match[0].length, type: 'grammar', label: rule.type, original: match[0], fix: rule.fix });
        }
      });

      return annotations;
    },

    buildAnnotatedHTML(transcript, annotations) {
      if (!transcript || !annotations || annotations.length === 0) {
        return `<span>${transcript}</span>`;
      }

      // Sort by start position
      const sorted = [...annotations].sort((a, b) => a.start - b.start);
      let html = '';
      let cursor = 0;

      sorted.forEach(ann => {
        if (ann.start < cursor) return; // overlap guard
        // text before
        html += escapeHtml(transcript.slice(cursor, ann.start));
        const colorMap = { filler: 'var(--rose)', repeat: 'var(--amber)', grammar: 'var(--purple)' };
        const bg = { filler: 'rgba(244,63,94,0.18)', repeat: 'rgba(245,158,11,0.18)', grammar: 'rgba(139,92,246,0.18)' };
        const word = escapeHtml(transcript.slice(ann.start, ann.end));
        const tip = ann.fix ? `"${word}" → "${ann.fix}" (${ann.label})` : ann.label;
        html += `<mark style="background:${bg[ann.type]||'rgba(255,255,255,0.1)'};color:${colorMap[ann.type]||'inherit'};border-radius:3px;padding:0 2px;cursor:help;" title="${tip}">${word}</mark>`;
        cursor = ann.end;
      });
      html += escapeHtml(transcript.slice(cursor));
      return html;
    },

    _emptyResult() {
      return {
        transcript: '', duration: 0, words: 0, wpm: 0, paceLabel: '--',
        fluency: 0, grammar: 0, pronunciation: 0, vocabulary: 0,
        argumentLogic: 0, delivery: 0, confidence: 0, finalScore: 0,
        strengths: [], mistakes: ['No speech detected'], suggestions: ['Speak into your microphone and try again'],
        annotations: [], fillerWords: [], grammarIssues: [], repeatedWords: [], advancedVocab: [], transitions: []
      };
    }
  };

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ------------------------------------------------------------------
   *  MICROPHONE RECORDER MANAGER
   * ------------------------------------------------------------------ */
  window.MicRecorder = {
    _stream: null,
    _mediaRecorder: null,
    _chunks: [],
    _audioBlob: null,
    _audioURL: null,

    async start(onError) {
      try {
        this._chunks = [];
        this._audioBlob = null;
        this._audioURL = null;

        this._stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 } });
        this._mediaRecorder = new MediaRecorder(this._stream, { mimeType: this._getSupportedMime() });
        this._mediaRecorder.ondataavailable = e => { if (e.data && e.data.size > 0) this._chunks.push(e.data); };
        this._mediaRecorder.start(200);
        return this._stream;
      } catch (err) {
        const msg = err.name === 'NotAllowedError'
          ? 'Microphone access denied. Please allow microphone permission in your browser and refresh.'
          : err.name === 'NotFoundError'
            ? 'No microphone found. Please connect a microphone and try again.'
            : 'Could not start recording: ' + err.message;
        if (onError) onError(msg);
        throw err;
      }
    },

    stop() {
      return new Promise((resolve) => {
        if (!this._mediaRecorder) { resolve(null); return; }
        this._mediaRecorder.onstop = () => {
          const mime = this._getSupportedMime();
          this._audioBlob = new Blob(this._chunks, { type: mime });
          this._audioURL = URL.createObjectURL(this._audioBlob);
          if (this._stream) this._stream.getTracks().forEach(t => t.stop());
          resolve({ blob: this._audioBlob, url: this._audioURL });
        };
        this._mediaRecorder.stop();
      });
    },

    _getSupportedMime() {
      const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      for (const t of types) { if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) return t; }
      return 'audio/webm';
    }
  };

  /* ------------------------------------------------------------------
   *  LIVE SPEECH-TO-TEXT ENGINE
   * ------------------------------------------------------------------ */
  window.LiveSTT = {
    _recognition: null,
    _finalText: '',
    _interimText: '',

    start(onUpdate, onError) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        if (onError) onError('Your browser does not support live speech recognition. Try Chrome or Edge.');
        return;
      }

      this._finalText   = '';
      this._interimText = '';

      this._recognition = new SR();
      this._recognition.continuous      = true;
      this._recognition.interimResults  = true;
      this._recognition.lang            = 'en-US';
      this._recognition.maxAlternatives = 1;

      this._recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            this._finalText += t + ' ';
          } else {
            interim += t;
          }
        }
        this._interimText = interim;
        if (onUpdate) onUpdate(this._finalText, interim);
      };

      this._recognition.onerror = (e) => {
        if (e.error === 'no-speech') return; // non-fatal
        if (e.error === 'not-allowed') {
          if (onError) onError('Microphone permission denied for speech recognition.');
        }
      };

      this._recognition.onend = () => {
        // Auto-restart while recording is active (Chrome stops after ~60s)
        if (this._active) {
          try { this._recognition.start(); } catch (_) {}
        }
      };

      this._active = true;
      try { this._recognition.start(); } catch (e) { if (onError) onError(e.message); }
    },

    stop() {
      this._active = false;
      if (this._recognition) {
        try { this._recognition.stop(); } catch (_) {}
      }
      return (this._finalText + this._interimText).trim();
    },

    getFinalText() { return this._finalText.trim(); },
    getFullText()  { return (this._finalText + this._interimText).trim(); }
  };

})();
