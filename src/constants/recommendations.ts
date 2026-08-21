export interface RecommendationActivity {
  time: string;
  description: string;
}

export interface RecommendationItineraryDay {
  day: number;
  title: string;
  location: string;
  activities: RecommendationActivity[];
}

export interface RecommendationTrip {
  id: string;
  name: string;
  country: string;
  location: string;
  duration: number;
  travelStyle: string;
  budget: string;
  groupType: string;
  interests: string;
  estimatedPrice: string;
  imageUrl: string;      
  imageUrls: string[];   
  weatherTemp: string;
  weatherCondition: string;
  description: string;
  tags: string[];
  bestTimeToVisit: string[];
  weatherInfo: string[];
  itinerary: RecommendationItineraryDay[];
  
  // NEW: Added missing flight fields to fix Appwrite null errors
  seatClass?: string;
  arrivalAirport?: string;
  departureAirport?: string;
  flightNumber?: string;
  arrivalTime?: string;
  departureTime?: string;
}

/**
 * Helper function to fetch/resolve an image directly from the browser based on the country.
 */
export const getCountryImageUrl = (country: string): string => {
  const countryImageMap: Record<string, string> = {
    Greece: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
    Italy: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
    Japan: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    Indonesia: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    Switzerland: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
    "United Arab Emirates": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    "South Africa": "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80",
    Iceland: "https://images.unsplash.com/photo-1504893524553-eefd5dffe0f1?auto=format&fit=crop&w=800&q=80",
    Canada: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80",
    Maldives: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
    Spain: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80",
    Peru: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80",
    "New Zealand": "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80",
    Morocco: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80"
  };

  return countryImageMap[country] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";
};

// Example of updating your BROWSE_RECOMMENDATIONS array with the new fields
export const BROWSE_RECOMMENDATIONS: RecommendationTrip[] = [
  {
    id: "rec-santorini-1",
    name: "Aegean Sunset & Coastal Escape",
    country: "Greece",
    location: "Santorini",
    duration: 5,
    travelStyle: "Relaxed",
    budget: "Luxury",
    groupType: "Couple",
    interests: "Beaches & Culinary",
    estimatedPrice: "$3,200",
    imageUrl: getCountryImageUrl("Greece"),
    imageUrls: [
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "26°C",
    weatherCondition: "Sunny & Clear",
    description: "Experience iconic whitewashed cliffside architecture, volcanic black sand beaches, catamarans on the Caldera, and world-class Mediterranean wine dining.",
    tags: ["Beach", "Luxury", "Views"],
    bestTimeToVisit: [
      "Late April to early November for warm sea temperatures.",
      "May and September offer peak climate with fewer tourist crowds."
    ],
    weatherInfo: [
      "Average high of 26°C during peak summer months.",
      "Low humidity accompanied by soft Aegean sea breezes."
    ],
    // NEW: Mock flight details to satisfy Appwrite
    seatClass: "Economy",
    departureAirport: "LOS",
    arrivalAirport: "JTR",
    flightNumber: "GR-404",
    departureTime: "08:00 AM",
    arrivalTime: "04:30 PM",
      itinerary: [
      {
        day: 1,
        title: "Arrival & Oia Cliffside Settling",
        location: "Oia",
        activities: [
          { time: "02:00 PM", description: "Private luxury transfer and check-in to a traditional cave villa overlooking the Caldera." },
          { time: "06:30 PM", description: "Sunset cocktail viewing at Oia Castle followed by fresh seafood dining." }
        ]
      },
      {
        day: 2,
        title: "Catamaran Sailing & Red Beach",
        location: "Red Beach",
        activities: [
          { time: "10:00 AM", description: "Board a semi-private luxury catamaran sailing past Akrotiri lighthouse." },
          { time: "01:30 PM", description: "Snorkeling at the volcanic Red Beach and hot springs barbecue buffet." }
        ]
      },
      {
        day: 3,
        title: "Volcanic Wine Tasting & History",
        location: "Pyrgos",
        activities: [
          { time: "09:30 AM", description: "Guided archaeological tour of the ancient Minoan city of Akrotiri." },
          { time: "04:00 PM", description: "Sommelier-led wine tasting at Santo Wines overlooking the Aegean volcano." }
        ]
      },
      {
        day: 4,
        title: "Fira Exploration & Cable Car",
        location: "Fira",
        activities: [
          { time: "11:00 AM", description: "Explore local artisan boutiques and art galleries in Fira's narrow pathways." },
          { time: "05:00 PM", description: "Scenic cable car descent down to Old Port for sunset dining." }
        ]
      },
      {
        day: 5,
        title: "Leisure Morning & Departure",
        location: "Oia",
        activities: [
          { time: "09:00 AM", description: "Early morning cliff walk and breakfast on your private terrace." },
          { time: "01:00 PM", description: "Souvenir collection and airport transfer." }
        ]
      }
    ]
  },



  {
    id: "rec-paris-2",
    name: "City of Light & Romance",
    country: "France",
    location: "Paris",
    duration: 4,
    travelStyle: "Cultural",
    budget: "Mid-range",
    groupType: "Couple",
    interests: "Art & History",
    estimatedPrice: "$2,100",
    imageUrl: getCountryImageUrl("France"),
    imageUrls: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "18°C",
    weatherCondition: "Partly Cloudy",
    description: "Stroll along the Seine, visit world-renowned museums, and enjoy fresh croissants at a sidewalk café in the heart of Paris.",
    tags: ["City", "Romance", "Food"],
    bestTimeToVisit: [
      "April to June for pleasant spring weather.",
      "September to October to avoid heavy summer crowds."
    ],
    weatherInfo: [
      "Average highs around 20°C in spring.",
      "Occasional light showers, so pack a light jacket."
    ],
    seatClass: "Economy",
    departureAirport: "LOS",
    arrivalAirport: "CDG",
    flightNumber: "AF-123",
    departureTime: "11:00 PM",
    arrivalTime: "06:15 AM",
    itinerary: []
  },
  {
    id: "rec-kyoto-3",
    name: "Ancient Temples & Zen Gardens",
    country: "Japan",
    location: "Kyoto",
    duration: 7,
    travelStyle: "Relaxed",
    budget: "Luxury",
    groupType: "Solo",
    interests: "Culture & Nature",
    estimatedPrice: "$4,500",
    imageUrl: getCountryImageUrl("Japan"),
    imageUrls: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "22°C",
    weatherCondition: "Clear",
    description: "Immerse yourself in traditional Japanese culture, exploring tranquil bamboo groves, historic shrines, and elegant tea houses.",
    tags: ["Culture", "Nature", "Photography"],
    bestTimeToVisit: [
      "March to May for the iconic cherry blossoms.",
      "Late October to November for striking autumn foliage."
    ],
    weatherInfo: [
      "Mild and pleasant temperatures during spring and autumn.",
      "Summers can be highly humid."
    ],
    seatClass: "Business",
    departureAirport: "LOS",
    arrivalAirport: "KIX",
    flightNumber: "QR-802",
    departureTime: "01:30 PM",
    arrivalTime: "04:45 PM",
    itinerary: []
  },
  {
    id: "rec-capetown-4",
    name: "Table Mountain & Wine Valleys",
    country: "South Africa",
    location: "Cape Town",
    duration: 6,
    travelStyle: "Adventurous",
    budget: "Mid-range",
    groupType: "Friends",
    interests: "Nature & Wine",
    estimatedPrice: "$1,800",
    imageUrl: getCountryImageUrl("South Africa"),
    imageUrls: [
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1576485290814-1c72aa4faa8e?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "24°C",
    weatherCondition: "Sunny",
    description: "Hike up Table Mountain for panoramic views, visit the penguins at Boulders Beach, and sip world-class wine in Stellenbosch.",
    tags: ["Adventure", "Wine", "Wildlife"],
    bestTimeToVisit: [
      "December to February for prime summer beach weather.",
      "March to May for great hiking conditions and fewer winds."
    ],
    weatherInfo: [
      "Dry, warm summers with temperatures hovering around 26°C.",
      "Expect the famous 'Cape Doctor' southeast wind in early summer."
    ],
    seatClass: "Economy",
    departureAirport: "LOS",
    arrivalAirport: "CPT",
    flightNumber: "SA-055",
    departureTime: "09:15 AM",
    arrivalTime: "03:45 PM",
    itinerary: []
  },
  {
    id: "rec-bali-5",
    name: "Tropical Jungle & Spiritual Retreat",
    country: "Indonesia",
    location: "Bali",
    duration: 8,
    travelStyle: "Relaxed",
    budget: "Budget",
    groupType: "Solo",
    interests: "Wellness & Nature",
    estimatedPrice: "$1,200",
    imageUrl: getCountryImageUrl("Indonesia"),
    imageUrls: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "28°C",
    weatherCondition: "Humid",
    description: "Find your zen among the lush rice terraces of Ubud, sacred monkey forests, and stunning cliffside water temples.",
    tags: ["Wellness", "Budget", "Tropical"],
    bestTimeToVisit: [
      "April to October during the dry season.",
      "May is ideal for surfing and diving."
    ],
    weatherInfo: [
      "Consistent year-round temperatures around 28-30°C.",
      "High humidity, especially during the rainy season (Nov-March)."
    ],
    seatClass: "Economy",
    departureAirport: "LOS",
    arrivalAirport: "DPS",
    flightNumber: "EK-398",
    departureTime: "06:00 PM",
    arrivalTime: "10:20 PM",
    itinerary: []
  },
  {
    id: "rec-nyc-6",
    name: "The Concrete Jungle Experience",
    country: "United States",
    location: "New York City",
    duration: 5,
    travelStyle: "Fast-paced",
    budget: "Luxury",
    groupType: "Friends",
    interests: "Shopping & Nightlife",
    estimatedPrice: "$3,500",
    imageUrl: getCountryImageUrl("United States"),
    imageUrls: [
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "15°C",
    weatherCondition: "Breezy",
    description: "Take a bite out of the Big Apple with Broadway shows, high-end shopping on Fifth Avenue, and walks through Central Park.",
    tags: ["City", "Shopping", "Nightlife"],
    bestTimeToVisit: [
      "April to June for mild weather and blooming parks.",
      "December for iconic holiday window displays and ice skating."
    ],
    weatherInfo: [
      "Distinct seasons with hot summers and snowy winters.",
      "Spring offers the most comfortable walking weather."
    ],
    seatClass: "Premium Economy",
    departureAirport: "LOS",
    arrivalAirport: "JFK",
    flightNumber: "DL-215",
    departureTime: "11:30 AM",
    arrivalTime: "06:00 PM",
    itinerary: []
  },
  {
    id: "rec-dubai-7",
    name: "Desert Safaris & Skyline Glamour",
    country: "United Arab Emirates",
    location: "Dubai",
    duration: 4,
    travelStyle: "Luxurious",
    budget: "Luxury",
    groupType: "Family",
    interests: "Architecture & Adventure",
    estimatedPrice: "$4,100",
    imageUrl: getCountryImageUrl("United Arab Emirates"),
    imageUrls: [
      "https://images.unsplash.com/photo-1512453979436-5a50ce8c5251?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582672060624-cdac16e1145b?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "32°C",
    weatherCondition: "Hot & Sunny",
    description: "Marvel at the Burj Khalifa, shop in the world's largest malls, and experience thrilling dune bashing in the Arabian desert.",
    tags: ["Luxury", "Family", "Architecture"],
    bestTimeToVisit: [
      "November to March for cooler, more tolerable temperatures.",
      "January for the annual Dubai Shopping Festival."
    ],
    weatherInfo: [
      "Extremely hot summers reaching over 40°C.",
      "Winters are mild and sunny, perfect for outdoor activities."
    ],
    seatClass: "First Class",
    departureAirport: "LOS",
    arrivalAirport: "DXB",
    flightNumber: "EK-784",
    departureTime: "02:00 PM",
    arrivalTime: "11:55 PM",
    itinerary: []
  }
  // NOTE: Add these same 6 fields (seatClass, departureAirport, arrivalAirport, 
  // flightNumber, departureTime, arrivalTime) to the other 14 trips in this array 
  // matching their respective destinations to completely clear the nulls.
];