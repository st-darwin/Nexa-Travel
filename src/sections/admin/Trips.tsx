import React, { useState } from 'react'
import Header from '../../components/Header'
import { useLoaderData, useSearchParams, type LoaderFunctionArgs } from 'react-router-dom';
import {  getALlTrips } from '../../appwrite/Trips';
import { parseTripData } from '../../lib/utils';
import TripCard from '../../components/TripCard';
import { PagerComponent } from '@syncfusion/ej2-react-grids';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const limit = 8;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  
  // 1. Calculate offset BEFORE using it
  const offset = (page - 1) * limit;

  // 2. Fetch all trips (Removed the single getTripById because 'id' isn't defined here)
  const { allTrips, total } = await getALlTrips(limit, offset);

  return {
    total,
    allTrips: allTrips.map((raw) => {
      const parsed = parseTripData(raw);
      
      // Safety for location object vs string
      let locationString = "Lagos, Nigeria"; 
      if (typeof parsed?.location === 'string') {
        locationString = parsed.location;
      } else if (typeof parsed?.location === 'object' && parsed.location !== null) {
        locationString = parsed.location.city || "Lagos, Nigeria";
      }

      return {
        id: raw.$id,
        name: parsed?.name || "Untitled Trip",
        imgUrl: raw.imgUrls?.[0] || "",
        location: locationString,
        estimatedPrice: parsed?.estimatedPrice,
        duration: parsed?.duration,
        budget: parsed?.budget,
        travelStyle: parsed?.travelStyle,
        interests: parsed?.interests
      };
    })
  };
};



const Trips = () => {
    const {allTrips , total} = useLoaderData() as { allTrips : any , total : number }
       const handleSubmit = async() =>{}
       const [searchParams] = useSearchParams()
       const initialPage= Number(searchParams.get('page' )|| '1') 

       const [currentPage , SetCurrentPage]  = useState(initialPage)

       const handlePageChange = (page: number) =>{
        SetCurrentPage(page);
        window.location.search = `?page=${page}`
       }
   
       return (
  <main className='wrapper space-y-8 bg-slate-50 min-h-screen p-8'>
<Header
    title="Manage and View Trips"
    description="View , edit and manage AI-generated travel plans"
    ctaText ="Create a New Trip"
    ctaUrl="create" />

    <section className='my-15'>
      <h1 className='p-24-semibold text-dark-100 my-5 ' >Manage Created Trips</h1>

      <div className='trip-grid mb-5'>
         {allTrips.map((trip : any) => (
              <TripCard key={trip.id}
         
            id={trip.id} 
        name={trip.name} 
        imgUrl={trip.imgUrl}       // Now exists!
        location={trip.location}   // Now exists!
        price={trip.estimatedPrice} // Passes validation
        tags={[trip.interests , trip.travelStyle]} // Passes validation
             
              />
            ))}
    {allTrips.length === 0 && (
  <section className=" col-span-full flex flex-col items-center justify-center min-h-[400px] mt-10 px-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
    
    {/* Soft Illustration with Ambient Glow */}
    <div className="relative w-full max-w-[240px] aspect-square mb-10 flex items-center justify-center">
      {/* The "Soft Glow" - Hidden behind the SVG */}
      <div className="absolute w-40 h-40 bg-blue-400/10 blur-[60px] rounded-full" />
      <div className="absolute w-32 h-32 bg-indigo-400/10 blur-[40px] rounded-full translate-x-10 -translate-y-5" />
      
      {/* Custom Modern SVG */}
      <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 opacity-90">
        <defs>
          <linearGradient id="soft-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>
        </defs>
        
        {/* Floating Paper/Map Base */}
        <rect x="40" y="50" width="120" height="90" rx="20" fill="url(#soft-grad)" stroke="#e2e8f0" strokeWidth="1.5" transform="rotate(-4 100 95)" />
        
        {/* Abstract "Empty" Lines */}
        <rect x="65" y="80" width="70" height="6" rx="3" fill="#cbd5e1" opacity="0.4" transform="rotate(-4 100 95)" />
        <rect x="65" y="95" width="40" height="6" rx="3" fill="#cbd5e1" opacity="0.3" transform="rotate(-4 100 95)" />
        
        {/* The "Spark" - Representing AI or Potential */}
        <path d="M140 40 L145 55 L160 60 L145 65 L140 80 L135 65 L120 60 L135 55 Z" fill="#60a5fa" className="animate-pulse" />
        <circle cx="50" cy="45" r="4" fill="#94a3b8" opacity="0.5" />
      </svg>
    </div>

    {/* Typography - SaaS Style (Tight tracking, muted subtext) */}
    <div className="space-y-3 text-center">
      <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
        No adventures found
      </h2>
      <p className="text-slate-500 max-w-sm mx-auto leading-relaxed font-normal">
        Your travel collection is currently empty. Generate a new AI itinerary to start exploring.
      </p>
    </div>

    {/* The "Glass" Button */}
    <button
      onClick={() => window.location.href = 'trips/create'}
      className="mt-10 group relative flex items-center gap-2 px-8 py-3.5 bg-white text-slate-900 border border-slate-200 rounded-full font-medium transition-all hover:border-slate-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] active:scale-95"
    >
      <span className="text-blue-500 text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
      <span>New Trip</span>
    </button>
  </section>
)}

      </div>
      <PagerComponent
      totalRecordsCount={total}
      pageSize={8}
      currentPage={currentPage}
      click={(args) => handlePageChange(args.currentPage)}
      cssClass='!mb-4'
      />

    </section>

  



  </main>
  )
}

export default Trips
