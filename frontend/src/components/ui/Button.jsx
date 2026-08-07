import { forwardRef } from "react";

const VARIANT_CLASSES = {
  primary: `
    inline-flex
    items-center
    justify-center
    gap-2

    rounded-xl
    px-5
    py-2.5

    text-sm
    font-semibold
    text-white

    bg-gradient-to-r
    from-blue-600
    via-purple-600
    to-violet-600

    shadow-lg
    shadow-purple-500/20

    transition-all
    duration-300

    hover:scale-[1.02]
    hover:from-blue-500
    hover:via-purple-500
    hover:to-violet-500

    active:scale-100

    disabled:opacity-50
    disabled:hover:scale-100
    `,

  secondary: `
    inline-flex
    items-center
    justify-center
    gap-2

    rounded-xl

    border
    border-brand-500/20

    px-5
    py-2.5

    text-sm
    font-semibold

    text-brand-700

    bg-gradient-to-r
    from-brand-500/10
    via-purple-500/10
    to-accent-500/10

    transition-all
    duration-300

    hover:border-brand-500/40
    hover:shadow-glass
    hover:-translate-y-0.5

    dark:border-white/10
    dark:text-brand-200

    disabled:opacity-50
    `,

  tertiary: `
    inline-flex
    items-center
    justify-center
    gap-2

    rounded-xl

    px-5
    py-2.5

    text-sm
    font-semibold

    text-ink-900/70

    transition-all
    duration-300

    hover:bg-brand-500/10
    hover:text-brand-600

    dark:text-white/70
    dark:hover:bg-white/10
    dark:hover:text-brand-300

    disabled:opacity-50
    `,

  danger: `
    inline-flex
    items-center
    justify-center
    gap-2

    rounded-xl

    bg-gradient-to-r
    from-red-500
    to-rose-600

    px-5
    py-2.5

    text-sm
    font-semibold
    text-white

    shadow-lg
    shadow-red-500/20

    transition-all
    duration-300

    hover:-translate-y-0.5
    hover:from-red-600
    hover:to-rose-700

    active:translate-y-0

    disabled:opacity-50
    disabled:hover:translate-y-0
    `,
};

const SIZE_CLASSES = {
  sm: "text-xs px-3.5 py-2",
  md: "",
};

/**
 * Design-system Button.
 * Keeps all buttons visually consistent with the platform theme.
 */
const Button = forwardRef(function Button(
  {
    as: Comp = "button",
    variant = "primary",
    size = "md",
    className = "",
    children,
    ...props
  },
  ref,
) {
  const classes = [
    VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary,
    SIZE_CLASSES[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Comp ref={ref} className={classes} {...props}>
      {children}
    </Comp>
  );
});

export default Button;
