export const businessDays = [
  ['monday', 'Monday'],
  ['tuesday', 'Tuesday'],
  ['wednesday', 'Wednesday'],
  ['thursday', 'Thursday'],
  ['friday', 'Friday'],
  ['saturday', 'Saturday'],
  ['sunday', 'Sunday'],
]

const defaultHours = {
  monday: { open: '11:00', close: '23:00', closed: false },
  tuesday: { open: '11:00', close: '23:00', closed: false },
  wednesday: { open: '11:00', close: '23:00', closed: false },
  thursday: { open: '11:00', close: '23:00', closed: false },
  friday: { open: '11:00', close: '00:00', closed: false },
  saturday: { open: '11:00', close: '00:00', closed: false },
  sunday: { open: '11:00', close: '23:00', closed: false },
}

const parseLegacyTime = (value, fallback) => {
  const text = String(value || '').trim()
  if (/^\d{2}:\d{2}$/.test(text)) return text
  const match = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return fallback
  let hour = Number(match[1]) % 12
  if (match[3].toUpperCase() === 'PM') hour += 12
  return `${String(hour).padStart(2, '0')}:${match[2]}`
}

export function normalizeBusinessHours(alley = {}) {
  const legacyOpen = parseLegacyTime(alley.openingTime, '11:00')
  const legacyClose = parseLegacyTime(alley.closingTime, '23:00')
  return Object.fromEntries(businessDays.map(([key]) => {
    const fallback = { ...defaultHours[key] }
    if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(key)) {
      fallback.open = legacyOpen
      fallback.close = legacyClose
    }
    const saved = alley.businessHours?.[key]
    return [key, {
      open: saved?.open || fallback.open,
      close: saved?.close || fallback.close,
      closed: Boolean(saved?.closed),
    }]
  }))
}

export function formatBusinessTime(value) {
  const [hourValue, minute = '00'] = String(value || '00:00').split(':')
  const hour = Number(hourValue)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}${minute === '00' ? '' : `:${minute}`} ${suffix}`
}

export function formatDayHours(dayHours) {
  if (!dayHours || dayHours.closed) return 'Closed'
  return `${formatBusinessTime(dayHours.open)} – ${formatBusinessTime(dayHours.close)}`
}

export function currentBusinessDay(date = new Date()) {
  return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()]
}
