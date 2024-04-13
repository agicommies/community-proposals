type LabelProps = {
  children: React.ReactNode;
  className?: string;
};

export const Label = ({ children, className = '' }: LabelProps) => {
  return (
    <span
      className={`flex items-center rounded-3xl px-4 py-1 text-sm font-semibold ${className}`}
    >
      {children}
    </span>
  );
};
