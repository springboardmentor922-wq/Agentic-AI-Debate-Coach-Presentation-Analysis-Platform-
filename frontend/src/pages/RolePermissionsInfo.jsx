import React from "react";
import Layout from "../components/Layout";

const ROLES = [
  { role: "Learner", access: ["Own profile", "Own sessions", "Feedback and scores", "Progress tracking"], denied: ["Other users' data", "System settings", "Admin controls"] },
  { role: "Debate Coach", access: ["Assigned learners", "Debate sessions", "Performance analysis", "Fallacy reports"], denied: ["System settings", "User management"] },
  { role: "Educator", access: ["Multiple learners", "Reports and analytics", "Group performance", "Classes, assignments, rubrics"], denied: ["System-level settings"] },
  { role: "Administrator", access: ["All users", "All data", "System settings", "Role management"], denied: [] },
];

function RolePermissionsInfo() {
  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Role & Permissions</h2>
      <p className="text-gray-500 mb-6">
        Reference view — roles in this platform are fixed in code, not a live editable permission matrix.
        This shows exactly what each role can and cannot access.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
        {ROLES.map((r) => (
          <div key={r.role} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-5">
            <p className="font-semibold mb-3">{r.role}</p>
            <p className="text-green-400 text-xs font-semibold mb-1">CAN ACCESS</p>
            <ul className="text-gray-400 text-sm list-disc list-inside mb-3">
              {r.access.map((a) => <li key={a}>{a}</li>)}
            </ul>
            {r.denied.length > 0 && (
              <>
                <p className="text-red-400 text-xs font-semibold mb-1">CANNOT ACCESS</p>
                <ul className="text-gray-400 text-sm list-disc list-inside">
                  {r.denied.map((d) => <li key={d}>{d}</li>)}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
}
export default RolePermissionsInfo;
