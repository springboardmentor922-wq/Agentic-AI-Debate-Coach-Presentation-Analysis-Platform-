export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div
      className="
      flex
      flex-col
      items-center
      justify-center
      gap-3

      rounded-2xl

      border
      border-dashed
      border-blue-500/20

      bg-gradient-to-br
      from-blue-50/40
      via-white
      to-purple-50/40

      py-14

      text-center

      shadow-sm


      dark:border-purple-400/20

      dark:bg-gradient-to-br
      dark:from-blue-950/30
      dark:via-slate-900/60
      dark:to-purple-950/30
      "
    >
      {Icon && (
        <div
          className="
          flex
          h-14
          w-14
          items-center
          justify-center

          rounded-2xl

          bg-gradient-to-br
          from-blue-500
          to-violet-500

          text-white

          shadow-lg
          shadow-blue-500/20
          "
        >
          <Icon size={24} />
        </div>
      )}

      <div>
        <p
          className="
          font-display
          font-semibold

          text-ink-900
          dark:text-white
          "
        >
          {title}
        </p>

        {description && (
          <p
            className="
            mx-auto
            mt-1
            max-w-sm

            text-sm

            text-ink-900/50
            dark:text-white/50
            "
          >
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}
