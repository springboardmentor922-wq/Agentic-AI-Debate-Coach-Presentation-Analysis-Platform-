import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  Trophy, 
  BarChart3, 
  Plus, 
  Search, 
  BookOpen, 
  BookmarkCheck, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Filter,
  ArrowLeft,
  Trash2,
  Edit3,
  UserPlus,
  Award,
  Mail,
  ChevronRight,
  BarChart2,
  AlertCircle,
  X,
  Check
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { MOCK_EDUCATOR_DATA } from '../../data/mockData';
import { UserProfile } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { BadgesShowcase } from '../badges/BadgesShowcase';

interface EducatorDashboardViewProps {
  activeUser?: UserProfile;
  activeSubTab?: string;
  existingUsers?: UserProfile[];
}

export interface StudentRosterItem {
  id: string;
  name: string;
  email: string;
  className: string;
  debatesCount: number;
  avgScore: number;
  argumentQuality: number;
  rebuttalScore: number;
  deliveryScore: number;
  evidenceScore: number;
  status: 'Top Performer' | 'Advanced' | 'Proficient' | 'Developing' | 'Needs Coaching';
  stance: 'Proposition' | 'Opposition' | 'Flexible';
  trend: string;
}

export const EducatorDashboardView: React.FC<EducatorDashboardViewProps> = ({ 
  activeUser, 
  activeSubTab = 'dashboard',
  existingUsers = []
}) => {
  const { isDark } = useTheme();
  const educatorName = activeUser?.name || 'Dr. Ananya Sharma';
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  const [searchQuery, setSearchQuery] = useState('');
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);

  // Dynamic state lists for Educator
  const [classList, setClassList] = useState(MOCK_EDUCATOR_DATA.myClasses);
  const [assignments, setAssignments] = useState([
    { id: '1', title: 'AP Rhetoric: AI Ethics Debate', class: 'AP Ethics & Social Media Policy Debate', topic: 'Should social media algorithms be regulated for youth safety?', dueDate: '2026-08-15', submitted: 12, total: 18 },
    { id: '2', title: 'Lincoln-Douglas: UBI & Economic Policy', class: 'Lincoln-Douglas: Universal Basic Income & Welfare', topic: 'Universal Basic Income provides superior social security to traditional welfare.', dueDate: '2026-08-20', submitted: 8, total: 18 },
    { id: '3', title: 'Parliamentary Subsidies Rebuttal Practice', class: 'Parliamentary: Climate Policy & Clean Energy Subsidies', topic: 'Renewable energy subsidies should be doubled by government mandate.', dueDate: '2026-08-25', submitted: 5, total: 15 },
  ]);

  const [rubrics, setRubrics] = useState([
    { id: '1', name: 'AP Policy Debate Rubric', criteriaCount: 4, weights: 'Argumentation (40%), Evidence (30%), Delivery (20%), Rebuttal (10%)' },
    { id: '2', name: 'Parliamentary Style Scoring Criteria', criteriaCount: 3, weights: 'Points of Order & Rebuttals (40%), Structure (30%), Eloquence (30%)' },
    { id: '3', name: 'Lincoln-Douglas Value Debate Checklist', criteriaCount: 3, weights: 'Value Framework (33%), Evidence (33%), Logical Consistency (34%)' },
  ]);

  const customLearners = existingUsers.filter(u => u.role === 'learner' && u.id !== 'usr_alex');

  const [evaluationQueue, setEvaluationQueue] = useState(() => {
    const defaultQueue = [
      { id: '1', learner: 'Alex Chen', topic: 'Should social media algorithms be regulated for youth safety?', submittedAt: '10 mins ago', status: 'Pending Review', text: 'Thank you, Judge. Me and my partner strongly urge you to affirm the resolution that social media platforms must be regulated under strict policy frameworks...' },
      { id: '2', learner: 'Riya Patel', topic: 'Universal Basic Income provides superior security to traditional welfare.', submittedAt: '2 hours ago', status: 'Pending Review', text: 'Honorable judge, excessive administrative barriers in traditional welfare impose unnecessary cognitive stress without proportional security outcomes...' },
      { id: '3', learner: 'Karan Mehta', topic: 'Renewable energy subsidies should be doubled by government mandate.', submittedAt: 'Yesterday', status: 'Pending Review', text: 'Subsidizing clean energy infrastructure accelerates private investment and achieves decarbonization targets rapidly...' },
    ];
    const customQueue = customLearners.map((u, idx) => ({
      id: `custom_edu_${u.id}_${idx}`,
      learner: u.name,
      topic: 'Universal Basic Income creates a resilient safety net for economic innovation.',
      submittedAt: 'Just now',
      status: 'Pending Review',
      text: 'Honorable judge, implementing a UBI fosters entrepreneurial risk-taking while guaranteeing basic human dignity...'
    }));
    return [...defaultQueue, ...customQueue];
  });

  // Modal input state
  const [newClassName, setNewClassName] = useState('');
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newRubricTitle, setNewRubricTitle] = useState('');

  // Roster Management States
  const [selectedRosterClass, setSelectedRosterClass] = useState<string | null>(null);
  const [rosterSearchQuery, setRosterSearchQuery] = useState('');
  const [rosterFilterStatus, setRosterFilterStatus] = useState<string>('All');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentScore, setNewStudentScore] = useState<number>(82);
  const [newStudentStance, setNewStudentStance] = useState<'Proposition' | 'Opposition' | 'Flexible'>('Proposition');

  // Candidate Score Editing Modal State
  const [editingCandidate, setEditingCandidate] = useState<StudentRosterItem | null>(null);
  const [editScoreInput, setEditScoreInput] = useState<number>(80);

  // Candidate Detail Analytics Modal
  const [candidateDetailModal, setCandidateDetailModal] = useState<StudentRosterItem | null>(null);

  // Central Roster Store with Varied Candidate Scores
  const [rosterData, setRosterData] = useState<Record<string, StudentRosterItem[]>>({
    'AP Ethics & Social Media Policy Debate': [
      { id: 'st_1', name: 'Riya Patel', email: 'riya.patel@debatecoach.ai', className: 'AP Ethics & Social Media Policy Debate', debatesCount: 18, avgScore: 92.4, argumentQuality: 95, rebuttalScore: 91, deliveryScore: 93, evidenceScore: 90, status: 'Top Performer', stance: 'Proposition', trend: '+4.2%' },
      { id: 'st_2', name: 'Priya Sharma', email: 'priya.sharma@debatecoach.ai', className: 'AP Ethics & Social Media Policy Debate', debatesCount: 20, avgScore: 89.1, argumentQuality: 90, rebuttalScore: 88, deliveryScore: 91, evidenceScore: 87, status: 'Advanced', stance: 'Proposition', trend: '+3.8%' },
      { id: 'st_3', name: 'Alex Chen', email: 'alex.chen@debatecoach.ai', className: 'AP Ethics & Social Media Policy Debate', debatesCount: 24, avgScore: 86.8, argumentQuality: 88, rebuttalScore: 85, deliveryScore: 89, evidenceScore: 85, status: 'Advanced', stance: 'Opposition', trend: '+5.1%' },
      { id: 'st_4', name: 'Sneha Kulkarni', email: 'sneha.k@debatecoach.ai', className: 'AP Ethics & Social Media Policy Debate', debatesCount: 16, avgScore: 81.5, argumentQuality: 83, rebuttalScore: 80, deliveryScore: 82, evidenceScore: 81, status: 'Proficient', stance: 'Opposition', trend: '+2.9%' },
      { id: 'st_5', name: 'Usha', email: 'usha.learner@debatecoach.ai', className: 'AP Ethics & Social Media Policy Debate', debatesCount: 22, avgScore: 78.6, argumentQuality: 81, rebuttalScore: 76, deliveryScore: 80, evidenceScore: 77, status: 'Proficient', stance: 'Flexible', trend: '+6.5%' },
      { id: 'st_6', name: 'Vikram Singh', email: 'vikram.s@debatecoach.ai', className: 'AP Ethics & Social Media Policy Debate', debatesCount: 12, avgScore: 75.0, argumentQuality: 76, rebuttalScore: 74, deliveryScore: 75, evidenceScore: 75, status: 'Developing', stance: 'Opposition', trend: '+1.5%' },
      { id: 'st_7', name: 'Karan Mehta', email: 'karan.m@debatecoach.ai', className: 'AP Ethics & Social Media Policy Debate', debatesCount: 14, avgScore: 73.2, argumentQuality: 74, rebuttalScore: 72, deliveryScore: 73, evidenceScore: 74, status: 'Developing', stance: 'Proposition', trend: '+2.1%' },
      { id: 'st_8', name: 'Arjun Verma', email: 'arjun.v@debatecoach.ai', className: 'AP Ethics & Social Media Policy Debate', debatesCount: 10, avgScore: 68.4, argumentQuality: 69, rebuttalScore: 67, deliveryScore: 70, evidenceScore: 67, status: 'Needs Coaching', stance: 'Proposition', trend: '-0.8%' },
    ],
    'Lincoln-Douglas: Universal Basic Income & Welfare': [
      { id: 'st_9', name: 'Ananya Sharma', email: 'ananya.s@debatecoach.ai', className: 'Lincoln-Douglas: Universal Basic Income & Welfare', debatesCount: 15, avgScore: 90.2, argumentQuality: 92, rebuttalScore: 89, deliveryScore: 91, evidenceScore: 89, status: 'Top Performer', stance: 'Proposition', trend: '+5.0%' },
      { id: 'st_10', name: 'Rahul Deshmukh', email: 'rahul.d@debatecoach.ai', className: 'Lincoln-Douglas: Universal Basic Income & Welfare', debatesCount: 19, avgScore: 85.6, argumentQuality: 87, rebuttalScore: 84, deliveryScore: 86, evidenceScore: 85, status: 'Advanced', stance: 'Opposition', trend: '+3.2%' },
      { id: 'st_11', name: 'Alex Chen', email: 'alex.chen@debatecoach.ai', className: 'Lincoln-Douglas: Universal Basic Income & Welfare', debatesCount: 12, avgScore: 82.3, argumentQuality: 84, rebuttalScore: 81, deliveryScore: 83, evidenceScore: 81, status: 'Proficient', stance: 'Flexible', trend: '+2.8%' },
      { id: 'st_12', name: 'Tanvi Joshi', email: 'tanvi.j@debatecoach.ai', className: 'Lincoln-Douglas: Universal Basic Income & Welfare', debatesCount: 11, avgScore: 76.1, argumentQuality: 78, rebuttalScore: 74, deliveryScore: 77, evidenceScore: 75, status: 'Proficient', stance: 'Proposition', trend: '+1.9%' },
      { id: 'st_13', name: 'Devansh Kapoor', email: 'devansh.k@debatecoach.ai', className: 'Lincoln-Douglas: Universal Basic Income & Welfare', debatesCount: 9, avgScore: 71.8, argumentQuality: 73, rebuttalScore: 70, deliveryScore: 72, evidenceScore: 72, status: 'Developing', stance: 'Opposition', trend: '+0.5%' },
      { id: 'st_14', name: 'Arjun Verma', email: 'arjun.v@debatecoach.ai', className: 'Lincoln-Douglas: Universal Basic Income & Welfare', debatesCount: 8, avgScore: 65.0, argumentQuality: 66, rebuttalScore: 63, deliveryScore: 67, evidenceScore: 64, status: 'Needs Coaching', stance: 'Flexible', trend: '-1.2%' },
    ],
    'Parliamentary: Climate Policy & Clean Energy Subsidies': [
      { id: 'st_15', name: 'Riya Patel', email: 'riya.patel@debatecoach.ai', className: 'Parliamentary: Climate Policy & Clean Energy Subsidies', debatesCount: 22, avgScore: 94.1, argumentQuality: 96, rebuttalScore: 93, deliveryScore: 95, evidenceScore: 92, status: 'Top Performer', stance: 'Proposition', trend: '+6.0%' },
      { id: 'st_16', name: 'Meera Nambiar', email: 'meera.n@debatecoach.ai', className: 'Parliamentary: Climate Policy & Clean Energy Subsidies', debatesCount: 20, avgScore: 91.5, argumentQuality: 93, rebuttalScore: 90, deliveryScore: 92, evidenceScore: 91, status: 'Top Performer', stance: 'Opposition', trend: '+4.8%' },
      { id: 'st_17', name: 'Siddharth Rao', email: 'siddharth.r@debatecoach.ai', className: 'Parliamentary: Climate Policy & Clean Energy Subsidies', debatesCount: 17, avgScore: 87.2, argumentQuality: 89, rebuttalScore: 85, deliveryScore: 88, evidenceScore: 86, status: 'Advanced', stance: 'Proposition', trend: '+3.5%' },
      { id: 'st_18', name: 'Sneha Kulkarni', email: 'sneha.k@debatecoach.ai', className: 'Parliamentary: Climate Policy & Clean Energy Subsidies', debatesCount: 14, avgScore: 83.0, argumentQuality: 85, rebuttalScore: 81, deliveryScore: 84, evidenceScore: 82, status: 'Proficient', stance: 'Flexible', trend: '+2.1%' },
      { id: 'st_19', name: 'Kabir Grover', email: 'kabir.g@debatecoach.ai', className: 'Parliamentary: Climate Policy & Clean Energy Subsidies', debatesCount: 13, avgScore: 79.4, argumentQuality: 81, rebuttalScore: 78, deliveryScore: 80, evidenceScore: 78, status: 'Proficient', stance: 'Opposition', trend: '+1.4%' },
    ],
    'Oxford Debate: AI Automation & Labor Market Shifts': [
      { id: 'st_20', name: 'Rohan Roy', email: 'rohan.r@debatecoach.ai', className: 'Oxford Debate: AI Automation & Labor Market Shifts', debatesCount: 16, avgScore: 88.5, argumentQuality: 90, rebuttalScore: 87, deliveryScore: 89, evidenceScore: 88, status: 'Advanced', stance: 'Proposition', trend: '+4.1%' },
      { id: 'st_21', name: 'Ishaan Gupta', email: 'ishaan.g@debatecoach.ai', className: 'Oxford Debate: AI Automation & Labor Market Shifts', debatesCount: 14, avgScore: 82.0, argumentQuality: 84, rebuttalScore: 80, deliveryScore: 83, evidenceScore: 81, status: 'Proficient', stance: 'Opposition', trend: '+2.5%' },
      { id: 'st_22', name: 'Karan Mehta', email: 'karan.m@debatecoach.ai', className: 'Oxford Debate: AI Automation & Labor Market Shifts', debatesCount: 12, avgScore: 74.5, argumentQuality: 76, rebuttalScore: 73, deliveryScore: 75, evidenceScore: 74, status: 'Developing', stance: 'Proposition', trend: '+1.0%' },
      { id: 'st_23', name: 'Simran Kaur', email: 'simran.k@debatecoach.ai', className: 'Oxford Debate: AI Automation & Labor Market Shifts', debatesCount: 10, avgScore: 69.8, argumentQuality: 71, rebuttalScore: 68, deliveryScore: 71, evidenceScore: 69, status: 'Developing', stance: 'Opposition', trend: '+0.2%' },
      { id: 'st_24', name: 'Yashwardhan', email: 'yash.w@debatecoach.ai', className: 'Oxford Debate: AI Automation & Labor Market Shifts', debatesCount: 8, avgScore: 63.2, argumentQuality: 64, rebuttalScore: 61, deliveryScore: 65, evidenceScore: 62, status: 'Needs Coaching', stance: 'Flexible', trend: '-2.0%' },
    ],
    'Public Forum: High School Curricula & Mandatory PE': [
      { id: 'st_25', name: 'Priya Sharma', email: 'priya.sharma@debatecoach.ai', className: 'Public Forum: High School Curricula & Mandatory PE', debatesCount: 25, avgScore: 93.0, argumentQuality: 95, rebuttalScore: 92, deliveryScore: 94, evidenceScore: 91, status: 'Top Performer', stance: 'Proposition', trend: '+5.5%' },
      { id: 'st_26', name: 'Alex Chen', email: 'alex.chen@debatecoach.ai', className: 'Public Forum: High School Curricula & Mandatory PE', debatesCount: 21, avgScore: 88.2, argumentQuality: 90, rebuttalScore: 86, deliveryScore: 89, evidenceScore: 87, status: 'Advanced', stance: 'Opposition', trend: '+4.0%' },
      { id: 'st_27', name: 'Usha', email: 'usha.learner@debatecoach.ai', className: 'Public Forum: High School Curricula & Mandatory PE', debatesCount: 18, avgScore: 82.5, argumentQuality: 84, rebuttalScore: 81, deliveryScore: 83, evidenceScore: 81, status: 'Proficient', stance: 'Proposition', trend: '+3.1%' },
      { id: 'st_28', name: 'Vikram Singh', email: 'vikram.s@debatecoach.ai', className: 'Public Forum: High School Curricula & Mandatory PE', debatesCount: 15, avgScore: 77.4, argumentQuality: 79, rebuttalScore: 75, deliveryScore: 78, evidenceScore: 77, status: 'Proficient', stance: 'Flexible', trend: '+1.8%' },
    ]
  });

  const cardBgClass = isDark 
    ? 'bg-[#1E293B] border-slate-700/80 text-white shadow-xl' 
    : 'bg-white border-slate-200 text-slate-900 shadow-md';

  const textHeader = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-600';

  const distribution = [
    { name: 'Above 85', value: 42 },
    { name: '70-84', value: 58 },
    { name: '50-69', value: 22 },
    { name: 'Below 50', value: 6 }
  ];

  // Helper function to remove student from roster
  const handleRemoveStudent = (studentId: string, className: string) => {
    setRosterData(prev => {
      const currentList = prev[className] || [];
      const updated = currentList.filter(s => s.id !== studentId);
      return { ...prev, [className]: updated };
    });
    // Update class learner count
    setClassList(prev => prev.map(c => c.name === className ? { ...c, learners: Math.max((c.learners || 1) - 1, 0) } : c));
  };

  // Helper to calculate candidate status based on score
  const getCandidateStatus = (score: number): StudentRosterItem['status'] => {
    if (score >= 90) return 'Top Performer';
    if (score >= 85) return 'Advanced';
    if (score >= 78) return 'Proficient';
    if (score >= 70) return 'Developing';
    return 'Needs Coaching';
  };

  // Helper to add new student to roster
  const handleAddStudentToRoster = () => {
    if (!selectedRosterClass || !newStudentName.trim()) return;
    const className = selectedRosterClass;
    const scoreVal = Number(newStudentScore) || 80;
    const newStudent: StudentRosterItem = {
      id: `st_${Date.now()}`,
      name: newStudentName.trim(),
      email: newStudentEmail.trim() || `${newStudentName.toLowerCase().replace(/\s+/g, '.')}@debatecoach.ai`,
      className,
      debatesCount: 1,
      avgScore: scoreVal,
      argumentQuality: Math.min(scoreVal + 2, 98),
      rebuttalScore: Math.min(scoreVal - 2, 95),
      deliveryScore: Math.min(scoreVal + 1, 98),
      evidenceScore: Math.max(scoreVal - 3, 50),
      status: getCandidateStatus(scoreVal),
      stance: newStudentStance,
      trend: '+1.0%'
    };

    setRosterData(prev => ({
      ...prev,
      [className]: [newStudent, ...(prev[className] || [])]
    }));

    // Recalculate class learner count and average score
    setClassList(prev => prev.map(c => {
      if (c.name === className) {
        const existingList = rosterData[className] || [];
        const allScores = [scoreVal, ...existingList.map(s => s.avgScore)];
        const newAvg = Number((allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1));
        return { ...c, learners: (c.learners || 0) + 1, avgScore: newAvg };
      }
      return c;
    }));

    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentScore(82);
    setIsAddStudentModalOpen(false);
  };

  // Helper to save edited candidate score
  const handleSaveCandidateScore = () => {
    if (!editingCandidate || !selectedRosterClass) return;
    const newScore = Math.min(Math.max(Number(editScoreInput) || 75, 40), 99);
    const className = selectedRosterClass;

    setRosterData(prev => {
      const list = prev[className] || [];
      const updated = list.map(s => {
        if (s.id === editingCandidate.id) {
          return {
            ...s,
            avgScore: newScore,
            status: getCandidateStatus(newScore),
            argumentQuality: Math.min(newScore + 2, 98),
            rebuttalScore: Math.min(newScore - 2, 95),
            evidenceScore: Math.max(newScore - 3, 50)
          };
        }
        return s;
      });
      return { ...prev, [className]: updated };
    });

    // Recalculate class average score
    setClassList(prev => prev.map(c => {
      if (c.name === className) {
        const currentList = rosterData[className] || [];
        const updatedScores = currentList.map(s => s.id === editingCandidate.id ? newScore : s.avgScore);
        const newAvg = Number((updatedScores.reduce((a, b) => a + b, 0) / updatedScores.length).toFixed(1));
        return { ...c, avgScore: newAvg };
      }
      return c;
    }));

    setEditingCandidate(null);
  };

  // RENDER ROSTER MANAGEMENT VIEW
  if (selectedRosterClass) {
    const currentClassObj = classList.find(c => c.name === selectedRosterClass) || { name: selectedRosterClass, learners: 0, avgScore: 80, trend: '+4.0' };
    const classRoster = rosterData[selectedRosterClass] || [];
    
    // Merge custom learners if not present
    const customLearnerRoster = customLearners.map((u, i) => ({
      id: `custom_roster_${u.id}_${i}`,
      name: u.name,
      email: u.email || `${u.name.toLowerCase().replace(/\s+/g, '.')}@learner.ai`,
      className: selectedRosterClass,
      debatesCount: 8,
      avgScore: 81.2 + (i % 5) * 2.3,
      argumentQuality: 83,
      rebuttalScore: 79,
      deliveryScore: 82,
      evidenceScore: 80,
      status: getCandidateStatus(81.2 + (i % 5) * 2.3),
      stance: 'Proposition' as const,
      trend: '+3.5%'
    })).filter(cl => !classRoster.some(s => s.email === cl.email || s.name === cl.name));

    const combinedRoster = [...classRoster, ...customLearnerRoster];

    // Filter by search & status
    const filteredRoster = combinedRoster.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(rosterSearchQuery.toLowerCase()) || 
                            item.email.toLowerCase().includes(rosterSearchQuery.toLowerCase());
      const matchesStatus = rosterFilterStatus === 'All' || item.status === rosterFilterStatus;
      return matchesSearch && matchesStatus;
    });

    // Dynamic class stats
    const totalStudents = combinedRoster.length;
    const avgScoreCalc = totalStudents > 0 
      ? (combinedRoster.reduce((sum, s) => sum + s.avgScore, 0) / totalStudents).toFixed(1)
      : currentClassObj.avgScore;
    const topPerformer = combinedRoster.length > 0 
      ? [...combinedRoster].sort((a, b) => b.avgScore - a.avgScore)[0] 
      : null;

    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-200">
        {/* Navigation Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900/40 via-slate-900 to-indigo-950/60 p-6 rounded-2xl border border-indigo-500/30 shadow-xl">
          <div className="space-y-1">
            <button 
              onClick={() => setSelectedRosterClass(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors mb-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to My Debate Classes
            </button>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-400 shrink-0" />
              Class Roster: <span className="text-indigo-300">{selectedRosterClass}</span>
            </h2>
            <p className="text-slate-300 text-xs">
              Manage enrolled debaters, adjust individual candidate performance scores, and inspect skill analytics.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setIsAddStudentModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-900/40 cursor-pointer transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" /> Add Debater
            </button>
          </div>
        </div>

        {/* Class Roster Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-2xl border ${cardBgClass} flex items-center gap-3.5`}>
            <div className="w-11 h-11 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Total Enrolled</p>
              <p className="text-xl font-bold text-white mt-0.5">{totalStudents} Debaters</p>
              <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">Active Roster</p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${cardBgClass} flex items-center gap-3.5`}>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Class Average Score</p>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">{avgScoreCalc}/100</p>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Calculated across roster</p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${cardBgClass} flex items-center gap-3.5`}>
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Top Candidate</p>
              <p className="text-sm font-bold text-amber-300 truncate max-w-[150px] mt-0.5">{topPerformer ? topPerformer.name : 'N/A'}</p>
              <p className="text-[11px] text-amber-400 font-semibold mt-0.5">{topPerformer ? `${topPerformer.avgScore}/100 Avg` : ''}</p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${cardBgClass} flex items-center gap-3.5`}>
            <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Score Variation Range</p>
              <p className="text-sm font-bold text-purple-300 mt-0.5">
                {combinedRoster.length > 0 
                  ? `${Math.min(...combinedRoster.map(s => s.avgScore))} - ${Math.max(...combinedRoster.map(s => s.avgScore))} pts`
                  : 'N/A'}
              </p>
              <p className="text-[11px] text-purple-400 font-semibold mt-0.5">Performance-weighted</p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className={`p-4 rounded-2xl border ${cardBgClass} flex flex-col md:flex-row items-center justify-between gap-3`}>
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={rosterSearchQuery}
              onChange={(e) => setRosterSearchQuery(e.target.value)}
              placeholder="Search candidate name or email..." 
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Performance Filter:
            </span>
            {['All', 'Top Performer', 'Advanced', 'Proficient', 'Developing', 'Needs Coaching'].map((st) => (
              <button
                key={st}
                onClick={() => setRosterFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  rosterFilterStatus === st 
                    ? 'bg-indigo-600 text-white shadow' 
                    : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Candidate Roster Table */}
        <div className={`rounded-2xl border overflow-hidden ${cardBgClass}`}>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              Roster Candidates ({filteredRoster.length})
            </span>
            <span className="text-xs text-slate-400">Showing candidate score variations based on debate turns</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Candidate Name</th>
                  <th className="p-3.5">Debates</th>
                  <th className="p-3.5">Average Score</th>
                  <th className="p-3.5">Skill Status</th>
                  <th className="p-3.5">Primary Stance</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredRoster.map((candidate) => {
                  const scoreColor = candidate.avgScore >= 88 ? 'text-emerald-400' : candidate.avgScore >= 78 ? 'text-indigo-400' : candidate.avgScore >= 70 ? 'text-amber-400' : 'text-rose-400';
                  const badgeColor = candidate.avgScore >= 90 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : candidate.avgScore >= 85 
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    : candidate.avgScore >= 78
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                    : candidate.avgScore >= 70
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                  return (
                    <tr key={candidate.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold flex items-center justify-center shrink-0">
                            {candidate.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{candidate.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{candidate.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-medium font-mono text-slate-300">
                        {candidate.debatesCount} Debates
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-extrabold text-sm font-mono ${scoreColor}`}>
                            {candidate.avgScore}/100
                          </span>
                          <span className="text-[10px] text-emerald-400 font-semibold">{candidate.trend}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                          {candidate.status}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="text-[11px] font-medium text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">
                          {candidate.stance}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setCandidateDetailModal(candidate)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold text-[11px] border border-indigo-500/20 transition-colors cursor-pointer"
                          >
                            Analytics
                          </button>
                          <button 
                            onClick={() => {
                              setEditingCandidate(candidate);
                              setEditScoreInput(candidate.avgScore);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit candidate score"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleRemoveStudent(candidate.id, selectedRosterClass)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="Remove candidate from roster"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredRoster.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      No candidates found matching filters in this class roster.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal 1: Add Student to Roster */}
        {isAddStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className={`w-full max-w-md p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className={`font-bold text-base ${textHeader} flex items-center gap-2`}>
                  <UserPlus className="w-5 h-5 text-indigo-400" />
                  Add Candidate to Roster
                </h3>
                <button onClick={() => setIsAddStudentModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Candidate Name *</label>
                  <input 
                    type="text" 
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="e.g. Sanya Kapoor" 
                    className="w-full p-2.5 rounded-xl border bg-slate-900 border-slate-700 text-white" 
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-300">Candidate Email</label>
                  <input 
                    type="email" 
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="e.g. sanya.k@debatecoach.ai" 
                    className="w-full p-2.5 rounded-xl border bg-slate-900 border-slate-700 text-white" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1 text-slate-300">Initial Avg Score (1-100)</label>
                    <input 
                      type="number" 
                      min={40}
                      max={99}
                      value={newStudentScore}
                      onChange={(e) => setNewStudentScore(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border bg-slate-900 border-slate-700 text-white font-mono" 
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-300">Primary Stance</label>
                    <select
                      value={newStudentStance}
                      onChange={(e) => setNewStudentStance(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border bg-slate-900 border-slate-700 text-white"
                    >
                      <option value="Proposition">Proposition</option>
                      <option value="Opposition">Opposition</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button 
                  onClick={() => setIsAddStudentModalOpen(false)} 
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddStudentToRoster}
                  disabled={!newStudentName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  Save & Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Edit Candidate Score */}
        {editingCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className={`w-full max-w-sm p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className={`font-bold text-base ${textHeader}`}>Edit Candidate Score</h3>
                <button onClick={() => setEditingCandidate(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-300 font-bold">{editingCandidate.name}</p>
                <p className="text-slate-400 text-[11px]">{editingCandidate.email}</p>

                <div>
                  <label className="font-semibold block mb-1 text-slate-300">New Average Score (1-100)</label>
                  <input 
                    type="number" 
                    min={40}
                    max={99}
                    value={editScoreInput}
                    onChange={(e) => setEditScoreInput(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border bg-slate-900 border-slate-700 text-white font-mono text-lg font-bold" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button 
                  onClick={() => setEditingCandidate(null)} 
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveCandidateScore}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Update Score
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 3: Candidate Detail Analytics Drawer */}
        {candidateDetailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className={`w-full max-w-lg p-6 rounded-2xl border space-y-5 ${cardBgClass}`}>
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md">
                    {candidateDetailModal.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{candidateDetailModal.name}</h3>
                    <p className="text-xs text-slate-400">{candidateDetailModal.email} • {candidateDetailModal.className}</p>
                  </div>
                </div>
                <button onClick={() => setCandidateDetailModal(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Candidate Performance Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-medium block">Overall Avg Score</span>
                  <span className="text-lg font-bold text-indigo-400 font-mono">{candidateDetailModal.avgScore}/100</span>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-medium block">Argument Quality</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">{candidateDetailModal.argumentQuality}/100</span>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-medium block">Rebuttal Sharpness</span>
                  <span className="text-lg font-bold text-sky-400 font-mono">{candidateDetailModal.rebuttalScore}/100</span>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-medium block">Evidence Usage</span>
                  <span className="text-lg font-bold text-amber-400 font-mono">{candidateDetailModal.evidenceScore}/100</span>
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-indigo-300 block">AI Coach Evaluation Summary:</span>
                <p className="text-slate-300 leading-relaxed italic">
                  "{candidateDetailModal.name} demonstrates consistent {candidateDetailModal.status.toLowerCase()} capabilities with strong structural logic. Recommended focus areas include integrating empirical statistical evidence and avoiding straw man assumptions in cross-examination."
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => setCandidateDetailModal(null)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Close Analytics
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- SUBVIEW 1: My Classes ---
  if (activeSubTab === 'my-classes') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>My Debate Classes</h2>
            <p className={`text-xs ${textSub}`}>Manage assigned debate topic student rosters and track class-level performance averages.</p>
          </div>
          <button 
            onClick={() => setIsClassModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> Create Class
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classList.map((c, i) => (
            <div key={i} className={`p-5 rounded-2xl border space-y-4 ${cardBgClass} flex flex-col justify-between`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {c.learners} Students
                  </span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">+{c.trend}% Avg Growth</span>
                </div>
                <div>
                  <h3 className={`font-bold text-base ${textHeader}`}>{c.name}</h3>
                  <p className={`text-xs ${textSub} mt-1`}>Term: Spring 2025 • Format: Debate & Public Speaking</p>
                </div>

                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={textSub}>Average Class Score</span>
                  <span className="font-bold text-indigo-400 text-base font-mono">{c.avgScore}/100</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80 mt-2">
                <button 
                  onClick={() => setSelectedRosterClass(c.name)}
                  className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Manage Roster →
                </button>
                <button 
                  onClick={() => setSelectedRosterClass(c.name)}
                  className="text-slate-400 hover:text-white text-[11px] cursor-pointer"
                >
                  View Analytics
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Create Class */}
        {isClassModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className={`w-full max-w-md p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
              <h3 className={`font-bold text-base ${textHeader}`}>Create New Debate Class</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Class Name / Debate Topic</label>
                  <input 
                    type="text" 
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="e.g. Oxford Debate: AI Regulation & Ethics Policy" 
                    className={`w-full p-2.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} 
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={() => setIsClassModalOpen(false)} className={`px-4 py-2 rounded-xl text-xs font-semibold border ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'}`}>Cancel</button>
                <button 
                  onClick={() => {
                    if (newClassName.trim()) {
                      const name = newClassName.trim();
                      setClassList(prev => [...prev, { name, shortName: name.slice(0, 12), learners: 12, avgScore: 81.2, trend: '+5.2' }]);
                      setRosterData(prev => ({
                        ...prev,
                        [name]: [
                          { id: `st_new_1`, name: 'Riya Patel', email: 'riya.p@debatecoach.ai', className: name, debatesCount: 14, avgScore: 89.2, argumentQuality: 91, rebuttalScore: 87, deliveryScore: 90, evidenceScore: 88, status: 'Advanced', stance: 'Proposition', trend: '+4.0%' },
                          { id: `st_new_2`, name: 'Alex Chen', email: 'alex.c@debatecoach.ai', className: name, debatesCount: 18, avgScore: 84.5, argumentQuality: 86, rebuttalScore: 83, deliveryScore: 85, evidenceScore: 82, status: 'Proficient', stance: 'Opposition', trend: '+3.2%' },
                          { id: `st_new_3`, name: 'Karan Mehta', email: 'karan.m@debatecoach.ai', className: name, debatesCount: 10, avgScore: 72.8, argumentQuality: 74, rebuttalScore: 71, deliveryScore: 73, evidenceScore: 72, status: 'Developing', stance: 'Flexible', trend: '+1.5%' }
                        ]
                      }));
                      setNewClassName('');
                    }
                    setIsClassModalOpen(false);
                  }} 
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- SUBVIEW 2: Assignments ---
  if (activeSubTab === 'assignments') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>Class Debate Assignments</h2>
            <p className={`text-xs ${textSub}`}>Assign debate topics, set deadlines, and monitor student submission progress.</p>
          </div>
          <button 
            onClick={() => setIsAssignmentModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> Create Assignment
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a) => (
            <div key={a.id} className={`p-5 rounded-2xl border space-y-4 ${cardBgClass}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">{a.class}</span>
                <span className={`text-xs font-mono ${textSub}`}>Due {a.dueDate}</span>
              </div>
              <div>
                <h3 className={`font-bold text-sm ${textHeader}`}>{a.title}</h3>
                <p className={`text-xs ${textSub} mt-1 italic`}>"{a.topic}"</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className={textSub}>Submissions</span>
                  <span className="text-indigo-400 font-mono">{a.submitted} / {a.total} Completed</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(a.submitted / a.total) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Create Assignment */}
        {isAssignmentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className={`w-full max-w-md p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
              <h3 className={`font-bold text-base ${textHeader}`}>Create Assignment</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Title</label>
                  <input 
                    type="text" 
                    value={newAssignmentTitle}
                    onChange={(e) => setNewAssignmentTitle(e.target.value)}
                    placeholder="e.g. Rebuttal Synthesis Assignment" 
                    className={`w-full p-2.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} 
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={() => setIsAssignmentModalOpen(false)} className={`px-4 py-2 rounded-xl text-xs font-semibold border ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'}`}>Cancel</button>
                <button 
                  onClick={() => {
                    if (newAssignmentTitle.trim()) {
                      setAssignments(prev => [...prev, { id: Date.now().toString(), title: newAssignmentTitle.trim(), class: 'AP Ethics & Social Media Policy Debate', topic: 'Should physical education be mandatory?', dueDate: '2026-08-30', submitted: 0, total: 18 }]);
                      setNewAssignmentTitle('');
                    }
                    setIsAssignmentModalOpen(false);
                  }} 
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- SUBVIEW 3: Rubrics & Criteria ---
  if (activeSubTab === 'rubrics') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>Rubrics & Criteria</h2>
            <p className={`text-xs ${textSub}`}>Custom evaluation frameworks and scoring rubrics applied during debate reviews.</p>
          </div>
          <button 
            onClick={() => setIsRubricModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> New Rubric
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rubrics.map((r) => (
            <div key={r.id} className={`p-5 rounded-2xl border space-y-3 ${cardBgClass}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">{r.criteriaCount} Criteria</span>
              </div>
              <h3 className={`font-bold text-sm ${textHeader}`}>{r.name}</h3>
              <p className={`text-xs ${textSub} leading-relaxed`}>Weightings: {r.weights}</p>
            </div>
          ))}
        </div>

        {/* Modal: New Rubric */}
        {isRubricModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className={`w-full max-w-md p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
              <h3 className={`font-bold text-base ${textHeader}`}>Create Scoring Rubric</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Rubric Name</label>
                  <input 
                    type="text" 
                    value={newRubricTitle}
                    onChange={(e) => setNewRubricTitle(e.target.value)}
                    placeholder="e.g. Policy Debate Advanced Rubric" 
                    className={`w-full p-2.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} 
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={() => setIsRubricModalOpen(false)} className={`px-4 py-2 rounded-xl text-xs font-semibold border ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'}`}>Cancel</button>
                <button 
                  onClick={() => {
                    if (newRubricTitle.trim()) {
                      setRubrics(prev => [...prev, { id: Date.now().toString(), name: newRubricTitle.trim(), criteriaCount: 4, weights: 'Argumentation (40%), Delivery (30%), Rebuttal (30%)' }]);
                      setNewRubricTitle('');
                    }
                    setIsRubricModalOpen(false);
                  }} 
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Save Rubric
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- SUBVIEW 4: Evaluation Queue ---
  if (activeSubTab === 'evaluation-queue') {
    return (
      <div className="space-y-6 pb-12">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>Evaluation Queue</h2>
          <p className={`text-xs ${textSub}`}>Sessions across all learners waiting for teacher grading and feedback.</p>
        </div>

        <div className="space-y-4">
          {evaluationQueue.map((item) => (
            <div key={item.id} className={`p-5 rounded-2xl border space-y-3 ${cardBgClass}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-sm ${textHeader}`}>{item.learner}</h3>
                  <span className={`text-xs ${textSub}`}>— {item.topic}</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400">{item.status}</span>
              </div>

              <div className={`p-4 rounded-xl border text-xs leading-relaxed italic ${isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                "{item.text}"
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="text" 
                  placeholder="Write your evaluation feedback..." 
                  className={`flex-1 p-2.5 rounded-xl border text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} 
                />
                <button 
                  onClick={() => {
                    setEvaluationQueue(prev => prev.filter(eq => eq.id !== item.id));
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                >
                  Mark Reviewed
                </button>
              </div>
            </div>
          ))}

          {evaluationQueue.length === 0 && (
            <div className={`p-12 text-center rounded-2xl border ${cardBgClass}`}>
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className={`text-sm font-semibold ${textSub}`}>Evaluation queue is empty! All submissions reviewed.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- SUBVIEW 5A: Class Analytics ---
  if (activeSubTab === 'performance-analytics') {
    const trendData = [
      { date: 'Jul 20', score: 62 },
      { date: 'Jul 23', score: 71 },
      { date: 'Jul 24', score: 85 },
      { date: 'Jul 25', score: 68 },
      { date: 'Jul 26', score: 79 },
      { date: 'Jul 27', score: 84 },
      { date: 'Aug 3', score: 88 },
    ];

    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>Class Debate Analytics</h2>
            <p className={`text-xs ${textSub}`}>Cohort performance trends, topic comparisons, and skill dimension benchmarks across debate classes.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Class Filter:</span>
            <select className={`p-2 rounded-xl border text-xs font-semibold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`}>
              <option value="all">All Debate Classes (128 Debaters)</option>
              {classList.map(c => (
                <option key={c.name} value={c.name}>{c.shortName || c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Growth Trend & Skill Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={`lg:col-span-8 p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-sm ${textHeader}`}>Aggregate Cohort Score Growth</h3>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">+8.4% Term Improvement</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center pt-2">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-[10px] ${textSub}`}>Argument Quality Avg</p>
                <p className="text-lg font-bold text-indigo-500 mt-0.5">86.4/100</p>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-[10px] ${textSub}`}>Rebuttal Precision</p>
                <p className="text-lg font-bold text-purple-500 mt-0.5">82.1/100</p>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-[10px] ${textSub}`}>Logical Cleanliness</p>
                <p className="text-lg font-bold text-emerald-500 mt-0.5">89.8/100</p>
              </div>
            </div>
          </div>

          <div className={`lg:col-span-4 p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
            <h3 className={`font-bold text-sm ${textHeader}`}>Topic Performance Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classList} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                  <YAxis type="category" dataKey="shortName" stroke="#94a3b8" fontSize={10} width={90} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="avgScore" fill="#6366f1" radius={[0, 6, 6, 0]} name="Class Avg" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-400 italic">Parliamentary Climate leads with 89.1 avg, followed by Public Forum PE at 85.3.</p>
          </div>
        </div>
      </div>
    );
  }

  // --- SUBVIEW 5B: Student Performance Reports ---
  if (activeSubTab === 'reports') {
    const studentReportList = [
      {
        id: 'std_1',
        name: 'Arjun Mehta',
        classTitle: 'AP Ethics & Social Media Policy Debate',
        shortClass: 'AP Social Media',
        score: 88,
        grade: 'A',
        rank: '#3 of 32',
        claimScore: 92,
        evidenceScore: 78,
        fallacyScore: 94,
        speechWpm: 142,
        rebuttalScore: 88,
        recentFeedback: 'Outstanding opening thesis on youth mental health algorithms. Needs more empirical statistical citations in turn 2.',
        turnsCount: 14
      },
      {
        id: 'std_2',
        name: 'Priya Sharma',
        classTitle: 'Parliamentary: Climate Policy & Clean Energy Subsidies',
        shortClass: 'Parl Climate',
        score: 93,
        grade: 'A+',
        rank: '#1 of 24',
        claimScore: 96,
        evidenceScore: 92,
        fallacyScore: 95,
        speechWpm: 148,
        rebuttalScore: 91,
        recentFeedback: 'Flawless policy framing. Masterful POI timing during cross-examination.',
        turnsCount: 18
      },
      {
        id: 'std_3',
        name: 'Karan Verma',
        classTitle: 'Lincoln-Douglas: Universal Basic Income & Welfare',
        shortClass: 'LD Basic Income',
        score: 72,
        grade: 'B-',
        rank: '#18 of 28',
        claimScore: 74,
        evidenceScore: 68,
        fallacyScore: 80,
        speechWpm: 128,
        rebuttalScore: 66,
        recentFeedback: 'Good effort. Avoid absolute dichotomy traps when addressing fiscal revenue models.',
        turnsCount: 9
      }
    ];

    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${textHeader}`}>Student Performance Reports</h2>
            <p className={`text-xs ${textSub}`}>Individual debater report cards, 5-dimension skill radar, and official progress transcripts.</p>
          </div>

          <button 
            onClick={() => alert("Report card PDF generation initiated for active cohort!")}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> Export All Student Reports (PDF)
          </button>
        </div>

        {/* Student Diagnostic Cards List */}
        <div className="space-y-4">
          {studentReportList.map((student) => (
            <div key={student.id} className={`p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-base flex items-center justify-center shadow-md">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-base ${textHeader}`}>{student.name}</h3>
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                        {student.shortClass}
                      </span>
                    </div>
                    <p className={`text-xs ${textSub} mt-0.5`}>{student.classTitle} • {student.turnsCount} Turns Logged</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Rank in Class</span>
                    <span className="text-sm font-extrabold text-white font-mono">{student.rank}</span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider block">Score & Grade</span>
                    <span className="text-sm font-extrabold font-mono">{student.score}/100 ({student.grade})</span>
                  </div>
                </div>
              </div>

              {/* 5-Skill Dimension Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Claim Structure</span>
                  <span className="text-sm font-bold text-indigo-400 font-mono mt-0.5">{student.claimScore}/100</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Evidence Sourcing</span>
                  <span className="text-sm font-bold text-sky-400 font-mono mt-0.5">{student.evidenceScore}/100</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Fallacy Immunity</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{student.fallacyScore}/100</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Speech Pace</span>
                  <span className="text-sm font-bold text-amber-400 font-mono mt-0.5">{student.speechWpm} WPM</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">Rebuttal Punch</span>
                  <span className="text-sm font-bold text-purple-400 font-mono mt-0.5">{student.rebuttalScore}/100</span>
                </div>
              </div>

              {/* Recent Evaluation Critique Note */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Teacher & AI Critique Note:</span>
                <p className="text-xs text-slate-200 italic">"{student.recentFeedback}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSubTab === 'badges') {
    return (
      <div className="space-y-6 pb-12">
        <BadgesShowcase />
      </div>
    );
  }

  // --- DEFAULT SUBVIEW: Educator Dashboard Overview ---
  return (
    <div className="space-y-6 pb-12">
      {/* Educator Welcome Header */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-sky-400/30">
        <div className="space-y-1">
          <span className="text-white bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30 font-bold text-xs uppercase tracking-wider shadow-xs">Educator Command Center</span>
          <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Welcome, {educatorName} 🎓</h2>
          <p className="text-sky-100 text-xs font-medium">Managing 5 debate classes, {MOCK_EDUCATOR_DATA.totalLearners} registered debaters, and candidate rosters</p>
        </div>

        <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 text-xs font-bold text-white shadow-md">
          Academic Term: Spring 2025
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Learners</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{MOCK_EDUCATOR_DATA.totalLearners}</p>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">Across {classList.length} Debate Topics</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Debate Classes</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{classList.length}</p>
            <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">Policy & Parliamentary</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed Debates</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{MOCK_EDUCATOR_DATA.debatesConducted}</p>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">AI Evaluated</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Class Score</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 font-mono">{MOCK_EDUCATOR_DATA.avgClassScore}/100</p>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">+4.2% this term</p>
          </div>
        </div>
      </div>

      {/* Class Overview Chart & Performance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Class Score Comparison (Debate Topics)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classList}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="shortName" stroke="#94a3b8" fontSize={10} interval={0} tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="avgScore" fill="#6366f1" radius={[8, 8, 0, 0]} name="Average Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution Donut */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Roster Score Distribution</h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {distribution.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span>{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700/80 font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
          <span>Managed Debate Classes & Topics</span>
          <span className="text-xs text-indigo-400">Click Manage Roster to view debater list</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Debate Class Topic</th>
                <th className="p-3.5">Learners Count</th>
                <th className="p-3.5">Class Avg Score</th>
                <th className="p-3.5">Improvement Trend</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {classList.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                    {c.name}
                  </td>
                  <td className="p-3.5 font-medium">{c.learners} Students</td>
                  <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400 font-mono">{c.avgScore}/100</td>
                  <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-bold">+{c.trend}%</td>
                  <td className="p-3.5 text-right">
                    <button 
                      onClick={() => setSelectedRosterClass(c.name)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Manage Roster →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
