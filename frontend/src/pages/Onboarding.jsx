import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Users, BookOpen, ArrowRight, ArrowLeft } from "lucide-react";
import { userApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import RecaptchaCheckbox from "../components/RecaptchaCheckbox";

const ROLES = [
  { value: "learner", label: "Learner", desc: "Practice debates & track growth", icon: GraduationCap },
  { value: "debate_coach", label: "Debate Coach", desc: "Guide learners, review sessions", icon: Users },
  { value: "educator", label: "Educator", desc: "Manage cohorts & topics", icon: BookOpen },
];

const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"];

export default function Onboarding() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [answers, setAnswers] = useState({
    institution: "",
    bio: "",
    learning_goals: "",
    preferred_topics: "",
    experience_level: "beginner",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canGoToStep2 = !!role;
  const canGoToStep3 = agreed && !!recaptchaToken;

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const { data } = await userApi.completeOnboarding({
        role,
        recaptcha_token: recaptchaToken,
        ...answers,
      });
      setUser(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not complete onboarding. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-900 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1.5 w-10 rounded-full ${n <= step ? "bg-motion-teal" : "bg-white/10"}`}
            />
          ))}
        </div>

        <div className="card p-8">
          {step === 1 && (
            <>
              <h2 className="font-display text-2xl mb-1">How will you use Podium?</h2>
              <p className="text-slate-muted text-sm mb-6">Choose the role that best fits you.</p>

              <div className="space-y-3 mb-6">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`w-full text-left flex items-center gap-4 rounded-xl border p-4 transition ${
                      role === r.value ? "border-motion-teal bg-motion-teal/10" : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <r.icon size={22} className={role === r.value ? "text-motion-teal" : "text-slate-muted"} />
                    <div>
                      <p className="text-sm font-semibold">{r.label}</p>
                      <p className="text-xs text-slate-muted">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!canGoToStep2}
                className="btn-primary w-full"
              >
                Continue <ArrowRight size={16} />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display text-2xl mb-1">Just to confirm</h2>
              <p className="text-slate-muted text-sm mb-6">A couple of quick checks before we continue.</p>

              <label className="flex items-start gap-3 mb-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-slate-muted">
                  I agree to Podium's Terms of Service and Privacy Policy.
                </span>
              </label>

              <div className="mb-6">
                <RecaptchaCheckbox onVerify={setRecaptchaToken} />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canGoToStep3}
                  className="btn-primary flex-1"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-display text-2xl mb-1">A few last details</h2>
              <p className="text-slate-muted text-sm mb-6">
                This helps us personalize your {role.replace("_", " ")} experience.
              </p>

              <div className="space-y-4 mb-6">
                {(role === "debate_coach" || role === "educator") && (
                  <div>
                    <label className="label-eyebrow block mb-2">Institution / organization</label>
                    <input
                      className="input-field"
                      placeholder="School, university, or organization"
                      value={answers.institution}
                      onChange={(e) => setAnswers({ ...answers, institution: e.target.value })}
                    />
                  </div>
                )}

                {role === "debate_coach" && (
                  <div>
                    <label className="label-eyebrow block mb-2">Coaching background</label>
                    <textarea
                      className="input-field"
                      rows={3}
                      placeholder="Briefly describe your debate coaching experience"
                      value={answers.bio}
                      onChange={(e) => setAnswers({ ...answers, bio: e.target.value })}
                    />
                  </div>
                )}

                {role === "educator" && (
                  <div>
                    <label className="label-eyebrow block mb-2">What will you use Podium for?</label>
                    <textarea
                      className="input-field"
                      rows={3}
                      placeholder="e.g. Running a classroom debate unit, after-school club, etc."
                      value={answers.bio}
                      onChange={(e) => setAnswers({ ...answers, bio: e.target.value })}
                    />
                  </div>
                )}

                {role === "learner" && (
                  <>
                    <div>
                      <label className="label-eyebrow block mb-2">Experience level</label>
                      <div className="grid grid-cols-3 gap-3">
                        {EXPERIENCE_LEVELS.map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setAnswers({ ...answers, experience_level: lvl })}
                            className={`rounded-lg border py-2.5 text-sm capitalize transition ${
                              answers.experience_level === lvl
                                ? "border-motion-teal bg-motion-teal/10 text-motion-teal"
                                : "border-white/10 text-slate-muted hover:border-white/20"
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="label-eyebrow block mb-2">Learning goals</label>
                      <textarea
                        className="input-field"
                        rows={2}
                        placeholder="e.g. Improve rebuttal speed, reduce filler words"
                        value={answers.learning_goals}
                        onChange={(e) => setAnswers({ ...answers, learning_goals: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label-eyebrow block mb-2">Preferred debate topics</label>
                      <input
                        className="input-field"
                        placeholder="e.g. Technology, Ethics, Politics"
                        value={answers.preferred_topics}
                        onChange={(e) => setAnswers({ ...answers, preferred_topics: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>

              {error && (
                <p className="text-sm text-rebuttal-coral bg-rebuttal-coral/10 border border-rebuttal-coral/30 rounded-lg px-3 py-2 mb-4">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1">
                  {submitting ? "Finishing…" : "Finish setup"} <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}