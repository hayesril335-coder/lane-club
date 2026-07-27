export function getRemainingWeeklyHours(usedHours, weeklyAllowance = 4) {
  return Math.max(0, weeklyAllowance - usedHours)
}
