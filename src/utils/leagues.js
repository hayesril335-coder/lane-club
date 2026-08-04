import { localDate } from './reservations.js'

export const activeLeagueMembers = league => (league?.members || []).filter(member => member.status !== 'cancelled' && member.active !== false)

export function generateRecurringLeagueDates({ startDate, endDate, weekdays = [], frequency = 'weekly', everyWeeks }) {
  if (!startDate || !endDate || (frequency !== 'daily' && !weekdays.length)) return []
  const start = new Date(`${startDate}T12:00:00`)
  const finish = new Date(`${endDate}T12:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(finish.getTime()) || finish < start) return []
  if (frequency === 'monthly') {
    const ordinal = Math.ceil(start.getDate() / 7)
    const generated = []
    for (const month = new Date(start.getFullYear(), start.getMonth(), 1, 12); month <= finish; month.setMonth(month.getMonth() + 1)) {
      weekdays.forEach(weekday => {
        const firstDayOffset = (weekday - month.getDay() + 7) % 7
        const date = new Date(month.getFullYear(), month.getMonth(), 1 + firstDayOffset + ((ordinal - 1) * 7), 12)
        if (date.getMonth() === month.getMonth() && date >= start && date <= finish) generated.push(localDate(date))
      })
    }
    return [...new Set(generated)].sort()
  }
  const generated = []
  const weekInterval = everyWeeks || (frequency === 'biweekly' ? 2 : 1)
  for (const date = new Date(start); date <= finish; date.setDate(date.getDate() + 1)) {
    const daysFromStart = Math.floor((date - start) / 86400000)
    const weekIndex = Math.floor(daysFromStart / 7)
    if (frequency === 'daily' || (weekdays.includes(date.getDay()) && weekIndex % weekInterval === 0)) generated.push(localDate(date))
  }
  return generated
}
