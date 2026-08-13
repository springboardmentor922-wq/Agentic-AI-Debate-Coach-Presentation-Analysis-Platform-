import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import AppShell from "../components/AppShell";
import RoleBadge from "../components/RoleBadge";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../api/endpoints";
import FeedbackModal from "../components/FeedbackModal";
import { presentationDomainsApi } from "../api/endpoints";

const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"];
const LEARNING_STYLES = ["visual", "practical", "reading_writing", "interactive"];
const FEEDBACK_STYLES = ["encouraging", "balanced", "strict"];
const OPPONENT_DIFFICULTIES = ["easy", "medium", "hard"];
const PRACTICE_FOCUSES = [
  "public_speaking",
  "debate_skills",
  "critical_thinking",
  "presentation_skills",
  "persuasive_communication",
  "interview_preparation",
];
const FEEDBACK_CATEGORIES = [
  "argument_structure",
  "logical_fallacies",
  "evidence_quality",
  "rebuttal_skills",
  "communication_skills",
  "speaking_confidence",
  "persuasiveness",
  "clarity",
  "logical_consistency",
];

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [allDomains, setAllDomains] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await userApi.getProfile();
      setProfile(data);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await presentationDomainsApi.list();
      setAllDomains(data);
    })();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg("");
    try {
      const { data } = await userApi.updateProfile({
        bio: profile.bio,
        institution: profile.institution,
        learning_goals: profile.learning_goals,
        preferred_topics: profile.preferred_topics,
        experience_level: profile.experience_level,
        presentation_domain_ids: (profile.presentation_domains || []).map((d) => d.id),
        learning_style: profile.learning_style,
        feedback_style: profile.feedback_style,
        opponent_difficulty: profile.opponent_difficulty,
        practice_focus: profile.practice_focus,
        preferred_feedback_categories: profile.preferred_feedback_categories || [],
      });
      setProfile(data);
      setSavedMsg("Profile saved.");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <AppShell>
        <div className="p-10 text-slate-muted text-sm">Loading profile…</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-8 py-10">
        <p className="label-eyebrow mb-1">Profile</p>
        <h1 className="font-display text-3xl mb-8">Your profile</h1>

        <div className="card p-6 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-motion-teal/15 flex items-center justify-center font-display text-2xl text-motion-teal">
            {user?.full_name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-lg">{user?.full_name}</p>
            <p className="text-slate-muted text-sm mb-2">{user?.email}</p>
           <RoleBadge role={user?.role} />
          </div>
          <button onClick={() => setShowFeedback(true)} className="btn-secondary ml-auto">
            View my feedback
          </button>
        </div>

        {showFeedback && (
          <FeedbackModal
            targetUserId={user.id}
            targetUserName={user.full_name}
            onClose={() => setShowFeedback(false)}
          />
        )}

        <form onSubmit={handleSave} className="card p-6 space-y-5">
          <div>
            <label className="label-eyebrow block mb-2">Institution</label>
            <input
              className="input-field"
              placeholder="School, university, or organization"
              value={profile.institution || ""}
              onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
            />
          </div>

          <div>
            <label className="label-eyebrow block mb-2">Bio</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="A short introduction about yourself"
              value={profile.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>

          <div>
            <label className="label-eyebrow block mb-2">Learning goals</label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="e.g. Improve rebuttal speed, reduce filler words"
              value={profile.learning_goals || ""}
              onChange={(e) => setProfile({ ...profile, learning_goals: e.target.value })}
            />
          </div>

          <div>
            <label className="label-eyebrow block mb-2">Preferred debate topics</label>
            <input
              className="input-field"
              placeholder="e.g. Technology, Ethics, Politics (comma separated)"
              value={profile.preferred_topics || ""}
              onChange={(e) => setProfile({ ...profile, preferred_topics: e.target.value })}
            />
          </div>

          <div>
            <label className="label-eyebrow block mb-2">Experience level</label>
            <div className="grid grid-cols-3 gap-3">
              {EXPERIENCE_LEVELS.map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setProfile({ ...profile, experience_level: lvl })}
                  className={`rounded-lg border py-2.5 text-sm capitalize transition ${
                    profile.experience_level === lvl
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
            <label className="label-eyebrow block mb-2">Presentation domains</label>
            <div className="flex flex-wrap gap-2">
              {allDomains.map((domain) => {
                const selectedIds = (profile.presentation_domains || []).map((d) => d.id);
                const active = selectedIds.includes(domain.id);
                return (
                  <button
                    type="button"
                    key={domain.id}
                    onClick={() => {
                      const current = profile.presentation_domains || [];
                      const updated = active
                        ? current.filter((d) => d.id !== domain.id)
                        : [...current, domain];
                      setProfile({ ...profile, presentation_domains: updated });
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      active
                        ? "border-motion-teal bg-motion-teal/10 text-motion-teal"
                        : "border-white/10 text-slate-muted hover:border-white/20"
                    }`}
                  >
                    {domain.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="label-eyebrow mb-3">Learning &amp; coaching preferences</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-eyebrow block mb-2">Learning style</label>
                <select
                  className="input-field"
                  value={profile.learning_style || "practical"}
                  onChange={(e) => setProfile({ ...profile, learning_style: e.target.value })}
                >
                  {LEARNING_STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", "/")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-eyebrow block mb-2">Feedback style</label>
                <select
                  className="input-field"
                  value={profile.feedback_style || "balanced"}
                  onChange={(e) => setProfile({ ...profile, feedback_style: e.target.value })}
                >
                  {FEEDBACK_STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-eyebrow block mb-2">Opponent difficulty</label>
                <select
                  className="input-field"
                  value={profile.opponent_difficulty || "medium"}
                  onChange={(e) => setProfile({ ...profile, opponent_difficulty: e.target.value })}
                >
                  {OPPONENT_DIFFICULTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-eyebrow block mb-2">Practice focus</label>
                <select
                  className="input-field"
                  value={profile.practice_focus || "debate_skills"}
                  onChange={(e) => setProfile({ ...profile, practice_focus: e.target.value })}
                >
                  {PRACTICE_FOCUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="label-eyebrow block mb-2">Preferred feedback categories</label>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_CATEGORIES.map((cat) => {
                const current = profile.preferred_feedback_categories || [];
                const active = current.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => {
                      const updated = active ? current.filter((c) => c !== cat) : [...current, cat];
                      setProfile({ ...profile, preferred_feedback_categories: updated });
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      active
                        ? "border-motion-teal bg-motion-teal/10 text-motion-teal"
                        : "border-white/10 text-slate-muted hover:border-white/20"
                    }`}
                  >
                    {cat.replace(/_/g, " ")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              <Save size={16} /> {saving ? "Saving…" : "Save changes"}
            </button>
            {savedMsg && <span className="text-sm text-motion-teal">{savedMsg}</span>}
          </div>
        </form>
      </div>
    </AppShell>
  );
}