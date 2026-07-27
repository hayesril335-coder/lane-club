export default function Brand({ href = '#', onClick, ariaLabel = 'Lane Club home', className = '' }) {
  return <a className={`brand ${className}`.trim()} href={href} onClick={onClick} aria-label={ariaLabel}>
    <span className="brand-mark"><i /><i /><i /></span>
    LANE CLUB
  </a>
}
