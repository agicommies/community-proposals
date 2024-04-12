type TSkeletonProps = { className: string }
export const Skeleton = (props: TSkeletonProps) => {
  const { className } = props;
  return (
    <span className={`block bg-gray-700 animate-pulse w-full rounded-lg ${className}`} />
  )
}