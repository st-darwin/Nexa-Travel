import { useState } from 'react'
import UserHeader from '../../components/UserHeader';
import { useLoaderData, useSearchParams, useNavigate, type LoaderFunctionArgs } from 'react-router-dom';
import { getUserTrips } from '../../appwrite/Trips'; // Using the User-scoped function
import { account } from '../../appwrite/client';
import { parseTripData } from '../../lib/utils';
import TripCard from '../../components/TripCard';
import { PagerComponent } from '@syncfusion/ej2-react-grids';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const limit = 8;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const offset = (page - 1) * limit;

  try {
  
    const user = await account.get();
    
   
    const { trips, total } = await getUserTrips(user.$id, limit, offset);

    return {
      total,
      allTrips: trips.map((raw: any) => {
        const parsed = parseTripData(raw);
        const locationString = typeof parsed?.location === 'object' 
          ? (parsed.location.city || "Global") 
          : (parsed?.location || "Destination Unknown");

        return {
          id: raw.$id,
          name: parsed?.name || "Untitled Trip",
          imgUrl: raw.imgUrls?.[0] || `https://source.unsplash.com/featured/?${locationString}`,
          location: locationString,
          estimatedPrice: parsed?.estimatedPrice,
          tags: [parsed?.travelStyle, parsed?.interests].filter(Boolean).flat()
        };
      })
    };
  } catch (error) {
    console.error("Nexa OS Loader Error:", error);
    return { allTrips: [], total: 0 };
  }
};

const Archive = () => {
  const { allTrips, total } = useLoaderData() as { allTrips: any[], total: number };
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initialPage = Number(searchParams.get('page') || '1');
  const [currentPage, setCurrentPage] = useState(initialPage);

 // Handle page changes (for pagination)
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    navigate(`?page=${page}`);
  };

  return (
    <main className='wrapper space-y-8 bg-slate-50 min-h-screen p-8'>
      <UserHeader
        title="My Travel Archive"
        description="View and manage your personal AI-generated blueprints."
        ctaText="Plan New Trip"
        ctaUrl="/Home/strategist" 
      />

      <section className='my-15'>
        <h1 className='text-2xl font-bold text-slate-900 my-5 px-2'>{allTrips.length === 0 ? "No Itineraries 😔.." : "Recent Itineraries" }</h1>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {allTrips.map((trip: any) => (
            <TripCard 
              key={trip.id}
              id={trip.id} 
              name={trip.name} 
              imgUrl={trip.imgUrl}
              location={trip.location}
              price={trip.estimatedPrice}
              tags={trip.tags}
            />
          ))}
        </div>

        {/* The "Empty State" from your Admin code fits perfectly here */}
    {allTrips.length === 0 && (
  <section className="col-span-full flex flex-col items-center justify-center min-h-[500px] mt-10 bg-white/40 backdrop-blur-md rounded-[3rem] border border-dashed border-black/10 px-8 py-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">

<svg viewBox="0 0 400 300" className="w-full max-w-sm mx-auto mb-12 animate-fade-in duration-1000">
  <defs>
    <linearGradient id="soft-blueprint-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
      <stop offset="100%" stopColor="#F9FAFB" stopOpacity="0.5" />
    </linearGradient>
    
    <radialGradient id="ai-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#818CF8" stopOpacity="0.2" />
      <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
    </radialGradient>
  </defs>

  <circle cx="200" cy="150" r="100" fill="url(#ai-glow)" />

  <g transform="translate(110, 80) rotate(-3)">
    <rect x="5" y="5" width="180" height="130" rx="20" fill="#000000" fillOpacity="0.03" filter="blur(5px)" />
    <rect width="180" height="130" rx="20" fill="url(#soft-blueprint-grad)" stroke="#E5E7EB" strokeWidth="1" />
    
    <rect x="25" y="30" width="100" height="8" rx="4" fill="#6B7280" fillOpacity="0.1" />
    <rect x="25" y="50" width="130" height="6" rx="3" fill="#6B7280" fillOpacity="0.05" />
    <rect x="25" y="65" width="130" height="6" rx="3" fill="#6B7280" fillOpacity="0.05" />
  </g>

  <g transform="translate(240, 150) rotate(8)">
     <rect x="3" y="3" width="90" height="70" rx="15" fill="#000000" fillOpacity="0.02" filter="blur(3px)" />
     <rect width="90" height="70" rx="15" fill="#FFFFFF" fillOpacity="0.9" stroke="#E5E7EB" strokeWidth="0.8" />
     <circle cx="25" cy="25" r="10" fill="#60A5FA" fillOpacity="0.1" />
     <rect x="45" y="20" width="25" height="10" rx="4" fill="#6B7280" fillOpacity="0.08" />
  </g>

  <g transform="translate(190, 140)">
    <path d="M10 0 L13 8 L20 10 L13 12 L10 20 L7 12 L0 10 L7 8 Z" fill="#4F46E5" fillOpacity="0.9">
       <animate attributeName="fill-opacity" values="0.9;0.5;0.9" dur="3s" repeatCount="indefinite" />
       <animate attributeName="transform" type="scale" values="1;1.05;1" dur="3s" repeatCount="indefinite" />
    </path>
    <circle cx="-15" cy="-20" r="3" fill="#60A5FA" fillOpacity="0.6" />
    <circle cx="35" cy="5" r="2" fill="#818CF8" fillOpacity="0.4" />
    <circle cx="5" cy="35" r="2" fill="#818CF8" fillOpacity="0.3" />
  </g>

  <g fill="#000000" fillOpacity="0.03">
     <circle cx="50" cy="50" r="1.5"/>
     <circle cx="100" cy="50" r="1.5"/>
     <circle cx="150" cy="50" r="1.5"/>
     </g>
</svg>

    {/* REFINE TYPOGRAPHY (SaaS-Style) */}
    <div className="space-y-3 text-center max-w-sm mx-auto mb-10">
      <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">
        The vault is waiting
      </h2>
      <p className="text-black/50 font-medium leading-relaxed">
        Your travel collection is empty. Launch the Nexa Strategist to spark your first AI-curated itinerary.
      </p>
    </div>

    {/* PREMIUM "GLASS" CTA BUTTON */}
    <button 
      onClick={() => navigate('/planner')} 
      className="group duration-500 cursor-pointer relative flex items-center gap-3 px-10 py-4 bg-black text-white rounded-2xl font-bold hover:scale-102 active:scale-95 transition-all shadow-2xl shadow-black/30 hover:shadow-black/10"
    >
      <span className="text-indigo-400 text-2xl transition-transform duration-500">
         ✧ 
      </span>
      
      <span>Create a Trip </span>
    </button>
  </section>
)}

        {total > 8 && (
          <div className="flex justify-center mt-10">
            <PagerComponent
              totalRecordsCount={total}
              pageSize={8}
              currentPage={currentPage}
              click={(args) => handlePageChange(args.currentPage)}
              cssClass='custom-pager' // Apply your Soft UI styles here
            />
          </div>
        )}
      </section>
    </main>
  );
};

export default Archive;
