export interface WeatherRecommendation {
  location: string;
  country: string;
  temperature: number;
  condition: string;
  isGoodWeather: boolean;
  code: number;
}

export const getWeatherRecommendation = async (lat: number, lng: number): Promise<{ temp: number; isGood: boolean; condition: string }> => {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
    );
    const data = await res.json();
    const weather = data.current_weather;

    // Weather code: 0 = Clear sky, 1-3 = Mainly clear/partly cloudy
    const isGood = weather.weathercode <= 3 && weather.temperature >= 18 && weather.temperature <= 32;

    const conditionMap: Record<number, string> = {
      0: "Sunny & Clear",
      1: "Mainly Clear",
      2: "Partly Cloudy",
      3: "Overcast",
    };

    return {
      temp: Math.round(weather.temperature),
      isGood,
      condition: conditionMap[weather.weathercode] || "Fair",
    };
  } catch (error) {
    return { temp: 24, isGood: true, condition: "Sunny" }; // Graceful fallback
  }
};