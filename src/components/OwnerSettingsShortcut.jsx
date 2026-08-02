import './OwnerSettingsShortcut.css'

export default function OwnerSettingsShortcut({ onClick }) {
  return <button className="owner-settings-shortcut" onClick={onClick} aria-label="Open owner settings">⚙ Settings</button>
}
