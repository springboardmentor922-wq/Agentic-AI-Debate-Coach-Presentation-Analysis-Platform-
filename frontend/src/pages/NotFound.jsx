import { Link } from "react-router-dom";
import { Scale } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ink-900 text-center px-4">
      <Scale className="text-motion-teal mb-4" size={32} />
      <p className="label-eyebrow mb-2">Motion overruled</p>
      <h1 className="font-display text-3xl mb-4">This page doesn't exist</h1>
      <Link to="/dashboard" className="btn-primary">
        Back to dashboard
      </Link>
    </div>
  );
}
