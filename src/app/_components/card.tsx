type TCardProps = {
  children: React.ReactNode
  className?: string
}

const CardRoot = (props: TCardProps) => {
  const { children, className } = props;
  return (
    <div className={`border border-black dark:border-white dark:text-white dark:bg-dark rounded-xl dark:shadow-custom-dark shadow-custom ${className}`}>
      {children}
    </div>
  )
}

const CardHeader = (props: TCardProps) => {
  const { children, className } = props;
  return (
    <div className={`relative flex items-center justify-center lg:justify-start w-full px-6 py-3 border-b border-black md:flex-row dark:border-white rounded-t-xl ${className}`}>
      <div className="absolute w-full h-full bg-[url('/grid-bg.svg')] bg-cover top-0 left-0 opacity-20 rounded-t-xl" />
      {children}
    </div>
  )
}

const CardBody = (props: TCardProps) => {
  const { children, className } = props;
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  )
}

export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Body: CardBody
}