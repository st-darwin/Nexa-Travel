import React, { useState, useEffect } from 'react'
import Header from '../../components/Header'
import { ComboBoxComponent } from "@syncfusion/ej2-react-dropdowns"
import { useFetcher, useLoaderData, useNavigate } from 'react-router-dom'
import { comboBoxItems ,  selectItems} from '../../constants'
import { LayerDirective, LayersDirective, MapsComponent } from '@syncfusion/ej2-react-maps'
import { world_map } from '../../constants/world_map'
import { account } from '../../appwrite/client'



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


const CreateTrips = () => {
  const countries = useLoaderData() as any[];
  const navigate = useNavigate()
  const fetcher = useFetcher()
  
  const [error , setError] = useState<string | null>(null)
  
  // Sync loading state with the fetcher state
  const loading = fetcher.state === "submitting" || fetcher.state === "loading";

 const [formData , setFormData] = useState<TripFormData>({
      country : countries[0]?.value || '',
      travelStyle: '',
      interest: '',
      budget: '',
      duration: 0,
      groupType: ''
 })

 // get the country obj that matches the the selected i guess...
 

  const selectedCountry = countries.find((c: any) => c.value === formData.country);

  // Watch for the action result to navigate or show errors
  useEffect(() => {
    // if darta gotten from the ai response is ready...navigate to the trip details
    if (fetcher.data?.id) {
      navigate(`/trips/${fetcher.data.id}`);
    } else if (fetcher.data?.error) {
      setError(fetcher.data.error);
    }
  }, [fetcher.data, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if(
      !formData.country || !formData.budget ||
       !formData.duration || !formData.groupType ||
       !formData.interest|| !formData.travelStyle
    ){ 
      setError("Please the provide the values of all fields..")
      return; 
    }

    if(formData.duration < 1 || formData.duration > 10 ){
      setError("Duration must be between 1 - 10 days ! ")
      return ;
    } 
    
    setError(null)

    try {
      // gets the current session
      const user = await account.get()
      
      if(!user.$id) {
        setError("This user is not authenticated")
        return;
      }

      // Submit to the Route Action instead of manual fetch
      fetcher.submit(
        {
          country: formData.country,
          numberOfDays: formData.duration,
          travelStyle: formData.travelStyle,
          interests: formData.interest, // Mapping singular to plural for the action
          budget: formData.budget,
          groupType: formData.groupType,
          userId: user.$id, // userId was submitted in the action, now we get it from the session and pass it along with the form data
          email: user.email,
        name: user.name,

        },
        { method: "post", encType: "application/json" }
      );

    } catch(err) {
      console.log("Auth error :" , err)
      setError("Authentication failed. Please log in again.")
    }
  }

  const handleChange = ( key : keyof TripFormData , value : string | number) =>{
    setFormData((prev) => ({...prev , [key]:value}))
  }
  // just for the map color shading or
  const mapData = [
    {
        country: selectedCountry ? selectedCountry.text.split(' ').slice(1).join(' ') : '',
        color : '#1E90FF',
        coordinatess : selectedCountry?.coordinates || []
    }
  ]

const sassyQuotes = [
  "Main character energy only. Please hold...",
  "Scanning for spots that aren't on TikTok yet.",
  "Deleting the tourist traps. You're welcome.",
  "Consulting the vibes. They're currently immaculate.",
  "Ensuring your Instagram feed stays top-tier.",
  "Filtering out the 'Basic' destinations...",
  "Building a trip your ex will definitely be jealous of.",
  "Sit tight, we’re busy being iconic.",
  "Locating the best views (and the strongest drinks).",
  "Doing the heavy lifting so you don't have to.",
  "Translating your wanderlust into actual plans.",
  "Gatekeeping the best spots, just for you.",
  "Processing... Good things take time, babe.",
  "Checking the itinerary for 'average' behavior. (Found none).",
  "Manifesting your best life. One second..."
];
// This picks a fresh quote every time the 'loading' state starts
const [currentQuote, setCurrentQuote] = useState<string>(sassyQuotes[0]);

useEffect(() => {
  if (loading) {
    const randomQuote = sassyQuotes[Math.floor(Math.random() * sassyQuotes.length)];
    setCurrentQuote(randomQuote)
    
    ;
    
  }
}, [loading]);

  return (

    <main className='flex flex-col gap-10 pb-20 wrapper'>

      {/* LOADING OVERLAY */}

      {loading && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white/40 backdrop-blur-[20px] transition-all duration-700 ease-in-out">
    
    {/* The Glass Card */}
    <div className="relative p-12 rounded-[3rem] bg-white/20 border border-white/40 shadow-2xl flex flex-col items-center max-w-sm w-[90%] overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute -top-20 -left-20 size-64 bg-primary-100/10 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute -bottom-20 -right-20 size-64 bg-blue-400/10 blur-[100px] rounded-full animate-pulse delay-700" />

      {/* Floating Icon Logic */}
      <div className="relative mb-10">
        <div className="absolute inset-0 rounded-full bg-primary-100/10 scale-150 animate-ping" />
        <div className="relative flex items-center justify-center size-28 rounded-full bg-white/80 shadow-inner border border-white/50 backdrop-blur-md">
          <img 
            src="/assets/icons/magic-star.svg" 
            className="size-14 animate-[spin_4s_linear_infinite] drop-shadow-xl" 
            alt="Magic" 
          />
        </div>
      </div>

      {/* Text Stack */}
      <div className="space-y-4 relative z-10">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Synthesizing<span className="text-primary-100 animate-pulse">...</span>
        </h2>
        
        <p className="text-slate-600 font-medium italic min-h-[48px]">
          "{currentQuote}"
        </p>

        {/* Minimalist Progress Line */}
        <div className="relative w-full h-1 bg-slate-200/50 rounded-full overflow-hidden mt-6">
          <div className="absolute h-full bg-gradient-to-r from-transparent via-primary-100 to-transparent w-1/2 animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>

      {/* Footer Label */}
      <div className="mt-10 flex items-center gap-2 opacity-60">
         <span className="size-1.5 rounded-full bg-green-400 animate-pulse" />
         <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
           Destination: {selectedCountry?.text.split(' ').slice(1).join(' ') || "The Unknown"}
         </p>
      </div>
    </div>
  </div>
)}

      <Header
        title='Hi There... Add a new Trip ✌️'
        description='View and edit AI-generated travel plans'
      />

      <section className='mt-2.5 wrapper-md'>
        <form className='trip-form' onSubmit={handleSubmit}>

            {/* COMBO BOX */}
          <div className="flex flex-col gap-2">
            <label htmlFor="country" className="font-semibold text-slate-700">
              Country
            </label>
            <ComboBoxComponent
              id="country"
              dataSource={countries} 
              fields={{ text: 'text', value: 'value' }}
              placeholder='Select a country'
              className="combo-box"
              cssClass="e-soft-custom"
              change={(e : {value:string | undefined}) =>{
                if(e.value){
                    handleChange('country' , e.value )
                }
              } }
               allowFiltering={true}
               filtering={(e) =>{
                const query = e.text.toLowerCase();
                e.updateData(
                    countries.filter((country :any) => country?.text?.toLowerCase().includes(query)).map((country) =>({
                        text: country.text,
                        value: country.value,
                    }))
                )
               }}
            />
          </div>

          <div>
            <label className='font-semibold' htmlFor="duration">Duration</label>
            <input
            id='duration'
            name='duration'
            className='form-input placeholder:text-gray-100'
            onChange={(e)=> handleChange( "duration" , Number(e.target.value) )}
            type="number" placeholder='Enter the number of days...' />
          </div>

          {selectItems.map((key) =>(
            <div key={key}>
                <label htmlFor={key}>{key}</label>
                <ComboBoxComponent
                id={key}
                className='combo-box'
                dataSource={comboBoxItems[key].map((item) =>({
                    text: item,
                    value : item,
                }))}
                change={(e: any) => {
                  
               if (e.value) handleChange(key as keyof TripFormData, e.value);
                  }}
                   placeholder={`Select ${key}...`}
                />
            </div>
          ))}

            {/* LOCATION */}
<div className="relative w-full max-w-5xl mx-auto group px-4 sm:px-0">
  {/* The "Glow" - Ambient mesh gradient behind the card */}
  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-100/40 via-purple-50/30 to-blue-100/40 blur-3xl rounded-[3rem] opacity-60 pointer-events-none" />

  {/* Main Outer Container */}
  <div className="relative p-1.5 sm:p-2 rounded-[32px] sm:rounded-[40px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.03)] transition-all duration-500 hover:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.08)]">
    
    <div className="bg-white rounded-[26px] sm:rounded-[34px] p-5 sm:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-slate-50">
      
      {/* Header Section - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 sm:mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-500 uppercase tracking-[0.15em]">System Live</span>
            <span className="text-[10px] font-medium text-slate-300 uppercase tracking-widest">• Global v5.0 </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Network <span className="text-slate-400 font-light ">Core</span>
          </h2>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center self-start sm:self-center gap-3 px-4 py-2 bg-slate-50/80 border border-slate-100/50 rounded-2xl">
         
          <span className="text-xs font-semibold text-slate-600 tracking-wide">99.9% Uptime</span>
        </div>
      </div>

      {/* Map Stage - Deep Inset Softness */}
      <div className="relative p-2 sm:p-3 bg-slate-50/50 rounded-[24px] sm:rounded-[32px] border border-slate-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="overflow-hidden bg-white border border-slate-200/50 rounded-[18px] sm:rounded-[24px] shadow-sm">
          <MapsComponent 
            background="transparent" 
            margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
            className="w-full h-[250px] sm:h-[450px]" // Responsive height
          >
            <LayersDirective>
              <LayerDirective
                dataSource={mapData}
                shapeDataPath='country'
                shapePropertyPath='name'
                shapeSettings={{ 
                  colorValuePath : 'color',
                  fill: '#F8FAFC', 
                  border: { color: '#E2E8F0', width: 1 } 
                }}
                shapeData={world_map} 
              />
            </LayersDirective>
          </MapsComponent>
        </div>

        {/* Decorative corner highlights */}
        <div className="absolute top-6 left-6 w-8 h-8 border-t-[1.5px] border-l-[1.5px] border-slate-200/60 rounded-tl-xl pointer-events-none" />
        <div className="absolute bottom-6 right-6 w-8 h-8 border-b-[1.5px] border-r-[1.5px] border-slate-200/60 rounded-br-xl pointer-events-none" />
      </div>

      {/* Footer Stats - Grid System for Mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 mt-10 px-2">
        {[
          { label: 'Active Regions', val: '124', unit: 'Loc' },
          { label: 'Latency Avg', val: '24', unit: 'ms' },
          { label: 'Node Count', val: '8.4', unit: 'k' },
          { label: 'Throughput', val: '1.2', unit: 'gb/s' }
        ].map((stat, i) => (
          <div key={i} className="flex flex-col gap-1 group/stat cursor-default">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-colors group-hover/stat:text-indigo-400">
              {stat.label}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-semibold text-slate-800 font-mono tracking-tighter">
                {stat.val}
              </span>
              <span className="text-[10px] font-black text-slate-300 uppercase">
                {stat.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

          <div className='bg-gray-200 h-px w-full'/>

     {error && (
  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm">
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] rounded-xl px-4 py-3 flex items-center justify-between">
      
      <div className="flex items-center gap-3">
        {/* Minimalist dot indicator instead of a big icon */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        
        <p className="text-[13px] font-medium text-slate-600 tracking-tight">
          {error}
        </p>
      </div>

      <button 
        onClick={() => setError(null)}
        className="group p-2 hover:bg-slate-100 rounded-full transition-all duration-200"
      >
        <svg 
          className="w-4 h-4 text-slate-400 group-hover:text-slate-600" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
)}

          <footer className=' !h-12 !w-50 !m-auto'>
            <button 
              disabled={loading} 
              type='submit' 
              className='px-5 duration-500 py-3 w-full flex items-center justify-center gap-3 bg-black rounded-2xl shadow-soft hover:scale-103 active:scale-70 hover:shadow-md cursor-pointer active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed'
            >
              <img 
                className={`size-7 ${loading ? "animate-spin" : ""}`} 
                src={`/assets/icons/${loading ? "loader.svg" : "magic-star.svg"}`} 
                alt="" 
              />
              <span className='font-medium text-white'>
                {loading ? "Synthesizing..." : "Generate Trip"}
              </span>
            </button>
          </footer>
        </form>
      </section>
    </main>
  )
}

export default CreateTrips;
