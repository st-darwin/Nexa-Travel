import React from 'react'
import { useLoaderData, type LoaderFunctionArgs } from 'react-router-dom'
import { getALlTrips, getTripById } from '../../appwrite/Trips';
import { getFirstWord, parseTripData } from '../../lib/utils';
import Header from '../../components/Header';
import InfoPill from '../../components/InfoPill';
import { cn } from '../../lib/utils';
import { ChipDirective, ChipListComponent, ChipsDirective } from '@syncfusion/ej2-react-buttons';
import TripCard from '../../components/TripCard';




export const loader = async({params} :LoaderFunctionArgs ) => {
  const {id} = params;

  if(!id) throw new Error('Trip id required')

  const trip =  await getTripById(id)
  const Trips = await getALlTrips(4 , 0)

  return {
    trip , 
    allTrips : Trips.allTrips.map((raw) => {
      const parsed = parseTripData(raw)
      let locationString = "Lagos, Nigeria"; // fallback
  
  if (typeof parsed.location === 'string') {
    locationString = parsed.location;
  } else if (typeof parsed.location === 'object' && parsed.location !== null) {
    // If it's the object with {city, coordinates}, grab just the city name
    locationString = parsed.location.city || "Lagos, Nigeria";
  }
      return{
        id : raw.$id,
        name : parsed.name,
        imgUrl: raw.imgUrls?.[0] || "", // Pass the first image string
        location: locationString,
        estimatedPrice: parsed.estimatedPrice,
        duration: parsed.duration,
        budget: parsed.budget,
        travelStyle : parsed.travelStyle,
        interests : parsed.interests
      }
    })

  }

}
const TripDetails = () => {
  const rawData = useLoaderData() as {trip : any ; allTrips : any};
  
  const tripData = React.useMemo(() => parseTripData(rawData.trip), [rawData.trip]);
  if (!tripData) return <div className="p-10 text-white">No trip data found.</div>;
  
  const allTrips = rawData.allTrips || []
  

  if (!tripData) return <div className="p-10 text-white">No trip data found.</div>;

  // 1. SAFE IMAGE DATA: Force it into an array
  const imageUrls = Array.isArray(tripData.imgUrls) 
    ? tripData.imgUrls 
    : typeof tripData.imgUrls === 'string' 
      ? [tripData.imgUrls] 
      : [];

      const pillItems =[
        {text : tripData.travelStyle, bg: '!bg-pink-50 !text-pink-500  '},
        {text : tripData.groupType , bg: '!bg-primary-50 !text-primary-500'},
        {text: tripData.budget , bg: '!bg-success-50 !text-success-700'},
        {text: tripData.interests , bg: '!bg-navy-50 !text-navy-500'}
      ]

      const visitTimeAndeatherInfo =[
        {title : 'Best time to visit' , items : tripData.bestTimeToVisit },
        {title : 'Weather Info' , items : tripData.weatherInfo}
      ]

     



  return (
    <main className='travel-detail wrapper'>
      <Header title='Trip Details' description='View and Edit AI generated Travel Plans' />
      
      <section className='container wrapper-md'>
        <header>
          <h1 className='p-40-semibold'>{tripData.name}</h1>
          <div className='flex items-center gap-5'>
             <InfoPill text={`${tripData.duration} day plan`} image="/assets/icons/calendar.svg" />
             <InfoPill text = {tripData.itinerary?.slice(0,3).map((item:any) => item.location).join( ', ')} image='/assets/icons/location-mark.svg'/>
          </div>
        </header>

        {/* 2. GALLERY: Added 'grid' and 'min-h' to make it visible */}
        <section className='gallery grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 min-h-[300px]'>
          {imageUrls.length > 0 ? (
            imageUrls.map((url: string, i: number) => (
              <img 
                src={url} 
                key={i} 
                alt={`Trip image ${i}`} 
                className={cn(
                  'w-full rounded-xl object-cover ', 
                  i === 0 ? 'md:col-span-2 md:row-span-2 h-[330px]' : 'h-[160px]'
                )}
                onError={(e) => {
                  console.error("Failed to load image:", url);
                  (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Not+Found";
                }}
              />
            ))
          ) : (
            <div className="col-span-full p-10 bg-neutral-900 rounded-xl text-center border border-dashed border-white/20">
              <p className="text-gray-400">No images available for this trip.</p>
            </div>
          )}
        </section>

        {/* CHIPS */}
        <section className='flex gap-3 md:gap-5 items-center flex-wrap'>
          <ChipListComponent id='travel-chip'>
            <ChipsDirective>
             {pillItems.map((pill , i) => (
              <ChipDirective
              key={i}
              text={getFirstWord(pill.text)}
              cssClass={cn(`${pill.bg} !text-base !font-medium !px-3`)}
              />
             ))}
            </ChipsDirective>
          </ChipListComponent>
          <ul className='flex gap-1 items-center'>
            {
        
            
            Array(5).fill(null).map((_ , index) => (
              <li key={index}>
                <img src="/assets/icons/star.svg" alt="star"  className='size-[18px]'/>
              </li>
             
            )) }
            <li className='ml-1'>
              <ChipListComponent>
                <ChipsDirective>

                  <ChipDirective
                  text='4.5/5'
                  cssClass='!bg-yellow-50 !text-yellow-800'
                  />
                </ChipsDirective>
              </ChipListComponent>
            </li>
          </ul>
        </section>
        <section className='title'>
          <article>
            <h3>
              {tripData.duration} - day {tripData.country} {tripData.travelStyle}
            </h3>
            <p>
              {tripData.budget} , {tripData.groupType} and {tripData.interests} 
            </p>
          </article>

            {/* Price chip */}
            

            <ChipListComponent>
              <ChipsDirective>
                <ChipDirective
                text={tripData.estimatedPrice}
                cssClass='!bg-success-50 !text-success-700 !font-semibold text-sm'
                />
              </ChipsDirective>
            </ChipListComponent>

        </section>
        <p className='text-sm md:text-lg font-normal text-dark-400 '>{tripData.description}</p>
         <ul className='itinerary'>
          {tripData.itinerary?.map((dayPlan : DayPlan , index : number)  =>(
            <li key={index}>
              <h3>{dayPlan.day} : {dayPlan.location}</h3>

              <ul>
                {dayPlan.activities.map((activity , index : number) =>(
                    <li key={index}>
                      <span className='flex-shrink-0 p-18-semibold'>{activity.time}</span>
                      <p className='flex-grow'>{activity.description}</p>
                      </li>
                ))}
              </ul>
            </li>
          ))}

         </ul>
          {/*  Time and Weather */}
         
         {visitTimeAndeatherInfo.map((section) => (
          <section key={section.title} className='visit'>
            <div>
              <h3>{section.title}</h3>
              <ul>
                {section.items.map((item : string) => (
                  <li key={item}>
                    <p className='flex-grow'>{item}</p>
                  </li>
                ))}
              </ul>
            </div>
           
          </section>
         ))}



      </section>
      
         <section className='flex flex-col gap-6 '>
          <h2 className='p-24-semibold !text-dark-100'>Some Popular Trips</h2>
          <div className='trip-grid'>
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

          </div>
         </section>
    </main>
  );
};

export default TripDetails
