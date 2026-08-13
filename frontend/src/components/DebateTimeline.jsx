import React, { useState } from "react";

export default function DebateTimeline({ timeline }) {

    const [expandedTurn, setExpandedTurn] = useState(null);

    if (!timeline || timeline.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                No debate timeline available.
            </div>
        );
    }

    return (

        <div className="space-y-8">

            {timeline.map((turn) => (

                <div
                    key={turn.turn_number}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                >

                    {/* Header */}

                    <div
                        className="bg-indigo-600 text-white px-6 py-4 cursor-pointer flex justify-between items-center"
                        onClick={() =>
                            setExpandedTurn(
                                expandedTurn === turn.turn_number
                                    ? null
                                    : turn.turn_number
                            )
                        }
                    >

                        <div>

                            <h2 className="text-xl font-bold">

                                Turn {turn.turn_number}

                            </h2>

                            <p className="text-sm opacity-90">

                                Click to view complete analysis

                            </p>

                        </div>

                        <div className="text-2xl">

                            {expandedTurn === turn.turn_number ? "▲" : "▼"}

                        </div>

                    </div>

                    {/* Expanded */}

                    {expandedTurn === turn.turn_number && (

                        <div className="p-6">

                            {/* User */}

                            <div className="mb-6">

                                <h3 className="font-bold text-blue-700 text-lg">

                                    👤 User Argument

                                </h3>

                                <div className="bg-blue-50 rounded-lg p-4 mt-2">

                                    {turn.user_argument}

                                </div>

                            </div>

                            {/* AI */}

                            <div className="mb-6">

                                <h3 className="font-bold text-green-700 text-lg">

                                    🤖 AI Response

                                </h3>

                                <div className="bg-green-50 rounded-lg p-4 mt-2">

                                    {turn.ai_response}

                                </div>

                            </div>

                            {/* Score */}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                <div className="bg-indigo-50 rounded-lg p-4">

                                    <h4 className="font-semibold">

                                        Overall Score

                                    </h4>

                                    <p className="text-4xl font-bold text-indigo-600 mt-2">

                                        {turn.score}

                                    </p>

                                </div>

                                <div className="bg-red-50 rounded-lg p-4">

                                    <h4 className="font-semibold">

                                        Fallacy

                                    </h4>

                                    <p className="mt-2 font-bold text-red-600">

                                        {turn.fallacy || "None"}

                                    </p>

                                </div>

                                <div className="bg-yellow-50 rounded-lg p-4">

                                    <h4 className="font-semibold">

                                        Counterargument

                                    </h4>

                                    <p className="mt-2">

                                        {turn.counterargument || "No counterargument"}

                                    </p>

                                </div>

                            </div>

                            {/* AI Feedback */}

                            <div className="mt-6 bg-gray-100 rounded-lg p-5">

                                <h3 className="font-bold text-lg">

                                    💡 AI Judge Feedback

                                </h3>

                                <p className="mt-3">

                                    {turn.feedback}

                                </p>

                            </div>

                        </div>

                    )}

                </div>

            ))}

        </div>

    );

}