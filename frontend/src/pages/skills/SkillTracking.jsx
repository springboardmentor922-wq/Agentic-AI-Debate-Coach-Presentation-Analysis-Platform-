import { useEffect, useMemo, useState } from "react";
import { FaChartLine, FaChartPie, FaMedal, FaSignal } from "react-icons/fa";

import MainLayout from "../../components/layout/MainLayout";
import Breadcrumb from "../../components/common/Breadcrumb";
import ChartShell from "../../components/sharedCharts/ChartShell";
import RadarScoreChart from "../../components/sharedCharts/RadarScoreChart";
import BarScoreChart from "../../components/sharedCharts/BarScoreChart";
import { useAuth } from "../../hooks/useAuth";
import { getMySkill } from "../../services/skillService";
import { getMySessions } from "../../services/debateSessionService";
import { getPerformanceOverview } from "../../services/performanceService";
import { computeAverageScore, safeNumber, toArray } from "../../utils/learnerHelpers";

import "./SkillTracking.css";

const SkillTracking = () => {
    const { user } = useAuth();
    const [skill, setSkill] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadSkills = async () => {
            try {
                setLoading(true);
                const [skillData, sessionData, overviewData] = await Promise.all([
                    getMySkill().catch(() => null),
                    getMySessions().catch(() => []),
                    getPerformanceOverview().catch(() => null),
                ]);

                if (!active) return;

                setSkill(skillData || overviewData?.skill || null);
                setSessions(toArray(sessionData));
                setOverview(overviewData);
                setError("");
            } catch (loadError) {
                console.error(loadError);
                if (active) {
                    setError("Unable to load skill tracking data right now.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadSkills();
        return () => { active = false; };
    }, [user?.id]);

    const chartData = useMemo(() => ([
        { label: "Communication", score: safeNumber(skill?.communication_score) },
        { label: "Critical Thinking", score: safeNumber(skill?.critical_thinking_score) },
        { label: "Presentation", score: safeNumber(skill?.presentation_score) },
        { label: "Argument", score: safeNumber(skill?.argument_score) },
        { label: "Confidence", score: safeNumber(skill?.confidence_score) },
    ]), [skill]);

    const sessionData = useMemo(() => ([
        { label: "Completed", score: sessions.filter((session) => String(session.session_status || session.status).toLowerCase() === "completed").length * 10 },
        { label: "Scheduled", score: sessions.filter((session) => String(session.session_status || session.status).toLowerCase() === "scheduled").length * 10 },
        { label: "In Progress", score: sessions.filter((session) => String(session.session_status || session.status).toLowerCase().includes("progress")).length * 10 },
    ]), [sessions]);

    const avgScore = useMemo(() => computeAverageScore(skill || {}), [skill]);

    const hasSkillData = useMemo(() => {
        if (!skill) return false;
        return (
            safeNumber(skill.communication_score) > 0 ||
            safeNumber(skill.critical_thinking_score) > 0 ||
            safeNumber(skill.presentation_score) > 0 ||
            safeNumber(skill.argument_score) > 0 ||
            safeNumber(skill.confidence_score) > 0
        );
    }, [skill]);

    if (loading) {
        return (
            <MainLayout>
                <div className="skill-page"><div className="empty-state">Loading skill tracking...</div></div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="skill-page">
                <Breadcrumb items={[{ label: "Dashboard", path: "/learner/dashboard" }, { label: "Skill Tracking" }]} />

                <div className="skill-header">
                    <div>
                        <h1>Skill Tracking</h1>
                        <p>Track real backend skill scores and debate progress over time.</p>
                    </div>
                    <div className="skill-header-icon"><FaSignal /></div>
                </div>

                {error && <div className="empty-state">{error}</div>}

                {!hasSkillData ? (
                    <div className="empty-state" style={{ marginTop: "1.5rem", padding: "3rem 1.5rem", textAlign: "center" }}>
                        <h3>No skill data available yet</h3>
                        <p style={{ marginTop: "0.5rem", color: "var(--text-muted, #64748b)" }}>
                            Complete a debate or presentation to build your skill profile.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="skill-stats-grid">
                            <div className="skill-stat-card"><FaChartLine /><span>Overall Score</span><strong>{avgScore}%</strong></div>
                            <div className="skill-stat-card"><FaChartPie /><span>Total Debates</span><strong>{overview?.summary?.total_debates || skill?.total_debates || 0}</strong></div>
                            <div className="skill-stat-card"><FaMedal /><span>Total Presentations</span><strong>{overview?.summary?.total_presentations || skill?.total_presentations || 0}</strong></div>
                        </div>

                        <div className="skill-layout">
                            <ChartShell title="Skill Radar" description="Measured skill dimensions from the backend profile.">
                                <RadarScoreChart data={chartData} />
                            </ChartShell>

                            <ChartShell title="Session Activity" description="Relative session activity by status.">
                                <BarScoreChart data={sessionData} color="#10B981" />
                            </ChartShell>
                        </div>

                        <section className="skill-card">
                            <div className="section-header"><h2>Progress Breakdown</h2></div>
                            {chartData.map((metric) => (
                                <div className="progress-item" key={metric.label}>
                                    <span>{metric.label}</span>
                                    <progress value={metric.score} max="100" />
                                    <strong>{metric.score}%</strong>
                                </div>
                            ))}
                        </section>
                    </>
                )}
            </div>
        </MainLayout>
    );
};

export default SkillTracking;
