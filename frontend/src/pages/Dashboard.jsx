import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Swords,
    Clock,
    Trophy,
    TrendingUp,
    Plus,
    Brain,
    MessageSquare,
    Mic,
    Target,
    Award,
} from "lucide-react";

import AppShell from "../components/AppShell";
import StatCard from "../components/StatCard";
import CounterargumentSummaryCard from "../components/CounterargumentSummaryCard";

import RadarChart from "../components/RadarChart";
import JudgeProgressGraph from "../components/JudgeProgressGraph";

import { useAuth } from "../context/AuthContext";

import {
    sessionApi,
    topicApi,
    scheduleApi,
    reportsApi,
    debateApi,
} from "../api/endpoints";


const STATUS_STYLES = {
    scheduled:
        "bg-signal-amber/15 text-signal-amber",

    in_progress:
        "bg-motion-teal/15 text-motion-teal",

    completed:
        "bg-white/10 text-slate-muted",

    cancelled:
        "bg-rebuttal-coral/15 text-rebuttal-coral",
};


export default function Dashboard() {

    const { user } = useAuth();

    const navigate = useNavigate();


    // =========================================================
    // Existing Dashboard State
    // =========================================================

    const [sessions, setSessions] = useState([]);

    const [topicsCount, setTopicsCount] = useState(0);

    const [upcomingCount, setUpcomingCount] = useState(0);

    const [loading, setLoading] = useState(true);


    // =========================================================
    // Counterargument State
    // =========================================================

    const [ctrSummary, setCtrSummary] = useState(null);

    const [ctrLoading, setCtrLoading] = useState(true);


    // =========================================================
    // AI Judge Statistics State
    // =========================================================

    const [judgeStats, setJudgeStats] = useState(null);

    const [judgeLoading, setJudgeLoading] = useState(true);


    // =========================================================
    // AI Judge History State
    // =========================================================

    const [judgeReports, setJudgeReports] = useState([]);

    const [judgeHistoryLoading, setJudgeHistoryLoading] =
        useState(true);


    // =========================================================
    // Load Main Dashboard Data
    // =========================================================

    useEffect(() => {

        (async () => {

            try {

                const [
                    sessionsRes,
                    topicsRes,
                    scheduleRes,
                ] = await Promise.all([
                    sessionApi.list(),
                    topicApi.list(),
                    scheduleApi.list(),
                ]);


                setSessions(
                    sessionsRes.data || []
                );


                setTopicsCount(
                    topicsRes.data?.length || 0
                );


                const now = new Date();


                const confirmedFuture =
                    (scheduleRes.data || []).filter(
                        (s) =>
                            s.status === "confirmed" &&
                            new Date(
                                s.scheduled_datetime
                            ) > now
                    );


                setUpcomingCount(
                    confirmedFuture.length
                );

            } catch (err) {

                console.error(
                    "Failed to load dashboard:",
                    err
                );

            } finally {

                setLoading(false);

            }

        })();

    }, []);


    // =========================================================
    // Load Counterargument Summary
    // =========================================================

    useEffect(() => {

        (async () => {

            try {

                const { data } =
                    await reportsApi.counterargumentSummary();

                setCtrSummary(data);

            } catch (err) {

                console.error(
                    "Failed to load counterargument summary:",
                    err
                );

            } finally {

                setCtrLoading(false);

            }

        })();

    }, []);


    // =========================================================
    // Load AI Judge Statistics
    // =========================================================

    useEffect(() => {

        (async () => {

            try {

                const { data } =
                    await debateApi.getJudgeDashboard();

                setJudgeStats(data);

            } catch (err) {

                console.error(
                    "Failed to load AI Judge statistics:",
                    err
                );

            } finally {

                setJudgeLoading(false);

            }

        })();

    }, []);


    // =========================================================
    // Load AI Judge Report History
    // =========================================================

    useEffect(() => {

        (async () => {

            try {

                const { data } =
                    await debateApi.getJudgeHistory();

                const reports =
                    Array.isArray(data)
                        ? data
                        : [];

                setJudgeReports(reports);

            } catch (err) {

                console.error(
                    "Failed to load AI Judge history:",
                    err
                );

                setJudgeReports([]);

            } finally {

                setJudgeHistoryLoading(false);

            }

        })();

    }, []);


    // =========================================================
    // Calculations
    // =========================================================

    const completed =
        sessions.filter(
            (s) => s.status === "completed"
        ).length;


    // =========================================================
    // Latest Judge Report
    // =========================================================

    const latestJudgeReport =
        [...judgeReports]
            .sort((a, b) => {

                const dateA = a.created_at
                    ? new Date(
                        a.created_at
                    ).getTime()
                    : 0;

                const dateB = b.created_at
                    ? new Date(
                        b.created_at
                    ).getTime()
                    : 0;

                return dateB - dateA;

            })[0] || null;


    // =========================================================
    // Format Score
    // =========================================================

    function formatScore(value) {

        if (
            value === null ||
            value === undefined ||
            Number.isNaN(Number(value))
        ) {

            return "—";

        }

        return Number(value).toFixed(1);

    }


    // =========================================================
    // Dashboard UI
    // =========================================================

    return (

        <AppShell>

            <div className="max-w-6xl mx-auto px-8 py-10">


                {/* =====================================================
                    Header
                ====================================================== */}

                <div className="flex items-center justify-between mb-8">

                    <div>

                        <p className="label-eyebrow mb-1">

                            Dashboard

                        </p>


                        <h1 className="font-display text-3xl">

                            Welcome back,{" "}

                            {
                                user?.full_name
                                    ?.split(" ")[0]
                            }

                        </h1>

                    </div>


                    <button
                        onClick={() =>
                            navigate("/schedule")
                        }
                        className="btn-primary"
                    >

                        <Plus size={16} />

                        New debate session

                    </button>

                </div>


                {/* =====================================================
                    Existing Session Statistics
                ====================================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">

                    <StatCard
                        label="Total Sessions"
                        value={sessions.length}
                        icon={Swords}
                        accent="teal"
                    />


                    <StatCard
                        label="Completed"
                        value={completed}
                        icon={Trophy}
                        accent="amber"
                    />


                    <StatCard
                        label="Upcoming"
                        value={upcomingCount}
                        icon={Clock}
                        accent="coral"
                    />


                    <StatCard
                        label="Topics Available"
                        value={topicsCount}
                        icon={TrendingUp}
                        accent="teal"
                    />

                </div>


                {/* =====================================================
                    AI Judge Performance
                ====================================================== */}

                <div className="mb-10">

                    {/* View Reports button removed */}

                    <div className="mb-4">

                        <div>

                            <p className="label-eyebrow mb-1">

                                AI JUDGE

                            </p>


                            <h2 className="font-display text-2xl">

                                Debate Performance

                            </h2>

                        </div>

                    </div>


                    {judgeLoading ? (

                        <div className="card p-8 text-center text-slate-muted">

                            Loading AI Judge statistics...

                        </div>

                    ) : judgeStats ? (

                        <>


                            {/* =================================================
                                Main Judge Cards
                            ================================================== */}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                                <StatCard
                                    label="Average Score"
                                    value={`${formatScore(
                                        judgeStats.averageScore
                                    )}/100`}
                                    icon={Target}
                                    accent="teal"
                                />


                                <StatCard
                                    label="Highest Score"
                                    value={`${formatScore(
                                        judgeStats.highestScore
                                    )}/100`}
                                    icon={Award}
                                    accent="amber"
                                />


                                <StatCard
                                    label="Debate Wins"
                                    value={
                                        judgeStats.wins ?? 0
                                    }
                                    icon={Trophy}
                                    accent="amber"
                                />


                                <StatCard
                                    label="AI Judged Debates"
                                    value={
                                        judgeStats.totalDebates ?? 0
                                    }
                                    icon={Swords}
                                    accent="teal"
                                />

                            </div>


                            {/* =================================================
                                Skill Statistics
                            ================================================== */}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">


                                {/* Critical Thinking */}

                                <div className="card p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 rounded-lg bg-motion-teal/10 flex items-center justify-center">

                                            <Brain
                                                size={20}
                                                className="text-motion-teal"
                                            />

                                        </div>


                                        <div>

                                            <p className="text-xs text-slate-muted uppercase tracking-wide">

                                                Critical Thinking

                                            </p>


                                            <p className="text-2xl font-display mt-1">

                                                {
                                                    formatScore(
                                                        judgeStats.averageCriticalThinking
                                                    )
                                                }

                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* Communication */}

                                <div className="card p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 rounded-lg bg-signal-amber/10 flex items-center justify-center">

                                            <MessageSquare
                                                size={20}
                                                className="text-signal-amber"
                                            />

                                        </div>


                                        <div>

                                            <p className="text-xs text-slate-muted uppercase tracking-wide">

                                                Communication

                                            </p>


                                            <p className="text-2xl font-display mt-1">

                                                {
                                                    formatScore(
                                                        judgeStats.averageCommunication
                                                    )
                                                }

                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* Presentation */}

                                <div className="card p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 rounded-lg bg-rebuttal-coral/10 flex items-center justify-center">

                                            <Mic
                                                size={20}
                                                className="text-rebuttal-coral"
                                            />

                                        </div>


                                        <div>

                                            <p className="text-xs text-slate-muted uppercase tracking-wide">

                                                Presentation

                                            </p>


                                            <p className="text-2xl font-display mt-1">

                                                {
                                                    formatScore(
                                                        judgeStats.averagePresentation
                                                    )
                                                }

                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* Logic */}

                                <div className="card p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 rounded-lg bg-motion-teal/10 flex items-center justify-center">

                                            <TrendingUp
                                                size={20}
                                                className="text-motion-teal"
                                            />

                                        </div>


                                        <div>

                                            <p className="text-xs text-slate-muted uppercase tracking-wide">

                                                Logical Consistency

                                            </p>


                                            <p className="text-2xl font-display mt-1">

                                                {
                                                    formatScore(
                                                        judgeStats.averageLogic
                                                    )
                                                }

                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </>

                    ) : (

                        <div className="card p-8">

                            <div className="text-center">

                                <Target
                                    size={36}
                                    className="mx-auto text-slate-muted mb-3"
                                />


                                <h3 className="font-display text-lg">

                                    No AI Judge reports yet

                                </h3>


                                <p className="text-slate-muted text-sm mt-2">

                                    Complete a debate to receive
                                    your first AI Judge performance
                                    report.

                                </p>


                                <button
                                    onClick={() =>
                                        navigate("/topics")
                                    }
                                    className="btn-primary mt-5"
                                >

                                    Start a Debate

                                </button>

                            </div>

                        </div>

                    )}

                </div>


                {/* =====================================================
                    AI Judge Charts
                ====================================================== */}

                {!judgeHistoryLoading &&
                    judgeReports.length > 0 && (

                        <div className="space-y-8 mb-10">


                            {/* =================================================
                                Performance Progress
                            ================================================== */}

                            <div className="card p-6">

                                <div className="flex items-center justify-between mb-6">

                                    <div>

                                        <p className="label-eyebrow mb-1">

                                            PERFORMANCE TREND

                                        </p>


                                        <h2 className="font-display text-2xl">

                                            Debate Performance Progress

                                        </h2>


                                        <p className="text-sm text-slate-muted mt-1">

                                            Your performance across
                                            completed AI Judge reports.

                                        </p>

                                    </div>


                                    <div className="text-right">

                                        <p className="text-xs text-slate-muted uppercase">

                                            Reports

                                        </p>


                                        <p className="text-2xl font-display text-motion-teal">

                                            {judgeReports.length}

                                        </p>

                                    </div>

                                </div>


                                <JudgeProgressGraph
                                    reports={judgeReports}
                                />

                            </div>


                            {/* =================================================
                                Latest Skill Radar
                            ================================================== */}

                            {latestJudgeReport && (

                                <div className="card p-6">

                                    <div className="mb-4">

                                        <p className="label-eyebrow mb-1">

                                            LATEST AI JUDGE REPORT

                                        </p>


                                        <h2 className="font-display text-2xl">

                                            Current Skill Profile

                                        </h2>


                                        <p className="text-sm text-slate-muted mt-1">

                                            Based on your latest
                                            completed debate.

                                        </p>

                                    </div>


                                    <RadarChart
                                        report={
                                            latestJudgeReport
                                        }
                                    />

                                </div>

                            )}

                        </div>

                    )}


                {/* =====================================================
                    No Judge History
                ====================================================== */}

                {!judgeHistoryLoading &&
                    judgeReports.length === 0 && (

                        <div className="card p-8 mb-10">

                            <div className="text-center">

                                <Target
                                    size={40}
                                    className="mx-auto text-slate-muted mb-3"
                                />


                                <h3 className="font-display text-lg">

                                    Your performance graphs
                                    will appear here

                                </h3>


                                <p className="text-sm text-slate-muted mt-2 max-w-xl mx-auto">

                                    Complete a debate and generate
                                    an AI Judge report. Your score
                                    progression and skill profile
                                    will automatically appear here.

                                </p>


                                <button
                                    onClick={() =>
                                        navigate("/topics")
                                    }
                                    className="btn-primary mt-5"
                                >

                                    Start a Debate

                                </button>

                            </div>

                        </div>

                    )}


                {/* =====================================================
                    Recent Debate Sessions
                ====================================================== */}

                <div className="card">

                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">

                        <h2 className="font-display text-lg">

                            Recent debate sessions

                        </h2>

                    </div>


                    {loading ? (

                        <div className="p-8 text-center text-slate-muted text-sm">

                            Loading sessions…

                        </div>

                    ) : sessions.length === 0 ? (

                        <div className="p-10 text-center">

                            <p className="text-slate-muted text-sm mb-4">

                                You haven't started a debate
                                session yet. Pick a motion
                                to get going.

                            </p>


                            <button
                                onClick={() =>
                                    navigate("/topics")
                                }
                                className="btn-secondary"
                            >

                                Browse debate topics

                            </button>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full text-sm">

                                <thead>

                                    <tr className="text-left text-slate-muted border-b border-white/5">

                                        <th className="px-6 py-3 font-medium">

                                            Session

                                        </th>


                                        <th className="px-6 py-3 font-medium">

                                            Stance

                                        </th>


                                        <th className="px-6 py-3 font-medium">

                                            Duration

                                        </th>


                                        <th className="px-6 py-3 font-medium">

                                            Status

                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {sessions
                                        .slice(0, 8)
                                        .map((s) => (

                                            <tr
                                                key={s.id}
                                                className="border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer"
                                                onClick={() =>
                                                    navigate(
                                                        `/debate-room/${s.id}`
                                                    )
                                                }
                                            >

                                                <td className="px-6 py-3 font-mono text-slate-muted">

                                                    #
                                                    {String(
                                                        s.id
                                                    ).padStart(
                                                        4,
                                                        "0"
                                                    )}

                                                </td>


                                                <td className="px-6 py-3 capitalize">

                                                    {s.stance
                                                        ?.replace(
                                                            "_",
                                                            " "
                                                        ) ||
                                                        "—"}

                                                </td>


                                                <td className="px-6 py-3">

                                                    {
                                                        s.duration_minutes
                                                    }{" "}

                                                    min

                                                </td>


                                                <td className="px-6 py-3">

                                                    <span
                                                        className={`px-2.5 py-1 rounded-full text-xs font-mono uppercase ${
                                                            STATUS_STYLES[
                                                                s.status
                                                            ] ||
                                                            "bg-white/10 text-slate-muted"
                                                        }`}
                                                    >

                                                        {s.status
                                                            ?.replace(
                                                                "_",
                                                                " "
                                                            ) ||
                                                            "unknown"}

                                                    </span>

                                                </td>

                                            </tr>

                                        ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>


                {/* =====================================================
                    Counterargument Summary
                ====================================================== */}

                {!ctrLoading &&
                    ctrSummary && (

                        <div className="mt-8">

                            <CounterargumentSummaryCard
                                summary={ctrSummary}
                            />

                        </div>

                    )}

            </div>

        </AppShell>

    );

}