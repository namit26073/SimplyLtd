/** Hands off to the visitor's maps app by address — more reliable than raw coordinates for a food-truck pitch. */
export function directionsUrl(addressLines: readonly string[], postcode: string): string {
  const destination = [...addressLines, postcode].join(", ");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
