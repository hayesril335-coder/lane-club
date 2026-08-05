const key = value => String(value ?? '')
const cycleLengthMs = 7 * 24 * 60 * 60 * 1000

export function membershipAlleyIds(member) {
  const ids = Array.isArray(member?.membershipAlleyIds) ? [...member.membershipAlleyIds] : []
  if (member?.membershipAlleyId !== undefined && member?.membershipAlleyId !== null) ids.push(member.membershipAlleyId)
  return [...new Map(ids.filter(id => key(id)).map(id => [key(id), id])).values()]
}

export function hasMembershipAt(member, alley) {
  return membershipAlleyIds(member).some(id => key(id) === key(alley?.id))
}

export function reservationsForAlley(member, alley) {
  const alleyId = key(alley?.id)
  const legacyAlleyId = key(member?.membershipAlleyId)
  return (member?.reservations || []).filter(reservation => {
    if (reservation.alleyId !== undefined && reservation.alleyId !== null) return key(reservation.alleyId) === alleyId
    return legacyAlleyId ? legacyAlleyId === alleyId : false
  })
}

export function membershipStartedAt(member, alley) {
  const saved = member?.membershipStartedAtByAlley?.[key(alley?.id)] || member?.membershipStartedAt
  const parsed = new Date(saved || 0)
  return Number.isNaN(parsed.getTime()) || !saved ? null : parsed
}

export function membershipCycle(member, alley, now = new Date()) {
  const startedAt = membershipStartedAt(member, alley) || new Date(now)
  const nowTime = now.getTime()
  const elapsed = Math.max(0, nowTime - startedAt.getTime())
  const cycleNumber = Math.floor(elapsed / cycleLengthMs)
  const start = new Date(startedAt.getTime() + cycleNumber * cycleLengthMs)
  const end = new Date(start.getTime() + cycleLengthMs)
  return { start, end }
}

const reservationMoment = reservation => {
  if (reservation.startsAt) return new Date(reservation.startsAt)
  if (/^\d{4}-\d{2}-\d{2}$/.test(reservation.date || '')) {
    const match = String(reservation.time || '').match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i)
    const date = new Date(`${reservation.date}T00:00:00`)
    if (match && !Number.isNaN(date.getTime())) {
      let hour = Number(match[1]) % 12
      if (match[3]?.toUpperCase() === 'PM') hour += 12
      date.setHours(hour, Number(match[2] || 0), 0, 0)
      return date
    }
  }
  return new Date(reservation.createdAt || 0)
}

export function memberForAlley(member, alley, now = new Date()) {
  const reservations = reservationsForAlley(member, alley)
  const cycle = membershipCycle(member, alley, now)
  const cycleReservations = reservations.filter(reservation => {
    const moment = reservationMoment(reservation)
    return !Number.isNaN(moment.getTime()) && moment >= cycle.start && moment < cycle.end
  })
  const usedHours = cycleReservations.reduce((total, reservation) => total + Number(reservation.duration || reservation.durationHours || 0), 0)
  return { ...member, reservations, cycleReservations, usedHours, membershipCycleStart: cycle.start.toISOString(), membershipCycleEnd: cycle.end.toISOString(), hasMembership: hasMembershipAt(member, alley) }
}
