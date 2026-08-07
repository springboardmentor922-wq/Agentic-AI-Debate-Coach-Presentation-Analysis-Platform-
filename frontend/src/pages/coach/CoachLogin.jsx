import { Users } from "lucide-react";
import RoleLogin from "../../components/RoleLogin";

export default function CoachLogin() {
  return (
    <RoleLogin
      role="debate_coach"
      roleLabel="Debate Coach"
      icon={Users}
      homePath="/coach"
      otherPortals={[
        {
          to: "/educator/login",
          label: "Educator",
        },
      ]}
    />
  );
}
