import { type ActionFunctionArgs, data } from "react-router";
import { parseMarkdownToJson } from "../../lib/utils";
import { appwriteConfig, database } from "../../appwrite/client";
import { ID } from "appwrite";
import { incrementUserTripCount } from "../../appwrite/Auth";

let count  = 0; 

export const action = async ({ request }: ActionFunctionArgs) => {
    const {
        country,
        numberOfDays,
        travelStyle,
        interests,
        budget,
        groupType,
        userId,
    } = await request.json();

    // Enforce valid user session to prevent saving trips as 'anonymous'
    if (!userId || userId === 'anonymous') {
        return data({ error: "User session not found. Please log in to generate and save trips." }, { status: 401 });
    }

    const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
    const unsplashApiKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY ;

    if (!groqApiKey) {
        throw new Error("Missing Groq API Key on the server.");
    }

    try {
        const prompt = `Generate a ${numberOfDays}-day travel itinerary for ${country} based on the following user information:
        Budget: '${budget}'
        Interests: '${interests}'
        TravelStyle: '${travelStyle}'
        GroupType: '${groupType}'
        Return the itinerary and lowest estimated price in a clean, valid JSON format with the following structure:
        {
        "name": "A descriptive title for the trip",
        "description": "A brief description of the trip and its highlights not exceeding 100 words",
        "estimatedPrice": "Lowest average price for the trip in USD, e.g.$price",
        "duration": ${numberOfDays},
        "budget": "${budget}",
        "travelStyle": "${travelStyle}",
        "country": "${country}",
        "interests": "${interests}",
        "groupType": "${groupType}",
        "bestTimeToVisit": [
          "🌸 Season (from month to month): reason to visit",
          "☀️ Season (from month to month): reason to visit",
          "🍁 Season (from month to month): reason to visit",
          "❄️ Season (from month to month): reason to visit"
        ],
        "weatherInfo": [
          "☀️ Season: temperature range in Celsius (temperature range in Fahrenheit)",
          "🌦️ Season: temperature range in Celsius (temperature range in Fahrenheit)",
          "🌧️ Season: temperature range in Celsius (temperature range in Fahrenheit)",
          "❄️ Season: temperature range in Celsius (temperature range in Fahrenheit)"
        ],
        "location": {
          "city": "name of the main city or region",
          "coordinates": [latitude, longitude],
          "openStreetMap": "link to open street map"
        },
        "itinerary": [
          {
            "day": 1,
            "locationName": "Specific Destination City/Region Name for this day",
            "destinationLat": latitude_as_float,
            "destinationLng": longitude_as_float,
            "activities": [
              {"time": "Morning", "description": "🏰 Visit the local historic castle and enjoy a scenic walk"},
              {"time": "Afternoon", "description": "🖼️ Explore a famous art museum with a guided tour"},
              {"time": "Evening", "description": "🍷 Dine at a rooftop restaurant with local wine"}
            ]
          }
        ]
    }`;

        const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${groqApiKey}`,
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b",
                messages: [
                    { 
                        role: "system", 
                        content: "You are a helpful travel assistant. You must output valid JSON using the requested structure." 
                    },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                max_tokens: 4000,
            })
        });

        if (!aiResponse.ok) {
            const errorData = await aiResponse.json();
            throw new Error(`Groq API Error: ${errorData.error?.message || aiResponse.statusText}`);
        }

        const aiData = await aiResponse.json();
        const rawText = aiData.choices[0].message.content;

        count += 1;

        let trip;
        try {
            trip = JSON.parse(rawText);
        } catch {
            trip = parseMarkdownToJson(rawText);
        }

        // --- SAFE UNSPLASH IMAGE FETCHING ---
        let imageUrls: string[] = [];
        try {
            const imageResponse = await fetch(
                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(country + ' ' + interests + ' ' + travelStyle)}&client_id=${unsplashApiKey}`
            );
            if (imageResponse.ok) {
                const imageJson = await imageResponse.json();
                imageUrls = imageJson.results 
                    ? imageJson.results
                        .slice(0, 3)
                        .map((result: any) => result.urls?.regular)
                        .filter((url: string | undefined): url is string => Boolean(url)) 
                    : [];
            }
        } catch (imgErr) {
            console.warn("Unsplash fetch skipped due to network limitation:", imgErr);
        }

        const result = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            ID.unique(),
            {
                tripDetail: JSON.stringify(trip),
                imgUrls: imageUrls || [],
                userId: userId, 
            }
        );

        await incrementUserTripCount(userId);

        return data({ id: result.$id });

    } catch (e: any) {
        console.error('Error generating travel plan: ', e);
        return data({ error: e.message }, { status: 500 });
    }
};