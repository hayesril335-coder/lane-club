import { useState } from 'react'
import './LeaguePages.css'

export default function LeagueSignupPage({ alley, onBack, onPurchase }) {
  const leagues = alley?.leagues || []
  const [leagueId, setLeagueId] = useState(leagues[0]?.id || '')
  const [message, setMessage] = useState('')
  const league = leagues.find(item => item.id === leagueId)
  const submit = async event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await onPurchase(leagueId, { id: crypto.randomUUID(), name: String(form.get('name')), phone: String(form.get('phone')), email: String(form.get('email')), joinedAt: new Date().toISOString(), status: 'active', amount: Number(league?.monthlyPrice || 0) })
    event.currentTarget.reset(); setMessage(`${form.get('name')} is signed up for ${league.name}.`)
  }
  return <main className="league-page league-signup"><header><button onClick={onBack}>← Back to new reservation</button><strong>LANE CLUB</strong><span>League signup</span></header><section><p>LEAGUE SIGNUP</p><h1>Join a <em>league.</em></h1><span>Register a bowler and collect their first monthly league payment.</span>{leagues.length ? <form onSubmit={submit}><div className="league-fields"><label>Name<input name="name" required /></label><label>Phone number<input name="phone" type="tel" required /></label><label>Email<input name="email" type="email" required /></label><label>League<select value={leagueId} onChange={event => setLeagueId(event.target.value)}>{leagues.map(item => <option value={item.id} key={item.id}>{item.name} — ${Number(item.monthlyPrice).toFixed(2)}/month</option>)}</select></label></div><button className="league-save">Purchase {league ? `$${Number(league.monthlyPrice).toFixed(2)}` : ''} →</button>{message && <p className="league-message">{message}</p>}</form> : <div className="no-leagues"><h2>No leagues available.</h2><p>An owner needs to create a league from Settings before bowlers can sign up.</p></div>}</section></main>
}
