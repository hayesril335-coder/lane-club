import { useState } from 'react'
import './StorePage.css'
import './OwnerStorePage.css'

export default function OwnerStorePage({ alley, onAddProduct, onAddCategory }) {
  const [preview, setPreview] = useState('')
  const [message, setMessage] = useState('')
  const products = alley?.products || []
  const categories = alley?.productCategories || []

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
      await onAddProduct({ id: crypto.randomUUID(), title: String(form.get('title')), description: String(form.get('description')), price: Number(form.get('price')), category: String(form.get('category')), image: preview })
      event.currentTarget.reset()
      setPreview('')
      setMessage('Product published to your alley store.')
    } catch (error) { setMessage(error.message) }
  }
  const submitCategory = async event => {
    event.preventDefault()
    const input = event.currentTarget.elements.categoryName
    const category = input.value.trim()
    if (categories.some(item => item.toLowerCase() === category.toLowerCase())) { setMessage('That category already exists.'); return }
    await onAddCategory(category)
    input.value = ''
    setMessage(`${category} category created.`)
  }

  return <main className="store-page owner-store-page"><header><span>LANE CLUB</span><strong>{alley?.name || 'Your bowling alley'}</strong><span>Owner store</span></header><section className="store-shell owner-store-shell">
    <div className="store-heading"><div><p>OWNER STORE</p><h1>Sell products to <em>your bowlers.</em></h1><span>Create categories, then publish products for your customers.</span></div><b>{products.length} live</b></div>
    <form className="category-form" onSubmit={submitCategory}><label>Create a product category<input name="categoryName" required placeholder="Food & drinks" /></label><button>Create category</button>{categories.length > 0 && <div>{categories.map(category => <span key={category}>{category}</span>)}</div>}</form>
    <div className="owner-store-grid"><form className="product-form" onSubmit={submit}><h2>Post a product</h2><label>Picture<input type="file" accept="image/*" onChange={chooseImage} /></label>{preview && <img className="product-preview" src={preview} alt="Product preview" />}<label>Title<input name="title" required placeholder="League night package" /></label><label>Price<input name="price" type="number" min="0" step="0.01" required placeholder="24.99" /></label><label>Category<select name="category" required defaultValue=""><option value="" disabled>{categories.length ? 'Select a category' : 'Create a category first'}</option>{categories.map(category => <option key={category}>{category}</option>)}</select></label><label>Description<textarea name="description" required rows="4" placeholder="Tell bowlers what is included." /></label><button disabled={!categories.length}>Publish product →</button>{message && <p>{message}</p>}</form>
      <section className="owner-product-list"><h2>Published products</h2>{products.length ? products.map(product => <article key={product.id}><div className="product-thumb">{product.image ? <img src={product.image} alt="" /> : '●'}</div><div><strong>{product.title}</strong><small>{product.category || 'Uncategorized'}</small><span>{product.description}</span></div><b>${Number(product.price).toFixed(2)}</b></article>) : <div className="empty-products"><span>◈</span><p>Your first published product will appear here.</p></div>}</section>
    </div>
  </section></main>
}
