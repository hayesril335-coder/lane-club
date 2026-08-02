export const localDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export function reservationStartHour(reservation) {
  if (reservation.startsAt) return new Date(reservation.startsAt).getHours()
  const match = String(reservation.time || '').match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i)
  if (!match) return 0
  let hour = Number(match[1]) % 12
  if (match[3]?.toUpperCase() === 'PM') hour += 12
  return hour
}

export function reservationDuration(reservation) {
  return Number.parseFloat(reservation.durationHours ?? reservation.hours ?? reservation.duration ?? 1) || 1
}

export function reservationDate(reservation) {
  return reservation.date || (reservation.createdAt ? localDate(new Date(reservation.createdAt)) : localDate(new Date()))
}

export function reservationEndsAt(reservation) {
  if (reservation.endsAt) return new Date(reservation.endsAt)
  const match = String(reservation.time || '').match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i)
  const start = new Date(`${reservationDate(reservation)}T00:00:00`)
  if (!match || Number.isNaN(start.getTime())) return null
  start.setHours(reservationStartHour(reservation), Number(match[2] || 0), 0, 0)
  return new Date(start.getTime() + reservationDuration(reservation) * 3600000)
}

export function isReservationActive(reservation, now = new Date()) {
  const end = reservationEndsAt(reservation)
  return !end || end.getTime() >= now.getTime()
}
