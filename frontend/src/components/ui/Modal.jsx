import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();

    if (open) document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="
      fixed
      inset-0
      z-50

      flex
      items-center
      justify-center

      bg-black/40

      backdrop-blur-sm

      px-4
      "
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          page-fade

          relative
          w-full
          ${widths[size]}

          max-h-[85vh]

          overflow-y-auto

          rounded-2xl

          border
          border-blue-500/20

          bg-gradient-to-br
          from-white
          via-blue-50/60
          to-purple-50/60

          p-6

          shadow-2xl
          shadow-blue-500/20

          backdrop-blur-xl


          dark:border-white/10

          dark:bg-gradient-to-br
          dark:from-slate-950
          dark:via-blue-950/50
          dark:to-purple-950/50
        `}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between gap-3">
          {title && (
            <h2
              className="
              font-display
              text-xl
              font-bold

              text-ink-900
              dark:text-white
              "
            >
              {title}
            </h2>
          )}

          <button
            onClick={onClose}
            className="
            flex
            h-9
            w-9
            items-center
            justify-center

            rounded-xl

            border
            border-blue-500/10

            bg-white/60

            text-ink-900/60

            transition-all

            hover:bg-blue-500/10
            hover:text-blue-600


            dark:border-white/10

            dark:bg-white/5

            dark:text-white/60

            dark:hover:bg-purple-500/20
            dark:hover:text-purple-300
            "
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>

        {/* Footer */}
        {footer && (
          <div
            className="
            mt-6

            border-t

            border-blue-500/10

            pt-4

            dark:border-white/10
            "
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
