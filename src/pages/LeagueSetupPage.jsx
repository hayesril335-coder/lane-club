import { useState } from 'react'
import { localDate } from '../utils/reservations'
import './LeaguePages.css'

export default function LeagueSetupPage({ alley, onBack, onSaveLeague }) {
  const [selectedLanes, setSelectedLanes] = useState([])
  const [selectedDates, setSelectedDates] = useState([])
  const [nextDate, setNextDate] = useState('')
  const [message, setMessage] = useState('')
  const leagues = alley?.leagues || []
  const today = new Date()
  const end = new Date(today); end.setFullYear(end.getFullYear() + 1)
  const toggleLane = lane => setSelectedLanes(current => current.includes(lane) ? current.filter(item => item !== lane) : [...current, lane])
  const addDate = () => { if (nextDate && !selectedDates.includes(nextDate)) setSelectedDates(current => [...current, nextDate].sort()); setNextDate('') }
  const submit = async event => {
    event.preventDefault()
    if (!selectedLanes.length || !selectedDates.length) { setMessage('Select at least one lane and one league date.'); return }
    const form = new FormData(event.currentTarget)
    await onSaveLeague({ id: crypto.randomUUID(), name: String(form.get('name')), monthlyPrice: Number(form.get('monthlyPrice')), lanes: selectedLanes, dates: selectedDates, members: [] })
    event.currentTarget.reset(); setSelectedLanes([]); setSelectedDates([]); setMessage('League created. You can create another one below.')
  }
  return <main className="league-page"><header><button onClick={onBack}>← Back to settings</button><strong>LANE CLUB</strong><span>League setup</span></header><section><p>LEAGUE MANAGEMENT</p><h1>Build a <em>league.</em></h1><span>Create as many leagues as your alley needs and reserve multiple lanes and dates.</span><form onSubmit={submit}><div className="league-fields"><label>League name<input name="name" required placeholder="Tuesday Night Strikers" /></label><label>Monthly price<input name="monthlyPrice" type="number" min="0" step="0.01" required placeholder="49.00" /></label></div><fieldset><legend>Select as many lanes as needed</legend><div className="league-lanes">{Array.from({ length: Number(alley?.lanes) || 16 }, (_, index) => `Lane ${String(index + 1).padStart(2, '0')}`).map(lane => <label key={lane}><input type="checkbox" checked={selectedLanes.includes(lane)} onChange={() => toggleLane(lane)} /><span>{lane}</span></label>)}</div></fieldset><fieldset><legend>Select league dates for the next year</legend><div className="league-date-add"><input type="date" min={localDate(today)} max={localDate(end)} value={nextDate} onChange={event => setNextDate(event.target.value)} /><button type="button" onClick={addDate}>Add date</button></div><div className="selected-dates">{selectedDates.map(date => <button type="button" key={date} onClick={() => setSelectedDates(current => current.filter(item => item !== date))}>{new Date(`${date}T12:00:00`).toLocaleDateString()} ×</button>)}</div></fieldset><button className="league-save">Save league →</button>{message && <p className="league-message">{message}</p>}</form><section className="league-list"><h2>Existing leagues</h2>{leagues.length ? leagues.map(league => <article key={league.id}><div><strong>{league.name}</strong><span>{league.lanes.length} lanes · {league.dates.length} dates</span></div><b>${Number(league.monthlyPrice).toFixed(2)}/month</b></article>) : <p>No leagues have been created yet.</p>}</section></section></main>
}
