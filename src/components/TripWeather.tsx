import React, { useEffect, useState } from 'react';

interface WeatherData {
  currentTemp: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  forecast: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
  }>;
}

interface TripWeatherProps {
  destinationCity: string;
}

// Maps WMO Weather Interpretation Codes to friendly text & icons
const getWeatherDescription = (code: number) => {
  if (code === 0) return { label: 'Clear Sky', icon: '☀️' };
  if (code >= 1 && code <= 3) return { label: 'Partly Cloudy', icon: '⛅' };
  if (code >= 45 && code <= 48) return { label: 'Foggy', icon: '🌫️' };
  if (code >= 51 && code <= 67) return { label: 'Rain / Drizzle', icon: '🌧️' };
  if (code >= 71 && code <= 77) return { label: 'Snowfall', icon: '❄️' };
  if (code >= 80 && code <= 82) return { label: 'Rain Showers', icon: '🌦️' };
  if (code >= 95) return { label: 'Thunderstorm', icon: '⛈️' };
  return { label: 'Overcast', icon: '☁️' };
};

export const TripWeather: React.FC<TripWeatherProps> = ({ destinationCity }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Geocode destination city name to Lat/Long via Open-Meteo Geocoding API
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destinationCity)}&count=1&language=en&format=json`
        );
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
          throw new Error(`Coordinates not found for ${destinationCity}`);
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // 2. Fetch current weather + 3-day daily forecast
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`
        );
        const weatherData = await weatherRes.json();

        if (isMounted) {
          const current = weatherData.current;
          const daily = weatherData.daily;

          const forecastDays = daily.time.slice(1, 4).map((timeStr: string, idx: number) => ({
            date: new Date(timeStr).toLocaleDateString('en-US', { weekday: 'short' }),
            maxTemp: Math.round(daily.temperature_2m_max[idx + 1]),
            minTemp: Math.round(daily.temperature_2m_min[idx + 1]),
            weatherCode: daily.weather_code[idx + 1],
          }));

          setWeather({
            currentTemp: Math.round(current.temperature_2m),
            weatherCode: current.weather_code,
            windSpeed: Math.round(current.wind_speed_10m),
            humidity: current.relative_humidity_2m,
            forecast: forecastDays,
          });
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to sync weather.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (destinationCity) {
      fetchWeather();
    }

    return () => {
      isMounted = false;
    };
  }, [destinationCity]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center justify-center min-h-[160px]">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
          <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          SYNCING ATMOSPHERIC TELEMETRY...
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm text-xs font-mono text-slate-400">
        Weather telemetry unavailable for {destinationCity}.
      </div>
    );
  }

  const currentCondition = getWeatherDescription(weather.weatherCode);

  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-mono block">
            Destination Climate
          </span>
          <h4 className="text-sm font-black text-slate-900 tracking-tight">{destinationCity}</h4>
        </div>
        <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-[10px] font-mono font-bold text-slate-600">
          Live Sync
        </span>
      </div>

      {/* Current Conditions */}
      <div className="flex items-center justify-between bg-slate-50/70 border border-slate-100 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{currentCondition.icon}</span>
          <div>
            <div className="text-2xl font-black font-mono text-slate-900">
              {weather.currentTemp}°C
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              {currentCondition.label}
            </span>
          </div>
        </div>

        <div className="text-right space-y-0.5 text-[10px] font-mono text-slate-500">
          <div>Humidity: <span className="font-bold text-slate-800">{weather.humidity}%</span></div>
          <div>Wind: <span className="font-bold text-slate-800">{weather.windSpeed} km/h</span></div>
        </div>
      </div>

      {/* 3-Day Outlook */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {weather.forecast.map((day, i) => {
          const condition = getWeatherDescription(day.weatherCode);
          return (
            <div key={i} className="bg-slate-50/40 border border-slate-100 p-2.5 rounded-xl text-center space-y-1">
              <span className="text-[9px] font-bold uppercase font-mono text-slate-400 block">{day.date}</span>
              <span className="text-lg block">{condition.icon}</span>
              <div className="text-[11px] font-bold font-mono text-slate-800">
                {day.maxTemp}° <span className="text-slate-400 text-[9px] font-normal">{day.minTemp}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};