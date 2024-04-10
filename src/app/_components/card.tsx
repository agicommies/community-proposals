type TCardProps = {
  children: React.ReactNode;
  className?: string;
};

const CardRoot = (props: TCardProps) => {
  const { children, className } = props;
  return (
    <div
      className={`rounded-xl border border-black bg-white shadow-custom dark:border-white dark:bg-dark dark:text-white dark:shadow-custom-dark ${className}`}
    >
      {children}
    </div>
  );
};

const CardHeader = (props: TCardProps) => {
  const { children, className } = props;
  return (
    <div
      className={`relative flex w-full items-center justify-center rounded-t-xl border-b border-black px-6 py-3 md:flex-row lg:justify-start dark:border-white ${className}`}
    >
      <div className="absolute left-0 top-0 h-full w-full rounded-t-xl bg-cover opacity-20 dark:bg-dark dark:bg-[url('/grid-bg.svg')]" />
      {children}
    </div>
  );
};

const CardBody = (props: TCardProps) => {
  const { children, className } = props;
  return <div className={`p-6 ${className}`}>{children}</div>;
};

export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Body: CardBody,
};
