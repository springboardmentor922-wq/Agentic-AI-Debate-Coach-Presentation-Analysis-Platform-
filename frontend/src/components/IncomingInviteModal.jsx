import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swords } from "lucide-react";
import { matchmakingApi } from "../api/endpoints";

export default function IncomingInviteModal({ invite, onClose }) {
  const navigate = useNavigate();
  const [responding, setResponding] = useState(false);

  const handleRespond = async (accept) => {
    setResponding(true);
    try {
      await matchmakingApi.respondToInvite(invite.id, accept);
      if (accept) {
        navigate(`/debate-room/${invite.session_id}`);
      }
    } finally {
      onClose();
      setResponding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="card w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-motion-teal/15 flex items-center justify-center mx-auto mb-4">
          <Swords className="text-motion-teal" size={22} />
        </div>
        <h3 className="font-display text-lg mb-1">{invite.from_user_name} invited you</h3>
        <p className="text-sm text-slate-muted mb-6 capitalize">
          {invite.invite_type.replace("_", " ")} debate session
        </p>
        <div className="flex gap-3">
          <button onClick={() => handleRespond(false)} disabled={responding} className="btn-secondary flex-1">
            Decline
          </button>
          <button onClick={() => handleRespond(true)} disabled={responding} className="btn-primary flex-1">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}