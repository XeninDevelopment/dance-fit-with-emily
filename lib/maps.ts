// Builds a universal Google Maps directions link from a free-text location.
// On phones this opens the Maps app (iOS/Android) ready to navigate; on desktop it
// opens Google Maps in the browser. Google Maps is available on every platform, so a
// single link works everywhere; from there the user can navigate in their app of choice.
export function mapsDirectionsUrl(location: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;
}
