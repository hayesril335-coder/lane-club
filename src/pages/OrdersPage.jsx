import './OrdersPage.css'

const formatDate = value => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function OrdersPage({ alley }) {
  const orders = [...(alley?.orders || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return <main className="orders-page"><section>
    <p>STORE ORDERS</p><div className="orders-heading"><div><h1>Customer <em>orders.</em></h1><span>Orders placed by owners and connected employees appear here.</span></div></div>
    {orders.length ? <div className="orders-list">{orders.map(order => <article key={order.id}>
      <div className="order-customer"><span>{String(order.customerName || '?').slice(0, 1).toUpperCase()}</span><div><strong>{order.customerName}</strong><small>{order.productTitle}</small></div></div>
      <div><small>PAYMENT</small><strong>{order.paymentMethod === 'card' ? 'Card / POS' : 'Cash in person'}</strong><em className={order.paymentStatus === 'Paid' ? 'paid' : 'pending'}>{order.paymentStatus}</em></div>
      <div><small>PLACED</small><strong>{formatDate(order.createdAt)}</strong><span>{order.createdBy === 'employee' ? 'Employee' : 'Owner'}</span></div>
      <b>${Number(order.amount || 0).toFixed(2)}</b>
    </article>)}</div> : <div className="orders-empty"><span>◈</span><h2>No store orders yet.</h2><p>Orders placed from the staff storefront will appear here.</p></div>}
  </section></main>
}
