import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Sparkles, RefreshCw, Info } from 'lucide-react';
import { analyzeFallacyApi } from '../../services/apiClient';
import { FallacyReportSchema } from '../../types';

export const FallacyDetectorView: React.FC = () => {
  const [inputText, setInputText] = useState(
    "My opponent claims we need tax reform, but he couldn't even manage his own campaign budget!"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<FallacyReportSchema>({
    fallacy_detected: true,
    fallacy_type: 'Ad Hominem',
    offending_text: "he couldn't even manage his own campaign budget!",
    explanation: "Attacking the opponent's personal history rather than addressing the substance of their tax reform policy.",
    counter_strategy: "Refocus the argument entirely on the flaws or merits of the proposed tax reform policy itself."
  });

  const handleDetect = async () => {
    setIsLoading(true);
    try {
      const res = await analyzeFallacyApi(inputText);
      setReport(res);
    } catch (err) {
      console.error('Fallacy audit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Logical Fallacy Detector (Agent 1 Referee)</h2>
            <p className="text-xs text-slate-500">Locked at 0.0 Temperature for strict, zero-drift logical auditing</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Argument / Statement to Audit</label>
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDetect}
            disabled={isLoading}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Audit Logic with Agent 1
          </button>

          <button
            onClick={() => {
              setInputText("Either we ban all cars in the city completely, or the planet will be destroyed in 5 years!");
              handleDetect();
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2.5 rounded-xl text-xs transition-colors"
          >
            Try "False Dilemma" Sample
          </button>
        </div>
      </div>

      {/* Structured JSON Fallacy Report Card */}
      {report && (
        <div className={`p-6 rounded-2xl border-2 space-y-4 transition-all ${
          report.fallacy_detected ? 'bg-rose-50/80 border-rose-200' : 'bg-emerald-50/80 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {report.fallacy_detected ? (
                <>
                  <ShieldAlert className="w-6 h-6 text-rose-600" />
                  <span className="font-extrabold text-base text-rose-900">Fallacy Flagged: {report.fallacy_type}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <span className="font-extrabold text-base text-emerald-900">No Logical Fallacy Detected</span>
                </>
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2.5 py-1 rounded-full border border-slate-200 text-slate-600">
              Agent 1 Referee Result
            </span>
          </div>

          {report.fallacy_detected && (
            <div className="space-y-3 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-rose-200">
                <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Offending Text Substring</span>
                <p className="font-mono text-rose-800 font-bold">"{report.offending_text || inputText}"</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-rose-200 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px] block">Explanation</span>
                <p className="text-slate-800 leading-relaxed">{report.explanation}</p>
              </div>

              <div className="bg-emerald-100/80 p-3.5 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                <span className="font-bold uppercase text-[10px] block text-emerald-800">Correction & Counter Strategy</span>
                <p className="font-medium">{report.counter_strategy}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
