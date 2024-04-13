type TCardProps = {
  children: React.ReactNode;
  className?: string;
};

const CardRoot = (props: TCardProps) => {
  const { children, className = "" } = props;
  return (
    <div
      className={`rounded-xl border border-black bg-white shadow-custom dark:border-white dark:bg-dark dark:text-white dark:shadow-custom-dark ${className}`}
    >
      {children}
    </div>
  );
};

const CardHeader = (props: TCardProps) => {
  const { children, className = "" } = props;
  return (
    <div
      className={`relative flex w-full items-center justify-center rounded-t-xl border-b border-black bg-[url('/grid-bg.svg')] bg-no-repeat px-6 py-3 md:flex-row lg:justify-start dark:border-white ${className}`}
    >
      {children}
    </div>
  );
};

const CardBody = (props: TCardProps) => {
  const { children, className = "" } = props;
  return <div className={`p-6 ${className}`}>{children}</div>;
};

export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Body: CardBody,
};
