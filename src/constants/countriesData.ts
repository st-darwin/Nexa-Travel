export interface CountryData {
  text: string;
  value: string;
  coordinates: number[];
  openStreetmap?: string;
}

export const FALLBACK_COUNTRIES: CountryData[] = [
  { text: "🇦🇫 Afghanistan", value: "AF", coordinates: [33, 65] },
  { text: "🇦🇱 Albania", value: "AL", coordinates: [41, 20] },
  { text: "🇩🇿 Algeria", value: "DZ", coordinates: [28, 3] },
  { text: "🇦🇩 Andorra", value: "AD", coordinates: [42.5, 1.5] },
  { text: "🇦🇴 Angola", value: "AO", coordinates: [-12.5, 18.5] },
  { text: "🇦🇷 Argentina", value: "AR", coordinates: [-34, -64] },
  { text: "🇦🇺 Australia", value: "AU", coordinates: [-27, 133] },
  { text: "🇦🇹 Austria", value: "AT", coordinates: [47.33, 13.33] },
  { text: "🇧🇷 Brazil", value: "BR", coordinates: [-10, -55] },
  { text: "🇨🇦 Canada", value: "CA", coordinates: [60, -95] },
  { text: "🇨🇳 China", value: "CN", coordinates: [35, 104] },
  { text: "🇪🇬 Egypt", value: "EG", coordinates: [27, 30] },
  { text: "🇫🇷 France", value: "FR", coordinates: [46, 2] },
  { text: "🇩🇪 Germany", value: "DE", coordinates: [51, 9] },
  { text: "🇬🇭 Ghana", value: "GH", coordinates: [8, -2] },
  { text: "🇮🇳 India", value: "IN", coordinates: [20, 77] },
  { text: "🇮🇩 Indonesia", value: "ID", coordinates: [-5, 120] },
  { text: "🇮🇹 Italy", value: "IT", coordinates: [42.83, 12.83] },
  { text: "🇯🇵 Japan", value: "JP", coordinates: [36, 138] },
  { text: "🇰🇪 Kenya", value: "KE", coordinates: [1, 38] },
  { text: "🇳🇬 Nigeria", value: "NG", coordinates: [10, 8] },
  { text: "🇿🇦 South Africa", value: "ZA", coordinates: [-29, 24] },
  { text: "🇪🇸 Spain", value: "ES", coordinates: [40, -4] },
  { text: "🇬🇧 United Kingdom", value: "GB", coordinates: [54, -2] },
  { text: "🇺🇸 United States", value: "US", coordinates: [38, -97] },
].sort((a, b) => a.text.localeCompare(b.text));