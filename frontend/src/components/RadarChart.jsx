import React from "react";

import {
    Radar
} from "react-chartjs-2";

import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

export default function RadarChart({ report }) {

    const data = {

        labels: [

            "Argument",

            "Evidence",

            "Logic",

            "Communication",

            "Presentation",

            "Critical Thinking",

        ],

        datasets: [

            {

                label: "Performance",

                data: [

                    report.argument_quality,

                    report.evidence_usage,

                    report.logical_consistency,

                    report.communication_skills,

                    report.presentation_score,

                    report.critical_thinking_score,

                ],

                backgroundColor: "rgba(99,102,241,0.2)",

                borderColor: "#4F46E5",

                borderWidth: 2,

                pointBackgroundColor: "#4F46E5",

                pointBorderColor: "#fff",

                pointRadius: 5,

                pointHoverRadius: 7,

            },

        ],

    };

    const options = {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {

                position: "top",

            },

            tooltip: {

                callbacks: {

                    label: function (context) {

                        return `${context.label}: ${context.raw}%`;

                    },

                },

            },

        },

        scales: {

            r: {

                suggestedMin: 0,

                suggestedMax: 100,

                ticks: {

                    stepSize: 20,

                    backdropColor: "transparent",

                },

                grid: {

                    color: "#D1D5DB",

                },

                angleLines: {

                    color: "#D1D5DB",

                },

                pointLabels: {

                    font: {

                        size: 14,

                        weight: "bold",

                    },

                    color: "#374151",

                },

            },

        },

    };

    return (

        <div
            className="w-full h-[500px] flex justify-center items-center"
        >

            <Radar

                data={data}

                options={options}

            />

        </div>

    );

}