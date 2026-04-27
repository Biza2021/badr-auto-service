export function displayStaffName(name: string | null | undefined) {
  if (!name) return "Équipe";
  const legacyAdminName = ["Badr", "El", "Amrani"].join(" ");
  return name === legacyAdminName ? "Badr" : name;
}
