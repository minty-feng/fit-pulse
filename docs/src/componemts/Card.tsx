// src/components/Card.tsx
export const Card = ({
    children,
    className = '',
    title,
    onClick
  }: {
    children: React.ReactNode
    className?: string
    title?: string
    onClick?: () => void
  }) => (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden ${className}`}
      onClick={onClick}
    >
      {title && (
        <div className="border-b border-gray-100 px-4 py-3">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  )