import { useEffect, useState } from 'react'
import { localDate } from '../utils/reservations'
import { activeLeagueMembers, generateRecurringLeagueDates } from '../utils/leagues'
import './LeaguePages.css'
import './LeagueManagementExtras.css'
import './LeagueRepeatStates.css'
import './LeagueEdit.css'
import './LeaguePasswords.css'

const weekdays = [
  ['Sunday', 0], ['Monday', 1], ['Tuesday', 2], ['Wednesday', 3],
  ['Thursday', 4], ['Friday', 5], ['Saturday', 6],
]

export default function LeagueSetupPage({ alley, initialLeagueId, managementOnly = false, onBack, onSaveLeague, onUpdateLeague, onDeleteLeague, onEndMembership, onGeneratePasswords }) {
  const [selectedLanes, setSelectedLanes] = useState([])
  const [selectedDates, setSelectedDates] = useState([])
  const [nextDate, setNextDate] = useState('')
  const [repeatDays, setRepeatDays] = useState([])
  const [repeatStart, setRepeatStart] = useState('')
  const [repeatEnd, setRepeatEnd] = useState('')
  const [repeatFrequency, setRepeatFrequency] = useState('weekly')
  const [selectedLeagueId, setSelectedLeagueId] = useState(initialLeagueId || null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDates, setEditDates] = useState([])
  const [editNextDate, setEditNextDate] = useState('')
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false)
  const [passwordCount, setPasswordCount] = useState(1)
  const [generatedPasswords, setGeneratedPasswords] = useState([])
  const [generatingPasswords, setGeneratingPasswords] = useState(false)
  const [message, setMessage] = useState('')
  const leagues = alley?.leagues || []
  const selectedLeague = leagues.find(league => league.id === selectedLeagueId)
  const today = new Date()
  const end = new Date(today); end.setFullYear(end.getFullYear() + 1)

  useEffect(() => { if (initialLeagueId) setSelectedLeagueId(initialLeagueId) }, [initialLeagueId])
  useEffect(() => { setEditing(false); setConfirmDelete(false); setShowPasswordGenerator(false); setGeneratedPasswords([]) }, [selectedLeagueId])

  const toggleLane = lane => setSelectedLanes(current => current.includes(lane) ? current.filter(item => item !== lane) : [...current, lane])
  const toggleRepeatDay = day => setRepeatDays(current => current.includes(day) ? current.filter(item => item !== day) : [...current, day])
  const addDate = () => { if (nextDate && !selectedDates.includes(nextDate)) setSelectedDates(current => [...current, nextDate].sort()); setNextDate('') }
  const addRepeatingDates = () => {
    if (!repeatStart || !repeatEnd || (repeatFrequency !== 'daily' && !repeatDays.length)) { setMessage(`Choose a start date, end date${repeatFrequency === 'daily' ? '' : ', and at least one repeating day'}.`); return }
    const generated = generateRecurringLeagueDates({ startDate: repeatStart, endDate: repeatEnd, weekdays: repeatDays, frequency: repeatFrequency })
    if (!generated.length) { setMessage('No repeating dates matched that schedule. Check the date range and try again.'); return }
    setSelectedDates(current => [...new Set([...current, ...generated])].sort())
    setMessage(`${generated.length} repeating league date${generated.length === 1 ? '' : 's'} added. You can still add or remove individual dates.`)
  }
  const submit = async event => {
    event.preventDefault()
    if (!selectedLanes.length || !selectedDates.length) { setMessage('Select at least one lane and one league date.'); return }
    const form = new FormData(event.currentTarget)
    await onSaveLeague({ id: crypto.randomUUID(), name: String(form.get('name')), monthlyPrice: Number(form.get('monthlyPrice')), lanes: selectedLanes, dates: selectedDates, recurrence: repeatStart ? { weekdays: repeatDays, startDate: repeatStart, endDate: repeatEnd, frequency: repeatFrequency } : null, members: [] })
    event.currentTarget.reset()
    setSelectedLanes([]); setSelectedDates([]); setNextDate(''); setRepeatDays([]); setRepeatStart(''); setRepeatEnd(''); setRepeatFrequency('weekly')
    setMessage('League created. You can create another one below.')
  }
  const beginEdit = () => {
    setEditName(selectedLeague.name)
    setEditDates([...(selectedLeague.dates || [])])
    setEditNextDate('')
    setEditing(true)
    setConfirmDelete(false)
    setShowPasswordGenerator(false)
  }
  const addEditDate = () => {
    if (editNextDate && !editDates.includes(editNextDate)) setEditDates(current => [...current, editNextDate].sort())
    setEditNextDate('')
  }
  const saveLeagueChanges = async event => {
    event.preventDefault()
    if (!editDates.length) { setMessage('A league must have at least one date.'); return }
    await onUpdateLeague(selectedLeague.id, { name: editName.trim(), dates: editDates })
    setEditing(false)
    setMessage('League name and dates updated.')
  }
  const generatePasswords = async event => {
    event.preventDefault()
    setGeneratingPasswords(true)
    setMessage('')
    try {
      const codes = await onGeneratePasswords(selectedLeague.id, passwordCount)
      setGeneratedPasswords(codes)
      setMessage(`${codes.length} one-time league password${codes.length === 1 ? '' : 's'} generated.`)
    } catch (error) { setMessage(error.message) } finally { setGeneratingPasswords(false) }
  }
  const endMembership = async memberId => {
    await onEndMembership(selectedLeague.id, memberId)
    setMessage('League membership ended. This member is no longer included in monthly charges.')
  }
  const deleteSelectedLeague = async () => {
    await onDeleteLeague(selectedLeague.id)
    setSelectedLeagueId(null); setConfirmDelete(false); setMessage('League deleted.')
  }

  return <main className="league-page"><header><button onClick={onBack}>← Back to {managementOnly ? 'overview' : 'settings'}</button><strong>LANE CLUB</strong><span>League setup</span></header><section>
    {!managementOnly && <><p>LEAGUE MANAGEMENT</p><h1>Build a <em>league.</em></h1><span>Create as many leagues as your alley needs and reserve multiple lanes and dates.</span>
    <form onSubmit={submit}>
      <div className="league-fields"><label>League name<input name="name" required placeholder="Tuesday Night Strikers" /></label><label>Monthly price<input name="monthlyPrice" type="number" min="0" step="0.01" required placeholder="49.00" /></label></div>
      <fieldset><legend>Select as many lanes as needed</legend><div className="league-lanes">{Array.from({ length: Number(alley?.lanes) || 16 }, (_, index) => `Lane ${String(index + 1).padStart(2, '0')}`).map(lane => <label key={lane}><input type="checkbox" checked={selectedLanes.includes(lane)} onChange={() => toggleLane(lane)} /><span>{lane}</span></label>)}</div></fieldset>
      <fieldset><legend>Select individual league dates</legend><div className="league-date-add"><input type="date" min={localDate(today)} max={localDate(end)} value={nextDate} onChange={event => setNextDate(event.target.value)} /><button type="button" onClick={addDate}>Add date</button></div></fieldset>
      <fieldset className="league-repeat"><legend>Repeat selected lanes on a schedule <small>optional</small></legend><p>Generate recurring dates while keeping the manual date system above. Per month repeats on the matching numbered weekday, such as the second Tuesday.</p><div className="repeat-days">{weekdays.map(([label, day]) => <label key={day}><input type="checkbox" checked={repeatDays.includes(day)} disabled={repeatFrequency === 'daily'} onChange={() => toggleRepeatDay(day)} /><span>{label.slice(0, 3)}</span></label>)}</div><div className="repeat-controls"><label>Start date<input type="date" min={localDate(today)} max={localDate(end)} value={repeatStart} onChange={event => setRepeatStart(event.target.value)} /></label><label>End date<input type="date" min={repeatStart || localDate(today)} max={localDate(end)} value={repeatEnd} onChange={event => setRepeatEnd(event.target.value)} /></label><label>Repeat<select value={repeatFrequency} onChange={event => setRepeatFrequency(event.target.value)}><option value="daily">Per day</option><option value="weekly">Per week</option><option value="biweekly">Every 2 weeks</option><option value="monthly">Per month</option></select></label></div><button className="repeat-add" type="button" onClick={addRepeatingDates}>Add repeating dates</button></fieldset>
      <div className="selected-dates">{selectedDates.map(date => <button type="button" key={date} onClick={() => setSelectedDates(current => current.filter(item => item !== date))}>{new Date(`${date}T12:00:00`).toLocaleDateString()} ×</button>)}</div>
      <button className="league-save">Save league →</button>
    </form></>}

    <section className="league-list"><h2>Existing leagues</h2>{leagues.length ? leagues.map(league => <button className={league.id === selectedLeagueId ? 'selected' : ''} type="button" key={league.id} onClick={() => { setSelectedLeagueId(league.id); setConfirmDelete(false) }}><span><strong>{league.name}</strong><small>{(league.lanes || []).length} lanes · {(league.dates || []).length} dates · {activeLeagueMembers(league).length} active members</small></span><b>${Number(league.monthlyPrice).toFixed(2)}/month</b></button>) : <p>No leagues have been created yet.</p>}</section>

    {selectedLeague && <section className="league-details"><div className="league-detail-heading"><div><p>LEAGUE DETAILS</p><h2>{selectedLeague.name}</h2></div><div className="league-detail-actions">{confirmDelete ? <div className="delete-league-confirm"><button type="button" onClick={() => setConfirmDelete(false)}>Keep league</button><button type="button" onClick={deleteSelectedLeague}>Confirm delete</button></div> : <><button className="delete-league" type="button" onClick={() => { setConfirmDelete(true); setEditing(false); setShowPasswordGenerator(false) }}>Delete league</button><button className="edit-league" type="button" onClick={beginEdit}>Edit</button><button className="generate-password-button" type="button" onClick={() => { setShowPasswordGenerator(value => !value); setEditing(false) }}>Generate a password</button></>}</div></div>{showPasswordGenerator && <form className="league-password-generator" onSubmit={generatePasswords}><div><h3>One-time league passwords</h3><p>Each password can be used once and only for {selectedLeague.name}.</p></div><label>How many passwords?<input type="number" min="1" max="100" value={passwordCount} onChange={event => setPasswordCount(event.target.value)} required /></label><button disabled={generatingPasswords}>{generatingPasswords ? 'Generating…' : 'Generate'}</button>{generatedPasswords.length > 0 && <div className="generated-passwords">{generatedPasswords.map(code => <strong key={code}>{code}</strong>)}</div>}</form>}{editing && <form className="league-edit-form" onSubmit={saveLeagueChanges}><label>League name<input value={editName} onChange={event => setEditName(event.target.value)} required /></label><fieldset><legend>League dates</legend><div className="league-date-add"><input type="date" min={localDate(today)} max={localDate(end)} value={editNextDate} onChange={event => setEditNextDate(event.target.value)} /><button type="button" onClick={addEditDate}>Add date</button></div><div className="selected-dates">{editDates.map(date => <button type="button" key={date} onClick={() => setEditDates(current => current.filter(item => item !== date))}>{new Date(`${date}T12:00:00`).toLocaleDateString()} ×</button>)}</div></fieldset><div className="league-edit-actions"><button type="button" onClick={() => setEditing(false)}>Cancel</button><button type="submit">Save changes</button></div></form>}<div className="league-member-list"><h3>Every league member</h3>{(selectedLeague.members || []).length ? selectedLeague.members.map(leagueMember => { const ended = leagueMember.status === 'cancelled' || leagueMember.active === false; return <article key={leagueMember.id}><div><strong>{leagueMember.name}</strong><span>{leagueMember.email} · {leagueMember.phone}</span></div><b className={ended ? 'ended' : 'active'}>{ended ? 'Ended' : 'Active'}</b>{ended ? <small>{leagueMember.endedAt ? `Ended ${new Date(leagueMember.endedAt).toLocaleDateString()}` : 'Membership ended'}</small> : <button type="button" onClick={() => endMembership(leagueMember.id)}>End membership</button>}</article> }) : <p>No members have joined this league yet.</p>}</div></section>}
    {message && <p className="league-message league-management-message">{message}</p>}
  </section></main>
}
