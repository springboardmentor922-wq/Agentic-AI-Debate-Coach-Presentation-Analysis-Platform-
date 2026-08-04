import React from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer
} from "recharts";

function ReportCard({ result }) {
  const a = result.argument_analysis;

  const d = result.delivery_metrics;

  const radarData = [
    { axis: "Clarity", value: a.clarity_score },
    { axis: "Relevance", value: a.relevance_score },
    { axis: "Evidence", value: a.evidence_strength_score },
    { axis: "Logic", value: a.logical_consistency_score },
    { axis: "Persuasion", value: a.persuasiveness_score }
  ];

  // ✅ Real weighted formula (Milestone 3): 30% Argument Quality + 20%
  // Evidence Usage + 20% Logical Consistency + 15% Rebuttal Effectiveness
  // + 15% Communication Skills — same mapping used server-side.
  const argumentQuality = (a.clarity_score + a.relevance_score) / 2;
  const evidenceUsage = a.evidence_strength_score;
  const logicalConsistency = a.logical_consistency_score;
  const rebuttalEffectiveness = a.persuasiveness_score;
  const communicationSkills = (d.clarity_score + d.confidence_score + d.engagement_score) / 3;

  const overall = Math.round(
    0.30 * argumentQuality +
    0.20 * evidenceUsage +
    0.20 * logicalConsistency +
    0.15 * rebuttalEffectiveness +
    0.15 * communicationSkills
  );

  return (
    <div className="mt-2 space-y-4">

      <div className="bg-[#1a1a2b] border border-purple-500/30 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Overall Performance Score</p>
          <p className="text-3xl font-bold text-purple-400">{overall}%</p>
        </div>
        <p className="text-gray-400 text-sm max-w-xs text-right">
          {result.delivery_metrics.overall_feedback}
        </p>
      </div>

      <div className="bg-[#0f0f1a] rounded-lg p-4">
        <p className="text-gray-300 text-sm font-semibold mb-2">Argument Analysis (5 criteria)</p>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#2e303a" />
            <PolarAngleAxis dataKey="axis" stroke="#9ca3af" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div className="bg-[#0f0f1a] rounded-lg p-3 text-center">
          <p className="text-gray-500 text-xs">Confidence</p>
          <p className="text-lg font-bold text-purple-300">{result.delivery_metrics.confidence_score}%</p>
        </div>
        <div className="bg-[#0f0f1a] rounded-lg p-3 text-center">
          <p className="text-gray-500 text-xs">Speech Clarity</p>
          <p className="text-lg font-bold text-purple-300">{result.delivery_metrics.clarity_score}%</p>
        </div>
        <div className="bg-[#0f0f1a] rounded-lg p-3 text-center">
          <p className="text-gray-500 text-xs">Pace</p>
          <p className="text-lg font-bold text-purple-300">
            {result.presentation_metrics.words_per_minute != null
              ? `${result.presentation_metrics.words_per_minute} WPM`
              : "N/A (typed)"}
          </p>
        </div>
        <div className="bg-[#0f0f1a] rounded-lg p-3 text-center">
          <p className="text-gray-500 text-xs">Fillers</p>
          <p className="text-lg font-bold text-purple-300">{result.presentation_metrics.filler_word_count}</p>
        </div>
      </div>

      <div className="bg-[#0f0f1a] rounded-lg p-4 text-sm">
        <p className="font-semibold mb-2 text-gray-300">Your Transcript</p>
        <p className="text-gray-400">{result.user_transcript}</p>
      </div>

      <div className="bg-[#0f0f1a] rounded-lg p-4 text-sm">
        <p className="font-semibold mb-2 text-gray-300">🎭 AI Opponent's Rebuttal</p>
        <p className="text-gray-400">{result.ai_rebuttal}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#0f0f1a] rounded-lg p-4 text-sm">
          <p className="font-semibold mb-2 text-green-400">💪 Strengths</p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            {a.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        <div className="bg-[#0f0f1a] rounded-lg p-4 text-sm">
          <p className="font-semibold mb-2 text-yellow-400">🎯 Weaknesses</p>
          <div className="space-y-3">
            {a.weaknesses.map((w, i) => (
              <div key={i}>
                <p className="text-gray-400">• {w.issue}</p>
                <p className="text-green-300 text-xs mt-1 pl-3 border-l-2 border-green-500/30">
                  Fix: "{w.stronger_version}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0f0f1a] rounded-lg p-4 text-sm">
        <p className="font-semibold mb-2 text-gray-300">⚖️ Logic Check (8-fallacy engine)</p>
        {result.fallacy_metrics.fallacy_detected ? (
          <>
            <p className="text-red-400 font-medium mb-1">{result.fallacy_metrics.fallacy_type} detected</p>
            <p className="text-gray-400 mb-1">"{result.fallacy_metrics.offending_text}"</p>
            <p className="text-gray-400 mb-1">{result.fallacy_metrics.explanation}</p>
            <p className="text-purple-300">{result.fallacy_metrics.correction_suggestion}</p>
          </>
        ) : (
          <p className="text-green-400">No logical fallacies detected — solid reasoning.</p>
        )}
      </div>

      <div className="bg-[#0f0f1a] rounded-lg p-4 text-sm">
        <p className="font-semibold mb-2 text-gray-300">✍️ Grammar</p>
        {result.delivery_metrics.grammar_issues.length === 0 ? (
          <p className="text-green-400">No grammar issues found.</p>
        ) : (
          <ul className="space-y-2">
            {result.delivery_metrics.grammar_issues.map((issue, i) => (
              <li key={i} className="border-b border-white/5 pb-2 last:border-0">
                <p className="text-red-400 line-through">{issue.original_text}</p>
                <p className="text-green-400">{issue.corrected_text}</p>
                <p className="text-gray-500 text-xs mt-1">{issue.explanation}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}

export default ReportCard;
