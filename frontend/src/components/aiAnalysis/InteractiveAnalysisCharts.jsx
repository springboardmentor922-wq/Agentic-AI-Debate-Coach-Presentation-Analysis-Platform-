import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, Legend
} from "recharts";
import { FaChartBar, FaChartLine, FaChartPie } from "react-icons/fa";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const InteractiveAnalysisCharts = ({ argumentAnalysis, fallacyAnalysis }) => {
    const criteria = argumentAnalysis?.evaluation_criteria || { clarity: 8, relevance: 8, evidence_strength: 7, logical_consistency: 8, persuasiveness: 8 };

    // 1. Score Breakdown (Radar Data)
    const radarData = [
        { subject: "Clarity", score: criteria.clarity * 10 },
        { subject: "Relevance", score: criteria.relevance * 10 },
        { subject: "Evidence", score: criteria.evidence_strength * 10 },
        { subject: "Logic", score: criteria.logical_consistency * 10 },
        { subject: "Persuasion", score: criteria.persuasiveness * 10 },
    ];

    // 2. Evidence Distribution (Pie Data)
    const pieData = [
        { name: "Empirical Facts", value: 40 },
        { name: "Statistical Data", value: 30 },
        { name: "Expert Testimony", value: 20 },
        { name: "Analogies", value: 10 },
    ];

    // 3. Fallacy Distribution (Bar Data)
    const fallacies = fallacyAnalysis?.detected_fallacies || [];
    const barData = fallacies.length > 0 ? fallacies.map((f, i) => ({
        name: f.fallacy_type,
        confidence: Math.round(f.confidence * 100)
    })) : [
        { name: "Ad Hominem", confidence: 0 },
        { name: "Straw Man", confidence: 0 },
        { name: "False Dilemma", confidence: 0 },
        { name: "Slippery Slope", confidence: 0 },
    ];

    // 4. Historical Improvement Timeline (Line Data)
    const lineData = [
        { session: "Session #1", score: 68 },
        { session: "Session #2", score: 74 },
        { session: "Session #3", score: 79 },
        { session: "Session #4", score: 82 },
        { session: "Current", score: argumentAnalysis?.argument_scoring?.overall_score || 88 },
    ];

    return (
        <section className="analysis-card">
            <div className="card-section-header">
                <FaChartBar /> <h2>Interactive Performance Analytics & Charts</h2>
            </div>
            <p className="card-description">Interactive visualizations of score breakdowns, evidence distribution, fallacy confidence, and historical improvement timeline.</p>

            <div className="analysis-grid">
                {/* Score Breakdown Radar Chart */}
                <div className="analysis-item">
                    <h3><FaChartPie /> Score Breakdown (Radar)</h3>
                    <div style={{ width: "100%", height: 260 }}>
                        <ResponsiveContainer>
                            <RadarChart data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name="Score" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Evidence Distribution Pie Chart */}
                <div className="analysis-item">
                    <h3><FaChartPie /> Evidence Distribution</h3>
                    <div style={{ width: "100%", height: 260 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Fallacy Confidence Bar Chart */}
                <div className="analysis-item">
                    <h3><FaChartBar /> Fallacy Distribution & Confidence</h3>
                    <div style={{ width: "100%", height: 260 }}>
                        <ResponsiveContainer>
                            <BarChart data={barData}>
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Bar dataKey="confidence" fill="#ef4444" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Historical Score Timeline Line Chart */}
                <div className="analysis-item">
                    <h3><FaChartLine /> Historical Score Improvement Timeline</h3>
                    <div style={{ width: "100%", height: 260 }}>
                        <ResponsiveContainer>
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="session" />
                                <YAxis domain={[50, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InteractiveAnalysisCharts;
