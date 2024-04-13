
type LabelProps = {
  children: React.ReactNode,
  className?: string
}

export const Label = ({ children, className = '' }: LabelProps) => {

  return (
    <span className={`px-4 py-1 text-sm font-semibold rounded-3xl ${className}`}>
      {children}
    </span>
  )
}