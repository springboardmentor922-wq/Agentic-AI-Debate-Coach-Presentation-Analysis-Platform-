import React from "react";

import {
    Line
} from "react-chartjs-2";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

export default function PerformanceGraph({ data }) {

    if (!data || data.length === 0) {

        return (

            <div className="text-center py-10 text-gray-500">

                No performance data available.

            </div>

        );

    }

    const labels = data.map(item => `Turn ${item.turn_number}`);

    const chartData = {

        labels,

        datasets: [

            {
                label: "Overall Score",
                data: data.map(item => item.overall_score),
                borderColor: "#4F46E5",
                backgroundColor: "rgba(79,70,229,0.15)",
                borderWidth: 3,
                tension: 0.4,
                fill: true,
            },

            {
                label: "Argument",
                data: data.map(item => item.argument_quality),
                borderColor: "#2563EB",
                borderWidth: 2,
                tension: 0.4,
            },

            {
                label: "Evidence",
                data: data.map(item => item.evidence_usage),
                borderColor: "#16A34A",
                borderWidth: 2,
                tension: 0.4,
            },

            {
                label: "Logic",
                data: data.map(item => item.logical_consistency),
                borderColor: "#F59E0B",
                borderWidth: 2,
                tension: 0.4,
            },

            {
                label: "Communication",
                data: data.map(item => item.communication),
                borderColor: "#EC4899",
                borderWidth: 2,
                tension: 0.4,
            },

            {
                label: "Rebuttal",
                data: data.map(item => item.rebuttal_effectiveness),
                borderColor: "#EF4444",
                borderWidth: 2,
                tension: 0.4,
            },

        ],

    };

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

            },

            tooltip: {

                callbacks: {

                    label: function(context) {

                        return `${context.dataset.label}: ${context.raw}%`;

                    }

                }

            }

        },

        scales: {

            y: {

                beginAtZero: true,

                max: 100,

                ticks: {

                    stepSize: 10,

                },

            },

        },

    };

    return (

        <div className="w-full h-[500px]">

            <Line

                data={chartData}

                options={options}

            />

        </div>

    );

}