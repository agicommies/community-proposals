type TCardProps = {
  children: React.ReactNode;
  className?: string;
};

const CardRoot = (props: TCardProps) => {
  const { children, className = "" } = props;
  return (
    <div className={`border border-gray-500 bg-black/50 ${className}`}>
      {children}
    </div>
  );
};

const CardHeader = (props: TCardProps) => {
  const { children, className = "" } = props;
  return (
    <div
      className={`relative flex w-full items-center justify-center border-b border-gray-500 px-4 py-3 lg:flex-row lg:justify-start ${className}`}
    >
      {children}
    </div>
  );
};

const CardBody = (props: TCardProps) => {
  const { children, className = "" } = props;
  return <div className={`p-4 ${className}`}>{children}</div>;
};

export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Body: CardBody,
};
