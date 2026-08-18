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
  imageUrl: string;      // Main fallback/hero image
  imageUrls: string[];   // 3 destination-specific images
  weatherTemp: string;
  weatherCondition: string;
  description: string;
  tags: string[];
  bestTimeToVisit: string[];
  weatherInfo: string[];
  itinerary: RecommendationItineraryDay[];
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
    id: "rec-positano-2",
    name: "Amalfi Coast Cliffside Retreat",
    country: "Italy",
    location: "Positano",
    duration: 4,
    travelStyle: "Couple",
    budget: "Premium",
    groupType: "Couple",
    interests: "Coastal & Culinary",
    estimatedPrice: "$2,800",
    imageUrl: getCountryImageUrl("Italy"),
    imageUrls: [
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "24°C",
    weatherCondition: "Mainly Clear",
    description: "Cliffside coastal panoramas, fragrant lemon groves, private boat excursions to Capri, and authentic Italian pasta masterclasses.",
    tags: ["Romantic", "Culinary", "Coastal"],
    bestTimeToVisit: [
      "May through October for optimal coastal boat conditions.",
      "June brings vibrant lemon harvests and warm waters."
    ],
    weatherInfo: [
      "Pleasant coastal climate averaging 24°C.",
      "Mild evening temperatures ideal for outdoor al fresco dining."
    ],
    itinerary: [
      {
        day: 1,
        title: "Positano Coastal Arrival",
        location: "Positano",
        activities: [
          { time: "03:00 PM", description: "Arrival via scenic drive and check-in to a boutique cliffside hotel." },
          { time: "06:00 PM", description: "Welcoming Limoncello tasting session and evening beach walk." }
        ]
      },
      {
        day: 2,
        title: "Path of the Gods Trek",
        location: "Nocelle",
        activities: [
          { time: "08:30 AM", description: "Hike the legendary Path of the Gods starting high above Bomerano." },
          { time: "01:00 PM", description: "Rustic farm-to-table lunch in the mountain village of Nocelle." }
        ]
      },
      {
        day: 3,
        title: "Private Capri Boat Excursion",
        location: "Capri",
        activities: [
          { time: "09:00 AM", description: "Private speed boat charter to Capri Island with Blue Grotto swim stops." },
          { time: "02:00 PM", description: "Shopping along Anacapri's luxury pedestrian avenues." }
        ]
      },
      {
        day: 4,
        title: "Ravello Gardens & Departure",
        location: "Ravello",
        activities: [
          { time: "10:00 AM", description: "Visit the infinity terrace gardens of Villa Cimbrone in Ravello." },
          { time: "03:00 PM", description: "Naples airport transfer and departure." }
        ]
      }
    ]
  },
  {
    id: "rec-kyoto-3",
    name: "Ancient Temples & Zen Gardens",
    country: "Japan",
    location: "Kyoto",
    duration: 6,
    travelStyle: "Cultural",
    budget: "Mid-range",
    groupType: "Solo",
    interests: "History & Nature",
    estimatedPrice: "$1,950",
    imageUrl: getCountryImageUrl("Japan"),
    imageUrls: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "22°C",
    weatherCondition: "Clear Sky",
    description: "Immerse yourself in traditional tea ceremonies, serene bamboo groves, red torii shrine hikes, and authentic Kaiseki dining.",
    tags: ["Culture", "History", "Nature"],
    bestTimeToVisit: [
      "March-April for Cherry Blossoms or November for Autumn foliage.",
      "October offers clear, crisp walking weather."
    ],
    weatherInfo: [
      "Mild temperature averaging 22°C.",
      "Low rainfall with crisp morning light ideal for photography."
    ],
    itinerary: [
      {
        day: 1,
        title: "Arashiyama Bamboo Forest",
        location: "Arashiyama",
        activities: [
          { time: "09:00 AM", description: "Morning walk through the quiet Arashiyama Bamboo Grove." },
          { time: "01:00 PM", description: "Explore Tenryu-ji Temple and its 14th-century landscape garden." }
        ]
      },
      {
        day: 2,
        title: "Golden Pavilion & Tea Ceremony",
        location: "Kita Ward",
        activities: [
          { time: "10:00 AM", description: "Visit Kinkaku-ji (The Golden Pavilion) reflected across the mirror pond." },
          { time: "03:00 PM", description: "Participate in a formal Zen matcha tea ceremony at a traditional Machiya." }
        ]
      },
      {
        day: 3,
        title: "Fushimi Inari Torii Trek",
        location: "Fushimi",
        activities: [
          { time: "07:30 AM", description: "Hike through the 10,000 vermilion Torii gates of Fushimi Inari." },
          { time: "06:00 PM", description: "Evening street food tasting in the historical Gion geisha district." }
        ]
      },
      {
        day: 4,
        title: "Nara Deer Park Day Excursion",
        location: "Nara",
        activities: [
          { time: "09:30 AM", description: "Train ride to Nara to interact with free-roaming sacred deer." },
          { time: "01:30 PM", description: "Tour Todai-ji Temple housing the Great Bronze Buddha statue." }
        ]
      },
      {
        day: 5,
        title: "Philosopher's Path & Shopping",
        location: "Higashiyama",
        activities: [
          { time: "10:30 AM", description: "Scenic walk along the canal side Philosopher's Path." },
          { time: "03:30 PM", description: "Traditional pottery and textile shopping in Higashiyama." }
        ]
      },
      {
        day: 6,
        title: "Nishiki Market & Departure",
        location: "Nishiki",
        activities: [
          { time: "10:00 AM", description: "Culinary tasting tour across Nishiki Market ('Kyoto's Kitchen')." },
          { time: "02:00 PM", description: "Kansai Express departure." }
        ]
      }
    ]
  },
  {
    id: "rec-bali-4",
    name: "Ubud Rainforest & Wellness Escape",
    country: "Indonesia",
    location: "Bali",
    duration: 5,
    travelStyle: "Nature & Outdoors",
    budget: "Budget",
    groupType: "Friends",
    interests: "Wellness & Nature",
    estimatedPrice: "$980",
    imageUrl: getCountryImageUrl("Indonesia"),
    imageUrls: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "28°C",
    weatherCondition: "Tropical Sunny",
    description: "Lush rice terraces, sacred waterfalls, holistic sound baths, volcano sunrise treks, and organic farm gastronomy.",
    tags: ["Wellness", "Nature", "Relaxation"],
    bestTimeToVisit: [
      "April to October during Bali's dry season.",
      "July and August offer optimal mountain trek conditions."
    ],
    weatherInfo: [
      "Warm tropical climate around 28°C.",
      "High sun exposure with refreshing jungle shade."
    ],
    itinerary: [
      {
        day: 1,
        title: "Jungle Sanctuary Check-in",
        location: "Ubud",
        activities: [
          { time: "02:00 PM", description: "Arrival and check-in to an eco-resort overlooking the Ayung River." },
          { time: "05:00 PM", description: "Welcome sound bath and Tibetan bowl meditation." }
        ]
      },
      {
        day: 2,
        title: "Rice Terraces & Waterfall Swim",
        location: "Tegallalang",
        activities: [
          { time: "08:30 AM", description: "Early trek through Tegallalang Rice Terraces before heat peaks." },
          { time: "01:00 PM", description: "Swim in the natural pool of Tegenungan Waterfall." }
        ]
      },
      {
        day: 3,
        title: "Sacred Monkey Forest & Arts",
        location: "Ubud Center",
        activities: [
          { time: "10:00 AM", description: "Guided walk through the Sacred Monkey Forest Sanctuary." },
          { time: "07:00 PM", description: "Traditional Legong dance performance at Ubud Palace." }
        ]
      },
      {
        day: 4,
        title: "Mount Batur Sunrise Trek",
        location: "Kintamani",
        activities: [
          { time: "03:00 AM", description: "Early morning hike up Mount Batur volcano for sunrise breakfast." },
          { time: "11:00 AM", description: "Soak in Toya Devasya natural geothermal hot springs." }
        ]
      },
      {
        day: 5,
        title: "Organic Cooking Workshop",
        location: "Ubud",
        activities: [
          { time: "09:00 AM", description: "Farm-to-table Balinese culinary class including market tour." },
          { time: "03:00 PM", description: "Airport transfer." }
        ]
      }
    ]
  },
  {
    id: "rec-swiss-5",
    name: "Alpine Peaks & Lake Geneva",
    country: "Switzerland",
    location: "Zermatt",
    duration: 5,
    travelStyle: "Adventure",
    budget: "Premium",
    groupType: "Family",
    interests: "Hiking & Outdoors",
    estimatedPrice: "$3,600",
    imageUrl: getCountryImageUrl("Switzerland"),
    imageUrls: [
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "18°C",
    weatherCondition: "Crisp Sunny",
    description: "Glacier mountain railways, iconic Matterhorn vistas, high-altitude alpine hiking, and traditional Swiss fondue dining.",
    tags: ["Mountains", "Adventure", "Scenic"],
    bestTimeToVisit: [
      "June to September for green trails and alpine flowers.",
      "December to March for ski and snow activities."
    ],
    weatherInfo: [
      "Crisp mountain climate averaging 18°C in summer.",
      "High UV index requiring sunglasses and sun protection."
    ],
    itinerary: [
      {
        day: 1,
        title: "Zermatt Eco-Village Arrival",
        location: "Zermatt",
        activities: [
          { time: "01:00 PM", description: "Arrival via electric train into car-free Zermatt." },
          { time: "05:00 PM", description: "Stroll through historic Hinterdorf old village chalets." }
        ]
      },
      {
        day: 2,
        title: "Gornergrat Cogwheel Railway",
        location: "Gornergrat",
        activities: [
          { time: "09:00 AM", description: "Ascend to 3,089m via Gornergrat Railway for Matterhorn views." },
          { time: "02:00 PM", description: "High alpine hike down to Riffelsee reflection lake." }
        ]
      },
      {
        day: 3,
        title: "Glacier Paradise Exploration",
        location: "Matterhorn Paradise",
        activities: [
          { time: "09:30 AM", description: "Cable car ascent to Europe's highest mountain station." },
          { time: "01:00 PM", description: "Walk inside the underground Glacier Palace ice sculptures." }
        ]
      },
      {
        day: 4,
        title: "Five Lakes Walk & Fondue",
        location: "Sunnegga",
        activities: [
          { time: "09:00 AM", description: "Hike the 5-Lakes Trail passing Stellisee and Grindjisee." },
          { time: "07:00 PM", description: "Traditional cheese fondue feast at a mountain hut." }
        ]
      },
      {
        day: 5,
        title: "Glacier Express Departure",
        location: "Zermatt",
        activities: [
          { time: "10:00 AM", description: "Panoramic train departure toward Zurich/Geneva." }
        ]
      }
    ]
  },
  {
    id: "rec-dubai-6",
    name: "Futuristic Skyline & Desert Dunes",
    country: "United Arab Emirates",
    location: "Dubai",
    duration: 4,
    travelStyle: "Luxury",
    budget: "Luxury",
    groupType: "Friends",
    interests: "Shopping & Nightlife",
    estimatedPrice: "$2,900",
    imageUrl: getCountryImageUrl("United Arab Emirates"),
    imageUrls: [
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546412414-e1885259563d?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "31°C",
    weatherCondition: "Clear & Sunny",
    description: "Soak in world-record architecture, luxury dune safaris with Bedouin dining, high-end yachting, and futuristic museum tours.",
    tags: ["Luxury", "Shopping", "Desert"],
    bestTimeToVisit: [
      "November to April for comfortable outdoor temperatures.",
      "January features the global Dubai Shopping Festival."
    ],
    weatherInfo: [
      "Warm, sunny desert climate averaging 31°C.",
      "Air-conditioned indoor venues throughout all primary sites."
    ],
    itinerary: [
      {
        day: 1,
        title: "Burj Khalifa & Fountain Show",
        location: "Downtown Dubai",
        activities: [
          { time: "03:00 PM", description: "Check in to luxury hotel in Downtown Dubai." },
          { time: "06:00 PM", description: "Ascend to At The Top (148th floor) of Burj Khalifa followed by fountain show." }
        ]
      },
      {
        day: 2,
        title: "Vip Desert Safari",
        location: "Lahbab Desert",
        activities: [
          { time: "10:00 AM", description: "Morning visit to the Museum of the Future." },
          { time: "03:30 PM", description: "Red dune bashing, sandboarding, and Bedouin camp dinner." }
        ]
      },
      {
        day: 3,
        title: "Marina Yacht Cruise & Palm",
        location: "Dubai Marina",
        activities: [
          { time: "11:00 AM", description: "Private luxury yacht cruise around Palm Jumeirah." },
          { time: "04:00 PM", description: "Shopping at Dubai Mall and evening beach club dinner." }
        ]
      },
      {
        day: 4,
        title: "Old Dubai Souks & Departure",
        location: "Deira",
        activities: [
          { time: "09:30 AM", description: "Abra boat ride across Dubai Creek to Gold & Spice Souks." },
          { time: "03:00 PM", description: "Airport transfer." }
        ]
      }
    ]
  },
  {
    id: "rec-cape-7",
    name: "Coastal Vineyard & Wildlife Odyssey",
    country: "South Africa",
    location: "Cape Town",
    duration: 6,
    travelStyle: "Adventure",
    budget: "Mid-range",
    groupType: "Couple",
    interests: "Nature & Culinary",
    estimatedPrice: "$2,100",
    imageUrl: getCountryImageUrl("South Africa"),
    imageUrls: [
      "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516026662312-26c7ae7c424a?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "23°C",
    weatherCondition: "Sunny Coastal",
    description: "Table Mountain cable rides, African penguin encounters at Boulders Beach, Stellenbosch wine tasting, and Cape Peninsula drives.",
    tags: ["Wildlife", "Wine", "Coastal"],
    bestTimeToVisit: [
      "November to March for warm summer weather.",
      "September features whale watching in nearby Hermanus."
    ],
    weatherInfo: [
      "Pleasant coastal climate averaging 23°C.",
      "Occasional 'Cape Doctor' wind keeping air clear."
    ],
    itinerary: [
      {
        day: 1,
        title: "Table Mountain Aerial Ride",
        location: "Cape Town",
        activities: [
          { time: "01:00 PM", description: "Check in at Victoria & Alfred Waterfront." },
          { time: "04:00 PM", description: "Revolving cable car ascent up Table Mountain for sunset." }
        ]
      },
      {
        day: 2,
        title: "Cape Peninsula & Penguins",
        location: "Boulders Beach",
        activities: [
          { time: "08:30 AM", description: "Drive Chapman's Peak to Cape Point nature reserve." },
          { time: "02:00 PM", description: "Walk alongside wild African penguins at Boulders Beach." }
        ]
      },
      {
        day: 3,
        title: "Stellenbosch Wine Tram",
        location: "Stellenbosch",
        activities: [
          { time: "09:30 AM", description: "Hop-on hop-off open-air tram through historic Stellenbosch wine estates." },
          { time: "01:00 PM", description: "Gourmet vineyard lunch and cellar tasting." }
        ]
      },
      {
        day: 4,
        title: "Robben Island & V&A Market",
        location: "Table Bay",
        activities: [
          { time: "09:00 AM", description: "Ferry ride and historic tour of Robben Island led by ex-political prisoners." },
          { time: "02:30 PM", description: "Local craft market tasting at V&A Food Market." }
        ]
      },
      {
        day: 5,
        title: "Kirstenbosch Botanical Gardens",
        location: "Constantia",
        activities: [
          { time: "10:00 AM", description: "Canopy walkway stroll through Kirstenbosch Gardens." },
          { time: "03:00 PM", description: "Wine tasting at Groot Constantia, South Africa's oldest estate." }
        ]
      },
      {
        day: 6,
        title: "Kite Beach Morning & Departure",
        location: "Bloubergstrand",
        activities: [
          { time: "10:00 AM", description: "Coastal breakfast at Bloubergstrand with classic mountain views." },
          { time: "02:00 PM", description: "International airport transfer." }
        ]
      }
    ]
  },
  {
    id: "rec-iceland-8",
    name: "Golden Circle & Northern Lights",
    country: "Iceland",
    location: "Reykjavik",
    duration: 5,
    travelStyle: "Nature & Outdoors",
    budget: "Premium",
    groupType: "Solo",
    interests: "Hiking & Nature",
    estimatedPrice: "$2,600",
    imageUrl: getCountryImageUrl("Iceland"),
    imageUrls: [
      "https://images.unsplash.com/photo-1504893524553-eefd5dffe0f1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "4°C",
    weatherCondition: "Fresh & Crisp",
    description: "Erupting geysers, roaring glacial waterfalls, volcanic black sand beaches, geothermal Blue Lagoon soaking, and Aurora hunts.",
    tags: ["Nature", "Geothermal", "Northern Lights"],
    bestTimeToVisit: [
      "September to April for Northern Lights viewing.",
      "June to August for 24-hour Midnight Sun daylight."
    ],
    weatherInfo: [
      "Crisp sub-polar climate averaging 4°C.",
      "Dynamic weather requiring layered waterproof gear."
    ],
    itinerary: [
      {
        day: 1,
        title: "Blue Lagoon Thermal Arrival",
        location: "Grindavik",
        activities: [
          { time: "11:00 AM", description: "Direct airport transfer to Blue Lagoon for silica mud spa relaxation." },
          { time: "04:00 PM", description: "Check in to Reykjavik hotel and local harbor walk." }
        ]
      },
      {
        day: 2,
        title: "Golden Circle Classic Tour",
        location: "Thingvellir",
        activities: [
          { time: "08:30 AM", description: "Tour Thingvellir National Park tectonic rift valley." },
          { time: "01:00 PM", description: "Witness Strokkur Geysir eruption and Gullfoss Waterfall." }
        ]
      },
      {
        day: 3,
        title: "South Coast Waterfalls & Black Sand",
        location: "Vik",
        activities: [
          { time: "08:00 AM", description: "Walk behind Seljalandsfoss and Skogafoss waterfalls." },
          { time: "02:00 PM", description: "Explore Reynisfjara basalt column black sand beach." }
        ]
      },
      {
        day: 4,
        title: "Glacier Hike & Aurora Hunt",
        location: "Solheimajokull",
        activities: [
          { time: "09:30 AM", description: "Guided crampon walk across Solheimajokull Glacier tongue." },
          { time: "09:00 PM", description: "Guided night bus hunt for the Northern Lights (Aurora Borealis)." }
        ]
      },
      {
        day: 5,
        title: "Reykjavik Culture & Departure",
        location: "Reykjavik",
        activities: [
          { time: "10:00 AM", description: "Visit Hallgrimskirkja church tower and Harpa Concert Hall." },
          { time: "02:30 PM", description: "Keflavik airport departure." }
        ]
      }
    ]
  },
  {
    id: "rec-banff-9",
    name: "Canadian Rockies & Glacial Lakes",
    country: "Canada",
    location: "Banff",
    duration: 5,
    travelStyle: "Nature & Outdoors",
    budget: "Mid-range",
    groupType: "Friends",
    interests: "Hiking & Photography",
    estimatedPrice: "$1,850",
    imageUrl: getCountryImageUrl("Canada"),
    imageUrls: [
      "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512467336214-a8dd4846f5d8?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "19°C",
    weatherCondition: "Sunny Mountain",
    description: "Turquoise waters of Lake Louise and Moraine Lake, icefield parkway drives, wildlife spotting, and mountain gondolas.",
    tags: ["Mountains", "Lakes", "Nature"],
    bestTimeToVisit: [
      "July and August for warm weather and full lake access.",
      "December to March for world-class ski conditions."
    ],
    weatherInfo: [
      "Comfortable mountain summer around 19°C.",
      "Cooler temperatures near glacial water bodies."
    ],
    itinerary: [
      {
        day: 1,
        title: "Banff Mountain Town Arrival",
        location: "Banff Town",
        activities: [
          { time: "01:30 PM", description: "Drive from Calgary into Banff National Park." },
          { time: "04:30 PM", description: "Ride Banff Gondola up Sulphur Mountain for 360-degree views." }
        ]
      },
      {
        day: 2,
        title: "Lake Louise & Agnes Tea House",
        location: "Lake Louise",
        activities: [
          { time: "07:30 AM", description: "Early arrival at Lake Louise for canoe rentals." },
          { time: "11:00 AM", description: "Hike up to historic Lake Agnes Tea House." }
        ]
      },
      {
        day: 3,
        title: "Moraine Lake & Valley of 10 Peaks",
        location: "Moraine Lake",
        activities: [
          { time: "08:00 AM", description: "Shuttle to Moraine Lake and walk the Rockpile Trail." },
          { time: "02:00 PM", description: "Soak in Banff Upper Hot Springs." }
        ]
      },
      {
        day: 4,
        title: "Icefields Parkway & Columbia Icefield",
        location: "Jasper Border",
        activities: [
          { time: "08:30 AM", description: "Drive the Icefields Parkway stopping at Peyto Lake viewpoint." },
          { time: "01:30 PM", description: "Walk on Athabasca Glacier via Ice Explorer snow coach." }
        ]
      },
      {
        day: 5,
        title: "Johnston Canyon & Departure",
        location: "Johnston Canyon",
        activities: [
          { time: "09:00 AM", description: "Walk catwalks through Johnston Canyon to lower/upper falls." },
          { time: "02:00 PM", description: "Calgary Airport transfer." }
        ]
      }
    ]
  },
  {
    id: "rec-maldives-10",
    name: "Overwater Bungalows & Coral Reefs",
    country: "Maldives",
    location: "Male Atoll",
    duration: 5,
    travelStyle: "Relaxed",
    budget: "Luxury",
    groupType: "Couple",
    interests: "Beaches & Water Activities",
    estimatedPrice: "$4,500",
    imageUrl: getCountryImageUrl("Maldives"),
    imageUrls: [
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "29°C",
    weatherCondition: "Tropical Clear",
    description: "Private overwater villa living, swimming alongside manta rays and whale sharks, bioluminescent beaches, and underwater spa treatments.",
    tags: ["Luxury", "Beach", "Snorkeling"],
    bestTimeToVisit: [
      "November to April during the dry northeast monsoon.",
      "February features the calmest, clearest diving waters."
    ],
    weatherInfo: [
      "Consistently warm tropical climate averaging 29°C.",
      "High sea clarity with water temperature around 27°C."
    ],
    itinerary: [
      {
        day: 1,
        title: "Seaplane Transfer & Villa Arrival",
        location: "Private Island",
        activities: [
          { time: "12:00 PM", description: "Scenic seaplane transfer from Male to private island resort." },
          { time: "05:00 PM", description: "Sunset champagne welcome on your overwater deck." }
        ]
      },
      {
        day: 2,
        title: "House Reef Snorkeling & Spa",
        location: "Private Lagoon",
        activities: [
          { time: "09:30 AM", description: "Guided snorkeling along house reef with sea turtles." },
          { time: "03:30 PM", description: "Overwater glass-floor massage treatment." }
        ]
      },
      {
        day: 3,
        title: "Manta Ray Safari & Sandbank Lunch",
        location: "Hanifaru Bay",
        activities: [
          { time: "09:00 AM", description: "Excursion boat to swim with Manta Rays." },
          { time: "01:00 PM", description: "Private picnic setup on an uninhabited sandbank." }
        ]
      },
      {
        day: 4,
        title: "Night Diving & Bioluminescence",
        location: "Lagoon",
        activities: [
          { time: "10:30 AM", description: "Stand-up paddleboarding across calm lagoon waters." },
          { time: "08:00 PM", description: "Night beach walk to observe glowing bioluminescent plankton." }
        ]
      },
      {
        day: 5,
        title: "Floating Breakfast & Departure",
        location: "Private Villa",
        activities: [
          { time: "08:30 AM", description: "Private floating breakfast served in your villa pool." },
          { time: "01:00 PM", description: "Seaplane transfer to Male International Airport." }
        ]
      }
    ]
  },
  {
    id: "rec-barcelona-11",
    name: "Gothic Architecture & Tapas Trails",
    country: "Spain",
    location: "Barcelona",
    duration: 4,
    travelStyle: "Cultural",
    budget: "Mid-range",
    groupType: "Friends",
    interests: "Museums & Culinary",
    estimatedPrice: "$1,650",
    imageUrl: getCountryImageUrl("Spain"),
    imageUrls: [
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511527846003-884b80a158bb?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "23°C",
    weatherCondition: "Sunny Mediterranean",
    description: "Marvel at Gaudi's Sagrada Familia and Park Guell, wander Gothic Quarter alleys, enjoy Barceloneta beach, and sample Catalan tapas.",
    tags: ["Architecture", "Culinary", "Culture"],
    bestTimeToVisit: [
      "May-June and September-October for ideal walking conditions.",
      "July features lively beach festival culture."
    ],
    weatherInfo: [
      "Warm Mediterranean climate averaging 23°C.",
      "High sunshine hours with soft coastal humidity."
    ],
    itinerary: [
      {
        day: 1,
        title: "Gothic Quarter & El Born Tapas",
        location: "Gothic Quarter",
        activities: [
          { time: "02:00 PM", description: "Check in near Las Ramblas and walk Gothic Quarter alleys." },
          { time: "07:30 PM", description: "Tapas and vermouth tasting crawl through El Born district." }
        ]
      },
      {
        day: 2,
        title: "Gaudi Masterpieces",
        location: "Eixample",
        activities: [
          { time: "09:00 AM", description: "Skip-the-line guided tour of Sagrada Familia cathedral." },
          { time: "02:30 PM", description: "Walk Park Guell mosaic gardens overlooking the sea." }
        ]
      },
      {
        day: 3,
        title: "Montjuic Cable Car & Beach",
        location: "Barceloneta",
        activities: [
          { time: "10:00 AM", description: "Cable car ride up Montjuic Hill and Miró Foundation museum." },
          { time: "04:00 PM", description: "Paella dinner beside Barceloneta Beach." }
        ]
      },
      {
        day: 4,
        title: "La Boqueria Market & Departure",
        location: "Las Ramblas",
        activities: [
          { time: "10:00 AM", description: "Fresh juice and jamón tasting at Mercat de la Boqueria." },
          { time: "02:00 PM", description: "El Prat airport transfer." }
        ]
      }
    ]
  },
  {
    id: "rec-cusco-12",
    name: "Inca Trail & Machu Picchu Sanctuary",
    country: "Peru",
    location: "Cusco",
    duration: 6,
    travelStyle: "Adventure",
    budget: "Mid-range",
    groupType: "Solo",
    interests: "History & Hiking",
    estimatedPrice: "$1,750",
    imageUrl: getCountryImageUrl("Peru"),
    imageUrls: [
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1509212034292-154ff2008dae?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "17°C",
    weatherCondition: "Clear High Altitude",
    description: "Explore imperial Inca ruins in Sacred Valley, ride panoramic train through cloud forests, and discover lost citadel of Machu Picchu.",
    tags: ["History", "Hiking", "Culture"],
    bestTimeToVisit: [
      "May to October during the dry Andean winter.",
      "June hosts the ancient Inti Raymi sun festival."
    ],
    weatherInfo: [
      "High altitude climate with sunny 17°C days.",
      "Cool evenings dipping toward 5°C requiring warm layers."
    ],
    itinerary: [
      {
        day: 1,
        title: "Cusco Acclimatization",
        location: "Cusco Old Town",
        activities: [
          { time: "11:00 AM", description: "Hotel check-in and coca tea acclimatization rest." },
          { time: "03:30 PM", description: "Gentle stroll through Plaza de Armas and Qorikancha temple." }
        ]
      },
      {
        day: 2,
        title: "Sacred Valley & Pisac Market",
        location: "Pisac",
        activities: [
          { time: "08:30 AM", description: "Explore mountain terrace ruins of Pisac." },
          { time: "01:30 PM", description: "Handicraft shopping at Pisac indigenous artisan market." }
        ]
      },
      {
        day: 3,
        title: "Ollantaytambo Fortress & Train",
        location: "Aguas Calientes",
        activities: [
          { time: "09:00 AM", description: "Climb giant sun temple terraces at Ollantaytambo." },
          { time: "03:30 PM", description: "Vistadome glass-roof train to Aguas Calientes." }
        ]
      },
      {
        day: 4,
        title: "Machu Picchu Lost Citadel",
        location: "Machu Picchu",
        activities: [
          { time: "06:00 AM", description: "Early bus entrance to Machu Picchu for sunrise over Sun Gate." },
          { time: "10:30 AM", description: "Guided archaeological circuit around upper terraces." }
        ]
      },
      {
        day: 5,
        title: "Rainbow Mountain Trek",
        location: "Vinicunca",
        activities: [
          { time: "04:30 AM", description: "Day excursion to trek Rainbow Mountain (Vinicunca at 5,200m)." },
          { time: "05:00 PM", description: "Return to Cusco for Andean dinner." }
        ]
      },
      {
        day: 6,
        title: "San Pedro Market & Departure",
        location: "Cusco",
        activities: [
          { time: "09:30 AM", description: "Local fruit tasting at San Pedro market." },
          { time: "01:30 PM", description: "Cusco Airport flight transfer." }
        ]
      }
    ]
  },
  {
    id: "rec-queenstown-13",
    name: "Fjordland & Adventure Capital",
    country: "New Zealand",
    location: "Queenstown",
    duration: 5,
    travelStyle: "Adventure",
    budget: "Premium",
    groupType: "Friends",
    interests: "Outdoor Activities",
    estimatedPrice: "$2,700",
    imageUrl: getCountryImageUrl("New Zealand"),
    imageUrls: [
      "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "16°C",
    weatherCondition: "Clear Alpine",
    description: "Jet boating through river canyons, Milford Sound scenic cruises, bungy jumping, and pinot noir wine tasting in Central Otago.",
    tags: ["Adventure", "Nature", "Scenic"],
    bestTimeToVisit: [
      "December to February for southern hemisphere summer hikes.",
      "June to August for snow sports on The Remarkables."
    ],
    weatherInfo: [
      "Crisp alpine weather averaging 16°C in summer.",
      "Fresh mountain air with high clarity for landscape photos."
    ],
    itinerary: [
      {
        day: 1,
        title: "Lake Wakatipu Skyline Gondola",
        location: "Queenstown",
        activities: [
          { time: "01:00 PM", description: "Check in alongside Lake Wakatipu." },
          { time: "04:00 PM", description: "Ride Skyline Gondola for mountain luge rides overlooking Remarkables." }
        ]
      },
      {
        day: 2,
        title: "Milford Sound Fly-Cruise-Fly",
        location: "Fiordland",
        activities: [
          { time: "08:30 AM", description: "Scenic fixed-wing flight over glaciers to Milford Sound." },
          { time: "11:30 AM", description: "Nature cruise beneath Stirling Falls and sheer fjord cliffs." }
        ]
      },
      {
        day: 3,
        title: "Shotover Jet & AJ Hackett Bungy",
        location: "Kawarau Bridge",
        activities: [
          { time: "09:30 AM", description: "High-speed Shotover Jet boat ride through narrow river canyons." },
          { time: "02:00 PM", description: "Visit historic Kawarau Bridge, world birthplace of bungy jumping." }
        ]
      },
      {
        day: 4,
        title: "Gibbston Valley Wine Tour",
        location: "Central Otago",
        activities: [
          { time: "10:30 AM", description: "E-bike winery trail through Gibbston Valley 'Valley of the Vines'." },
          { time: "02:00 PM", description: "Underground cave wine tasting at Gibbston Valley Estate." }
        ]
      },
      {
        day: 5,
        title: "Glenorchy Paradise Drive",
        location: "Glenorchy",
        activities: [
          { time: "09:00 AM", description: "Drive rated among world's top coastal roads to Glenorchy." },
          { time: "02:00 PM", description: "Queenstown Airport departure." }
        ]
      }
    ]
  },
  {
    id: "rec-tokyo-14",
    name: "Neon Lights & Culinary Excellence",
    country: "Japan",
    location: "Tokyo",
    duration: 5,
    travelStyle: "City Exploration",
    budget: "Mid-range",
    groupType: "Solo",
    interests: "Shopping & Food",
    estimatedPrice: "$2,100",
    imageUrl: getCountryImageUrl("Japan"),
    imageUrls: [
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "21°C",
    weatherCondition: "Clear Urban",
    description: "Explore Shibuya Crossing, teamLab digital art immersive worlds, high-end Ginza shopping, Michelin ramen shops, and Akihabara tech culture.",
    tags: ["City", "Technology", "Culinary"],
    bestTimeToVisit: [
      "October-November for comfortable autumn walking weather.",
      "March-April for cherry blossom parks."
    ],
    weatherInfo: [
      "Mild temperature averaging 21°C.",
      "Clear skies suitable for outdoor city exploring."
    ],
    itinerary: [
      {
        day: 1,
        title: "Shibuya Crossing & Skytree",
        location: "Shibuya",
        activities: [
          { time: "03:00 PM", description: "Hotel check-in in Shinjuku and walk Shibuya Crossing." },
          { time: "06:30 PM", description: "Shibuya Sky rooftop observatory observation." }
        ]
      },
      {
        day: 2,
        title: "teamLab Planets & Toyosu",
        location: "Odaiba",
        activities: [
          { time: "09:30 AM", description: "Walk through barefoot digital art installation at teamLab Planets." },
          { time: "01:00 PM", description: "Fresh sushi lunch at Toyosu Fish Market." }
        ]
      },
      {
        day: 3,
        title: "Asakusa Senso-ji & Akihabara",
        location: "Asakusa",
        activities: [
          { time: "09:00 AM", description: "Explore Tokyo's oldest temple, Senso-ji in Asakusa." },
          { time: "02:30 PM", description: "Explore electronics and anime culture in Akihabara." }
        ]
      },
      {
        day: 4,
        title: "Harajuku Fashion & Meiji Shrine",
        location: "Harajuku",
        activities: [
          { time: "10:00 AM", description: "Walk peaceful forest paths of Meiji Jingu Shrine." },
          { time: "01:30 PM", description: "Explore youth fashion along Takeshita Street and Omotesando." }
        ]
      },
      {
        day: 5,
        title: "Shinjuku Gyoen & Departure",
        location: "Shinjuku",
        activities: [
          { time: "09:30 AM", description: "Stroll traditional Japanese gardens inside Shinjuku Gyoen." },
          { time: "02:00 PM", description: "Narita/Haneda Express train departure." }
        ]
      }
    ]
  },
  {
    id: "rec-marrakech-15",
    name: "Medina Souks & Atlas Mountain Oasis",
    country: "Morocco",
    location: "Marrakech",
    duration: 4,
    travelStyle: "Cultural",
    budget: "Budget",
    groupType: "Couple",
    interests: "History & Shopping",
    estimatedPrice: "$1,100",
    imageUrl: getCountryImageUrl("Morocco"),
    imageUrls: [
      "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1489493887464-892ded60d77e?auto=format&fit=crop&w=800&q=80"
    ],
    weatherTemp: "27°C",
    weatherCondition: "Warm Sunny",
    description: "Stay in traditional courtyard Riads, wander aromatic spice souks, visit Jardin Majorelle, and hike Berber villages in High Atlas mountains.",
    tags: ["Culture", "Markets", "History"],
    bestTimeToVisit: [
      "March to May and September to November.",
      "Spring brings wild mountain blooms across the valleys."
    ],
    weatherInfo: [
      "Warm dry climate averaging 27°C.",
      "Low humidity with high sunshine counts."
    ],
    itinerary: [
      {
        day: 1,
        title: "Traditional Riad & Jemaa el-Fnaa",
        location: "Medina",
        activities: [
          { time: "02:00 PM", description: "Check in to a restored marble Riad inside Medina walls." },
          { time: "06:30 PM", description: "Sunset mint tea overlooking bustling Jemaa el-Fnaa square." }
        ]
      },
      {
        day: 2,
        title: "Jardin Majorelle & YSL Museum",
        location: "Gueliz",
        activities: [
          { time: "09:00 AM", description: "Tour Yves Saint Laurent's cobalt blue Jardin Majorelle botanical garden." },
          { time: "02:00 PM", description: "Explore Bahia Palace and historic Saadian Tombs." }
        ]
      },
      {
        day: 3,
        title: "High Atlas Mountain Berber Excursion",
        location: "Ourika Valley",
        activities: [
          { time: "08:30 AM", description: "Day trip into Ourika Valley inside High Atlas Mountains." },
          { time: "01:00 PM", description: "Traditional Berber tagine lunch alongside mountain streams." }
        ]
      },
      {
        day: 4,
        title: "Spice Souks & Departure",
        location: "Souk Semmarine",
        activities: [
          { time: "09:30 AM", description: "Guided artisan market tour for spices, lanterns, and leather." },
          { time: "02:30 PM", description: "Marrakech Menara airport transfer." }
        ]
      }
    ]
  }
];