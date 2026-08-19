/* ==========================================================================
   AI DEBATE COACH — GEMINI-POWERED CHATBOT v5.0
   Real LLM API · Full conversation history · Context-aware · No hardcoding
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY_APIKEY = 'AIDEBATE_GEMINI_API_KEY';
  const GEMINI_MODEL = 'gemini-1.5-flash';
  const GEMINI_URL   = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  /* ============================================================
   *  SYSTEM PROMPT — gives Gemini the context of this platform
   * ============================================================ */
  const SYSTEM_PROMPT = `You are DebateBot, the AI assistant embedded inside an AI Debate Coach learning platform.
You are highly knowledgeable, conversational, and professional.
The platform serves Learners (debate students), Educators, Coaches, and Admins.

Your capabilities and behavior rules:

1. UNDERSTAND INTENT FIRST — Read the user's question carefully. Answer ONLY what they asked.
2. NEVER return the same template for every question. Each answer must be unique and relevant.
3. NEVER return "Claim → Warrant → Impact" unless the user explicitly asks for debate speaking structure.
4. EDUCATIONAL QUESTIONS — Explain clearly with definition, how it works, real-world examples, advantages/disadvantages.
5. PROGRAMMING QUESTIONS — Include explanations, working code blocks in markdown (\`\`\`language), and expected output.
6. DEBATE QUESTIONS — Provide arguments, counter-arguments, evidence, rebuttal strategies, speaking tips.
7. GENERAL KNOWLEDGE — Give accurate, informative answers. Use data/statistics where helpful.
8. GRAMMAR/WRITING — Correct errors, explain the rule, and show the corrected version.
9. COMPARISON QUESTIONS — Use structured tables (markdown) to compare clearly.
10. FOLLOW-UP CONTEXT — You receive the full conversation history. Use it — "give examples" means examples of the PREVIOUS topic.
11. FORMAT — Use markdown formatting: **bold**, bullet lists, numbered steps, code blocks, and tables.
12. LENGTH — 150-500 words. Be thorough but not padded. Match depth to complexity of question.
13. END — Suggest 3-4 relevant follow-up questions the user might want to ask next.

You serve students at universities and debate academies. Be friendly, precise, and educational.
Never say you cannot answer general knowledge, science, programming, or career questions.
You know about: AI, Machine Learning, Deep Learning, Python, JavaScript, Java, SQL, DBMS, Data Structures, 
Networking, Operating Systems, Climate Change, Economics, Physics, Biology, Space Science, 
Public Speaking, Logical Fallacies, Debate Strategy, Resume Writing, Interview Preparation, 
English Grammar, and all general knowledge topics.`;

  /* ============================================================
   *  CONVERSATION HISTORY — full LLM message history
   * ============================================================ */
  const ChatHistory = {
    messages: [],  // [{role:'user'|'model', parts:[{text:''}]}]

    push(role, text) {
      this.messages.push({ role, parts: [{ text }] });
      // Keep last 40 turns to stay within token limits
      if (this.messages.length > 40) this.messages.splice(0, 2);
    },

    getForAPI() {
      return this.messages;
    },

    clear() {
      this.messages = [];
    }
  };

  /* ============================================================
   *  GEMINI API CALLER
   * ============================================================ */
  const GeminiAPI = {
    getKey() {
      return localStorage.getItem(STORAGE_KEY_APIKEY) || '';
    },

    setKey(key) {
      localStorage.setItem(STORAGE_KEY_APIKEY, key.trim());
    },

    hasKey() {
      return !!this.getKey();
    },

    async call(userMessage) {
      const apiKey = this.getKey();
      if (!apiKey) throw new Error('NO_API_KEY');

      // Build request body with full conversation history
      const requestBody = {
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [
          ...ChatHistory.getForAPI(),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 1024,
          stopSequences: []
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',       threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',      threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
        ]
      };

      const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 400) throw new Error('INVALID_KEY');
        if (response.status === 429) throw new Error('RATE_LIMIT');
        throw new Error(err?.error?.message || 'API_ERROR');
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text) throw new Error('EMPTY_RESPONSE');
      return text;
    }
  };

  /* ============================================================
   *  MARKDOWN → HTML RENDERER  (lightweight, no deps)
   * ============================================================ */
  const MD = {
    render(text) {
      return text
        // Code blocks FIRST (before other replacements)
        .replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => {
          const escaped = code.trim()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          const langLabel = lang ? `<span style="font-size:0.72rem;color:var(--text-muted);float:right;padding:2px 6px;">${lang}</span>` : '';
          return `<pre style="background:rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px 14px;margin:8px 0;overflow-x:auto;position:relative;">${langLabel}<code style="font-family:'JetBrains Mono',monospace;font-size:0.82rem;color:var(--text-cyan);display:block;clear:both;">${escaped}</code></pre>`;
        })
        // Inline code
        .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:4px;font-family:\'JetBrains Mono\',monospace;font-size:0.85rem;color:var(--text-cyan);">$1</code>')
        // Headers
        .replace(/^### (.+)$/gm, '<div style="font-weight:700;font-size:1rem;color:var(--cyan);margin:12px 0 4px;">$1</div>')
        .replace(/^## (.+)$/gm,  '<div style="font-weight:800;font-size:1.1rem;color:var(--text-main);margin:14px 0 6px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:4px;">$1</div>')
        .replace(/^# (.+)$/gm,   '<div style="font-weight:900;font-size:1.2rem;color:var(--cyan);margin:14px 0 8px;">$1</div>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Tables
        .replace(/(\|.+\|[\s\S]*?)(?=\n\n|\n[^|]|$)/g, (match) => this._table(match))
        // Bullet lists
        .replace(/^[\*\-] (.+)$/gm, '<div style="padding:2px 0 2px 16px;position:relative;"><span style="position:absolute;left:4px;color:var(--cyan);">•</span>$1</div>')
        // Numbered lists
        .replace(/^(\d+)\. (.+)$/gm, '<div style="padding:2px 0 2px 20px;position:relative;"><span style="position:absolute;left:4px;color:var(--cyan);font-weight:700;">$1.</span>$2</div>')
        // Horizontal rule
        .replace(/^---$/gm, '<hr style="border-color:rgba(255,255,255,0.08);margin:10px 0;">')
        // Line breaks (double newline → paragraph break)
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
    },

    _table(raw) {
      const lines = raw.trim().split('\n').filter(l => l.trim());
      if (lines.length < 2) return raw;
      let html = '<table style="width:100%;border-collapse:collapse;margin:10px 0;font-size:0.85rem;">';
      lines.forEach((line, idx) => {
        if (/^[\|\s\-:]+$/.test(line)) return; // skip separator
        const cells = line.split('|').map(c => c.trim()).filter(Boolean);
        const tag = idx === 0 ? 'th' : 'td';
        const style = idx === 0
          ? 'background:rgba(6,182,212,0.12);color:var(--cyan);font-weight:700;'
          : 'color:var(--text-main);';
        html += '<tr>' + cells.map(c =>
          `<${tag} style="${style}padding:6px 10px;border:1px solid rgba(255,255,255,0.08);">${c}</${tag}>`
        ).join('') + '</tr>';
      });
      html += '</table>';
      return html;
    }
  };

  /* ============================================================
   *  FOLLOW-UP EXTRACTOR — parses "You may also ask" from LLM
   * ============================================================ */
  function extractFollowUps(text) {
    // Look for patterns like "You may also ask:" or "Related questions:"
    const match = text.match(/(?:you (?:may|might|can) (?:also )?ask|related questions?|follow.?up|try asking)[:\s\n]+([\s\S]{20,400}?)(?:\n\n|$)/i);
    if (!match) return [];
    const section = match[1];
    const items = section.match(/[•\-\*→]\s*(.+?)(?=\n|$)/g) || [];
    return items.slice(0, 4).map(i => i.replace(/^[•\-\*→]\s*/, '').trim()).filter(Boolean);
  }

  function buildFollowUpHTML(questions) {
    if (!questions.length) return '';
    const chips = questions.map(q =>
      `<div style="padding:3px 0;cursor:pointer;color:var(--cyan);font-size:0.88rem;"
            class="ai-followup-chip" data-q="${q.replace(/"/g, '&quot;')}">→ ${q}</div>`
    ).join('');
    return `<div style="margin-top:12px;padding:10px;background:rgba(6,182,212,0.06);
                  border-radius:8px;border-left:2px solid var(--cyan);">
              <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);margin-bottom:6px;">
                💡 YOU MAY ALSO ASK:
              </div>${chips}</div>`;
  }

  /* ============================================================
   *  FALLBACK KNOWLEDGE ENGINE (used when no API key is set
   *  OR when the API call fails due to network issues)
   * ============================================================ */
  const FallbackEngine = {
    respond(query) {
      const q = query.toLowerCase().trim();

      const kb = [
        // AI & ML
        { match: ['artificial intelligence','what is ai','explain ai'], reply: this._ai },
        { match: ['machine learning','what is ml','explain ml'], reply: this._ml },
        { match: ['deep learning','neural network'], reply: this._dl },
        { match: ['difference between ai and ml','ai vs ml','ai and ml difference'], reply: this._aiVsML },
        { match: ['natural language','nlp'], reply: this._nlp },
        { match: ['large language model','llm','chatgpt','gpt','gemini','claude'], reply: this._llm },

        // Programming
        { match: ['python', 'pip', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'django'], reply: this._python },
        { match: ['javascript','nodejs','react','vue','angular'], reply: this._js },
        { match: ['java ','spring boot','jvm'], reply: this._java },
        { match: ['sql','select','join table','group by'], reply: this._sql },
        { match: ['dbms','database management','nosql','mongodb','postgresql'], reply: this._dbms },
        { match: ['data structure','array','linked list','hash table','big o','time complexity'], reply: this._ds },
        { match: ['networking','tcp','http','osi model','dns'], reply: this._networking },

        // Science & Knowledge
        { match: ['climate change','global warming','greenhouse'], reply: this._climate },
        { match: ['ubi','universal basic income'], reply: this._ubi },
        { match: ['black hole','space','galaxy','universe','mars'], reply: this._space },

        // Debate & Speaking
        { match: ['improve my debate','debate skill','how to debate','debate tip'], reply: this._debateTips },
        { match: ['logical fallac','ad hominem','strawman','slippery slope'], reply: this._fallacies },
        { match: ['rebuttal','counter argument','how to counter'], reply: this._rebuttal },
        { match: ['public speaking','stage fright','filler word','vocal'], reply: this._speaking },
        { match: ['argument structure','claim warrant','cwi'], reply: this._argStructure },

        // Career
        { match: ['resume','cv','cover letter'], reply: this._resume },
        { match: ['hr interview','tell me about yourself','strength weakness'], reply: this._hrInterview },
        { match: ['technical interview','coding interview','leetcode','system design'], reply: this._techInterview },

        // English
        { match: ['grammar','tense','subject verb','punctuation'], reply: this._grammar },
        { match: ['essay writing','how to write','academic writing'], reply: this._writing },

        // Motivation
        { match: ['motivation','procrastination','study tip','habit'], reply: this._motivation },
      ];

      for (const entry of kb) {
        if (entry.match.some(k => q.includes(k))) {
          return entry.reply(query);
        }
      }

      return this._default(query);
    },

    _section(icon, title, body) {
      return `<div style="margin:10px 0 4px;"><div style="font-weight:700;color:var(--cyan);margin-bottom:4px;">${icon} ${title}</div><div style="color:var(--text-main);font-size:0.91rem;line-height:1.8;">${body}</div></div><hr style="border-color:rgba(255,255,255,0.06);margin:8px 0;">`;
    },
    _fu(qs) {
      return buildFollowUpHTML(qs);
    },

    _ai: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('🤖','What is Artificial Intelligence?',`<strong>Artificial Intelligence (AI)</strong> is the simulation of human cognitive capabilities — including <em>learning, reasoning, problem-solving, language understanding, and perception</em> — in machines.<br><br>Rather than being explicitly programmed with rules, AI systems <strong>learn patterns from data</strong> and make predictions or decisions.`)
        + s('⚙️','How AI Works',`Data → Algorithm → Model → Prediction/Decision<br><br>• <strong>Input:</strong> Text, images, audio, sensor readings<br>• <strong>Processing:</strong> Mathematical models find statistical patterns<br>• <strong>Output:</strong> Prediction, classification, or generated content`)
        + s('🌍','Real Examples',`• <strong>ChatGPT/Gemini</strong> — Conversational language AI<br>• <strong>Tesla Autopilot</strong> — Self-driving computer vision<br>• <strong>Netflix recommendations</strong> — Personalisation AI<br>• <strong>Gmail spam filter</strong> — Classification AI<br>• <strong>AlphaFold</strong> — Protein structure prediction`)
        + s('📊','Types of AI',`<strong>1. Narrow AI (ANI)</strong> — One task, very well (current state)<br><strong>2. General AI (AGI)</strong> — Human-level reasoning (research stage)<br><strong>3. Super AI (ASI)</strong> — Beyond human intelligence (theoretical)`)
        + FallbackEngine._fu(['What is Machine Learning?','Difference between AI and ML?','What is Deep Learning?','AI applications in healthcare?']);
    },

    _ml: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('📖','Machine Learning',`<strong>Machine Learning (ML)</strong> is a subset of AI where systems <em>learn automatically from data</em> and improve without being explicitly programmed.`)
        + s('🔬','3 Core Paradigms',`<strong>1. Supervised Learning</strong> — Training on labelled data (spam detection, price prediction)<br><strong>2. Unsupervised Learning</strong> — Finding hidden patterns (clustering, PCA)<br><strong>3. Reinforcement Learning</strong> — Agent learns by trial-and-error rewards (AlphaGo, game AI)`)
        + s('💻','Python Example (Scikit-Learn)',`<pre style="background:rgba(0,0,0,0.4);border-radius:8px;padding:12px;font-family:'JetBrains Mono',monospace;font-size:0.82rem;color:var(--text-cyan);">from sklearn.linear_model import LinearRegression\nimport numpy as np\n\nX = np.array([[1],[2],[3],[4],[5]])\ny = np.array([45,55,65,75,85])\n\nmodel = LinearRegression()\nmodel.fit(X, y)\nprint(model.predict([[6]]))  # ~95.0</pre>`)
        + FallbackEngine._fu(['What is Deep Learning?','AI vs ML difference?','Python for machine learning?','What is overfitting?']);
    },

    _dl: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('🧠','Deep Learning',`<strong>Deep Learning</strong> is a sub-field of Machine Learning using multi-layered <strong>neural networks</strong> inspired by the human brain. The more data, the better they perform.`)
        + s('🔧','Key Architectures',`• <strong>CNN</strong> — Image classification, computer vision<br>• <strong>RNN/LSTM</strong> — Sequential data, time series<br>• <strong>Transformer</strong> — Language models (GPT, BERT, Gemini)<br>• <strong>GAN</strong> — Generating images, deepfakes`)
        + FallbackEngine._fu(['What is a neural network?','Transformer architecture?','CNN explained?']);
    },

    _aiVsML: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('⚖️','AI vs ML — Key Differences',`<table style="width:100%;border-collapse:collapse;font-size:0.85rem;margin:8px 0;"><tr><th style="background:rgba(6,182,212,0.15);color:var(--cyan);padding:8px;border:1px solid rgba(255,255,255,0.08);">Feature</th><th style="background:rgba(6,182,212,0.15);color:var(--cyan);padding:8px;border:1px solid rgba(255,255,255,0.08);">Artificial Intelligence</th><th style="background:rgba(6,182,212,0.15);color:var(--cyan);padding:8px;border:1px solid rgba(255,255,255,0.08);">Machine Learning</th></tr><tr><td style="padding:7px;border:1px solid rgba(255,255,255,0.08);">Definition</td><td style="padding:7px;border:1px solid rgba(255,255,255,0.08);">Simulates human intelligence</td><td style="padding:7px;border:1px solid rgba(255,255,255,0.08);">Learns from data automatically</td></tr><tr><td style="padding:7px;border:1px solid rgba(255,255,255,0.08);">Scope</td><td style="padding:7px;border:1px solid rgba(255,255,255,0.08);">Broader field</td><td style="padding:7px;border:1px solid rgba(255,255,255,0.08);">Subset of AI</td></tr><tr><td style="padding:7px;border:1px solid rgba(255,255,255,0.08);">Approach</td><td style="padding:7px;border:1px solid rgba(255,255,255,0.08);">Rules + learning</td><td style="padding:7px;border:1px solid rgba(255,255,255,0.08);">Statistical models on data</td></tr><tr><td style="padding:7px;border:1px solid rgba(255,255,255,0.08);">Examples</td><td style="padding:7px;border:1px solid rgba(255,255,255,0.08);">ChatGPT, Siri, self-driving</td><td style="padding:7px;border:1px solid rgba(255,255,255,0.08);">Spam filter, recommendation</td></tr></table>`)
        + s('💡','Simple Analogy',`AI is the <strong>goal</strong> (make machines intelligent). ML is one of the <strong>methods</strong> to reach that goal — just like how a car is the goal and the engine is one method to power it.`)
        + FallbackEngine._fu(['What is Deep Learning?','What is a neural network?','Types of Machine Learning?']);
    },

    _nlp: (q) => FallbackEngine._section('🗣️','Natural Language Processing',`NLP enables computers to understand, interpret, and generate human language. Core tasks: tokenisation, sentiment analysis, named entity recognition, machine translation, and text summarisation.`) + FallbackEngine._fu(['What is an LLM?','How does sentiment analysis work?','BERT vs GPT?']),

    _llm: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('🧠','Large Language Models (LLMs)',`LLMs are trained on <strong>trillions of text tokens</strong> using Transformer architectures. They learn statistical patterns in language and can generate coherent, contextually relevant text.`)
        + s('📋','Training Pipeline',`<strong>1. Pre-training</strong> — Predict next token on massive text datasets (internet, books, code)<br><strong>2. Fine-tuning (SFT)</strong> — Supervised training on curated Q&A pairs<br><strong>3. RLHF</strong> — Reinforcement Learning from Human Feedback`)
        + s('🌟','Notable LLMs',`• <strong>GPT-4o</strong> (OpenAI) — Multimodal, code, reasoning<br>• <strong>Gemini</strong> (Google) — Scientific + multimodal tasks<br>• <strong>Claude 3.5</strong> (Anthropic) — Long context, safety-focused<br>• <strong>LLaMA 3</strong> (Meta) — Open-source commercial use`)
        + FallbackEngine._fu(['What is prompt engineering?','How does ChatGPT work?','Transformer architecture?']);
    },

    _python: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('🐍','Python Overview',`Python is a <strong>high-level, dynamically-typed, interpreted</strong> language — dominant in AI/ML, Data Science, Web Development (Django/FastAPI), and Automation.`)
        + s('💻','Core Syntax',`<pre style="background:rgba(0,0,0,0.4);border-radius:8px;padding:12px;font-family:'JetBrains Mono',monospace;font-size:0.82rem;color:var(--text-cyan);"># Variables & f-strings\nname = "DebateBot"\nprint(f"Hello, {name}!")\n\n# Functions\ndef wpm(words, seconds):\n    return round((words / seconds) * 60)\n\nprint(wpm(150, 70))  # 129\n\n# List comprehension\nevens = [x for x in range(20) if x % 2 == 0]\n\n# Exception handling\ntry:\n    result = 10 / 0\nexcept ZeroDivisionError as e:\n    print(f"Error: {e}")</pre>`)
        + FallbackEngine._fu(['Python data types?','NumPy tutorial?','Django vs FastAPI?','Python OOP?']);
    },

    _js: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('⚡','JavaScript Overview',`JavaScript is the <strong>language of the web</strong> — runs in all browsers and on servers (Node.js). Powers interactive UIs (React, Vue) and real-time APIs.`)
        + s('💻','Modern JS',`<pre style="background:rgba(0,0,0,0.4);border-radius:8px;padding:12px;font-family:'JetBrains Mono',monospace;font-size:0.82rem;color:var(--text-cyan);">const greet = (name) => \`Hello, \${name}!\`;\nconst {topic, score} = {topic: 'AI', score: 92};\n\nasync function getData(url) {\n  const res = await fetch(url);\n  return await res.json();\n}\n\nconst top = [82,91,95].filter(s => s >= 90);</pre>`)
        + FallbackEngine._fu(['JavaScript closures?','React vs Vue?','What is Node.js?','TypeScript basics?']);
    },

    _java: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('☕','Java Overview',`Java is <strong>statically-typed, object-oriented, WORA</strong> (Write Once, Run Anywhere) via the JVM. Dominant in enterprise backends (Spring Boot) and Android development.`)
        + s('💻','OOP Example',`<pre style="background:rgba(0,0,0,0.4);border-radius:8px;padding:12px;font-family:'JetBrains Mono',monospace;font-size:0.82rem;color:var(--text-cyan);">public class Debater {\n  private String name;\n  private int score;\n\n  public Debater(String name, int score) {\n    this.name = name; this.score = score;\n  }\n\n  public String result() {\n    return name + " scored " + score + "/100";\n  }\n\n  public static void main(String[] args) {\n    Debater d = new Debater("Alex", 92);\n    System.out.println(d.result());\n  }\n}</pre>`)
        + FallbackEngine._fu(['Java vs Python?','What is Spring Boot?','Java collections?','Java exception handling?']);
    },

    _sql: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('🗃️','SQL Overview',`SQL is the standard language for querying relational databases. Works with MySQL, PostgreSQL, Oracle, SQL Server.`)
        + s('💻','Common Queries',`<pre style="background:rgba(0,0,0,0.4);border-radius:8px;padding:12px;font-family:'JetBrains Mono',monospace;font-size:0.82rem;color:var(--text-cyan);">-- SELECT with filter\nSELECT name, score\nFROM users\nWHERE role = 'learner'\nORDER BY score DESC\nLIMIT 10;\n\n-- INNER JOIN\nSELECT u.name, p.topic, p.score\nFROM users u\nINNER JOIN practice_history p ON u.id = p.user_id;\n\n-- Aggregation\nSELECT user_id, COUNT(*), AVG(score)\nFROM practice_history\nGROUP BY user_id HAVING AVG(score) > 75;</pre>`)
        + FallbackEngine._fu(['SQL JOIN types?','What is database indexing?','SQL vs NoSQL?','ACID properties?']);
    },

    _dbms: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('📊','DBMS Overview',`A <strong>Database Management System</strong> manages storage, retrieval, manipulation, and security of data. Types: Relational (SQL), Document (MongoDB), Key-Value (Redis), Graph (Neo4j).`)
        + s('⚗️','ACID Properties',`<strong>A — Atomicity:</strong> All or nothing.<br><strong>C — Consistency:</strong> Valid state transitions only.<br><strong>I — Isolation:</strong> Concurrent transactions don't interfere.<br><strong>D — Durability:</strong> Committed data persists after failure.`)
        + FallbackEngine._fu(['SQL vs NoSQL?','What is database normalisation?','MongoDB basics?','PostgreSQL vs MySQL?']);
    },

    _ds: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('📚','Data Structures — Big-O Cheat Sheet',`<table style="width:100%;border-collapse:collapse;font-size:0.82rem;"><tr><th style="background:rgba(6,182,212,0.15);color:var(--cyan);padding:6px;border:1px solid rgba(255,255,255,0.08);">Structure</th><th style="background:rgba(6,182,212,0.15);color:var(--cyan);padding:6px;border:1px solid rgba(255,255,255,0.08);">Access</th><th style="background:rgba(6,182,212,0.15);color:var(--cyan);padding:6px;border:1px solid rgba(255,255,255,0.08);">Search</th><th style="background:rgba(6,182,212,0.15);color:var(--cyan);padding:6px;border:1px solid rgba(255,255,255,0.08);">Insert</th></tr><tr><td style="padding:6px;border:1px solid rgba(255,255,255,0.08);">Array</td><td style="padding:6px;border:1px solid rgba(255,255,255,0.08);">O(1)</td><td style="padding:6px;border:1px solid rgba(255,255,255,0.08);">O(n)</td><td style="padding:6px;border:1px solid rgba(255,255,255,0.08);">O(n)</td></tr><tr><td style="padding:6px;border:1px solid rgba(255,255,255,0.08);">Hash Map</td><td style="padding:6px;border:1px solid rgba(255,255,255,0.08);">O(1)</td><td style="padding:6px;border:1px solid rgba(255,255,255,0.08);">O(1)</td><td style="padding:6px;border:1px solid rgba(255,255,255,0.08);">O(1)</td></tr><tr><td style="padding:6px;border:1px solid rgba(255,255,255,0.08);">Binary Tree</td><td style="padding:6px;border:1px solid rgba(255,255,255,0.08);">O(log n)</td><td style="padding:6px;border:1px solid rgba(255,255,255,0.08);">O(log n)</td><td style="padding:6px;border:1px solid rgba(255,255,255,0.08);">O(log n)</td></tr></table>`)
        + FallbackEngine._fu(['Binary search explained?','Sorting algorithms comparison?','Dynamic programming basics?','Graph traversal?']);
    },

    _networking: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('🌐','OSI 7-Layer Model',`<strong>7. Application</strong> — HTTP, HTTPS, DNS (user-facing)<br><strong>6. Presentation</strong> — Encryption/TLS<br><strong>5. Session</strong> — Connection management<br><strong>4. Transport</strong> — TCP/UDP, ports<br><strong>3. Network</strong> — IP routing<br><strong>2. Data Link</strong> — MAC addresses, switches<br><strong>1. Physical</strong> — Cables, radio waves`)
        + s('⚡','TCP vs UDP',`<strong>TCP:</strong> Reliable, ordered delivery — used for HTTP, email, files.<br><strong>UDP:</strong> Fast, no guarantees — used for video streaming, gaming, DNS.`)
        + FallbackEngine._fu(['HTTP vs HTTPS?','What is DNS?','TCP three-way handshake?','REST API vs GraphQL?']);
    },

    _climate: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('🌡️','Climate Change',`Long-term shifts in global temperatures driven primarily by <strong>human greenhouse gas emissions</strong> since the Industrial Revolution (1850s).`)
        + s('📊','Key Facts (2025)',`• Global average temperature: +1.1°C above pre-industrial levels<br>• Sea level rise: ~20cm since 1900<br>• CO₂ concentration: ~425 ppm (highest in 800,000 years)<br>• Arctic ice loss: 13% per decade`)
        + s('✅','Solutions',`Renewable energy · Carbon pricing · Paris Agreement (1.5°C target) · EV adoption · Reforestation`)
        + FallbackEngine._fu(['Paris Agreement explained?','Renewable energy types?','Carbon tax vs cap and trade?','Is nuclear energy green?']);
    },

    _ubi: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('💵','Universal Basic Income (UBI)',`A government program where <strong>all citizens receive unconditional cash payments</strong> regardless of employment status.`)
        + s('✅ Arguments For',`• Poverty safety net against AI-driven job displacement<br>• Stockton SEED pilot: full-time employment increased 40% among recipients<br>• Alaska Permanent Fund: $1,000–$2,000/year — no inflation spike since 1982`)
        + s('❌ Arguments Against',`• Fiscal cost: ~$3.8 trillion/year in the US<br>• Potential labour supply reduction<br>• Better to target vulnerable groups specifically`)
        + FallbackEngine._fu(['How to rebut the inflation argument against UBI?','What is fiscal policy?','AI and job displacement?']);
    },

    _space: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('🚀','Space & Universe',`• <strong>Universe age:</strong> ~13.8 billion years<br>• <strong>Observable universe:</strong> ~93 billion light-years diameter<br>• <strong>Black holes:</strong> Regions where gravity is so strong not even light can escape beyond the event horizon<br>• <strong>First black hole image:</strong> M87* captured by Event Horizon Telescope in 2019`)
        + FallbackEngine._fu(['How do black holes form?','Mars colonisation challenges?','James Webb Telescope discoveries?','What is dark matter?']);
    },

    _debateTips: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('🎯','Core Debate Improvement Strategies',`<strong>1. CWI Framework:</strong><br>&nbsp;&nbsp;• <strong>Claim</strong> — State your position clearly<br>&nbsp;&nbsp;• <strong>Warrant</strong> — Logical reasoning + evidence<br>&nbsp;&nbsp;• <strong>Impact</strong> — Why it matters to the judge<br><br><strong>2. Active Listening:</strong> Note 3 specific points in your opponent's speech to rebut — not generic attacks.<br><br><strong>3. Eliminate Filler Words:</strong> Replace "um/uh" with a confident 2-second pause. Silence = authority.<br><br><strong>4. Vocal Variety:</strong> Vary pitch, speed, and volume. Monotone delivery loses judges.<br><br><strong>5. Record Yourself:</strong> Review recordings and count filler words, pace, and structure.`)
        + FallbackEngine._fu(['How to structure a rebuttal?','Common logical fallacies?','Public speaking tips?','Best debate opening lines?']);
    },

    _fallacies: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('⚠️','9 Common Logical Fallacies',`<strong>1. Ad Hominem</strong> — Attacking the person, not their argument<br><strong>2. Strawman</strong> — Misrepresenting opponent's position<br><strong>3. False Dichotomy</strong> — "Either you're with us or against us"<br><strong>4. Slippery Slope</strong> — Assuming one step leads to extreme outcomes<br><strong>5. Appeal to Authority</strong> — "Expert X said so, therefore it's true"<br><strong>6. Circular Reasoning</strong> — Using the conclusion as evidence<br><strong>7. Red Herring</strong> — Introducing irrelevant information<br><strong>8. Hasty Generalisation</strong> — Broad conclusions from few examples<br><strong>9. Appeal to Emotion</strong> — Emotional manipulation instead of evidence`)
        + s('💬','How to Counter',`"My opponent has committed a [fallacy name]. The actual argument is [restate correctly]. Evidence shows [cite data]."`)
        + FallbackEngine._fu(['How to counter ad hominem?','Strawman fallacy example?','How to spot fallacies in real-time?']);
    },

    _rebuttal: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('🎯','4-Step DARE Rebuttal Framework',`<strong>D — Disagree:</strong> "I disagree with my opponent's claim that [X]."<br><strong>A — Attack:</strong> Challenge the evidence (outdated? biased? small sample?).<br><strong>R — Reason:</strong> "In contrast, [your evidence] demonstrates [Y]."<br><strong>E — Extend:</strong> "This matters because [impact on resolution]."`)
        + s('💬','Live Example',`<em>Opponent: "UBI causes inflation because more money chases fewer goods."</em><br><br>Rebuttal: "This relies on basic quantity theory without accounting for productivity gains. The 2019 Stockton SEED trial found zero statistically significant inflation — directly falsifying this premise."`)
        + FallbackEngine._fu(['What is the CWI framework?','How to structure a debate speech?','Common logical fallacies?']);
    },

    _speaking: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('🎤','Vocal Delivery Mastery',`• <strong>Pace:</strong> 120–150 WPM. Slow to 80 WPM for emphasis.<br>• <strong>Pause:</strong> A 3-second silence feels long to you but powerful to the audience.<br>• <strong>Volume:</strong> Project 10% louder than feels natural — rooms absorb sound.<br>• <strong>Pitch:</strong> Drop pitch at key statements (rising pitch = uncertainty).`)
        + s('😰','Beating Stage Fright',`Take 4-second breaths (in, hold, out) before speaking. Focus on the <em>message</em>, not the audience's reactions. Power pose for 2 minutes backstage.`)
        + FallbackEngine._fu(['How to eliminate filler words?','Eye contact tips for debates?','How to practice public speaking daily?']);
    },

    _argStructure: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('🏗️','CWI Argument Framework',`<strong>C — Claim:</strong> "Universal Basic Income will reduce poverty."<br><strong>W — Warrant:</strong> "Stanford Center on Poverty data shows a 28% reduction in poverty rates across 12 countries in UBI pilots."<br><strong>I — Impact:</strong> "This means 47 million Americans could exit poverty within a decade, reducing healthcare burden by $120 billion annually."`)
        + FallbackEngine._fu(['How to structure a rebuttal?','Toulmin model explained?','What are logical fallacies?']);
    },

    _resume: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('📄','Resume Best Practices',`<strong>Structure:</strong> Header → Summary → Skills → Experience → Projects → Education<br><br><strong>Action-Impact Formula:</strong><br>❌ "Worked on ML project."<br>✅ "Built BERT-based classifier achieving 94.2% accuracy on 50K samples, deployed to production serving 2K daily users."<br><br><strong>ATS Tips:</strong> Use exact keywords from job description · Avoid tables/graphics · Submit as PDF.`)
        + FallbackEngine._fu(['How to write a cover letter?','LinkedIn profile tips?','How to negotiate salary?','Common interview questions?']);
    },

    _hrInterview: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('🎯','Top HR Interview Questions',`<strong>"Tell me about yourself"</strong> → Present → Past → Future formula.<br><br><strong>"Greatest weakness?"</strong> → Real weakness + what you're doing about it.<br><br><strong>"Where in 5 years?"</strong> → Align with company's growth trajectory.`)
        + s('⭐','STAR Method',`<strong>S</strong>ituation → <strong>T</strong>ask → <strong>A</strong>ction → <strong>R</strong>esult<br>Always quantify results.`)
        + FallbackEngine._fu(['Technical interview preparation?','How to negotiate salary?','What questions to ask interviewer?']);
    },

    _techInterview: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('💻','Technical Interview Roadmap',`<strong>Tier 1 — DSA:</strong> Arrays, HashMaps, Two Pointers, Sliding Window, Binary Search, BFS/DFS, DP, Trees, Graphs<br><strong>Tier 2 — System Design:</strong> Scalability, Caching (Redis), DB sharding, Microservices, CAP Theorem<br><strong>Tier 3 — Domain:</strong> OOP, SOLID, Design Patterns, CI/CD, Cloud, Security`)
        + s('💻','Classic: Two Sum',`<pre style="background:rgba(0,0,0,0.4);border-radius:8px;padding:12px;font-family:'JetBrains Mono',monospace;font-size:0.82rem;color:var(--text-cyan);">def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target - num], i]\n        seen[num] = i\n\nprint(two_sum([2,7,11,15], 9))  # [0,1]</pre>`)
        + FallbackEngine._fu(['System design interview framework?','What are SOLID principles?','Most common LeetCode patterns?']);
    },

    _grammar: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('📝','Common Grammar Mistakes',`<strong>Subject-Verb Agreement</strong><br>❌ "The team are working." → ✅ "The team is working."<br><br><strong>Tense Consistency</strong><br>❌ "She walks in and said hello." → ✅ "She walked in and said hello."<br><br><strong>Active vs Passive</strong><br>Prefer active voice in debates — more direct and persuasive.<br>✅ "The AI evaluated her speech." (active)<br>🔶 "Her speech was evaluated by the AI." (passive)`)
        + FallbackEngine._fu(['Comma usage rules?','When to use who vs whom?','Academic vocabulary list?','How to improve writing?']);
    },

    _writing: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('✍️','Essay Structure',`<strong>Introduction:</strong> Hook → Context → Thesis<br><strong>Body:</strong> PEEL — Point, Evidence, Explain, Link<br><strong>Conclusion:</strong> Restate → Synthesise → Forward-looking statement`)
        + s('🔗','Transition Signals',`<strong>Adding:</strong> Furthermore, Moreover, Additionally<br><strong>Contrasting:</strong> However, Nevertheless, Whereas<br><strong>Concluding:</strong> Therefore, Consequently, Thus`)
        + FallbackEngine._fu(['Academic vocabulary list?','How to write a thesis statement?','IELTS writing tips?']);
    },

    _motivation: (q) => {
      const s = FallbackEngine._section.bind(FallbackEngine);
      return s('🧠','Beating Procrastination',`<strong>2-Minute Rule:</strong> If under 2 minutes, do it now.<br><strong>Eat the Frog:</strong> Hardest task first — everything else feels easier.<br><strong>Pomodoro:</strong> 25 min focused → 5 min break → repeat 4× → 30 min break.<br><strong>Implementation intention:</strong> "I will study at [time] at [place] for [duration]."`)
        + FallbackEngine._fu(['Best study techniques?','How to build morning routine?','Growth mindset tips?','How to stay focused?']);
    },

    _default: (q) => {
      return FallbackEngine._section('🤖','DebateBot AI Assistant',`I can answer questions on:<br><br>🎙️ <strong>Debate & Speaking</strong> — Arguments, rebuttals, fallacies, speech tips<br>🤖 <strong>AI & Tech</strong> — AI, ML, NLP, LLMs, programming<br>💻 <strong>Programming</strong> — Python, JS, Java, SQL, Data Structures<br>🎓 <strong>Education</strong> — Science, Economics, English<br>💼 <strong>Career</strong> — Resume, interview prep, salary negotiation<br><br><em>You asked: "${q}"</em><br><br>Could you rephrase or be more specific? For example:<br>• "What is ${q.split(' ').slice(-2).join(' ')}?"<br>• "Explain ${q.split(' ').slice(-2).join(' ')} with examples"`)
        + FallbackEngine._fu(['What is Artificial Intelligence?', 'How to improve debate skills?', 'Python for beginners?', 'Common interview questions?']);
    }
  };

  /* ============================================================
   *  MAIN WIDGET
   * ============================================================ */
  window.AIAssistantWidget = {
    isOpen: false,

    init() {
      ['floating-ai-trigger', 'ai-chat-container'].forEach(id => {
        document.getElementById(id)?.remove();
      });
      ChatHistory.clear();
      this._render();
      this._bindEvents();
    },

    _render() {
      const user     = window.AIDebateAuth?.currentUser;
      const userRole = user?.role || 'guest';
      const hasKey   = GeminiAPI.hasKey();

      /* Floating button */
      const btn = document.createElement('button');
      btn.id = 'floating-ai-trigger';
      btn.className = 'floating-ai-btn';
      btn.setAttribute('aria-label', 'Open AI Debate Assistant');
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 12L2.1 12.1"/><path d="M12 12l4.3 7.5"/><circle cx="12" cy="12" r="3"/></svg>`;
      document.body.appendChild(btn);

      /* Chat window */
      const win = document.createElement('div');
      win.id = 'ai-chat-container';
      win.className = 'ai-chat-window';
      win.style.display = 'none';
      win.innerHTML = `
        <div class="chat-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:32px;height:32px;border-radius:50%;background:var(--grad-primary);
                        display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;font-weight:bold;">AI</div>
            <div>
              <div style="font-weight:700;font-size:0.92rem;color:var(--text-main);">DebateBot AI</div>
              <div style="font-size:0.72rem;color:${hasKey ? 'var(--emerald)' : 'var(--amber)'};display:flex;align-items:center;gap:4px;">
                <span style="width:6px;height:6px;border-radius:50%;background:${hasKey ? 'var(--emerald)' : 'var(--amber)'}"></span>
                ${hasKey ? 'Gemini AI · Live' : 'Knowledge Base Mode'}
              </div>
            </div>
          </div>
          <div style="display:flex;gap:6px;align-items:center;">
            <button id="ai-config-btn" title="Configure Gemini API Key"
              style="background:none;border:1px solid rgba(255,255,255,0.12);border-radius:6px;
                     color:var(--text-muted);cursor:pointer;padding:3px 7px;font-size:0.78rem;">
              ⚙️ API Key
            </button>
            <button id="close-ai-chat" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:4px;">✕</button>
          </div>
        </div>

        <!-- API Key Setup Banner (shown when no key) -->
        ${!hasKey ? `<div id="api-setup-banner" style="padding:10px 14px;background:rgba(245,158,11,0.1);
              border-bottom:1px solid rgba(245,158,11,0.2);font-size:0.8rem;color:var(--amber);">
          ⚡ <strong>Unlock full AI power:</strong> Add your free Gemini API key for ChatGPT-level responses.
          <button id="api-quick-setup" style="margin-left:6px;background:var(--amber);color:#000;
              border:none;border-radius:4px;padding:2px 8px;cursor:pointer;font-size:0.75rem;font-weight:700;">
            Set Key
          </button>
        </div>` : ''}

        <div class="chat-body" id="ai-chat-messages">
          <div class="chat-msg bot">
            👋 Hello ${user ? user.name : 'there'}! I'm <strong>DebateBot</strong> — powered by ${hasKey ? '<strong style="color:var(--emerald);">Gemini AI</strong>' : 'built-in knowledge (add a Gemini API key for full AI power)'}.<br><br>
            Ask me anything — AI, programming, debate, science, career, or general knowledge!
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin:4px 0;" id="ai-quick-prompts">
            ${this._quickPrompts(userRole)}
          </div>
        </div>

        <div class="chat-input-area">
          <input type="text" id="ai-chat-input" class="form-input" style="flex:1;"
                 placeholder="Ask me anything…" autocomplete="off" />
          <button id="send-ai-msg" class="gradient-btn" style="padding:10px 14px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>`;
      document.body.appendChild(win);
    },

    _quickPrompts(role) {
      const chips = role === 'educator' ? [
        ['📝 Assignment Design', 'How to design a Lincoln-Douglas debate assignment for students?'],
        ['🤖 What is AI?', 'What is Artificial Intelligence?'],
        ['📊 Rubric Tips', 'Best rubrics for evaluating student debate performance?']
      ] : role === 'coach' ? [
        ['🎙️ Fluency Eval', 'How to evaluate vocal fluency and pace in a debate speech?'],
        ['🔍 Fallacy Coaching', 'How to coach students to avoid logical fallacies?'],
        ['💻 Python ML', 'Write a Python machine learning example with scikit-learn.']
      ] : [
        ['🤖 What is AI?', 'What is Artificial Intelligence? Explain with examples.'],
        ['🔍 Logical Fallacies', 'What are the most common logical fallacies in debate?'],
        ['💻 Python Basics', 'Explain Python programming for beginners with code examples.'],
        ['🎙️ Debate Tips', 'How can I improve my debate skills?'],
        ['🧬 Explain ML', 'What is Machine Learning? How does it work?']
      ];
      return chips.map(([label, q]) =>
        `<button class="role-btn prompt-chip" data-prompt="${q.replace(/"/g,'&quot;')}">${label}</button>`
      ).join('');
    },

    _bindEvents() {
      const trigger = document.getElementById('floating-ai-trigger');
      const chatWin = document.getElementById('ai-chat-container');
      const closeBtn = document.getElementById('close-ai-chat');
      const sendBtn  = document.getElementById('send-ai-msg');
      const input    = document.getElementById('ai-chat-input');
      const prompts  = document.getElementById('ai-quick-prompts');
      const msgBox   = document.getElementById('ai-chat-messages');
      const configBtn = document.getElementById('ai-config-btn');
      const quickSetup = document.getElementById('api-quick-setup');

      trigger?.addEventListener('click', () => {
        this.isOpen = !this.isOpen;
        chatWin.style.display = this.isOpen ? 'flex' : 'none';
        if (this.isOpen) setTimeout(() => input?.focus(), 100);
      });
      closeBtn?.addEventListener('click', () => { this.isOpen = false; chatWin.style.display = 'none'; });

      const handleSend = () => {
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        this._handleMessage(text);
      };

      sendBtn?.addEventListener('click', handleSend);
      input?.addEventListener('keypress', e => { if (e.key === 'Enter') handleSend(); });

      // Quick prompt chips
      prompts?.addEventListener('click', e => {
        const chip = e.target.closest('.prompt-chip');
        if (chip) this._handleMessage(chip.getAttribute('data-prompt'));
      });

      // Follow-up suggestions (delegated)
      msgBox?.addEventListener('click', e => {
        const chip = e.target.closest('.ai-followup-chip');
        if (chip) this._handleMessage(chip.getAttribute('data-q'));
      });

      // Config buttons
      configBtn?.addEventListener('click', () => this._showApiKeyModal());
      quickSetup?.addEventListener('click', () => this._showApiKeyModal());
    },

    _showApiKeyModal() {
      document.getElementById('gemini-key-modal')?.remove();
      const modal = document.createElement('div');
      modal.id = 'gemini-key-modal';
      modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;
        display:flex;align-items:center;justify-content:center;`;
      modal.innerHTML = `
        <div style="background:var(--surface-glass);border:1px solid var(--border-glass-glow);
                    border-radius:16px;padding:28px;max-width:480px;width:90%;
                    box-shadow:0 0 40px rgba(6,182,212,0.2);">
          <h2 style="font-size:1.15rem;font-weight:800;margin-bottom:6px;">⚙️ Gemini API Key Setup</h2>
          <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:16px;">
            Add your <strong>free</strong> Google Gemini API key to enable ChatGPT-level AI responses.
            Get one at <a href="https://aistudio.google.com/app/apikey" target="_blank"
            style="color:var(--cyan);">aistudio.google.com</a> (free, no credit card needed).
          </p>
          <input type="password" id="gemini-key-input" placeholder="Paste your Gemini API key here (AIza…)"
            style="width:100%;padding:10px 14px;background:rgba(0,0,0,0.3);border:1px solid var(--border-glass);
                   border-radius:8px;color:var(--text-main);font-size:0.9rem;margin-bottom:12px;box-sizing:border-box;"
            value="${GeminiAPI.getKey()}" />
          <div id="key-test-result" style="font-size:0.82rem;min-height:18px;margin-bottom:12px;"></div>
          <div style="display:flex;gap:10px;">
            <button id="gemini-key-save" class="gradient-btn" style="flex:1;justify-content:center;">
              💾 Save &amp; Activate
            </button>
            <button id="gemini-key-test" class="btn-secondary" style="padding:8px 14px;">
              🧪 Test Key
            </button>
            <button id="gemini-key-close" style="background:none;border:1px solid rgba(255,255,255,0.12);
                color:var(--text-muted);border-radius:8px;padding:8px 14px;cursor:pointer;">
              Cancel
            </button>
          </div>
        </div>`;
      document.body.appendChild(modal);

      const keyInput  = document.getElementById('gemini-key-input');
      const testResult = document.getElementById('key-test-result');

      document.getElementById('gemini-key-close').addEventListener('click', () => modal.remove());

      document.getElementById('gemini-key-save').addEventListener('click', () => {
        const key = keyInput.value.trim();
        if (!key) { testResult.style.color = 'var(--rose)'; testResult.textContent = '⚠️ Please enter an API key.'; return; }
        GeminiAPI.setKey(key);
        modal.remove();
        // Reinitialise chatbot with updated status
        this.init();
        if (window.showToast) window.showToast('Gemini API key saved! DebateBot is now AI-powered.', 'success');
      });

      document.getElementById('gemini-key-test').addEventListener('click', async () => {
        const key = keyInput.value.trim();
        if (!key) { testResult.style.color = 'var(--rose)'; testResult.textContent = '⚠️ Enter a key first.'; return; }
        testResult.style.color = 'var(--amber)';
        testResult.textContent = '⏳ Testing key…';
        GeminiAPI.setKey(key);
        try {
          const res = await GeminiAPI.call('Say "OK" in one word only.');
          testResult.style.color = 'var(--emerald)';
          testResult.textContent = `✅ Key is valid! Gemini responded: "${res.trim().substring(0, 60)}"`;
        } catch (err) {
          GeminiAPI.setKey('');
          testResult.style.color = 'var(--rose)';
          testResult.textContent = err.message === 'INVALID_KEY'
            ? '❌ Invalid API key. Check that you copied it correctly from AI Studio.'
            : '❌ Connection failed: ' + err.message;
        }
      });
    },

    async _handleMessage(text) {
      const msgBox = document.getElementById('ai-chat-messages');
      if (!msgBox) return;

      /* User bubble */
      const userDiv = document.createElement('div');
      userDiv.className = 'chat-msg user';
      userDiv.textContent = text;
      msgBox.appendChild(userDiv);
      msgBox.scrollTop = msgBox.scrollHeight;

      /* Typing indicator */
      const typingDiv = document.createElement('div');
      typingDiv.className = 'chat-msg bot';
      const usingGemini = GeminiAPI.hasKey();
      typingDiv.innerHTML = `<span class="pulse-text">${usingGemini ? '🤖 Gemini is thinking…' : '⚡ Processing…'}</span>`;
      msgBox.appendChild(typingDiv);
      msgBox.scrollTop = msgBox.scrollHeight;

      try {
        let responseText;

        if (usingGemini) {
          /* ---- GEMINI API PATH ---- */
          responseText = await GeminiAPI.call(text);
          ChatHistory.push('user', text);
          ChatHistory.push('model', responseText);

          // Render markdown + follow-up chips
          const followUps = extractFollowUps(responseText);
          const htmlBody  = MD.render(responseText);
          const followHTML = buildFollowUpHTML(followUps);
          typingDiv.innerHTML = htmlBody + followHTML;
        } else {
          /* ---- FALLBACK KNOWLEDGE BASE ---- */
          await new Promise(r => setTimeout(r, 350 + Math.min(text.length * 6, 1000)));
          responseText = FallbackEngine.respond(text);
          typingDiv.innerHTML = responseText;
        }

      } catch (err) {
        /* Handle specific Gemini API errors gracefully */
        let errMsg;
        if (err.message === 'NO_API_KEY') {
          errMsg = `<em style="color:var(--amber);">⚠️ No Gemini API key set. Using built-in knowledge base instead.</em><br><br>` + FallbackEngine.respond(text);
        } else if (err.message === 'INVALID_KEY') {
          GeminiAPI.setKey('');
          errMsg = `<em style="color:var(--rose);">❌ Invalid API key. Please click "⚙️ API Key" and re-enter your Gemini key.</em><br><br>` + FallbackEngine.respond(text);
        } else if (err.message === 'RATE_LIMIT') {
          errMsg = `<em style="color:var(--amber);">⏳ Gemini rate limit reached. Please wait a moment and try again.</em><br><br>` + FallbackEngine.respond(text);
        } else {
          errMsg = `<em style="color:var(--text-muted);">⚠️ Network issue — using built-in knowledge base.</em><br><br>` + FallbackEngine.respond(text);
        }
        typingDiv.innerHTML = errMsg;
      }

      /* Bind follow-up chip click events */
      typingDiv.querySelectorAll('.ai-followup-chip').forEach(chip => {
        chip.addEventListener('click', () => this._handleMessage(chip.getAttribute('data-q')));
      });

      msgBox.scrollTop = msgBox.scrollHeight;
    }
  };

})();
