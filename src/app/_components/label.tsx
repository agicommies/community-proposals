type LabelProps = {
  children: React.ReactNode;
  className?: string;
};

export const Label = ({ children, className = '' }: LabelProps) => {
  return (
    <div
      className={`flex gap-1 items-center rounded-3xl px-4 py-1 text-sm font-semibold ${className}`}
    >
      {children}
    </div>
  );
};
