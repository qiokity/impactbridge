export function isOrganizationManagerMembership(role: string | null | undefined) {
  return role === "ORGANIZATION_REP" || role === "ADMIN";
}
