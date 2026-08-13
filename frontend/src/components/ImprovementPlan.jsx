import React from "react";

function WeekCard({ item }) {
    return (
        <div className="card overflow-hidden hover:border-motion-teal/30 transition-all">

            {/* Header */}

            <div className="bg-gradient-to-r from-ink-800 to-ink-700 border-b border-white/5 text-white p-5">

                <h2 className="text-2xl font-bold">

                    Week {item.week}

                </h2>

                <p className="text-slate-muted mt-1">

                    {item.title}

                </p>

            </div>

            {/* Body */}

            <div className="p-6">

                {/* Objective */}

                <div className="mb-5">

                    <h3 className="font-semibold text-lg text-fog">

                        🎯 Objective

                    </h3>

                    <p className="mt-2 text-slate-muted">

                        {item.objective}

                    </p>

                </div>

                {/* Exercises */}

                <div className="mb-5">

                    <h3 className="font-semibold text-lg text-fog">

                        📚 Practice Exercises

                    </h3>

                    <ul className="mt-3 space-y-3">

                        {item.exercises.map((exercise, index) => (

                            <li
                                key={index}
                                className="flex items-center gap-3"
                            >

                                <span className="text-motion-teal text-lg">

                                    ✔

                                </span>

                                <span className="text-fog">

                                    {exercise}

                                </span>

                            </li>

                        ))}

                    </ul>

                </div>

                {/* Outcome */}

                <div className="mb-6">

                    <h3 className="font-semibold text-lg text-fog">

                        🏆 Expected Outcome

                    </h3>

                    <p className="mt-2 text-slate-muted">

                        {item.expected_outcome}

                    </p>

                </div>

                {/* Progress */}

                <div>

                    <h3 className="font-semibold mb-3 text-fog">

                        Progress

                    </h3>

                    <div className="w-full bg-white/10 rounded-full h-4">

                        <div
                            className="bg-motion-teal h-4 rounded-full"
                            style={{
                                width: `${Math.min(item.week * 25, 100)}%`,
                            }}
                        />

                    </div>

                    <div className="mt-2 text-right text-sm text-slate-muted">

                        {Math.min(item.week * 25, 100)}%

                    </div>

                </div>

            </div>

        </div>
    );
}

export default function ImprovementPlan({ plan }) {

    if (!plan || plan.length === 0) {

        return (

            <div className="text-center py-10 text-slate-muted">

                No personalized learning plan available.

            </div>

        );

    }

    return (

        <div>

            {/* Title */}

            <div className="mb-8">

                <h2 className="text-3xl font-bold text-fog">

                    📖 AI Personalized Learning Roadmap

                </h2>

                <p className="text-slate-muted mt-2">

                    Follow this weekly plan to improve your debating,
                    critical thinking, communication, and presentation
                    skills.

                </p>

            </div>

            {/* Timeline */}

            <div className="space-y-8">

                {plan.map((week) => (

                    <WeekCard
                        key={week.week}
                        item={week}
                    />

                ))}

            </div>

        </div>

    );

}