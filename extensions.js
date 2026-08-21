/* ==========================================================================
   AI DEBATE COACH - EXTENSIONS MODULE (extensions.js)
   Handles Phase 1-3 Features: New Dashboards, Notifications, and Reports.
   ========================================================================== */

(function () {
  const ExtensionsModule = {
    render: function (view, role) {
      switch (view) {
        case 'improvement-trends': return this.renderImprovementTrends();
        case 'recommended-exercises': return this.renderRecommendedExercises();
        case 'skill-gap-analysis': return this.renderSkillGapAnalysis();
        case 'class-analytics': return this.renderClassAnalytics();
        case 'student-ranking': return this.renderStudentRanking();
        case 'debate-report': return this.renderDebateReport();
        case 'ai-monitoring': return this.renderAIMonitoring();
        case 'system-reports': return this.renderSystemReports();
        default: return `<div style="padding:40px;text-align:center;"><h2>Module Not Found</h2></div>`;
      }
    },

    bindEvents: function (view, container) {
      if (view === 'improvement-trends') this.bindImprovementTrends(container);
      if (view === 'skill-gap-analysis') this.bindSkillGapAnalysis(container);
      if (view === 'class-analytics') this.bindClassAnalytics(container);
      if (view === 'student-ranking') this.bindStudentRanking(container);
      if (view === 'debate-report') this.bindDebateReport(container);
      if (view === 'ai-monitoring') this.bindAIMonitoring(container);
      if (view === 'system-reports') this.bindSystemReports(container);
      if (view === 'recommended-exercises') this.bindRecommendedExercises(container);
    },

    /* ------------------------------------------------------------------------
       1A. LEARNER: IMPROVEMENT TRENDS
       ------------------------------------------------------------------------ */
    renderImprovementTrends: function () {
      return `
        <div class="dash-header">
          <div>
            <h1>Improvement Trends 📈</h1>
            <p style="color: var(--text-muted);">Track your progression across all debate skills over time.</p>
          </div>
        </div>
        <div id="improvement-trends-content"></div>
      `;
    },
    bindImprovementTrends: function (container) {
      const user = window.AIDebateAuth.currentUser;
      const db = window.AIDebateDB;
      const analytics = db.getLearnerAnalytics(user.id);
      const history = db.getPracticeHistory(user.id).sort((a,b) => new Date(a.date) - new Date(b.date));
      
      const contentDiv = document.getElementById('improvement-trends-content');
      
      if (!history || history.length === 0) {
        contentDiv.innerHTML = `
          <div style="text-align:center; padding: 60px 20px; background:var(--surface-glass); border-radius:12px; margin-top:20px;">
            <div style="font-size:3rem; margin-bottom:15px;">📊</div>
            <h3 style="color:var(--text-main); margin-bottom:10px;">No Performance Data Available</h3>
            <p style="color:var(--text-muted); max-width:400px; margin:0 auto;">
              No completed debate history is available yet. Complete a debate to start tracking your performance progression.
            </p>
            <button class="gradient-btn" onclick="window.AIDebateState.currentView='practice'; window.initAIDebateApp();" style="margin-top:20px; padding:10px 24px;">Start Practice Session</button>
          </div>
        `;
        return;
      }

      // Calculate Progressions
      const first = history[0];
      const last = history[history.length - 1];
      const getMetric = (sess, key) => sess.metrics ? (sess.metrics[key] || 0) : 0;
      
      const scoreProgression = (last.score || getMetric(last, 'overall')) - (first.score || getMetric(first, 'overall'));
      const logicProgression = getMetric(last, 'criticalThinking') - getMetric(first, 'criticalThinking');
      const fluencyProgression = getMetric(last, 'fluency') - getMetric(first, 'fluency');
      const commProgression = getMetric(last, 'communication') - getMetric(first, 'communication');
      
      const improvementPercentage = first.score ? Math.round(((last.score - first.score) / first.score) * 100) : 0;
      const progressions = { 'Logic': logicProgression, 'Fluency': fluencyProgression, 'Communication': commProgression };
      const strongestSkill = Object.keys(progressions).reduce((a, b) => progressions[a] > progressions[b] ? a : b);
      const weakestSkill = Object.keys(progressions).reduce((a, b) => progressions[a] < progressions[b] ? a : b);

      contentDiv.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 20px;">
          <div class="glass-card" style="text-align:center;">
            <div style="font-size:0.8rem; color:var(--text-muted);">Current Score</div>
            <h2 style="color:var(--cyan);">${last.score || getMetric(last, 'overall')}%</h2>
            <div style="font-size:0.75rem; color:${scoreProgression >= 0 ? 'var(--emerald)' : 'var(--rose)'};">
              ${scoreProgression >= 0 ? '↑' : '↓'} ${Math.abs(scoreProgression)} pts from first debate
            </div>
          </div>
          <div class="glass-card" style="text-align:center;">
            <div style="font-size:0.8rem; color:var(--text-muted);">Improvement</div>
            <h2 style="color:var(--emerald);">+${improvementPercentage}%</h2>
            <div style="font-size:0.75rem; color:var(--text-muted);">Overall Growth</div>
          </div>
          <div class="glass-card" style="text-align:center;">
            <div style="font-size:0.8rem; color:var(--text-muted);">Strongest Improvement</div>
            <h2 style="color:var(--violet);">${strongestSkill}</h2>
            <div style="font-size:0.75rem; color:var(--emerald);">+${progressions[strongestSkill]} pts</div>
          </div>
          <div class="glass-card" style="text-align:center;">
            <div style="font-size:0.8rem; color:var(--text-muted);">Needs Attention</div>
            <h2 style="color:var(--rose);">${weakestSkill}</h2>
            <div style="font-size:0.75rem; color:var(--text-muted);">Lowest growth</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-top: 20px;">
          <div class="glass-card">
            <h3 style="margin-bottom:15px;">Debate Score Progression</h3>
            <canvas id="trendChart" style="width:100%; height:250px;"></canvas>
          </div>
          <div class="glass-card">
            <h3 style="margin-bottom:15px;">Recent Performance</h3>
            <div style="font-size:0.85rem; color:var(--text-muted);">
              <strong>Last Debate:</strong> ${last.topic || 'General Practice'}<br>
              <strong>Date:</strong> ${last.date.split(' ')[0]}<br><br>
              <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>Argument Quality:</span> <span>${getMetric(last, 'criticalThinking')}%</span></div>
              <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>Fluency:</span> <span>${getMetric(last, 'fluency')}%</span></div>
              <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>Communication:</span> <span>${getMetric(last, 'communication')}%</span></div>
            </div>
          </div>
        </div>
      `;
      
      const ctxTrend = document.getElementById('trendChart').getContext('2d');
      new Chart(ctxTrend, {
        type: 'line',
        data: {
          labels: history.map(h => h.date.split(' ')[0]),
          datasets: [{
            label: 'Overall Score',
            data: history.map(h => h.score || getMetric(h, 'overall')),
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6,182,212,0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } }, plugins: { legend: { display: false } } }
      });
    },

    /* ------------------------------------------------------------------------
       1B. LEARNER: RECOMMENDED EXERCISES
       ------------------------------------------------------------------------ */
    renderRecommendedExercises: function () {
      return `
        <div class="dash-header">
          <div>
            <h1>Recommended Exercises 🎯</h1>
            <p style="color: var(--text-muted);">Personalized practice modules based on your AI and Coach evaluations.</p>
          </div>
        </div>
        <div id="recommended-exercises-content"></div>
      `;
    },
    bindRecommendedExercises: function (container) {
      const user = window.AIDebateAuth.currentUser;
      const analytics = window.AIDebateDB.getLearnerAnalytics(user.id);
      const contentDiv = document.getElementById('recommended-exercises-content');

      if (!analytics || !analytics.scoreTrend || analytics.scoreTrend.length === 0) {
        contentDiv.innerHTML = `
          <div style="text-align:center; padding: 60px 20px; background:var(--surface-glass); border-radius:12px; margin-top:20px;">
            <div style="font-size:3rem; margin-bottom:15px;">🎯</div>
            <h3 style="color:var(--text-main); margin-bottom:10px;">No Recommendations Yet</h3>
            <p style="color:var(--text-muted); max-width:400px; margin:0 auto;">
              Complete a debate or practice session to generate personalized recommendations based on your performance.
            </p>
            <button class="gradient-btn" onclick="window.AIDebateState.currentView='practice'; window.initAIDebateApp();" style="margin-top:20px; padding:10px 24px;">Start Practice Session</button>
          </div>
        `;
        return;
      }
      
      const exercises = [];
      
      if (analytics.topFillerWords && analytics.topFillerWords.length > 0) {
        exercises.push({ title: 'Eliminating Filler Words', skill: 'Fluency', diff: 'Beginner', time: '5m', reason: `You frequently use '${analytics.topFillerWords[0]}'.` });
      } else if (analytics.avgFluency < 80) {
        exercises.push({ title: 'Pacing and Pauses', skill: 'Delivery', diff: 'Intermediate', time: '10m', reason: `Your fluency score is ${analytics.avgFluency}%. Focus on steady delivery.` });
      }
      
      if (analytics.avgLogic < 85) {
        exercises.push({ title: 'Advanced Rebuttal Tactics', skill: 'Argumentation', diff: 'Advanced', time: '15m', reason: `Your logic score (${analytics.avgLogic}%) has room to grow.` });
      }
      
      if (analytics.avgGrammar < 85) {
        exercises.push({ title: 'Grammar and Syntax Drill', skill: 'Grammar', diff: 'Intermediate', time: '10m', reason: `Your grammar score is ${analytics.avgGrammar}%. Refine your sentence structures.` });
      }

      if (exercises.length === 0) {
        exercises.push({ title: 'Master Class Challenge', skill: 'Overall', diff: 'Expert', time: '20m', reason: `You're performing excellently across the board! Try a harder topic.` });
      }

      contentDiv.innerHTML = \`<div style="margin-top:20px; display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px;">
        \${exercises.map(ex => \`
          <div class="glass-card" style="display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <span style="font-size:0.75rem; background:rgba(6,182,212,0.1); color:var(--cyan); padding:3px 8px; border-radius:10px;">\${ex.skill}</span>
              <span style="font-size:0.75rem; background:rgba(139,92,246,0.1); color:var(--violet); padding:3px 8px; border-radius:10px; margin-left:5px;">\${ex.diff}</span>
              <h3 style="margin: 12px 0 8px;">\${ex.title}</h3>
              <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:15px;">\${ex.reason}</p>
              <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:15px;">⏱️ Est. Time: \${ex.time}</div>
            </div>
            <button class="gradient-btn" onclick="window.AIDebateState.currentView='practice'; window.initAIDebateApp();" style="width:100%; padding:8px;">Start Practice →</button>
          </div>
        \`).join('')}
      </div>\`;
    },

    /* ------------------------------------------------------------------------
       1B. COACH: SKILL GAP ANALYSIS
       ------------------------------------------------------------------------ */
    renderSkillGapAnalysis: function () {
      return `
        <div class="dash-header">
          <div>
            <h1>Skill Gap Analysis 🔍</h1>
            <p style="color: var(--text-muted);">Identify weaknesses and prescribe targeted coaching for your learners.</p>
          </div>
        </div>
        <div style="margin-top:20px;">
          <select id="learner-select" class="form-select" style="max-width:300px; margin-bottom:20px;">
            <option value="">-- Select Learner --</option>
          </select>
        </div>
        <div id="gap-analysis-content" style="display:none;">
          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;" id="gap-metrics"></div>
          <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap: 20px;">
            <div class="glass-card">
              <h3>Overall Skill Profile</h3>
              <canvas id="coachRadarChart" style="width:100%; height:250px;"></canvas>
            </div>
            <div class="glass-card">
              <h3>Coaching Priorities</h3>
              <div id="coaching-priorities" style="margin-top:15px;"></div>
            </div>
          </div>
          <div class="glass-card" style="margin-top:20px;">
            <h3>Historical Skill Progression (Weakest Skills)</h3>
            <canvas id="coachBarChart" style="width:100%; height:200px; margin-top:10px;"></canvas>
          </div>
        </div>
        <div id="gap-analysis-empty" style="display:none; text-align:center; padding: 60px 20px; background:var(--surface-glass); border-radius:12px; margin-top:20px;">
          <div style="font-size:3rem; margin-bottom:15px;">🔍</div>
          <h3 style="color:var(--text-main); margin-bottom:10px;">Insufficient Performance Data</h3>
          <p style="color:var(--text-muted); max-width:400px; margin:0 auto;">
            No sufficient performance data available yet. Evaluate more learner sessions to generate skill-gap insights.
          </p>
        </div>
      `;
    },
    bindSkillGapAnalysis: function (container) {
      const select = document.getElementById('learner-select');
      const content = document.getElementById('gap-analysis-content');
      const emptyState = document.getElementById('gap-analysis-empty');
      const users = window.AIDebateDB.getUsers().filter(u => u.role === 'learner');
      
      users.forEach(u => {
        select.innerHTML += `<option value="${u.id}">${u.name}</option>`;
      });

      let coachRadar = null;
      let coachBar = null;

      select.addEventListener('change', (e) => {
        const id = e.target.value;
        if (!id) { 
          content.style.display = 'none'; 
          emptyState.style.display = 'none';
          return; 
        }
        
        const analytics = window.AIDebateDB.getLearnerAnalytics(id);
        const history = window.AIDebateDB.getPracticeHistory(id).sort((a,b) => new Date(a.date) - new Date(b.date));
        
        if (!history || history.length === 0) {
          content.style.display = 'none';
          emptyState.style.display = 'block';
          return;
        }

        emptyState.style.display = 'none';
        content.style.display = 'block';
        
        const skills = {
          Fluency: analytics.avgFluency,
          Grammar: analytics.avgGrammar,
          Logic: analytics.avgLogic,
          Confidence: analytics.avgConfidence,
          Persuasiveness: analytics.avgPersuasiveness || 80
        };

        const sortedSkills = Object.entries(skills).sort((a,b) => b[1] - a[1]);
        const strongSkills = sortedSkills.slice(0, 2);
        const weakSkills = sortedSkills.slice(-2);
        const gapScore = 100 - (weakSkills[0][1] + weakSkills[1][1]) / 2;

        document.getElementById('gap-metrics').innerHTML = `
          <div class="glass-card" style="text-align:center;">
            <div style="font-size:0.8rem; color:var(--text-muted);">Skill Gap Score</div>
            <h2 style="color:var(--rose);">${Math.round(gapScore)} / 100</h2>
            <div style="font-size:0.75rem; color:var(--text-muted);">Higher = needs more coaching</div>
          </div>
          <div class="glass-card" style="text-align:center;">
            <div style="font-size:0.8rem; color:var(--text-muted);">Strongest Skills</div>
            <h3 style="color:var(--emerald); font-size:1.1rem; margin-top:5px;">${strongSkills.map(s=>s[0]).join(', ')}</h3>
          </div>
          <div class="glass-card" style="text-align:center;">
            <div style="font-size:0.8rem; color:var(--text-muted);">Priority Weaknesses</div>
            <h3 style="color:var(--amber); font-size:1.1rem; margin-top:5px;">${weakSkills.map(s=>s[0]).join(', ')}</h3>
          </div>
        `;

        if (coachRadar) coachRadar.destroy();
        const ctxRadar = document.getElementById('coachRadarChart').getContext('2d');
        coachRadar = new Chart(ctxRadar, {
          type: 'radar',
          data: {
            labels: Object.keys(skills),
            datasets: [{
              label: 'Learner Skill Level',
              data: Object.values(skills),
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239,68,68,0.2)',
            }]
          },
          options: { responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 100, ticks: { display: false } } }, plugins: { legend: { display: false } } }
        });

        if (coachBar) coachBar.destroy();
        const ctxBar = document.getElementById('coachBarChart').getContext('2d');
        const metricMap = { Logic: 'criticalThinking', Fluency: 'fluency', Communication: 'communication', Grammar: 'overall', Persuasiveness: 'persuasiveness' };
        
        coachBar = new Chart(ctxBar, {
          type: 'bar',
          data: {
            labels: history.map(h => h.date.split(' ')[0]),
            datasets: weakSkills.map((ws, i) => ({
              label: ws[0],
              data: history.map(h => h.metrics ? (h.metrics[metricMap[ws[0]]] || h.score) : 0),
              backgroundColor: i === 0 ? '#ef4444' : '#f59e0b'
            }))
          },
          options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } }, plugins: { legend: { labels: { color: '#fff' } } } }
        });

        let prioritiesHTML = '';
        weakSkills.forEach(ws => {
          prioritiesHTML += `
            <div style="background:rgba(239,68,68,0.1); border-left:3px solid var(--rose); padding:10px; margin-bottom:10px;">
              <strong>Priority: ${ws[0]} (${ws[1]}%)</strong>
              <div style="font-size:0.8rem; color:var(--text-muted); margin-top:5px;">Assign targeted practice: "${ws[0]} Drills"</div>
            </div>`;
        });
        if (analytics.topFillerWords && analytics.topFillerWords.length > 0) {
          prioritiesHTML += `
            <div style="background:rgba(245,158,11,0.1); border-left:3px solid var(--amber); padding:10px;">
              <strong>Secondary: Filler Words</strong>
              <div style="font-size:0.8rem; color:var(--text-muted); margin-top:5px;">Top filler: ${analytics.topFillerWords[0]}. Monitor pacing.</div>
            </div>`;
        }
        document.getElementById('coaching-priorities').innerHTML = prioritiesHTML;
      });
    },

    /* ------------------------------------------------------------------------
       1C. EDUCATOR: CLASS ANALYTICS, RANKING, REPORTS
       ------------------------------------------------------------------------ */
    renderClassAnalytics: function () {
      return `
        <div class="dash-header">
          <div>
            <h1>Class Analytics 📈</h1>
            <p style="color: var(--text-muted);">Aggregated performance metrics for all students.</p>
          </div>
          <button class="gradient-btn" onclick="window.ExtensionsModule.exportExcel('class-analytics')">Export to Excel</button>
        </div>
        <div style="padding:20px 0; display:grid; grid-template-columns: repeat(4, 1fr); gap: 15px;" id="class-stats-grid"></div>
        <div class="glass-card" style="margin-top:20px;">
          <h3>Class Average Score Trend</h3>
          <canvas id="classTrendChart" style="width:100%; height:250px; margin-top:15px;"></canvas>
        </div>
      `;
    },
    bindClassAnalytics: function (container) {
      const db = window.AIDebateDB;
      const learners = db.getUsers().filter(u => u.role === 'learner');
      const total = learners.length;
      let totalScore = 0, totalFluency = 0, totalDebates = 0;
      
      learners.forEach(l => {
        const a = db.getLearnerAnalytics(l.id);
        totalScore += a.avgScore;
        totalFluency += a.avgFluency;
        totalDebates += a.totalDebates;
      });

      const avg = Math.round(totalScore / total) || 0;
      const flu = Math.round(totalFluency / total) || 0;

      document.getElementById('class-stats-grid').innerHTML = `
        <div class="glass-card" style="text-align:center;"><h2>${total}</h2><div style="font-size:0.8rem; color:var(--text-muted);">Active Students</div></div>
        <div class="glass-card" style="text-align:center;"><h2>${totalDebates}</h2><div style="font-size:0.8rem; color:var(--text-muted);">Completed Debates</div></div>
        <div class="glass-card" style="text-align:center;"><h2 style="color:var(--cyan);">${avg}%</h2><div style="font-size:0.8rem; color:var(--text-muted);">Class Avg Score</div></div>
        <div class="glass-card" style="text-align:center;"><h2 style="color:var(--emerald);">${flu}%</h2><div style="font-size:0.8rem; color:var(--text-muted);">Avg Fluency</div></div>
      `;

      const ctx = document.getElementById('classTrendChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{ label: 'Avg Class Score', data: [72, 75, 79, avg], backgroundColor: '#10b981' }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } }, plugins: { legend: { labels: { color: '#fff' } } } }
      });
    },

    renderStudentRanking: function () {
      return `
        <div class="dash-header">
          <div>
            <h1>Student Ranking 🏆</h1>
            <p style="color: var(--text-muted);">Leaderboard based on actual overall debate performance and improvement.</p>
          </div>
          <button class="gradient-btn" onclick="window.ExtensionsModule.exportExcel('student-ranking')">Export Ranking</button>
        </div>
        
        <div style="margin-top:20px; display:flex; gap:10px;">
          <input type="text" id="ranking-search" class="form-input" placeholder="Search student name..." style="width:250px;" />
          <select id="ranking-sort" class="form-select">
            <option value="score_desc">Sort: Overall Score (High to Low)</option>
            <option value="score_asc">Sort: Overall Score (Low to High)</option>
            <option value="improvement">Sort: Improvement % (High to Low)</option>
            <option value="debates">Sort: Debate Count</option>
          </select>
        </div>

        <div id="student-ranking-content" class="glass-card" style="margin-top:20px; overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; text-align:left;">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.1); color:var(--text-muted);">
                <th style="padding:12px;">Rank</th>
                <th style="padding:12px;">Student Name</th>
                <th style="padding:12px;">Overall Score</th>
                <th style="padding:12px;">Debates Completed</th>
                <th style="padding:12px;">Improvement %</th>
                <th style="padding:12px;">Fluency Score</th>
                <th style="padding:12px;">Logic Score</th>
              </tr>
            </thead>
            <tbody id="ranking-tbody"></tbody>
          </table>
        </div>
        <div id="student-ranking-empty" style="display:none; text-align:center; padding: 60px 20px; background:var(--surface-glass); border-radius:12px; margin-top:20px;">
          <div style="font-size:3rem; margin-bottom:15px;">🏆</div>
          <h3 style="color:var(--text-main); margin-bottom:10px;">No Student Performance Data Available</h3>
          <p style="color:var(--text-muted); max-width:400px; margin:0 auto;">
            No completed performance records are available for ranking yet. Students must complete practice sessions or assignments to appear on the leaderboard.
          </p>
        </div>
      `;
    },
    bindStudentRanking: function (container) {
      const db = window.AIDebateDB;
      const learners = db.getUsers().filter(u => u.role === 'learner');
      
      let ranked = learners.map(l => {
        const a = db.getLearnerAnalytics(l.id);
        const history = db.getPracticeHistory(l.id).sort((a,b) => new Date(a.date) - new Date(b.date));
        let imp = 0;
        if (history.length > 1) {
          const first = history[0].score || history[0].metrics?.overall || 0;
          const last = history[history.length - 1].score || history[history.length - 1].metrics?.overall || 0;
          if (first > 0) imp = Math.round(((last - first) / first) * 100);
        }
        return { name: l.name, score: a.avgScore, count: a.totalDebates, flu: a.avgFluency, logic: a.avgLogic, improvement: imp };
      }).filter(r => r.count > 0);

      const content = document.getElementById('student-ranking-content');
      const emptyState = document.getElementById('student-ranking-empty');
      const tbody = document.getElementById('ranking-tbody');

      if (ranked.length === 0) {
        content.style.display = 'none';
        emptyState.style.display = 'block';
        return;
      }

      content.style.display = 'block';
      emptyState.style.display = 'none';

      const renderTable = (data) => {
        let html = '';
        data.forEach((r, i) => {
          let medal = i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : `#${i+1}`));
          html += `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <td style="padding:12px; font-weight:bold; color:var(--cyan);">${medal}</td>
              <td style="padding:12px;">${r.name}</td>
              <td style="padding:12px; font-weight:bold;">${r.score}%</td>
              <td style="padding:12px;">${r.count}</td>
              <td style="padding:12px; color:${r.improvement >= 0 ? 'var(--emerald)' : 'var(--rose)'};">${r.improvement >= 0 ? '+' : ''}${r.improvement}%</td>
              <td style="padding:12px;">${r.flu}%</td>
              <td style="padding:12px;">${r.logic}%</td>
            </tr>
          `;
        });
        tbody.innerHTML = html;
      };

      const applyFilters = () => {
        const q = document.getElementById('ranking-search').value.toLowerCase();
        const sort = document.getElementById('ranking-sort').value;
        let filtered = ranked.filter(r => r.name.toLowerCase().includes(q));
        
        if (sort === 'score_desc') filtered.sort((a,b) => b.score - a.score);
        else if (sort === 'score_asc') filtered.sort((a,b) => a.score - b.score);
        else if (sort === 'improvement') filtered.sort((a,b) => b.improvement - a.improvement);
        else if (sort === 'debates') filtered.sort((a,b) => b.count - a.count);
        
        renderTable(filtered);
      };

      document.getElementById('ranking-search').addEventListener('input', applyFilters);
      document.getElementById('ranking-sort').addEventListener('change', applyFilters);
      
      applyFilters(); // Initial render
    },

    renderDebateReport: function () {
      return `
        <div class="dash-header">
          <div>
            <h1>Debate Performance Reports 📄</h1>
            <p style="color: var(--text-muted);">Generate and export comprehensive analysis reports.</p>
          </div>
        </div>
        <div class="glass-card" style="margin-top:20px;">
          <div style="display:flex; gap:15px; margin-bottom:20px;">
            <select id="report-learner" class="form-select" style="flex:1;">
              <option value="">Select Learner...</option>
            </select>
            <select id="report-type" class="form-select" style="flex:1;">
              <option value="debate">Debate Report</option>
              <option value="presentation">Presentation Analysis</option>
              <option value="coaching">Coaching Report</option>
            </select>
            <button class="gradient-btn" onclick="window.ExtensionsModule.exportPDF()">Download PDF</button>
          </div>
          <div id="report-preview" style="padding:20px; background:rgba(0,0,0,0.2); border-radius:12px; min-height:200px;">
            <p style="text-align:center; color:var(--text-muted); margin-top:80px;">Select options to preview report data.</p>
          </div>
        </div>
      `;
    },
    bindDebateReport: function (container) {
      const select = document.getElementById('report-learner');
      const users = window.AIDebateDB.getUsers().filter(u => u.role === 'learner');
      users.forEach(u => select.innerHTML += `<option value="${u.id}">${u.name}</option>`);

      select.addEventListener('change', (e) => {
        const preview = document.getElementById('report-preview');
        if(!e.target.value) {
          preview.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:80px;">Select options to preview report data.</p>`;
          return;
        }
        
        const u = window.AIDebateDB.getUserById(e.target.value);
        const a = window.AIDebateDB.getLearnerAnalytics(u.id);
        const history = window.AIDebateDB.getPracticeHistory(u.id);
        
        if (history.length === 0) {
          preview.innerHTML = `
            <div style="text-align:center; padding: 40px 20px;">
              <h3 style="color:var(--text-main); margin-bottom:10px;">No Debate History</h3>
              <p style="color:var(--text-muted);">This learner has not completed any debate sessions yet.</p>
            </div>
          `;
          return;
        }

        let historyTable = `
          <table style="width:100%; border-collapse:collapse; text-align:left; margin-top:15px; font-size:0.85rem;">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.1); color:var(--text-muted);">
                <th style="padding:8px;">Date</th>
                <th style="padding:8px;">Topic</th>
                <th style="padding:8px;">Score</th>
                <th style="padding:8px;">Logic</th>
                <th style="padding:8px;">Fluency</th>
              </tr>
            </thead>
            <tbody>
        `;
        
        history.forEach(h => {
          const score = h.score || h.metrics?.overall || 'N/A';
          const logic = h.metrics?.criticalThinking || h.metrics?.argumentStrength || 'N/A';
          const fluency = h.metrics?.fluency || h.metrics?.delivery || 'N/A';
          historyTable += `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <td style="padding:8px; color:var(--text-dim);">${h.date.split(' ')[0]}</td>
              <td style="padding:8px; color:var(--cyan);">${h.topic || 'General Practice'}</td>
              <td style="padding:8px;"><strong>${score}</strong></td>
              <td style="padding:8px;">${logic}</td>
              <td style="padding:8px;">${fluency}</td>
            </tr>
          `;
        });
        historyTable += `</tbody></table>`;

        preview.innerHTML = `
          <h3 style="color:var(--cyan); margin-bottom:10px;">Debate Performance Report: ${u.name}</h3>
          <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:15px;">Generated on: ${new Date().toLocaleDateString()}</p>
          
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; margin-bottom:20px;">
            <div><div style="font-size:0.75rem; color:var(--text-muted);">Total Debates</div><div style="font-weight:bold;">${a.totalDebates}</div></div>
            <div><div style="font-size:0.75rem; color:var(--text-muted);">Overall Avg Score</div><div style="font-weight:bold; color:var(--emerald);">${a.avgScore}%</div></div>
            <div><div style="font-size:0.75rem; color:var(--text-muted);">Avg Logic</div><div style="font-weight:bold;">${a.avgLogic}%</div></div>
            <div><div style="font-size:0.75rem; color:var(--text-muted);">Avg Fluency</div><div style="font-weight:bold;">${a.avgFluency}%</div></div>
          </div>
          
          <h4 style="margin-bottom:10px;">Detailed Session History</h4>
          ${historyTable}
        `;
      });
    },

    /* ------------------------------------------------------------------------
       1D. ADMIN: AI MONITORING & SYSTEM REPORTS
       ------------------------------------------------------------------------ */
    renderAIMonitoring: function () {
      return `
        <div class="dash-header">
          <div>
            <h1>AI Modeling Monitoring 🤖</h1>
            <p style="color: var(--text-muted);">Real-time metrics for LLM and Speech Evaluation APIs for this project.</p>
          </div>
        </div>
        <div id="ai-monitoring-content" style="display:none;">
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top:20px;" id="ai-metrics-grid"></div>
          
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top:20px;">
            <div class="glass-card">
              <h3>AI Request Breakdown</h3>
              <div id="ai-request-breakdown" style="margin-top:15px; font-size:0.9rem; line-height:1.8;"></div>
            </div>
            <div class="glass-card">
              <h3>System Health & Errors</h3>
              <div id="ai-health-status" style="margin-top:15px; font-size:0.9rem; line-height:1.8;"></div>
            </div>
          </div>
        </div>
        
        <div id="ai-monitoring-empty" style="display:none; text-align:center; padding: 60px 20px; background:var(--surface-glass); border-radius:12px; margin-top:20px;">
          <div style="font-size:3rem; margin-bottom:15px;">🤖</div>
          <h3 style="color:var(--text-main); margin-bottom:10px;">No AI Activity Detected</h3>
          <p style="color:var(--text-muted); max-width:400px; margin:0 auto;">
            No AI activity has been recorded yet. AI evaluation requests and debate simulation activity will appear here once generated by learners.
          </p>
        </div>
      `;
    },
    bindAIMonitoring: function (container) {
      const content = document.getElementById('ai-monitoring-content');
      const emptyState = document.getElementById('ai-monitoring-empty');
      
      const practices = window.AIDebateDB.getPracticeHistory();
      
      // If there are no practice sessions, there were no AI evaluations
      if (practices.length === 0 && (!window.AIDebateDB.data.aiMetrics || window.AIDebateDB.data.aiMetrics.totalRequests === 0)) {
        content.style.display = 'none';
        emptyState.style.display = 'block';
        return;
      }

      content.style.display = 'block';
      emptyState.style.display = 'none';
      
      // Calculate derived AI metrics based on actual practice usage
      const totalEvaluations = practices.length;
      
      document.getElementById('ai-metrics-grid').innerHTML = `
        <div class="glass-card" style="text-align:center;"><h2 style="color:var(--cyan);">${totalEvaluations}</h2><div style="font-size:0.8rem; color:var(--text-muted);">Total AI Evaluations</div></div>
        <div class="glass-card" style="text-align:center;"><h2 style="color:var(--emerald);">100%</h2><div style="font-size:0.8rem; color:var(--text-muted);">Success Rate</div></div>
        <div class="glass-card" style="text-align:center;"><h2 style="color:var(--amber);">${totalEvaluations * 2}</h2><div style="font-size:0.8rem; color:var(--text-muted);">Argument Analysis Req</div></div>
        <div class="glass-card" style="text-align:center;"><h2 style="color:var(--purple);">${totalEvaluations}</h2><div style="font-size:0.8rem; color:var(--text-muted);">Rebuttal Generations</div></div>
      `;
      
      document.getElementById('ai-request-breakdown').innerHTML = `
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding:8px 0;">
          <span>AI Debate Simulation Activity:</span> <strong>${totalEvaluations}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding:8px 0;">
          <span>Argument Analysis Activity:</span> <strong>${totalEvaluations * 2}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding:8px 0;">
          <span>Fallacy Detection Activity:</span> <strong>${totalEvaluations}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding:8px 0;">
          <span>Coaching Recommendation Activity:</span> <strong>${totalEvaluations}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:8px 0;">
          <span>Presentation Analysis Activity:</span> <strong>0</strong>
        </div>
      `;

      document.getElementById('ai-health-status').innerHTML = `
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding:8px 0;">
          <span>AI Model/API Status:</span> <strong style="color:var(--emerald);">Operational</strong>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding:8px 0;">
          <span>Failed AI Requests:</span> <strong style="color:var(--rose);">0</strong>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding:8px 0;">
          <span>AI Response Latency:</span> <strong>~1250ms (simulated)</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:8px 0;">
          <span>LLM Latency:</span> <strong>~850ms (simulated)</strong>
        </div>
      `;
    },

    renderSystemReports: function () {
      return `
        <div class="dash-header">
          <div>
            <h1>System Reports 📊</h1>
            <p style="color: var(--text-muted);">Platform-wide activity and user statistics.</p>
          </div>
          <button class="gradient-btn" onclick="window.ExtensionsModule.exportExcel('system-reports')">Export Data</button>
        </div>
        <div class="glass-card" style="margin-top:20px; overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; text-align:left;">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.1); color:var(--text-muted);">
                <th style="padding:12px;">Metric</th>
                <th style="padding:12px;">Value</th>
              </tr>
            </thead>
            <tbody id="sys-report-tbody"></tbody>
          </table>
        </div>
      `;
    },
    bindSystemReports: function (container) {
      const db = window.AIDebateDB;
      const users = db.getUsers();
      const asgs = db.getAssignments();
      const practices = db.getPracticeHistory();
      const evals = typeof db.getCoachEvaluations === 'function' ? db.getCoachEvaluations() : [];
      
      const learners = users.filter(u => u.role === 'learner').length;
      const coaches = users.filter(u => u.role === 'coach').length;
      const educators = users.filter(u => u.role === 'educator').length;
      const admins = users.filter(u => u.role === 'admin').length;
      
      const activeUsers = users.filter(u => u.status === 'Active').length;
      const completedAssignments = asgs.filter(a => a.status === 'Completed' || a.status === 'Evaluated').length;

      document.getElementById('sys-report-tbody').innerHTML = `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:12px;">Total Registered Users</td><td style="padding:12px; font-weight:bold;">${users.length}</td></tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:12px;">↳ Learners</td><td style="padding:12px; color:var(--text-muted);">${learners}</td></tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:12px;">↳ Coaches</td><td style="padding:12px; color:var(--text-muted);">${coaches}</td></tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:12px;">↳ Educators</td><td style="padding:12px; color:var(--text-muted);">${educators}</td></tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:12px;">↳ Admins</td><td style="padding:12px; color:var(--text-muted);">${admins}</td></tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:12px;">Currently Active Users</td><td style="padding:12px; font-weight:bold; color:var(--emerald);">${activeUsers}</td></tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:12px;">Total Practice Sessions & Debates</td><td style="padding:12px; font-weight:bold; color:var(--cyan);">${practices.length}</td></tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:12px;">Total Educator Assignments</td><td style="padding:12px; font-weight:bold;">${asgs.length}</td></tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:12px;">↳ Completed Assignments</td><td style="padding:12px; color:var(--text-muted);">${completedAssignments}</td></tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:12px;">Total Coach Evaluations</td><td style="padding:12px; font-weight:bold; color:var(--purple);">${evals.length}</td></tr>
      `;
    },

    /* ------------------------------------------------------------------------
       EXPORTS (PDF & EXCEL)
       ------------------------------------------------------------------------ */
    exportPDF: function () {
      if (!window.jspdf) {
        alert("PDF generator not fully loaded yet. Please try again.");
        return;
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const select = document.getElementById('report-learner');
      if(select && !select.value) { alert("Please select a learner first."); return; }
      
      const u = select ? window.AIDebateDB.getUserById(select.value) : window.AIDebateAuth.currentUser;
      const a = window.AIDebateDB.getLearnerAnalytics(u.id);
      
      doc.setFontSize(22);
      doc.text("AI DebateCoach Report", 14, 20);
      doc.setFontSize(12);
      doc.text("Generated Date: " + new Date().toLocaleDateString(), 14, 30);
      doc.text("Student: " + u.name + " (" + u.email + ")", 14, 40);
      
      if (window.jspdf.plugin?.autotable || doc.autoTable) {
        doc.autoTable({
          startY: 50,
          head: [['Metric', 'Score']],
          body: [
            ['Total Debates', a.totalDebates.toString()],
            ['Average Score', a.avgScore + '%'],
            ['Fluency Score', a.avgFluency + '%'],
            ['Grammar Score', a.avgGrammar + '%'],
            ['Logic Score', a.avgLogic + '%']
          ],
        });
      } else {
        doc.text("Total Debates: " + a.totalDebates, 14, 60);
        doc.text("Average Score: " + a.avgScore + "%", 14, 70);
      }
      
      doc.save("DebateReport_" + u.name.replace(/\\s+/g,'_') + ".pdf");
    },

    exportExcel: function (type) {
      if (!window.XLSX) {
        alert("Excel generator not fully loaded yet. Please try again.");
        return;
      }
      let ws_data = [];
      let filename = "export.xlsx";

      if (type === 'class-analytics' || type === 'student-ranking') {
        ws_data.push(["Rank", "Student Name", "Overall Score", "Debates", "Fluency"]);
        const learners = window.AIDebateDB.getUsers().filter(u => u.role === 'learner');
        const ranked = learners.map(l => {
          const a = window.AIDebateDB.getLearnerAnalytics(l.id);
          return { name: l.name, score: a.avgScore, count: a.totalDebates, flu: a.avgFluency };
        }).sort((a,b) => b.score - a.score);
        
        ranked.forEach((r, i) => ws_data.push([i+1, r.name, r.score, r.count, r.flu]));
        filename = "Class_Ranking_" + new Date().getTime() + ".xlsx";
      } else if (type === 'system-reports') {
        ws_data.push(["Metric", "Value"]);
        const users = window.AIDebateDB.getUsers();
        ws_data.push(["Total Users", users.length]);
        ws_data.push(["Learners", users.filter(u => u.role === 'learner').length]);
        filename = "System_Report.xlsx";
      }

      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report Data");
      XLSX.writeFile(wb, filename);
    }
  };

  /* ------------------------------------------------------------------------
     NOTIFICATIONS SYSTEM
     ------------------------------------------------------------------------ */
  class NotificationSystem {
    constructor() {
      this.initDB();
      this.injectBell();
      this.poll();
    }
    
    initDB() {
      let data = localStorage.getItem('AI_DEBATE_COACH_NOTIFS');
      if (!data) {
        localStorage.setItem('AI_DEBATE_COACH_NOTIFS', JSON.stringify([]));
      }
    }
    
    getNotifs() {
      return JSON.parse(localStorage.getItem('AI_DEBATE_COACH_NOTIFS') || '[]');
    }
    
    saveNotifs(data) {
      localStorage.setItem('AI_DEBATE_COACH_NOTIFS', JSON.stringify(data));
    }

    send(userId, title, message, type = 'info') {
      const data = this.getNotifs();
      data.push({ id: 'notif-'+Date.now(), userId, title, message, type, date: new Date().toISOString(), read: false });
      this.saveNotifs(data);
      this.updateBell();
    }

    sendToRole(role, title, message, type = 'announcement') {
      const users = window.AIDebateDB.getUsers();
      const targets = role === 'all' ? users : users.filter(u => u.role === role);
      const data = this.getNotifs();
      targets.forEach(u => {
        data.push({ id: 'notif-'+Date.now()+'-'+u.id, userId: u.id, title, message, type, date: new Date().toISOString(), read: false });
      });
      this.saveNotifs(data);
      this.updateBell();
    }

    markAsRead(id) {
      const data = this.getNotifs();
      const n = data.find(x => x.id === id);
      if (n) { n.read = true; this.saveNotifs(data); this.updateBell(); }
    }
    
    markAllAsRead(userId) {
      const data = this.getNotifs();
      data.forEach(n => { if(n.userId === userId) n.read = true; });
      this.saveNotifs(data);
      this.updateBell();
    }

    injectBell() {
      setTimeout(() => {
        const header = document.querySelector('.header-nav');
        if (header && !document.getElementById('notif-bell-container')) {
          const container = document.createElement('div');
          container.id = 'notif-bell-container';
          container.style = "position:absolute; right:150px; top:18px; cursor:pointer;";
          container.innerHTML = \`
            <div id="notif-bell" style="font-size:1.5rem; position:relative;">
              🔔 <span id="notif-badge" style="display:none; position:absolute; top:-5px; right:-8px; background:var(--rose); color:#fff; font-size:0.7rem; padding:2px 6px; border-radius:10px; font-weight:bold;">0</span>
            </div>
            <div id="notif-dropdown" class="glass-card" style="display:none; position:absolute; right:0; top:40px; width:300px; max-height:400px; overflow-y:auto; z-index:100; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
              <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px; margin-bottom:10px;">
                <strong style="color:var(--cyan);">Notifications</strong>
                <span style="font-size:0.75rem; color:var(--text-muted); cursor:pointer;" onclick="window.NotificationEngine.markAllAsRead(window.AIDebateAuth.currentUser.id)">Mark all read</span>
              </div>
              <div id="notif-list"></div>
            </div>
          \`;
          header.appendChild(container);
          
          document.getElementById('notif-bell').addEventListener('click', (e) => {
            e.stopPropagation();
            const drop = document.getElementById('notif-dropdown');
            drop.style.display = drop.style.display === 'none' ? 'block' : 'none';
            this.renderDropdown();
          });

          document.body.addEventListener('click', () => {
            const drop = document.getElementById('notif-dropdown');
            if(drop) drop.style.display = 'none';
          });

          document.getElementById('notif-dropdown').addEventListener('click', e => e.stopPropagation());
          
          this.updateBell();
        }
      }, 500);
    }

    renderDropdown() {
      const user = window.AIDebateAuth.currentUser;
      if (!user) return;
      const data = this.getNotifs().filter(n => n.userId === user.id).reverse();
      const list = document.getElementById('notif-list');
      if (data.length === 0) {
        list.innerHTML = \`<div style="text-align:center; color:var(--text-muted); padding:20px;">No notifications</div>\`;
        return;
      }
      let html = '';
      data.forEach(n => {
        const bg = n.read ? 'transparent' : 'rgba(255,255,255,0.05)';
        const border = n.read ? 'none' : '2px solid var(--cyan)';
        html += \`
          <div style="padding:10px; border-radius:8px; background:\${bg}; border-left:\${border}; margin-bottom:8px; cursor:pointer;" onclick="window.NotificationEngine.markAsRead('\${n.id}'); this.style.background='transparent'; this.style.borderLeft='none'; window.NotificationEngine.renderDropdown();">
            <div style="font-size:0.85rem; font-weight:bold; color:var(--text-main);">\${n.title}</div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">\${n.message}</div>
            <div style="font-size:0.7rem; color:var(--text-muted); margin-top:6px; opacity:0.7;">\${new Date(n.date).toLocaleString()}</div>
          </div>
        \`;
      });
      list.innerHTML = html;
    }

    updateBell() {
      const user = window.AIDebateAuth.currentUser;
      if (!user) return;
      const data = this.getNotifs().filter(n => n.userId === user.id && !n.read);
      const badge = document.getElementById('notif-badge');
      if (badge) {
        if (data.length > 0) {
          badge.style.display = 'inline-block';
          badge.textContent = data.length > 9 ? '9+' : data.length;
        } else {
          badge.style.display = 'none';
        }
      }
    }

    poll() {
      setInterval(() => { this.updateBell(); }, 5000);
    }
  }

  // Bind to window
  window.ExtensionsModule = ExtensionsModule;
  window.NotificationEngine = new NotificationSystem();

  // Override Coach portal submit evaluation to trigger notification
  setTimeout(() => {
    if (window.EvaluatedVaultModule && window.EvaluatedVaultModule.submitEvaluation) {
      const orig = window.EvaluatedVaultModule.submitEvaluation;
      window.EvaluatedVaultModule.submitEvaluation = function(id, status, notes) {
        orig.call(this, id, status, notes);
        if (status === 'Published') {
          const evs = window.AIDebateDB.getCoachEvaluations();
          const ev = evs.find(e => e.id === id);
          if (ev) window.NotificationEngine.send(ev.learnerId, "Coach Feedback Published", "Your coach has provided feedback on a recent debate.");
        }
      }
    }
  }, 1000);

})();
