  
// ai planner 
import { useLoaderData } from "react-router-dom";
import UserHeader from "../../components/UserHeader"
import { useState } from "react";
export const loader = async () => {
  // 1. Ask for ALL the fields you plan to use in your .map()
  const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flag,latlng,maps');
  
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  

  // converts the response to json format and then we can use it in our component
  const data = await res.json();

  // 2. Format the data once here. 
  // Syncfusion fields 'text' and 'value' are standard names to use.

  // return an object that has the coutry name , value and cooredinates 
  return data.map((country: any) => ({
    text: `${country.flag} ${country.name.common}`,
    value: country.cca2,
    coordinates: country.latlng,
    openStreetmap: country.maps?.openStreetMap
  })).sort((a: any, b: any) => a.text.localeCompare(b.text)); // Sort A-Z
}


const AIStrategist = () => {
  const countries = useLoaderData() as TripFormData[];
  const [formData , setFormData] = useState({
     country: "",
    travelStyle: "",
    interest: "",
    budget: "",
    duration: "",
    groupType: "",
   // initial form data state, can be empty or have default values


  })


  return (
    <div>
     <UserHeader
     title="Personalized AI Strategist"
      description="Transform raw intent into curated journeys. Nexa leverages deep-learning to synthesize routes, budgets, and experiences in real-time."
      ctaText="view Trip Archive"
      ctaUrl="/Home/archive"
     />
    </div>
  )
}

export default AIStrategist
