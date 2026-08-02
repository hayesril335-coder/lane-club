import { useState } from 'react'
import StoreOrderDialog from '../components/StoreOrderDialog'
import { productsForAlley } from '../utils/products'
import './StorePage.css'

export default function MemberStorePage({ alley, onDashboard, onChangeAlley, onEditStore, hideHeader = false, onPlaceOrder, staffRole }) {
  const [notice, setNotice] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const products = productsForAlley(alley)
  const purchase = product => {
    if (onPlaceOrder) setSelectedProduct(product)
    else setNotice(`${product.title} is ready to purchase at ${alley.name}. Online checkout will be added when payments are enabled.`)
  }

  return <main className="store-page member-store-page">
    {!hideHeader && <header>
      <button onClick={onDashboard}>← Dashboard</button>
      <strong>LANE CLUB</strong>
      {onEditStore ? <button className="edit-store-button" onClick={onEditStore}>Edit Store</button> : onChangeAlley ? <button onClick={onChangeAlley}>Change Alley</button> : <span>Alley store</span>}
    </header>}
    <section className="store-shell">
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
