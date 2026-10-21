import { Link } from 'react-router'

export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M6 8h10l-4 8H2L6 8Z" fill="currentColor" opacity=".55" />
      <path d="M16 8h10L14 24H4L16 8Z" fill="currentColor" />
      <path d="M24 16h6l-4 8H18l6-8Z" fill="currentColor" opacity=".55" />
    </svg>
  )
}

export function Brand({ to }: { to?: string }) {
  const wordmark = (
    <>
      <span className="brand-symbol">
        <BrandMark />
      </span>
      <span className="brand-wordmark">
        devflow <span className="brand-agency">agency</span>
      </span>
    </>
  )
  return to ? (
    <Link to={to} className="brand" aria-label="DevFlow Agency — strona główna">
      {wordmark}
    </Link>
  ) : (
    <a href="#top" className="brand" aria-label="DevFlow Agency — początek strony">
      {wordmark}
    </a>
  )
}
