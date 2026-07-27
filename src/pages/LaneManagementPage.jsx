import { useState } from 'react'
import './LaneManagementPage.css'

const startingLanes = Array.from({ length: 16 }, (_, index) => ({ id: index + 1, name: `Lane ${index + 1}`, status: index === 5 ? 'Maintenance' : index < 4 ? 'In use' : 'Available', reservation: '' }))

export default function LaneManagementPage({ onBack }) {
  const [lanes, setLanes] = useState(startingLanes)
  const [filter, setFilter] = useState('All lanes')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [laneName, setLaneName] = useState('')
  const visible = lanes.filter(lane => filter === 'All lanes' || lane.status === filter)
  const addLane = () => {
    const next = lanes.length + 1
    const lane = { id: next, name: `Lane ${next}`, status: 'Available', reservation: '' }
    setLanes(current => [...current, lane])
    setEditing(lane)
    setLaneName(lane.name)
  }
  const updateStatus = (status) => {
    setLanes(current => current.map(lane => lane.id === selected.id ? { ...lane, status } : lane))
    setSelected(current => ({ ...current, status }))
  }
  const editLane = (lane) => { setEditing(lane); setLaneName(lane.name); setSelected(null) }
  const saveLane = (event) => { event.preventDefault(); setLanes(current => current.map(lane => lane.id === editing.id ? { ...lane, name: laneName || lane.name } : lane)); setEditing(null) }
  if (editing) return <main className="lanes-page"><section className="lanes-content"><button className="reservation-back" onClick={() => setEditing(null)}>← Back to lane management</button><div className="settings-panel"><div className="settings-heading"><h2>Edit lane details</h2><p>Update how this lane appears to members and staff.</p></div><form className="settings-fields" onSubmit={saveLane}><label>Lane name<input value={laneName} onChange={event => setLaneName(event.target.value)} required /></label><label>Lane number<input value={editing.id} disabled /></label><button className="settings-save">Save lane details</button></form></div></section></main>
  return <main className="lanes-page"><aside className="lanes-nav"><a className="brand dash-brand" href="#owner-dashboard" onClick={(event) => { event.preventDefault(); onBack() }}><span className="brand-mark"><i /><i /><i /></span>LANE CLUB</a><div className="alley-switch"><span>SL</span><div><strong>Sunset Lanes</strong><small>Owner account</small></div></div><nav><button onClick={onBack}>Overview</button><button>Members <span>148</span></button><button>Reservations</button><button className="selected">Lanes</button></nav></aside><section className="lanes-content"><header className="lanes-header"><div><p>LANE MANAGEMENT</p><h1>Your <em>lanes.</em></h1><span>Manage availability and lane details.</span></div><button className="lane-add" onClick={addLane}>+ Add lane</button></header><div className="lanes-toolbar"><div className="lane-count"><strong>{lanes.length}</strong> total lanes <b>•</b> <span>{lanes.filter(lane => lane.status === 'Available').length} available now</span></div><div className="lane-filters">{['All lanes', 'Available', 'In use', 'Maintenance'].map(item => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="lanes-grid">{visible.map(lane => <button className={`lane-tile ${lane.status.toLowerCase().replace(' ', '-')}`} key={lane.id} onClick={() => setSelected(lane)}><small>LANE</small><strong>{String(lane.id).padStart(2, '0')}</strong><span className="lane-tile-status">{lane.status}</span><p>{lane.name}</p></button>)}</div></section>{selected && <div className="lane-drawer-backdrop" onClick={() => setSelected(null)}><aside className="lane-drawer" onClick={event => event.stopPropagation()}><button className="drawer-close" onClick={() => setSelected(null)}>×</button><p>LANE DETAILS</p><h2>{selected.name}</h2><div className={`drawer-status ${selected.status.toLowerCase().replace(' ', '-')}`}>{selected.status}</div><div className="status-controls"><p>Change status</p><button onClick={() => updateStatus('Available')}>Mark available</button><button onClick={() => updateStatus('Maintenance')}>Set maintenance</button><button onClick={() => updateStatus('In use')}>Mark in use</button></div><button className="edit-lane" onClick={() => editLane(selected)}>Edit lane details</button></aside></div>}</main>
}
