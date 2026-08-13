import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import AppShell from "../components/AppShell";
import JudgeScoreCard from "../components/JudgeScoreCard";
import RadarChart from "../components/RadarChart";
import PerformanceGraph from "../components/PerformanceGraph";
import DebateTimeline from "../components/DebateTimeline";
import ImprovementPlan from "../components/ImprovementPlan";

import { debateApi } from "../api/endpoints";

import {
    generateJudgePdf,
    createJudgePdfFileName,
} from "../utils/generateJudgePdf";


export default function DebateReport() {

    const { sessionId } = useParams();

    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState(null);
    const [error, setError] = useState("");
    const [generatingPdf, setGeneratingPdf] = useState(false);


    // =========================================================
    // Load Report
    // =========================================================

    useEffect(() => {

        loadReport();

    }, [sessionId]);


    async function loadReport() {

        try {

            setLoading(true);
            setError("");

            const { data } =
                await debateApi.getJudgeReport(sessionId);

            setReport(data);

        } catch (err) {

            console.error(
                "Unable to load judge report:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "Unable to load debate report."
            );

        } finally {

            setLoading(false);

        }
    }


    // =========================================================
    // Regenerate Report
    // =========================================================

    async function regenerateReport() {

        try {

            setLoading(true);
            setError("");

            const { data } =
                await debateApi.generateJudgeReport(
                    sessionId,
                    true
                );

            setReport(data);

        } catch (err) {

            console.error(
                "Unable to regenerate report:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "Unable to regenerate report."
            );

        } finally {

            setLoading(false);

        }
    }


    // =========================================================
    // Download PDF
    // =========================================================

    async function downloadPdf() {

        if (!report) {
            return;
        }

        try {

            setGeneratingPdf(true);
            setError("");

            const fileName =
                createJudgePdfFileName(sessionId);

            await generateJudgePdf({
                elementId: "judge-report-content",
                fileName,
            });

        } catch (err) {

            console.error(
                "PDF generation failed:",
                err
            );

            setError(
                err?.message ||
                "Unable to generate the PDF report."
            );

        } finally {

            setGeneratingPdf(false);

        }
    }


    // =========================================================
    // Loading State
    // =========================================================

    if (loading) {

        return (

            <AppShell>

                <div className="flex justify-center items-center h-full min-h-[60vh]">

                    <div className="text-xl font-semibold text-fog">

                        Generating AI Judge Report...

                    </div>

                </div>

            </AppShell>

        );
    }


    // =========================================================
    // Error State
    // =========================================================

    if (error) {

        return (

            <AppShell>

                <div className="flex justify-center items-center h-full min-h-[60vh] px-6">

                    <div className="card p-8 text-center max-w-xl">

                        <h1 className="text-rebuttal-coral text-2xl font-bold">

                            Unable to Load Report

                        </h1>

                        <p className="text-fog mt-4">

                            {error}

                        </p>

                        <button
                            onClick={loadReport}
                            className="btn-primary mt-6 px-6 py-3"
                        >
                            Try Again
                        </button>

                    </div>

                </div>

            </AppShell>

        );
    }


    // =========================================================
    // Report Page
    // =========================================================

    return (

        <AppShell>

            <div
                id="judge-report-content"
                className="min-h-screen bg-ink-900"
            >

                {/* =====================================================
                    Header
                ====================================================== */}

                <div className="bg-gradient-to-r from-ink-900 via-ink-800 to-ink-900 border-b border-white/5 text-white">

                    <div className="max-w-7xl mx-auto px-8 py-10">

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                            <div>

                                <h1 className="text-4xl font-bold">

                                    AI Judge Debate Report

                                </h1>

                                <p className="mt-2 text-slate-muted">

                                    Complete performance analysis
                                    generated by the AI Judge.

                                </p>

                            </div>

                            <div className="text-sm text-slate-muted">

                                Session #{sessionId}

                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    Main Content
                ====================================================== */}

                <div className="max-w-7xl mx-auto p-8">


                    {/* =================================================
                        Winner
                    ================================================== */}

                    <div className="card p-8 mb-8">

                        <h2 className="text-3xl font-bold text-fog">

                            🏆 Winner

                        </h2>

                        <h1 className="text-5xl mt-5 font-extrabold text-motion-teal">

                            {report?.winner || "Not Available"}

                        </h1>

                        <p className="mt-6 text-lg text-fog">

                            {report?.judge_summary ||
                                "No judge summary is available."}

                        </p>

                    </div>


                    {/* =================================================
                        Score Cards
                    ================================================== */}

                    <JudgeScoreCard
                        report={report}
                    />


                    {/* =================================================
                        Radar Chart
                    ================================================== */}

                    <div className="card p-8 mt-8">

                        <h2 className="text-2xl font-bold mb-5 text-fog">

                            Skill Radar

                        </h2>

                        <RadarChart
                            report={report}
                        />

                    </div>


                    {/* =================================================
                        Performance Graph
                    ================================================== */}

                    <div className="card p-8 mt-8">

                        <h2 className="text-2xl font-bold mb-5 text-fog">

                            Performance Progress

                        </h2>

                        <PerformanceGraph
                            data={report?.score_progression || []}
                        />

                    </div>


                    {/* =================================================
                        Strengths & Weaknesses
                    ================================================== */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">


                        {/* Strengths */}

                        <div className="card bg-motion-teal/5 border-motion-teal/20 p-6">

                            <h2 className="text-2xl font-bold text-motion-teal">

                                Strengths

                            </h2>

                            <ul className="mt-4 space-y-3 text-fog">

                                {(report?.strengths || []).map(
                                    (item, index) => (

                                        <li
                                            key={index}
                                        >

                                            ✅ {item}

                                        </li>

                                    )
                                )}

                            </ul>

                        </div>


                        {/* Weaknesses */}

                        <div className="card bg-rebuttal-coral/5 border-rebuttal-coral/20 p-6">

                            <h2 className="text-2xl font-bold text-rebuttal-coral">

                                Weaknesses

                            </h2>

                            <ul className="mt-4 space-y-3 text-fog">

                                {(report?.weaknesses || []).map(
                                    (item, index) => (

                                        <li
                                            key={index}
                                        >

                                            ⚠️ {item}

                                        </li>

                                    )
                                )}

                            </ul>

                        </div>

                    </div>


                    {/* =================================================
                        Best Argument
                    ================================================== */}

                    <div className="card p-8 mt-8">

                        <h2 className="text-2xl font-bold text-fog">

                            Best Argument

                        </h2>

                        <div className="mt-4 p-5 rounded-lg bg-ink-800 border border-white/5">

                            <p className="text-fog leading-relaxed">

                                {report?.best_argument ||
                                    "No best argument was identified."}

                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        Best Rebuttal
                    ================================================== */}

                    <div className="card p-8 mt-8">

                        <h2 className="text-2xl font-bold text-fog">

                            Best Rebuttal

                        </h2>

                        <div className="mt-4 p-5 rounded-lg bg-ink-800 border border-white/5">

                            <p className="text-fog leading-relaxed">

                                {report?.best_rebuttal ||
                                    "No best rebuttal was identified."}

                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        Debate Timeline
                    ================================================== */}

                    <div className="card p-8 mt-8">

                        <h2 className="text-2xl font-bold mb-5 text-fog">

                            Debate Timeline

                        </h2>

                        <DebateTimeline
                            timeline={report?.timeline || []}
                        />

                    </div>


                    {/* =================================================
                        Personalized Learning Plan
                    ================================================== */}

                    <div className="card p-8 mt-8">

                        <h2 className="text-2xl font-bold text-fog">

                            Personalized Learning Plan

                        </h2>

                        <ImprovementPlan
                            plan={report?.learning_plan || []}
                        />

                    </div>


                    {/* =================================================
                        Recommendations
                    ================================================== */}

                    <div className="card bg-signal-amber/5 border-signal-amber/20 p-8 mt-8">

                        <h2 className="text-2xl font-bold text-signal-amber">

                            Recommendations

                        </h2>

                        <ul className="mt-5 space-y-3 text-fog">

                            {(report?.recommendations || []).map(
                                (item, index) => (

                                    <li
                                        key={index}
                                    >

                                        ⭐ {item}

                                    </li>

                                )
                            )}

                        </ul>

                    </div>


                    {/* =================================================
                        Action Buttons
                    ================================================== */}

                    <div className="flex flex-col sm:flex-row gap-5 mt-10 pb-12">


                        {/* Regenerate */}

                        <button
                            onClick={regenerateReport}
                            disabled={
                                loading ||
                                generatingPdf
                            }
                            className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >

                            {loading
                                ? "Regenerating..."
                                : "Regenerate Report"}

                        </button>


                        {/* Download PDF */}

                        <button
                            onClick={downloadPdf}
                            disabled={
                                generatingPdf ||
                                !report
                            }
                            className="btn-secondary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >

                            {generatingPdf
                                ? "Generating PDF..."
                                : "Download PDF"}

                        </button>

                    </div>

                </div>

            </div>

        </AppShell>

    );
}