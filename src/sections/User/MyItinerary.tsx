import React, { useState, useMemo } from 'react';
import { useLoaderData, useNavigate, type LoaderFunctionArgs } from 'react-router-dom';
import { finalizeTripById, getUserTripById, getUserTrips } from '../../appwrite/Trips';
import { account, database, appwriteConfig } from '../../appwrite/client';
import { parseTripData, getFirstWord } from '../../lib/utils';
import UserHeader from '../../components/UserHeader';
import InfoPill from '../../components/InfoPill';
import { cn } from '../../lib/utils';
import { ChipDirective, ChipListComponent, ChipsDirective } from '@syncfusion/ej2-react-buttons';
import UserTripCard from '../../components/UserTripCard';

export const Loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;
  if (!id) throw new Error('Unable to get id from the usertripdetails');
  
  const user = await account.get();
  const trip = await getUserTripById(id, user.$id);
  const Trips = await getUserTrips(user.$id, 4, 0);

  if (!trip) throw new Error('Trip not found');

  return {
    id,
    trip,
    allTrips: Trips.trips.map((raw) => {
      const parsed = parseTripData(raw);
      let locationString = "Lagos, Nigeria";

      if (typeof parsed.location === 'string') {
        locationString = parsed.location;
      } else if (typeof parsed.location === 'object' && parsed.location !== null) {
        locationString = parsed.location.city || "Lagos, Nigeria";
      }
      return {
        id: raw.$id,
        name: parsed.name,
        imgUrl: raw.imgUrls?.[0] || "",
        location: locationString,
        estimatedPrice: parsed.estimatedPrice,
        duration: parsed.duration,
        budget: parsed.budget,
        travelStyle: parsed.travelStyle,
        interests: parsed.interests
      };
    })
  };
};

const MyItinerary = () => {
  const rawData = useLoaderData() as { trip: any, allTrips: any, id: string };
  const navigate = useNavigate();

  // 1. Core Data Evaluation
  const tripData = useMemo(() => parseTripData(rawData.trip), [rawData.trip]);

  const bookingId = tripData?.bookingId || null;

  // 2. State & Status Tracking
  const [showPopup, setShowPopup] = useState(tripData?.status !== 'finalized');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOverlayModal, setShowOverlayModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  React.useEffect(() => {
    if (tripData?.status === 'finalized') {
      setShowPopup(false);
    }
  }, [tripData?.status]);

  // 3. Safe-Guarded Data Lists
  const allTrips = rawData.allTrips || [];
  
  const imageUrls = useMemo(() => {
    if (!tripData) return [];
    return Array.isArray(tripData.imgUrls)
      ? tripData.imgUrls
      : typeof tripData.imgUrls === 'string'
        ? [tripData.imgUrls]
        : [];
  }, [tripData]);

  const pillItems = useMemo(() => {
    if (!tripData) return [];
    return [
      { text: tripData.travelStyle, bg: '!bg-pink-50 !text-pink-500' },
      { text: tripData.groupType, bg: '!bg-primary-50 !text-primary-500' },
      { text: tripData.budget, bg: '!bg-success-50 !text-success-700' },
      { text: tripData.interests, bg: '!bg-navy-50 !text-navy-500' }
    ];
  }, [tripData]);

  const visitTimeAndWeatherInfo = useMemo(() => {
    if (!tripData) return [];
    return [
      { title: 'Best time to visit', items: tripData.bestTimeToVisit || [] },
      { title: 'Weather Info', items: tripData.weatherInfo || [] }
    ];
  }, [tripData]);

  // 4. Handle Finalize with Checking Loader & Conditional Modal
  const handleFinalize = async () => {
    if (!rawData.id || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const user = await account.get();
      const freshTrip = await getUserTripById(rawData.id, user.$id);
      
    
      const isAlreadyBooked = freshTrip?.bookingStatus === 'confirmed' || freshTrip?.paymentStatus === 'paid';

      // IF ALREADY FINALIZED OR BOOKED -> Open SaaS Modal
      if ( isAlreadyBooked) {
        setIsSubmitting(false);
        setShowOverlayModal(true);
        return;
      }

      // IF NOT FINALIZED -> Process and Navigate
      const updatedDocument = await finalizeTripById(rawData.id);
      
      if (updatedDocument && updatedDocument.status === 'finalized') {
        setShowPopup(false);
        navigate(`/Home/telemetry/${rawData.id}`);
      } else {
        throw new Error("Database state mismatch");
      }
    } catch (error) {
      console.error("Could not finalize your plan ledger:", error);
      setShowPopup(true); 
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal Actions
  const handleDeleteBooking = async () => {
    setActionLoading(true);
    try {
      await database.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.tripCollectionId,
        rawData.id,
        {
          bookingStatus: 'cancelled',
          paymentStatus: 'unpaid'
        }
      );
      setShowOverlayModal(false);
      navigate('/Home');
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewTicket = () => {
    setShowOverlayModal(false);
  const targetId = bookingId || rawData.id;
  navigate(`/booking-success/${targetId}`);
  };

  const handleDeleteTrip = async () => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    setActionLoading(true);
    try {
      await database.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.tripCollectionId,
        rawData.id
      );
      setShowOverlayModal(false);
      navigate('/Home');
    } catch (err) {
      console.error('Failed to delete trip:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBookAgain = () => {
    setShowOverlayModal(false);
    navigate(`/Home/telemetry/${rawData.id}`);
  };

  // 5. Clean Fallback Placement
  if (!tripData) {
    return (
      <div className="p-10 text-slate-400 font-medium text-center bg-[#F9FAFB] min-h-screen flex items-center justify-center">
        No trip details could be compiled.
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F9FAFB]">
      
      {/* Dynamic Slide-down Toast */}
      <div 
        className={`fixed top-6 right-6 z-40 w-full max-w-sm bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl p-4 transition-all duration-500 ease-out flex items-center justify-between gap-4 shadow-sm ${
          showPopup ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-800"></span>
          </div>
          <span className="text-xs font-medium text-slate-800 truncate tracking-tight">
            Trip plan generated
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleFinalize}
            disabled={isSubmitting}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-xl shadow-xs transition-all duration-200 active:scale-[0.97] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-2.5 h-2.5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              "Finalize"
            )}
          </button>
          
          <button 
            onClick={() => setShowPopup(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* SOFT SAAS OVERLAY MODAL */}
   {/* SOFT SAAS OVERLAY MODAL */}
{showOverlayModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="w-full max-w-sm bg-white border border-slate-200/80 rounded-2xl shadow-xl p-6 relative space-y-6">
      
      {/* Minimal Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            Status: Finalized
          </span>
          <button
            type="button"
            onClick={() => setShowOverlayModal(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h3 className="text-base font-bold text-slate-900 tracking-tight pt-1">
          Trip Options
        </h3>
        <p className="text-xs text-slate-500 font-normal leading-relaxed">
          This itinerary has already been finalized and processed in your account.
        </p>
      </div>

      {/* Clean Action List */}
      <div className="space-y-2 pt-1">
        
        {/* Primary: View Ticket */}
        <button
          type="button"
          onClick={handleViewTicket}
          disabled={actionLoading}
          className="w-full px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-between transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          <span>View Ticket</span>
          <span className="text-slate-400 text-xs">→</span>
        </button>

        {/* Secondary: Book Again */}
        <button
          type="button"
          onClick={handleBookAgain}
          disabled={actionLoading}
          className="w-full px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs flex items-center justify-between transition-all cursor-pointer disabled:opacity-50"
        >
          <span>Book Again</span>
          <span className="text-slate-400 text-xs">→</span>
        </button>

        {/* Delete Booking */}
        <button
          type="button"
          onClick={handleDeleteBooking}
          disabled={actionLoading}
          className="w-full px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs flex items-center justify-between transition-all cursor-pointer disabled:opacity-50"
        >
          <span>Delete Booking</span>
          <span className="text-slate-400 text-xs">→</span>
        </button>

        {/* Delete Trip */}
        <button
          type="button"
          onClick={handleDeleteTrip}
          disabled={actionLoading}
          className="w-full px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/60 text-slate-500 hover:text-slate-800 font-medium text-xs flex items-center justify-between transition-all cursor-pointer disabled:opacity-50"
        >
          <span>Delete Trip</span>
          <span className="text-slate-400 text-xs">→</span>
        </button>
      </div>

      {/* Footer Dismiss */}
      <div className="pt-1 text-center">
        <button
          type="button"
          onClick={() => setShowOverlayModal(false)}
          className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </div>
  </div>
)}

      {/* Main Layout Interface */}
      <main className='travel-detail wrapper bg-[#F9FAFB] min-h-screen text-slate-800 selection:bg-blue-100'>
        <UserHeader title='Trip Details' description='View and Edit AI generated Travel Plans' />
        
        <section className='container wrapper-md max-w-5xl mx-auto px-6 py-10 space-y-12'>
          <header className="space-y-4">
            <h1 className='text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900'>
              {tripData.name}
            </h1>
            <div className='flex flex-wrap items-center gap-2'>
               <InfoPill text={`${tripData.duration} day plan`} image="/assets/icons/calendar.svg" className="bg-white border border-slate-200/60 shadow-sm" />
               <InfoPill text={tripData.itinerary?.slice(0,3).map((item:any) => item.location).join(', ')} image='/assets/icons/location-mark.svg' className="bg-white border border-slate-200/60 shadow-sm" />
            </div>
          </header>

          <section className='gallery grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[300px]'>
            {imageUrls.length > 0 ? (
              imageUrls.map((url: string, i: number) => (
                <div key={i} className={cn(
                  "overflow-hidden rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1",
                  i === 0 ? 'md:col-span-2 md:row-span-2 h-[350px] md:h-[480px]' : 'h-[170px] md:h-[230px]'
                )}>
                  <img 
                    src={url} 
                    alt={`Trip Image ${i}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Not+Found";
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full p-20 bg-white rounded-[2rem] text-center border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium italic">Curating your visual journey...</p>
              </div>
            )}
          </section>

          <section className='flex justify-between items-center flex-wrap gap-6 py-8 border-y border-slate-200/60'>
            <div className="flex gap-2 items-center flex-wrap">
              <ChipListComponent id='travel-chip'>
                <ChipsDirective>
                 {pillItems.map((pill, i) => (
                  <ChipDirective
                    key={i}
                    text={getFirstWord(pill.text)}
                    cssClass={cn(`${pill.bg} !text-[12px] !tracking-wider !font-bold !rounded-lg !px-4 !py-1.5 !border-none !shadow-sm`)}
                  />
                 ))}
                </ChipsDirective>
              </ChipListComponent>
            </div>
            
            <div className='flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-100'>
              <ul className='flex gap-0.5 items-center'>
                {Array(5).fill(null).map((_, index) => (
                  <li key={index}>
                    <img src="/assets/icons/star.svg" alt="star" className='size-4' style={{ filter: 'invert(75%) sepia(80%) saturate(500%) hue-rotate(10deg)' }} />
                  </li>
                ))}
              </ul>
              <span className="text-sm font-bold text-slate-700 tracking-tight">4.5 Rating</span>
            </div>
          </section>

          <section className='grid md:grid-cols-3 gap-12 items-start'>
            <article className="md:col-span-2 space-y-6">
              <h3 className="text-2xl font-bold text-slate-900">
                Experience {tripData.country}
              </h3>
              <p className='text-xl leading-relaxed text-slate-600 font-normal'>
                {tripData.description}
              </p>
            </article>

            <aside className="bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black">estimated cost</p>
                <h4 className="text-3xl font-bold text-slate-900">{tripData.estimatedPrice}</h4>
              </div>
              <div className="pt-6 border-t border-slate-50 text-[13px] text-slate-500 font-medium leading-loose">
                <span className="block">👤 {tripData.groupType}</span>
                <span className="block">💰 {tripData.budget}</span>
                <span className="block">🎨 {tripData.interests}</span>
              </div>
            </aside>
          </section>

          <section className="space-y-10">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">The Itinerary</h2>
            <ul className='space-y-6 relative before:absolute before:left-[23px] before:top-4 before:bottom-4 before:w-[1px] before:bg-slate-200'>
              {tripData.itinerary?.map((dayPlan: any, index: number) => (
                <li key={index} className="relative pl-16 group">
                  <div className="absolute left-0 top-0 size-[48px] rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center z-10 group-hover:border-blue-400 transition-all duration-300">
                     <span className="text-sm font-bold text-slate-900">{index + 1}</span>
                  </div>
                  
                  <div className="bg-white p-8 rounded-[1.5rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.04)] transition-shadow duration-500">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">
                       Day {dayPlan.day}: <span className="text-slate-400 font-semibold">{dayPlan.location}</span>
                    </h3>

                    <ul className='space-y-4'>
                      {dayPlan.activities?.map((activity: any, aIdx: number) => (
                        <li key={aIdx} className="flex flex-col md:flex-row gap-2 md:gap-8 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                          <span className='text-xs font-black text-blue-600/70 w-24 flex-shrink-0 uppercase tracking-widest'>{activity.time}</span>
                          <p className='text-slate-600 font-medium text-[15px] leading-snug'>{activity.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid md:grid-cols-2 gap-8">
            {visitTimeAndWeatherInfo.map((section) => (
              <div key={section.title} className='p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm'>
                 <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                   <span className="size-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                   {section.title}
                 </h3>
                 <ul className="space-y-3">
                   {section.items?.map((item: string) => (
                     <li key={item} className="text-slate-500 text-[14px] leading-relaxed flex items-start gap-3">
                       <span className="text-blue-500 font-bold">→</span> {item}
                     </li>
                   ))}
                 </ul>
              </div>
            ))}
          </section>
        </section>
             
        <section className='container max-w-5xl mx-auto px-6 flex flex-col gap-6 pb-24'>
          <h2 className='text-xl font-bold text-slate-900'>{allTrips.length === 1 ? "View your last trip" : "View Previous Trips"}</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'>
            {allTrips.map((trip: any) => (
              <UserTripCard 
                key={trip.id}
                id={trip.id} 
                name={trip.name} 
                imgUrl={trip.imgUrl}      
                location={trip.location}   
                price={trip.estimatedPrice} 
                tags={[trip.interests, trip.travelStyle]} 
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default MyItinerary;