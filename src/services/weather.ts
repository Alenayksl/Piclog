const OPENWEATHER_API_KEY = (
  process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY ?? ""
).trim();

export interface WeatherData {
  temp: number;
  description: string;
  icon: string;
}

export async function getWeather(
  lat: number,
  lon: number,
): Promise<WeatherData | null> {
  if (!OPENWEATHER_API_KEY) {
    console.warn("OpenWeatherMap API key not configured");
    return null;
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=tr`,
    );
    const data = await res.json();
    const code = Number(data?.cod ?? res.status);
    if (!res.ok || code !== 200) {
      console.warn("Weather API non-200 response:", {
        status: res.status,
        cod: data?.cod,
        message: data?.message,
      });
      return null;
    }

    if (typeof data?.main?.temp !== "number") {
      console.warn("Weather API payload missing temp:", data);
      return null;
    }

    return {
      temp: Math.round(data.main.temp),
      description: data.weather[0]?.description ?? "",
      icon: data.weather[0]?.icon ?? "",
    };
  } catch (error) {
    console.error("Weather API error:", error);
    return null;
  }
}
