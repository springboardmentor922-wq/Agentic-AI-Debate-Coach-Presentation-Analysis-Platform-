import React, { useState, useEffect } from 'react';
import { 
  BookmarkCheck, 
  Bookmark, 
  ExternalLink, 
  BookOpen, 
  Video, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Search, 
  X, 
  Award, 
  Sparkles, 
  ChevronRight, 
  Play, 
  GraduationCap, 
  Share2, 
  Check, 
  HelpCircle,
  Lightbulb,
  Target,
  ArrowUpRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface ResourceItem {
  id: string;
  title: string;
  category: 'Guides' | 'Video Lesson' | 'Article' | 'Masterclass' | 'Framework';
  readTime: string;
  icon: any;
  author: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  externalUrl?: string;
  content: {
    overview: string;
    keyTakeaways: string[];
    sections: { heading: string; body: string; tip?: string }[];
    quizPrompt?: { question: string; options: string[]; answerIndex: number; explanation: string };
  };
}

const RESOURCES_DATA: ResourceItem[] = [
  {
    id: 'res_1',
    title: 'The Oxford Debate Format Guide',
    category: 'Guides',
    readTime: '10 min read',
    icon: BookOpen,
    author: 'Oxford Union Debate Society',
    difficulty: 'Intermediate',
    summary: 'Comprehensive breakdown of 1st Prop, 1st Opp, floor speeches, cross-examination protocols, and standard floor scoring rules.',
    externalUrl: 'https://en.wikipedia.org/wiki/Oxford_Union',
    content: {
      overview: 'The Oxford debate format centers around a single motion proposed by the Prime Minister and opposed by the Leader of Opposition. Success requires sharp logical structure, adherence to speech time limits, and respectful point of information (POI) interventions.',
      keyTakeaways: [
        'Prop side must establish clear, non-truistic definitions of the motion.',
        'POI (Points of Information) are permitted between minutes 1 and 6 of main speeches.',
        'Summation speeches must synthesize themes rather than introduce brand new arguments.'
      ],
      sections: [
        {
          heading: '1. Role of the Prime Minister (First Proposition)',
          body: 'The Prime Minister opens the debate by setting definitions, establishing the scope of the problem, and presenting 2-3 core constructive arguments supported by empirical or normative evidence.',
          tip: 'Avoid overly restrictive "squirreling" of definitions—keep them fair and debateable.'
        },
        {
          heading: '2. Role of the Opposition',
          body: 'The Leader of Opposition must immediately clash with the PM’s model, refute core assumptions, and present an opposing counter-case or status-quo defense.',
          tip: 'Highlight systemic flaws or unintended consequences of the proposed policy.'
        },
        {
          heading: '3. Points of Information (POI)',
          body: 'POI interventions must be under 15 seconds. Speakers should accept at least 1-2 POIs during their main address to demonstrate confidence.',
          tip: 'Stand up, raise your hand, and state "On that point, sir/ma’am".'
        }
      ],
      quizPrompt: {
        question: 'When are Points of Information (POIs) allowed during standard 7-minute speeches?',
        options: ['Any time during the speech', 'Between minutes 1 and 6 (protected time excluded)', 'Only in the final 30 seconds', 'Only during reply speeches'],
        answerIndex: 1,
        explanation: 'The first and last minute of a speech are protected time where no POIs can be offered.'
      }
    }
  },
  {
    id: 'res_2',
    title: 'Mastering Logical Fallacy Audits',
    category: 'Video Lesson',
    readTime: '15 min watch',
    icon: Video,
    author: 'Dr. Ananya Sharma',
    difficulty: 'Beginner',
    summary: 'Learn to detect Straw Man, Ad Hominem, False Dilemma, and Slippery Slope fallacies in real-time debate rounds.',
    externalUrl: 'https://en.wikipedia.org/wiki/List_of_fallacies',
    content: {
      overview: 'Detecting logical fallacies allows debaters to instantly dismantle flawed opponent arguments without wasting time on secondary details. This guide covers the top 6 fallacies encountered in competitive debating.',
      keyTakeaways: [
        'Straw Man: Distorting an opponent’s stance to make it easier to attack.',
        'Ad Hominem: Attacking the person rather than the merit of their argument.',
        'False Dilemma: Presenting only two extreme choices when moderate alternatives exist.'
      ],
      sections: [
        {
          heading: '1. Spotting the Straw Man Fallacy',
          body: 'When your opponent says "My opponent wants to destroy the economy by raising taxes," ask the judge to compare what you actually said versus the caricature created.',
          tip: 'Quote your original phrase directly to highlight the distortion.'
        },
        {
          heading: '2. Dismantling False Dilemmas',
          body: 'If presented with "Either we ban AI completely or lose all human jobs", introduce a third pragmatic option such as adaptive regulatory frameworks.',
          tip: 'Nuance is the deadliest counter to black-and-white fallacies.'
        }
      ],
      quizPrompt: {
        question: 'Which fallacy occurs when an opponent attacks the person making the claim instead of the argument itself?',
        options: ['Straw Man', 'Ad Hominem', 'Slippery Slope', 'Red Herring'],
        answerIndex: 1,
        explanation: 'Ad Hominem translates to "to the person" and refers to personal attacks instead of logical rebuttals.'
      }
    }
  },
  {
    id: 'res_3',
    title: 'Public Speaking Pace & WPM Mastery',
    category: 'Article',
    readTime: '8 min read',
    icon: FileText,
    author: 'Prof. Marcus Vance',
    difficulty: 'Beginner',
    summary: 'How to control 130–160 WPM cadence, utilize vocal emphasis, and avoid filler words during high-intensity debate rounds.',
    externalUrl: 'https://en.wikipedia.org/wiki/Public_speaking',
    content: {
      overview: 'Speaking too quickly causes judges to miss key arguments, while speaking too slowly wastes valuable speech time. The optimal speed for persuasive debate delivery is between 130 and 160 Words Per Minute.',
      keyTakeaways: [
        '130-150 WPM: Ideal for complex policy frameworks and philosophical arguments.',
        'Tactical Pauses: 1-2 second pauses after key claims increase judge retention by 40%.',
        'Eliminating Fillers: Replace "um", "ah", "like" with deliberate silence.'
      ],
      sections: [
        {
          heading: '1. The Power of Intentional Silence',
          body: 'Novice debaters fear silence and fill gaps with vocalized pauses. Elite debaters embrace 1-2 second silent pauses before introducing major impacts.',
          tip: 'Take a deep diaphragm breath before starting a new argument point.'
        },
        {
          heading: '2. Pacing Variations for Maximum Impact',
          body: 'Speed up slightly during empirical data lists, but slow down significantly when delivering your main thesis impact line.',
          tip: 'Use vocal pitch drops on final concluding statements.'
        }
      ]
    }
  },
  {
    id: 'res_4',
    title: 'Building Watertight Rebuttal Trees',
    category: 'Masterclass',
    readTime: '20 min watch',
    icon: Video,
    author: 'Stanford Debate Syndicate',
    difficulty: 'Advanced',
    summary: 'Visual mapping technique for categorizing opponent arguments into claim, warrant, and impact nodes for tactical destruction.',
    externalUrl: 'https://en.wikipedia.org/wiki/Rebuttal',
    content: {
      overview: 'A Rebuttal Tree is a cognitive framework used to map out every argument presented by your opponent, isolating their core foundational assumptions (warrants) so you can collapse their entire position with a single point of clash.',
      keyTakeaways: [
        'Attack the Warrant, not just the Claim.',
        'Turn Arguments: Prove that their proposed policy actually accelerates the problem.',
        'Mitigate, De-link, or Outweigh.'
      ],
      sections: [
        {
          heading: '1. The De-link vs Turn Hierarchy',
          body: 'De-linking proves their argument does not apply to this motion. Turning the argument proves that their policy yields the opposite effect.',
          tip: 'Turns earn significantly higher judge speaker points than simple mitigations.'
        },
        {
          heading: '2. Impact Weighing (Magnitude vs Probability vs Timeliness)',
          body: 'Even if the opponent’s argument is true, prove why your impact is larger in scale, more immediate, or irreversible.',
          tip: 'Always use "Even If" logic when delivering complex rebuttals.'
        }
      ]
    }
  },
  {
    id: 'res_5',
    title: 'Lincoln-Douglas Philosophical Frameworks',
    category: 'Framework',
    readTime: '12 min read',
    icon: GraduationCap,
    author: 'Ethics & Philosophy Guild',
    difficulty: 'Advanced',
    summary: 'Applying Kantian Deontology, Utilitarianism, and Rawlsian Justice frameworks in value debates.',
    externalUrl: 'https://en.wikipedia.org/wiki/Lincoln%E2%80%93Douglas_debate',
    content: {
      overview: 'Lincoln-Douglas debate focuses on value propositions rather than policy implementation. Setting a strong Value and Criterion framework is essential for establishing why your side holds the moral high ground.',
      keyTakeaways: [
        'Value: The ultimate moral good (e.g., Justice, Autonomy, Societal Welfare).',
        'Criterion: The measuring stick used to evaluate whether the value is achieved.',
        'Framework Clash: Win the framework first, and your impacts naturally follow.'
      ],
      sections: [
        {
          heading: '1. Utilitarianism vs Deontology',
          body: 'Utilitarianism focuses on the greatest good for the greatest number. Deontology asserts that certain duties or rights are absolute regardless of outcomes.',
          tip: 'Anticipate outcome trade-offs when defending deontological principles.'
        }
      ]
    }
  },
  {
    id: 'res_6',
    title: 'Cross-Examination Leading Questions Strategy',
    category: 'Guides',
    readTime: '7 min read',
    icon: FileText,
    author: 'National Speech & Debate Association',
    difficulty: 'Intermediate',
    summary: 'How to ask closed-ended, trapping questions during cross-fire rounds without giving away your strategy early.',
    externalUrl: 'https://www.speechanddebate.org/',
    content: {
      overview: 'Cross-examination is not for argument debate—it is for extracting admissions from your opponent that you can exploit in subsequent speeches.',
      keyTakeaways: [
        'Never ask "Why?"—it allows the opponent to re-explain their case.',
        'Ask short, yes/no factual questions that force commitments.',
        'Store extracted concessions for your rebuttal speech.'
      ],
      sections: [
        {
          heading: '1. The 3-Step Trap Technique',
          body: 'Establish an uncontroversial baseline premise, get agreement on the application, then reveal the contradiction in their case.',
          tip: 'Keep your tone polite and inquisitive rather than aggressive.'
        }
      ]
    }
  }
];

export const LearningResourcesView: React.FC = () => {
  const { isDark } = useTheme();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalResource, setActiveModalResource] = useState<ResourceItem | null>(null);
  
  // Local state for bookmarks and completed resources
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ai_debate_bookmarked_resources');
      return saved ? JSON.parse(saved) : ['res_1', 'res_2'];
    } catch {
      return ['res_1', 'res_2'];
    }
  });

  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ai_debate_completed_resources');
      return saved ? JSON.parse(saved) : ['res_1'];
    } catch {
      return ['res_1'];
    }
  });

  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      localStorage.setItem('ai_debate_bookmarked_resources', JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.error(e);
    }
  }, [bookmarkedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('ai_debate_completed_resources', JSON.stringify(completedIds));
    } catch (e) {
      console.error(e);
    }
  }, [completedIds]);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleCompleted = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompletedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const categories = ['All', 'Guides', 'Video Lesson', 'Article', 'Masterclass', 'Framework', 'Bookmarks', 'Completed'];

  const filteredResources = RESOURCES_DATA.filter(res => {
    const matchesCategory = 
      selectedCategory === 'All' ? true :
      selectedCategory === 'Bookmarks' ? bookmarkedIds.includes(res.id) :
      selectedCategory === 'Completed' ? completedIds.includes(res.id) :
      res.category === selectedCategory;

    const matchesSearch = 
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.author.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const completedCount = completedIds.length;
  const totalCount = RESOURCES_DATA.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  // Theme styling helpers
  const cardBg = isDark ? 'bg-[#1E293B] border-slate-700/80' : 'bg-white border-slate-200/80 shadow-xs';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputBg = isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400';

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className={`${cardBg} p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-xl font-black tracking-tight ${textPrimary}`}>Curated Learning Resources</h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Hub & Guides
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${textSub}`}>
              Master rhetoric, debate formats, speech pacing, and logical fallacy audits with full interactive guides.
            </p>
          </div>
        </div>

        {/* Learning Progress Widget */}
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/60 min-w-[220px] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Course Progress
            </span>
            <span className="text-emerald-400 font-mono">{completedCount}/{totalCount} ({completionPercentage}%)</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
              style={{ width: `${completionPercentage}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]'
                    : isDark
                    ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
                {cat === 'Bookmarks' && bookmarkedIds.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded-full font-mono">
                    {bookmarkedIds.length}
                  </span>
                )}
                {cat === 'Completed' && completedIds.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-mono">
                    {completedIds.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides, fallacies..."
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${inputBg}`}
          />
        </div>
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className={`${cardBg} p-12 rounded-2xl border text-center space-y-3`}>
          <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className={`text-base font-bold ${textPrimary}`}>No learning resources found</h3>
          <p className={`text-xs max-w-sm mx-auto ${textSub}`}>
            No items matched your active category filter or search query "{searchQuery}". Try selecting "All" or resetting your search.
          </p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const IconComponent = res.icon;
            const isBookmarked = bookmarkedIds.includes(res.id);
            const isCompleted = completedIds.includes(res.id);

            return (
              <div 
                key={res.id} 
                onClick={() => setActiveModalResource(res)}
                className={`${cardBg} p-5 rounded-2xl border flex flex-col justify-between space-y-4 hover:border-indigo-500/50 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden`}
              >
                <div className="space-y-3">
                  {/* Card Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                      {res.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(res.id, e)}
                        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Resource'}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          isBookmarked 
                            ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => toggleCompleted(res.id, e)}
                        title={isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          isCompleted 
                            ? 'text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'fill-emerald-400/30 text-emerald-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Icon */}
                  <div>
                    <h3 className={`font-extrabold text-base leading-snug flex items-start gap-2 group-hover:text-indigo-400 transition-colors ${textPrimary}`}>
                      <IconComponent className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{res.title}</span>
                    </h3>
                    <p className={`text-xs mt-2 line-clamp-2 leading-relaxed ${textSub}`}>
                      {res.summary}
                    </p>
                  </div>
                </div>

                {/* Card Footer Info */}
                <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> {res.readTime}
                  </span>

                  <span className="text-indigo-400 font-bold group-hover:underline flex items-center gap-1 text-xs">
                    Open Resource <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL INTERACTIVE RESOURCE READER MODAL */}
      {activeModalResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#1E293B] border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#1E293B]/95 backdrop-blur-md border-b border-slate-700/80 p-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  {React.createElement(activeModalResource.icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                    {activeModalResource.category} • {activeModalResource.readTime}
                  </span>
                  <h3 className="text-lg font-black text-white leading-tight">
                    {activeModalResource.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleBookmark(activeModalResource.id)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    bookmarkedIds.includes(activeModalResource.id)
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title="Bookmark Resource"
                >
                  <Bookmark className={`w-4 h-4 ${bookmarkedIds.includes(activeModalResource.id) ? 'fill-amber-400' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalResource(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 space-y-6 text-slate-200">
              {/* Overview Box */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Resource Overview
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeModalResource.content.overview}
                </p>
              </div>

              {/* Key Takeaways Bullet List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Target className="w-4 h-4" /> Key Learning Takeaways
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {activeModalResource.content.keyTakeaways.map((takeaway, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl text-xs text-emerald-200">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Sections */}
              <div className="space-y-5 pt-2">
                {activeModalResource.content.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-2 border-l-2 border-indigo-500/50 pl-4 py-1">
                    <h5 className="font-bold text-sm text-white">{sec.heading}</h5>
                    <p className="text-xs text-slate-300 leading-relaxed">{sec.body}</p>
                    {sec.tip && (
                      <div className="bg-amber-950/20 border border-amber-500/30 p-2.5 rounded-xl text-[11px] text-amber-300 flex items-start gap-2 mt-2">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>Pro Tip:</strong> {sec.tip}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Interactive Quiz / Audit Prompt if available */}
              {activeModalResource.content.quizPrompt && (
                <div className="bg-slate-900/90 p-5 rounded-2xl border border-indigo-500/30 space-y-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    Knowledge Check Quiz
                  </span>
                  <h5 className="text-xs font-bold text-white">
                    {activeModalResource.content.quizPrompt.question}
                  </h5>

                  <div className="space-y-2 pt-1">
                    {activeModalResource.content.quizPrompt.options.map((opt, oIdx) => {
                      const isSelected = selectedQuizAnswers[activeModalResource.id] === oIdx;
                      const hasSubmitted = quizSubmitted[activeModalResource.id];
                      const isCorrect = oIdx === activeModalResource.content.quizPrompt?.answerIndex;

                      let btnStyle = 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-indigo-500/50';
                      if (hasSubmitted) {
                        if (isCorrect) btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold';
                        else if (isSelected && !isCorrect) btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-300';
                      } else if (isSelected) {
                        btnStyle = 'bg-indigo-600/30 border-indigo-500 text-white font-bold';
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => {
                            setSelectedQuizAnswers(prev => ({ ...prev, [activeModalResource.id]: oIdx }));
                            setQuizSubmitted(prev => ({ ...prev, [activeModalResource.id]: true }));
                          }}
                          className={`w-full text-left p-3 rounded-xl text-xs border transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {hasSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted[activeModalResource.id] && (
                    <p className="text-[11px] text-slate-300 bg-indigo-950/30 p-3 rounded-xl border border-indigo-800/40">
                      <strong>Explanation:</strong> {activeModalResource.content.quizPrompt.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="sticky bottom-0 bg-[#1E293B]/95 backdrop-blur-md border-t border-slate-700/80 p-4 flex flex-wrap items-center justify-between gap-3 z-10">
              <button
                type="button"
                onClick={() => toggleCompleted(activeModalResource.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  completedIds.includes(activeModalResource.id)
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {completedIds.includes(activeModalResource.id) ? 'Completed ✓' : 'Mark as Completed (+50 XP)'}
              </button>

              {activeModalResource.externalUrl && (
                <a
                  href={activeModalResource.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                >
                  <span>Open Official Guide</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
