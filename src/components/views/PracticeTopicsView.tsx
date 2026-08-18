import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  ArrowRight, 
  Sparkles, 
  Dices, 
  Shuffle, 
  Filter, 
  Check, 
  Zap, 
  Clock, 
  Scale, 
  Flame, 
  RefreshCw,
  Bookmark,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { MOCK_PRACTICE_TOPICS } from '../../data/mockData';
import { PracticeTopic } from '../../types';
import { generateTopicApi } from '../../services/apiClient';

interface PracticeTopicsViewProps {
  onStartPractice: (topicTitle: string) => void;
}

export const PracticeTopicsView: React.FC<PracticeTopicsViewProps> = ({ onStartPractice }) => {
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Randomizer state
  const [randomCategory, setRandomCategory] = useState<string>('All');
  const [randomDifficulty, setRandomDifficulty] = useState<string>('Any');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Default active motion from randomizer
  const [activeRandomMotion, setActiveRandomMotion] = useState<PracticeTopic>({
    id: 'random_init',
    title: 'The Future of Artificial Intelligence',
    category: 'Technology',
    difficulty: 'Intermediate',
    description: 'Debate the societal impact, ethical safeguards, and economic shifts driven by frontier AI models.',
    keyArgumentsFor: ['Accelerates scientific discovery', 'Automates mundane labor', 'Provides personalized education'],
    keyArgumentsAgainst: ['Job displacement concerns', 'Algorithmic bias', 'Security & alignment risks'],
    popularityCount: 1420
  });

  const categories = ['All', 'Technology', 'Environment', 'Society', 'Politics', 'Philosophy', 'Economics'];
  const difficulties = ['Any', 'Beginner', 'Intermediate', 'Advanced'];

  const getAllTopics = (): PracticeTopic[] => {
    try {
      const saved = localStorage.getItem('ai_debate_admin_topics');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load admin topics', e);
    }
    return MOCK_PRACTICE_TOPICS;
  };

  // Handler to pick a random topic from existing pool or custom filter
  const handleSpinRandom = () => {
    setIsSpinning(true);
    setIsSaved(false);

    setTimeout(() => {
      let pool = getAllTopics();
      if (randomCategory !== 'All') {
        pool = pool.filter(t => t.category === randomCategory);
      }
      if (randomDifficulty !== 'Any') {
        pool = pool.filter(t => t.difficulty === randomDifficulty);
      }
      
      // Fallback if filter turns up empty
      if (pool.length === 0) {
        pool = getAllTopics();
      }

      const randomIndex = Math.floor(Math.random() * pool.length);
      setActiveRandomMotion(pool[randomIndex]);
      setIsSpinning(false);
    }, 400);
  };

  // Handler to generate a novel motion using AI
  const handleGenerateAiMotion = async () => {
    setIsGeneratingAi(true);
    setIsSaved(false);
    try {
      const res = await generateTopicApi(
        randomCategory === 'All' ? 'Technology' : randomCategory,
        randomDifficulty === 'Any' ? 'Intermediate' : randomDifficulty
      );
      
      setActiveRandomMotion({
        id: `ai_${Date.now()}`,
        title: res.title || 'AI Generated Motion',
        category: res.category || randomCategory,
        difficulty: (res.difficulty as any) || 'Intermediate',
        description: res.description || 'Custom generated motion for real-time practice.',
        keyArgumentsFor: res.keyArgumentsFor || ['Empirical safety boost', 'Economic advantage', 'Public welfare'],
        keyArgumentsAgainst: res.keyArgumentsAgainst || ['High cost', 'Implementation friction', 'Unintended side effects'],
        popularityCount: 999
      });
    } catch (err) {
      console.error('Failed to generate AI motion:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const filteredTopics = getAllTopics().filter((t) => {
    const matchesCat = selectedCat === 'All' || t.category === selectedCat;
    const matchesQuery = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* SECTION 1: DEBATE TOPIC RANDOMIZER WIDGET */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-500/30 relative overflow-hidden">
        {/* Decorative blur elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-700/50 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-indigo-500/30 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-200 backdrop-blur-md">
                <Dices className="w-3.5 h-3.5 text-indigo-300" />
                <span>AI Debate Topic Generator & Randomizer</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                Debate Topic Randomizer
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/80">
                Spin the randomizer wheel or prompt AI to discover instant, high-stakes debate motions for practice
              </p>
            </div>

            {/* Randomizer Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 p-2.5 rounded-2xl border border-indigo-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-xs px-2">
                <Filter className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-300 font-semibold">Filter:</span>
              </div>
              
              <select
                value={randomCategory}
                onChange={(e) => setRandomCategory(e.target.value)}
                className="bg-slate-900 text-slate-200 border border-indigo-500/30 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>

              <select
                value={randomDifficulty}
                onChange={(e) => setRandomDifficulty(e.target.value)}
                className="bg-slate-900 text-slate-200 border border-indigo-500/30 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>
                    Difficulty: {diff}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Trigger Row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSpinRandom}
              disabled={isSpinning || isGeneratingAi}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <Shuffle className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Spinning Motion Wheel...' : 'Spin Random Motion'}</span>
            </button>

            <button
              onClick={handleGenerateAiMotion}
              disabled={isSpinning || isGeneratingAi}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isGeneratingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
              <span>{isGeneratingAi ? 'Generating AI Motion...' : 'Generate AI Surprise Motion'}</span>
            </button>

            <span className="text-[11px] text-indigo-300/70 font-mono ml-auto hidden sm:inline-block">
              Theme: Light / Dark Synchronized
            </span>
          </div>

          {/* Featured Randomized Motion Showcase Card */}
          <div className="bg-white/10 dark:bg-slate-900/90 border border-white/20 dark:border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl transition-all space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-200 bg-indigo-500/30 px-3 py-1 rounded-full border border-indigo-400/30">
                  {activeRandomMotion.category}
                </span>
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                  activeRandomMotion.difficulty === 'Beginner' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : activeRandomMotion.difficulty === 'Intermediate' 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                }`}>
                  {activeRandomMotion.difficulty} Level
                </span>
                <span className="text-[10px] font-mono text-indigo-200/80 bg-slate-950/50 px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
                  <Scale className="w-3 h-3 text-indigo-300" />
                  Oxford Style Format
                </span>
              </div>

              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`text-xs px-3 py-1 rounded-lg border flex items-center gap-1.5 transition-colors self-start sm:self-auto ${
                  isSaved 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-white/5 text-indigo-200 border-white/10 hover:bg-white/10'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isSaved ? 'Saved to Practice Notes' : 'Save Topic'}</span>
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                "{activeRandomMotion.title}"
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed font-normal">
                {activeRandomMotion.description}
              </p>
            </div>

            {/* Key Arguments Grid inside Motion Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5" /> Key Arguments FOR (Proposition)
                </span>
                <ul className="space-y-1 text-xs text-emerald-100/90">
                  {activeRandomMotion.keyArgumentsFor.map((arg, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{arg}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-950/40 border border-rose-500/30 p-3.5 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ThumbsDown className="w-3.5 h-3.5" /> Key Arguments AGAINST (Opposition)
                </span>
                <ul className="space-y-1 text-xs text-rose-100/90">
                  {activeRandomMotion.keyArgumentsAgainst.map((arg, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{arg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Start Practice CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-indigo-200/80 font-mono">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Est. Duration: 15-20 Mins • Dual AI Agents Active</span>
              </div>

              <button
                onClick={() => onStartPractice(activeRandomMotion.title)}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02]"
              >
                <span>Practice This Topic</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: FULL TOPIC REPOSITORY SEARCH & GRID (Theme Context Aware) */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Debate Practice Topics Repository
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Explore curated topics across categories or launch direct practice drills with AI
                </p>
              </div>
            </div>

            <div className="flex items-center relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics or keywords..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedCat === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Repository Grid of Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTopics.map((topic) => (
            <div 
              key={topic.id} 
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900">
                    {topic.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    topic.difficulty === 'Beginner' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                      : (topic.difficulty === 'Intermediate' 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' 
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300')
                  }`}>
                    {topic.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                  {topic.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {topic.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Key Arguments FOR:</p>
                  <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                    {topic.keyArgumentsFor.map((arg, i) => <li key={i}>{arg}</li>)}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => onStartPractice(topic.title)}
                className="w-full bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-indigo-200 dark:border-indigo-800"
              >
                <span>Practice This Topic</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
