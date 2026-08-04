import { useEffect, useState } from 'react'
import { localDate } from '../utils/reservations'
import { activeLeagueMembers, generateRecurringLeagueDates } from '../utils/leagues'
import './LeaguePages.css'
import './LeagueManagementExtras.css'

const weekdays = [
  ['Sunday', 0], ['Monday', 1], ['Tuesday', 2], ['Wednesday', 3],
  ['Thursday', 4], ['Friday', 5], ['Saturday', 6],
]

export default function LeagueSetupPage({ alley, initialLeagueId, onBack, onSaveLeague, onDeleteLeague, onEndMembership }) {
  const [selectedLanes, setSelectedLanes] = useState([])
  const [selectedDates, setSelectedDates] = useState([])
  const [nextDate, setNextDate] = useState('')
  const [repeatDays, setRepeatDays] = useState([])
  const [repeatStart, setRepeatStart] = useState('')
  const [repeatEnd, setRepeatEnd] = useState('')
  const [repeatEvery, setRepeatEvery] = useState(1)
  const [selectedLeagueId, setSelectedLeagueId] = useState(initialLeagueId || null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [message, setMessage] = useState('')
  const leagues = alley?.leagues || []
  const selectedLeague = leagues.find(league => league.id === selectedLeagueId)
  const today = new Date()
  const end = new Date(today); end.setFullYear(end.getFullYear() + 1)

  useEffect(() => { if (initialLeagueId) setSelectedLeagueId(initialLeagueId) }, [initialLeagueId])

  const toggleLane = lane => setSelectedLanes(current => current.includes(lane) ? current.filter(item => item !== lane) : [...current, lane])
  const toggleRepeatDay = day => setRepeatDays(current => current.includes(day) ? current.filter(item => item !== day) : [...current, day])
  const addDate = () => { if (nextDate && !selectedDates.includes(nextDate)) setSelectedDates(current => [...current, nextDate].sort()); setNextDate('') }
  const addRepeatingDates = () => {
    if (!repeatStart || !repeatEnd || !repeatDays.length) { setMessage('Choose a start date, end date, and at least one repeating day.'); return }
    const generated = generateRecurringLeagueDates({ startDate: repeatStart, endDate: repeatEnd, weekdays: repeatDays, everyWeeks: repeatEvery })
    if (!generated.length) { setMessage('No repeating dates matched that schedule. Check the date range and try again.'); return }
    setSelectedDates(current => [...new Set([...current, ...generated])].sort())
    setMessage(`${generated.length} repeating league date${generated.length === 1 ? '' : 's'} added. You can still add or remove individual dates.`)
  }
  const submit = async event => {
    event.preventDefault()
    if (!selectedLanes.length || !selectedDates.length) { setMessage('Select at least one lane and one league date.'); return }
    const form = new FormData(event.currentTarget)
    await onSaveLeague({ id: crypto.randomUUID(), name: String(form.get('name')), monthlyPrice: Number(form.get('monthlyPrice')), lanes: selectedLanes, dates: selectedDates, recurrence: repeatDays.length ? { weekdays: repeatDays, startDate: repeatStart, endDate: repeatEnd, everyWeeks: repeatEvery } : null, members: [] })
    event.currentTarget.reset()
    setSelectedLanes([]); setSelectedDates([]); setRepeatDays([]); setRepeatStart(''); setRepeatEnd('')
    setMessage('League created. You can create another one below.')
  }
  const endMembership = async memberId => {
    await onEndMembership(selectedLeague.id, memberId)
    setMessage('League membership ended. This member is no longer included in monthly charges.')
  }
  const deleteSelectedLeague = async () => {
    await onDeleteLeague(selectedLeague.id)
    setSelectedLeagueId(null); setConfirmDelete(false); setMessage('League deleted.')
  }

  return <main className="league-page"><header><button onClick={onBack}>← Back to settings</button><strong>LANE CLUB</strong><span>League setup</span></header><section>
    <p>LEAGUE MANAGEMENT</p><h1>Build a <em>league.</em></h1><span>Create as many leagues as your alley needs and reserve multiple lanes and dates.</span>
    <form onSubmit={submit}>
      <div className="league-fields"><label>League name<input name="name" required placeholder="Tuesday Night Strikers" /></label><label>Monthly price<input name="monthlyPrice" type="number" min="0" step="0.01" required placeholder="49.00" /></label></div>
      <fieldset><legend>Select as many lanes as needed</legend><div className="league-lanes">{Array.from({ length: Number(alley?.lanes) || 16 }, (_, index) => `Lane ${String(index + 1).padStart(2, '0')}`).map(lane => <label key={lane}><input type="checkbox" checked={selectedLanes.includes(lane)} onChange={() => toggleLane(lane)} /><span>{lane}</span></label>)}</div></fieldset>
      <fieldset><legend>Select individual league dates</legend><div className="league-date-add"><input type="date" min={localDate(today)} max={localDate(end)} value={nextDate} onChange={event => setNextDate(event.target.value)} /><button type="button" onClick={addDate}>Add date</button></div></fieldset>
      <fieldset className="league-repeat"><legend>Repeat selected lanes on a schedule <small>optional</small></legend><p>Generate recurring dates while keeping the manual date system above.</p><div className="repeat-days">{weekdays.map(([label, day]) => <label key={day}><input type="checkbox" checked={repeatDays.includes(day)} onChange={() => toggleRepeatDay(day)} /><span>{label.slice(0, 3)}</span></label>)}</div><div className="repeat-controls"><label>Start date<input type="date" min={localDate(today)} max={localDate(end)} value={repeatStart} onChange={event => setRepeatStart(event.target.value)} /></label><label>End date<input type="date" min={repeatStart || localDate(today)} max={localDate(end)} value={repeatEnd} onChange={event => setRepeatEnd(event.target.value)} /></label><label>Repeat<select value={repeatEvery} onChange={event => setRepeatEvery(Number(event.target.value))}><option value="1">Every week</option><option value="2">Every 2 weeks</option><option value="4">Every 4 weeks</option></select></label></div><button className="repeat-add" type="button" onClick={addRepeatingDates}>Add repeating dates</button></fieldset>
      <div className="selected-dates">{selectedDates.map(date => <button type="button" key={date} onClick={() => setSelectedDates(current => current.filter(item => item !== date))}>{new Date(`${date}T12:00:00`).toLocaleDateString()} ×</button>)}</div>
      <button className="league-save">Save league →</button>{message && <p className="league-message">{message}</p>}
    </form>

    <section className="league-list"><h2>Existing leagues</h2>{leagues.length ? leagues.map(league => <button className={league.id === selectedLeagueId ? 'selected' : ''} type="button" key={league.id} onClick={() => { setSelectedLeagueId(league.id); setConfirmDelete(false) }}><span><strong>{league.name}</strong><small>{(league.lanes || []).length} lanes · {(league.dates || []).length} dates · {activeLeagueMembers(league).length} active members</small></span><b>${Number(league.monthlyPrice).toFixed(2)}/month</b></button>) : <p>No leagues have been created yet.</p>}</section>

    {selectedLeague && <section className="league-details"><div className="league-detail-heading"><div><p>LEAGUE DETAILS</p><h2>{selectedLeague.name}</h2></div>{confirmDelete ? <div className="delete-league-confirm"><button type="button" onClick={() => setConfirmDelete(false)}>Keep league</button><button type="button" onClick={deleteSelectedLeague}>Confirm delete</button></div> : <button className="delete-league" type="button" onClick={() => setConfirmDelete(true)}>Delete league</button>}</div><div className="league-member-list"><h3>Every league member</h3>{(selectedLeague.members || []).length ? selectedLeague.members.map(leagueMember => { const ended = leagueMember.status === 'cancelled' || leagueMember.active === false; return <article key={leagueMember.id}><div><strong>{leagueMember.name}</strong><span>{leagueMember.email} · {leagueMember.phone}</span></div><b className={ended ? 'ended' : 'active'}>{ended ? 'Ended' : 'Active'}</b>{ended ? <small>{leagueMember.endedAt ? `Ended ${new Date(leagueMember.endedAt).toLocaleDateString()}` : 'Membership ended'}</small> : <button type="button" onClick={() => endMembership(leagueMember.id)}>End membership</button>}</article> }) : <p>No members have joined this league yet.</p>}</div></section>}
  </section></main>
}
