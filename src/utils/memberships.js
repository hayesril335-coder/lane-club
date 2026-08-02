const key = value => String(value ?? '')

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

export function memberForAlley(member, alley) {
  const reservations = reservationsForAlley(member, alley)
  const usedHours = reservations.reduce((total, reservation) => total + Number(reservation.duration || reservation.durationHours || 0), 0)
  return { ...member, reservations, usedHours, hasMembership: hasMembershipAt(member, alley) }
}
