import { useState } from 'react'
import AccountMenu from '../components/AccountMenu'
import MembershipAlleyMenu from '../components/MembershipAlleyMenu'
import StoreOrderDialog from '../components/StoreOrderDialog'
import { productsForAlley } from '../utils/products'
import './StorePage.css'
import './MemberStoreHeader.css'

export default function MemberStorePage({ alley, membershipAlleys, member, onDashboard, onSelectAlley, onAccount, onLogout, onEditStore, hideHeader = false, onPlaceOrder, staffRole }) {
  const [notice, setNotice] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const products = productsForAlley(alley)
  const purchase = product => {
    if (onPlaceOrder) setSelectedProduct(product)
    else setNotice(`${product.title} is ready to purchase at ${alley.name}. Online checkout will be added when payments are enabled.`)
  }

  return <main className="store-page member-store-page">
    {!hideHeader && <header className="finder-header member-store-member-header">
      <a className="brand finder-brand" href="#dashboard" onClick={event => { event.preventDefault(); onDashboard() }}><span className="brand-mark"><i /><i /><i /></span>LANE CLUB</a>
      <AccountMenu member={member} onOpenSettings={onAccount} onLogout={onLogout} />
    </header>}
    <section className="store-shell">
      {!hideHeader && onSelectAlley && <div className="store-change-alley-row"><MembershipAlleyMenu alleys={membershipAlleys} currentAlley={alley} onSelect={onSelectAlley} /></div>}
      <div className="store-alley-banner"><div className="store-alley-mark">{alley.name.split(' ').map(word => word[0]).join('').slice(0, 2)}</div><div><p>SHOPPING AT</p><h1>{alley.name}</h1><span>{alley.area} · Products offered directly by your bowling alley</span></div></div>
      <div className="store-heading"><div><p>ALLEY PRODUCTS</p><h2>Everything for your <em>next game.</em></h2></div><span>{products.length} products</span></div>
      {notice && <p className="store-notice">{notice}</p>}
      <div className="product-grid">{products.map(product => <article className="product-card" key={product.id}>
        <div className="product-image">{product.image ? <img src={product.image} alt={product.title} /> : <span>●</span>}</div>
        <div><p>{alley.name.toUpperCase()}</p><h3>{product.title}</h3><span>{product.description}</span><footer><strong>${Number(product.price).toFixed(2)}</strong><button onClick={() => purchase(product)}>{onPlaceOrder ? 'Place order' : 'Purchase'}</button></footer></div>
      </article>)}</div>
    </section>
    {selectedProduct && <StoreOrderDialog product={selectedProduct} staffRole={staffRole} onSubmit={onPlaceOrder} onClose={success => { setSelectedProduct(null); if (success) setNotice(success) }} />}
  </main>
}
