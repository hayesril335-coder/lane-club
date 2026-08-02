import { useState } from 'react'
import './StoreOrderDialog.css'

export default function StoreOrderDialog({ product, staffRole, onClose, onSubmit }) {
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setBusy(true)
    setMessage('')
    try {
      await onSubmit({
        id: crypto.randomUUID(),
        customerName: String(form.get('customerName')).trim(),
        productId: product.id,
        productTitle: product.title,
        amount: Number(product.price),
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'Paid' : 'Awaiting terminal',
        status: 'Placed',
        createdBy: staffRole,
        createdAt: new Date().toISOString(),
      })
      onClose(`${product.title} order placed.`)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  return <div className="store-order-backdrop" onClick={() => onClose()}>
    <section className="store-order-dialog" onClick={event => event.stopPropagation()}>
      <button className="store-order-close" onClick={() => onClose()} aria-label="Close order form">×</button>
      <p>NEW STORE ORDER</p><h2>{product.title}</h2><strong>${Number(product.price).toFixed(2)}</strong>
      <form onSubmit={submit}>
        <label>Customer name<input name="customerName" required placeholder="Customer name" /></label>
        <fieldset><legend>Payment method</legend><label><input type="radio" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} /> Cash in person</label><label><input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /> Card / POS system</label></fieldset>
        {paymentMethod === 'card' && <small>The order will remain awaiting terminal confirmation until a connected POS reader confirms the charge.</small>}
        <button className="store-order-submit" disabled={busy}>{busy ? 'Placing order…' : paymentMethod === 'cash' ? 'Place cash order →' : 'Send to POS →'}</button>
        {message && <p className="store-order-error">{message}</p>}
      </form>
    </section>
  </div>
}
