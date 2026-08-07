import { forwardRef } from "react";

/**
 * Design-system Input: label + `.input-field` + inline error message.
 * Forwards ref so it drops into react-hook-form / uncontrolled patterns.
 */

const Input = forwardRef(function Input(
  { label, error, hint, id, className = "", ...props },
  ref,
) {
  const inputId = id || props.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="
          text-xs
          font-semibold
          tracking-wide

          text-ink-900/70
          dark:text-white/70
          "
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        ref={ref}
        className={`
          input-field

          rounded-xl

          border

          bg-white/80

          transition-all
          duration-300

          placeholder:text-ink-900/30

          focus:border-blue-500
          focus:ring-4
          focus:ring-blue-500/10


          dark:bg-slate-900/70

          dark:placeholder:text-white/30

          ${
            error
              ? `
                border-red-400
                focus:border-red-500
                focus:ring-red-500/10
              `
              : `
                border-blue-500/10
                dark:border-white/10

                hover:border-purple-400/40
              `
          }

          ${className}
        `}
        {...props}
      />

      {error && (
        <p
          className="
          text-xs
          font-medium
          text-red-500
          dark:text-red-300
          "
        >
          {error}
        </p>
      )}

      {hint && !error && (
        <p
          className="
          text-xs

          text-ink-900/45
          dark:text-white/45
          "
        >
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
