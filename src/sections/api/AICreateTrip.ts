import {type ActionFunctionArgs, data} from "react-router";

import { parseMarkdownToJson } from "../../lib/utils";
import { appwriteConfig , database } from "../../appwrite/client";
import {ID} from "appwrite";
import { useState } from "react";
import { incrementUserTripCount } from "../../appwrite/Auth";
let count = 0; // to keep track of how many times the action has been called, for analytics or other purposes   

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

    const deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY!;
    const unsplashApiKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY!;


    // collects the data form the fetcher.submit 
    // and its applied to the prompt.
    try {
        const prompt = `Generate a ${numberOfDays}-day travel itinerary for ${country} based on the following user information:
        Budget: '${budget}'
        Interests: '${interests}'
        TravelStyle: '${travelStyle}'
        GroupType: '${groupType}'
        Return the itinerary and lowest estimated price in a clean, non-markdown JSON format with the following structure:
        {
        "name": "A descriptive title for the trip",
        "description": "A brief description of the trip and its highlights not exceeding 100 words",
        "estimatedPrice": "Lowest average price for the trip in USD, e.g.$price",
        "duration": ${numberOfDays},
        "budget": "${budget}",
        "travelStyle": "${travelStyle}",
        "country": "${country}",
        "interests": ${interests},
        "groupType": "${groupType}",
        "bestTimeToVisit": [
          '🌸 Season (from month to month): reason to visit',
          '☀️ Season (from month to month): reason to visit',
          '🍁 Season (from month to month): reason to visit',
          '❄️ Season (from month to month): reason to visit'
        ],
        "weatherInfo": [
          '☀️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '🌦️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '🌧️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '❄️ Season: temperature range in Celsius (temperature range in Fahrenheit)'
        ],
        "location": {
          "city": "name of the city or region",
          "coordinates": [latitude, longitude],
          "openStreetMap": "link to open street map"
        },
        "itinerary": [
        {
          "day": 1,
          "location": "City/Region Name",
          "activities": [
            {"time": "Morning", "description": "🏰 Visit the local historic castle and enjoy a scenic walk"},
            {"time": "Afternoon", "description": "🖼️ Explore a famous art museum with a guided tour"},
            {"time": "Evening", "description": "🍷 Dine at a rooftop restaurant with local wine"}
          ]
        },
        ...
        ]
    }`;
        
    if (!navigator.onLine) {
    throw new Error("You appear to be offline. Check your internet connection.");
}

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${deepseekApiKey}`,
                "Accept": "application/json",

            },
            body: JSON.stringify({
                model: "anthropic/claude-3-haiku", 
                messages: [
                    { 
                        role: "system", 
                        content: "You are a helpful travel assistant. You must output only valid JSON without markdown code blocks." 
                    },
                    { role: "user", content: prompt }
                ],
                // Helps ensure the AI doesn't yap before giving the JSON
                response_format: { type: 'json_object' }, 
                stream: false,
                max_tokens: 4000,
            })
        });

        if (!aiResponse.ok) {
            const errorData = await aiResponse.json();
            throw new Error(`DeepSeek API Error: ${errorData.error?.message || aiResponse.statusText}`);
        }

        const aiData = await aiResponse.json();
        // collect the first cchoce or whatever
        const rawText = aiData.choices[0].message.content;

        count += 1;

        // Since DeepSeek is better at clean JSON, we try parsing directly, 
        // but keep your utility as a fallback.
        let trip;
        try {
            trip = JSON.parse(rawText);
        } catch {
            trip = parseMarkdownToJson(rawText);
        }

        // --- REST OF YOUR LOGIC (UNSPLASH & APPWRITE) ---
        const imageResponse = await fetch(
            `https://api.unsplash.com/search/photos?query=${country} ${interests} ${travelStyle}&client_id=${unsplashApiKey}`
        );

        const imageUrls = (await imageResponse.json()).results.slice(0, 3)
            .map((result: any) => result.urls?.regular || null);

        const result = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            ID.unique(),
            {
                tripDetail: JSON.stringify(trip),
                
                imgUrls : imageUrls || [],
                userId : userId || 'anonymous', 
             
                
            }
        );
        // if the useid is there and is not equalto the anonymous do this ..

         if (userId && userId !== 'anonymous') {
        await incrementUserTripCount(userId);
    }

        return data({ id: result.$id });
        

    } catch (e) {
        console.error('Error generating travel plan: ', e);
    }
}
// !: AI creates the trip 
// 2: Document was created in the database with the trip details and image urls
// the id was returned to the client and then used to navigate to the trip details page.
