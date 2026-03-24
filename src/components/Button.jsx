export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'px-5 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-accent text-neutral-950 hover:bg-accent-light',
    secondary: 'bg-surface-lighter text-neutral-100 hover:bg-neutral-500',
    danger: 'bg-danger/20 text-danger hover:bg-danger/30',
    ghost: 'text-neutral-400 hover:text-neutral-100 hover:bg-surface-lighter',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
