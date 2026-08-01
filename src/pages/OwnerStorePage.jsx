import { useState } from 'react'
import './StorePage.css'

export default function OwnerStorePage({ alley, onAddProduct }) {
  const [preview, setPreview] = useState('')
  const [message, setMessage] = useState('')
  const products = alley?.products || []

  const chooseImage = event => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 700000) { setMessage('Choose an image smaller than 700 KB.'); return }
    const reader = new FileReader()
    reader.onload = () => setPreview(String(reader.result))
    reader.readAsDataURL(file)
  }

  const submit = async event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setMessage('Saving product…')
    try {
      await onAddProduct({ id: crypto.randomUUID(), title: String(form.get('title')), description: String(form.get('description')), price: Number(form.get('price')), image: preview })
      event.currentTarget.reset(); setPreview(''); setMessage('Product published to your alley store.')
    } catch (error) { setMessage(error.message) }
  }

  return <main className="store-page owner-store-page">
    <header><span>LANE CLUB</span><strong>{alley?.name || 'Your bowling alley'}</strong><span>Owner store</span></header>
    <section className="store-shell owner-store-shell">
      <div className="store-heading"><div><p>OWNER STORE</p><h1>Sell products to <em>your bowlers.</em></h1><span>Add merchandise, food packages, equipment, and other alley products.</span></div><b>{products.length} live</b></div>
      <div className="owner-store-grid"><form className="product-form" onSubmit={submit}>
        <h2>Post a product</h2><label>Picture<input type="file" accept="image/*" onChange={chooseImage} /></label>{preview && <img className="product-preview" src={preview} alt="Product preview" />}
        <label>Title<input name="title" required placeholder="League night package" /></label>
        <label>Price<input name="price" type="number" min="0" step="0.01" required placeholder="24.99" /></label>
        <label>Description<textarea name="description" required rows="4" placeholder="Tell bowlers what is included." /></label>
        <button>Publish product →</button>{message && <p>{message}</p>}
      </form><section className="owner-product-list"><h2>Published products</h2>{products.length ? products.map(product => <article key={product.id}><div className="product-thumb">{product.image ? <img src={product.image} alt="" /> : '●'}</div><div><strong>{product.title}</strong><span>{product.description}</span></div><b>${Number(product.price).toFixed(2)}</b></article>) : <div className="empty-products"><span>◈</span><p>Your first published product will appear here.</p></div>}</section></div>
    </section>
  </main>
}
