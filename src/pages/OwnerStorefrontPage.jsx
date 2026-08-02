import MemberStorePage from './MemberStorePage'
import './OwnerStorefrontPage.css'

export default function OwnerStorefrontPage({ alley, onDashboard, onEditStore }) {
  return <MemberStorePage alley={alley} onDashboard={onDashboard} onEditStore={onEditStore} />
}
