// Temporary local-preview setting. Set to false before production.
export const DEMO_ALL_MEMBERSHIPS = true

export function hasActiveMembership() {
  return DEMO_ALL_MEMBERSHIPS
}
