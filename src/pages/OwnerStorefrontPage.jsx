import MemberStorePage from './MemberStorePage'
export default function OwnerStorefrontPage({ alley, onDashboard, onPlaceOrder }) {
  return <MemberStorePage alley={alley} onDashboard={onDashboard} onPlaceOrder={onPlaceOrder} staffRole="owner" hideHeader />
}
