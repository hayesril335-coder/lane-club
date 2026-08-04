import { localDate } from './reservations.js'

export const activeLeagueMembers = league => (league?.members || []).filter(member => member.status !== 'cancelled' && member.active !== false)

export function generateRecurringLeagueDates({ startDate, endDate, weekdays, everyWeeks = 1 }) {
  if (!startDate || !endDate || !weekdays?.length) return []
  const start = new Date(`${startDate}T12:00:00`)
  const finish = new Date(`${endDate}T12:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(finish.getTime()) || finish < start) return []
  const generated = []
  for (const date = new Date(start); date <= finish; date.setDate(date.getDate() + 1)) {
    const daysFromStart = Math.floor((date - start) / 86400000)
    const weekIndex = Math.floor(daysFromStart / 7)
    if (weekdays.includes(date.getDay()) && weekIndex % Math.max(1, everyWeeks) === 0) generated.push(localDate(date))
  }
  return generated
}
