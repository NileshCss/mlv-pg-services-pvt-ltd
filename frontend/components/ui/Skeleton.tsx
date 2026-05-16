import React from 'react'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
}

const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1, ...props }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={`skeleton h-12 rounded-lg ${i > 0 ? 'mt-3' : ''}`}
        {...props}
      />
    ))}
  </>
)

Skeleton.displayName = 'Skeleton'

export { Skeleton }

