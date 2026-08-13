import React from "react";

function ScoreCard({ title, value, color }) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl hover:-translate-y-1">

            <h3 className="text-gray-600 font-semibold text-sm uppercase tracking-wide">
                {title}
            </h3>

            <div className="flex items-center justify-between mt-5">

                <div
                    className={`text-5xl font-bold ${color}`}
                >
                    {value}
                </div>

                <div className="w-20 h-20 relative">

                    <svg
                        viewBox="0 0 36 36"
                        className="w-20 h-20 rotate-[-90deg]"
                    >

                        {/* Background */}

                        <path
                            d="
                                M18 2
                                a16 16 0 1 1 0 32
                                a16 16 0 1 1 0 -32
                            "
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="3"
                        />

                        {/* Progress */}

                        <path
                            d="
                                M18 2
                                a16 16 0 1 1 0 32
                                a16 16 0 1 1 0 -32
                            "
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${value},100`}
                            className={color}
                        />

                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">

                        <span className="font-bold">

                            {value}%

                        </span>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default function JudgeScoreCard({ report }) {

    return (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <ScoreCard
                title="Overall Score"
                value={Math.round(report.overall_score)}
                color="text-indigo-600"
            />

            <ScoreCard
                title="Argument Quality"
                value={Math.round(report.argument_quality)}
                color="text-blue-600"
            />

            <ScoreCard
                title="Evidence Usage"
                value={Math.round(report.evidence_usage)}
                color="text-green-600"
            />

            <ScoreCard
                title="Logical Consistency"
                value={Math.round(report.logical_consistency)}
                color="text-yellow-600"
            />

            <ScoreCard
                title="Communication"
                value={Math.round(report.communication_skills)}
                color="text-pink-600"
            />

            <ScoreCard
                title="Critical Thinking"
                value={Math.round(report.critical_thinking_score)}
                color="text-red-600"
            />

        </div>

    );

}