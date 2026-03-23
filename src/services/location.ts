/**
 * Reverse Geocoding: Koordinatları adrese çevirme
 */

export interface AddressResult {
  city?: string;
  country?: string;
  formatted?: string;
}

const reverseGeocodeCache = new Map<string, AddressResult | null>();

export async function reverseGeocode(
  lat: number,
  lon: number,
  language: "tr" | "en" = "tr",
): Promise<AddressResult | null> {
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)},${language}`;
  if (reverseGeocodeCache.has(cacheKey)) {
    return reverseGeocodeCache.get(cacheKey) ?? null;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Language": language === "tr" ? "tr,en;q=0.8" : "en,tr;q=0.8",
      },
    });

    if (!res.ok) {
      reverseGeocodeCache.set(cacheKey, null);
      return null;
    }

    const contentType = res.headers.get("content-type") ?? "";
    const bodyText = await res.text();

    if (!contentType.includes("application/json")) {
      reverseGeocodeCache.set(cacheKey, null);
      return null;
    }

    const data = JSON.parse(bodyText);

    if (!data.address) {
      reverseGeocodeCache.set(cacheKey, null);
      return null;
    }

    const { city, town, village, municipality, state, country } = data.address;
    const cityName =
      city ??
      town ??
      village ??
      municipality ??
      state ??
      (language === "tr" ? "Bilinmeyen" : "Unknown");

    const result = {
      city: cityName,
      country: country,
      formatted: data.display_name ?? `${cityName}, ${country}`,
    };

    reverseGeocodeCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.warn(
      "Reverse geocode skipped:",
      (error as Error)?.message ?? error,
    );
    reverseGeocodeCache.set(cacheKey, null);
    return null;
  }
}
