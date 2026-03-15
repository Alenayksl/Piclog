/**
 * Reverse Geocoding: Koordinatları adrese çevirme
 */

export interface AddressResult {
  city?: string;
  country?: string;
  formatted?: string;
}

export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<AddressResult | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`
    );
    const data = await res.json();

    if (!data.address) return null;

    const { city, town, village, municipality, state, country } = data.address;
    const cityName = city ?? town ?? village ?? municipality ?? state ?? 'Bilinmeyen';

    return {
      city: cityName,
      country: country,
      formatted: data.display_name ?? `${cityName}, ${country}`,
    };
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return null;
  }
}
