import React from "react";

import {
    Line,
} from "react-chartjs-2";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
);


export default function JudgeProgressGraph({ reports }) {

    // =========================================================
    // Empty State
    // =========================================================

    if (!reports || reports.length === 0) {

        return (

            <div className="flex items-center justify-center h-[400px]">

                <div className="text-center">

                    <p className="text-slate-muted text-sm">

                        No AI Judge reports available yet.

                    </p>

                    <p className="text-slate-muted text-xs mt-2">

                        Complete a debate to start tracking
                        your performance.

                    </p>

                </div>

            </div>

        );

    }


    // =========================================================
    // Sort Reports
    // =========================================================

    const sortedReports = [...reports].sort(
        (a, b) => {

            const dateA = a.created_at
                ? new Date(a.created_at).getTime()
                : 0;

            const dateB = b.created_at
                ? new Date(b.created_at).getTime()
                : 0;

            return dateA - dateB;

        }
    );


    // =========================================================
    // Labels
    // =========================================================

    const labels = sortedReports.map(
        (_, index) => `Debate ${index + 1}`
    );


    // =========================================================
    // Chart Data
    // =========================================================

    const chartData = {

        labels,

        datasets: [

            {
                label: "Overall Performance",

                data: sortedReports.map(
                    (report) =>
                        Number(
                            report.overall_score || 0
                        )
                ),

                borderWidth: 3,

                tension: 0.4,

                fill: true,

                backgroundColor:
                    "rgba(45, 212, 191, 0.10)",

                borderColor:
                    "#2DD4BF",

                pointBackgroundColor:
                    "#2DD4BF",

                pointBorderColor:
                    "#0F172A",

                pointRadius: 5,

                pointHoverRadius: 7,
            },


            {
                label: "Critical Thinking",

                data: sortedReports.map(
                    (report) =>
                        Number(
                            report.critical_thinking_score || 0
                        )
                ),

                borderWidth: 2,

                tension: 0.4,

                borderColor:
                    "#818CF8",

                pointRadius: 3,

            },


            {
                label: "Communication",

                data: sortedReports.map(
                    (report) =>
                        Number(
                            report.communication_skills || 0
                        )
                ),

                borderWidth: 2,

                tension: 0.4,

                borderColor:
                    "#F59E0B",

                pointRadius: 3,

            },


            {
                label: "Logic",

                data: sortedReports.map(
                    (report) =>
                        Number(
                            report.logical_consistency || 0
                        )
                ),

                borderWidth: 2,

                tension: 0.4,

                borderColor:
                    "#FB7185",

                pointRadius: 3,

            },

        ],

    };


    // =========================================================
    // Chart Options
    // =========================================================

    const options = {

        responsive: true,

        maintainAspectRatio: false,

        interaction: {

            mode: "index",

            intersect: false,

        },


        plugins: {

            legend: {

                position: "top",

                labels: {

                    color: "#CBD5E1",

                    padding: 20,

                },

            },


            tooltip: {

                callbacks: {

                    label: function (context) {

                        return `${context.dataset.label}: ${Number(
                            context.raw
                        ).toFixed(1)}%`;

                    },

                },

            },

        },


        scales: {

            x: {

                ticks: {

                    color: "#94A3B8",

                },

                grid: {

                    color:
                        "rgba(255,255,255,0.05)",

                },

            },


            y: {

                beginAtZero: true,

                max: 100,

                ticks: {

                    stepSize: 10,

                    color: "#94A3B8",

                    callback: (value) =>
                        `${value}%`,

                },

                grid: {

                    color:
                        "rgba(255,255,255,0.05)",

                },

            },

        },

    };


    // =========================================================
    // Render
    // =========================================================

    return (

        <div className="w-full h-[420px]">

            <Line
                data={chartData}
                options={options}
            />

        </div>

    );

}