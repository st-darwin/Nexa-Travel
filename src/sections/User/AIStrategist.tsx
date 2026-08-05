
// ai planner 
import { ComboBoxComponent } from "@syncfusion/ej2-react-dropdowns";
import { useLoaderData, useNavigate } from "react-router-dom";
import UserHeader from "../../components/UserHeader"
import { useState , useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useFetcher } from "react-router-dom";
import { account } from "../../appwrite/client";
import { world_map } from "../../constants/world_map";
import { comboBoxItems , selectItems } from "../../constants";
import { MapsComponent , LayerDirective , LayersDirective } from "@syncfusion/ej2-react-maps";
import { FALLBACK_COUNTRIES } from "../../constants/countriesData";



export const Loader = async () => {
  try {
    const res = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://restcountries.com/v3.1/all?fields=name,cca2,flag,latlng,maps'));
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("Response is not an array");

    return data
      .map((country: any) => ({
        text: `${country.flag || ''} ${country.name?.common || ''}`,
        value: country.cca2 || '',
        coordinates: country.latlng || [],
        openStreetmap: country.maps?.openStreetMap || ''
      }))
      .sort((a: any, b: any) => a.text.localeCompare(b.text));

  } catch (error) {
    console.warn("API load failed, using local fallback country list:", error);
    // Graceful Fallback: Application loads instantly without crashing
    return FALLBACK_COUNTRIES;
  }
}

const AIStrategist = () => {
  const countries = useLoaderData() as any[];
  
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const loading = fetcher.state !== "idle";

  const [error, setError] = useState<string | null>(null);
  const [formData , setFormData] = useState({
     country: "",
    travelStyle: "",
    interest: "",
    budget: "",
    duration: 0,
    groupType: "",
   // initial form data state, can be empty or have default values


  })
    
   const selectedCountry = countries.find((c: any) => c.value === formData.country);

     useEffect(() => {
       // if darta gotten from the ai response is ready...navigate to the trip details
       if (fetcher.data?.id) {
         navigate(`/Home/my-itinerary/${fetcher.data.id}`);
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

   // to handle change on the combo box 
   // update the the value of the form data 
const handleChange = (key: string, value: string | number) => {
  setFormData((prev) => ({ ...prev, [key]: value }));
};
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
    <main className="min-h-screen bg-slate-50">


      
{loading && (
  <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-slate-50/40 backdrop-blur-[24px] transition-all duration-1000 ease-in-out">
    
    {/* Minimal Floating Module */}
    <div className="relative bg-white p-10 rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)] border border-white/60 flex flex-col items-center max-w-sm w-[90%] space-y-10 group">
      
      {/* 1. Subtle Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/20 to-transparent rounded-[48px] pointer-events-none" />

      {/* 2. The Core Synthesis Icon */}
      <div className="relative">
        {/* Animated Outer Ring (Soft Pulse) */}
        <div className="absolute inset-[-16px] rounded-full bg-indigo-100/20 scale-110 animate-[pulse_3s_infinite]" />
        
        {/* Inner Glass Orb */}
        <div className="relative flex items-center justify-center size-24 rounded-full bg-white shadow-[0_8px_32px_rgba(0,0,0,0.02),inset_0_2px_8px_rgba(0,0,0,0.02)] border border-slate-100/50 backdrop-blur-md">
          {/* Minimal Spin Ring */}
          <div className="absolute inset-0 rounded-full border-[2px] border-indigo-500/10 border-t-indigo-500 animate-spin [animation-duration:1.5s]" />
          
          <img 
            src="/assets/icons/logo1.svg" 
            className="size-10  drop-shadow-sm" 
            alt="AI" 
          />
        </div>
      </div>

      {/* 3. Text Stack (Refined Typography) */}
      <div className="w-full space-y-5 relative z-10 text-center">
        <div className="space-y-1.5">
          <p className="text-[10px] font-black text-indigo-500/80 uppercase tracking-[0.3em]">Processing Trip 🍃</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Nexa <span className="text-slate-400 font-light">Intelligence</span>
          </h2>
        </div>
        
        {/* Soft Quote Box */}
        <div className="px-6 py-4 bg-slate-50/50 rounded-3xl border border-slate-100/50">
          <p className="text-slate-500 text-[13px] font-medium italic leading-relaxed">
            "{currentQuote}"
          </p>
        </div>
      </div>

      {/* 4. Minimal Detail Footer */}
      <div className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
        </span>
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
          {selectedCountry?.text.split(' ').slice(1).join(' ') || "Universal"} / v1.0 NexaLabs
        </p>
      </div>

    </div>

    {/* Elegant Bottom Edge Progress */}
    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100/30">
      <div className="h-full bg-indigo-500/40 w-1/3 animate-[shimmerMobile_2.5s_infinite]" />
    </div>

  </div>
)}
    
    <div>
     <UserHeader
     title="Personalized AI Strategist"
      description="Transform raw intent into curated journeys. Nexa leverages deep-learning to synthesize routes, budgets, and experiences in real-time."
      ctaText="view Trip Archive"
      ctaUrl="/Home/archive"
     />

     <section className="mt-4 xl:mt-10 wrapper-md">
      <form className="trip-form" onSubmit={handleSubmit}>
     
                 {/* COMBO BOX  FOR COUNTRY*/}
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
                       // filter the coutries then matches with the query(in smalls lettes )then return the text and value of the matched country to be shown in the combo box
                      countries.filter((c: any) => c.text.toLowerCase().includes(query)).map((c: any) => ({ text: c.text, value: c.value }))
                     )
                    }}
                 />
               </div>
                {/*Duration */}
               <div>
                    <label htmlFor="duration" className="font-semibold text-slate-700">
                   Duration
                 </label>
                 <input
                   id="duration"
                   name="duration"
                   className="form-input placeholder:text-gray-100"
                   onChange={(e) => handleChange("duration", Number(e.target.value))}
                   type="number"
                   placeholder='Enter the number of days...'
                 />

               </div>

               {/* Other fields */}

            {selectItems.map((itemKey) => (
  <div className="flex flex-col gap-2 my-4" key={itemKey}>
    <label htmlFor={itemKey} className="font-semibold text-slate-700 capitalize">
      {itemKey.replace(/([A-Z])/g, ' $1')} {/* Formats groupType to Group Type */}
    </label>
    <ComboBoxComponent
      id={itemKey}
      className="combo-box"
      cssClass="e-soft-custom"
      placeholder={`Select ${itemKey}...`}
      dataSource={comboBoxItems[itemKey]} // No need to .map() if constants are simple strings
      change={(e) => {
        if (e.value) handleChange(itemKey, e.value as string);
      }}
      allowFiltering={true}
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

               {/* Error handling and messages */}
               
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

              {/* CTA Button */}
<div className="mt-8 mb-12">
  <button
    type="submit"
    disabled={loading}
    className="group cursor-pointer relative hover:scale-[1.01] duration-300 w-full overflow-hidden rounded-2xl bg-[#0a0a0a] py-4 px-8 transition-all duration-300 active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
  >
    {/* Subtle Inner Glow */}
    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    {/* Sleek Glass Border */}
    <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-white/20 transition-colors" />

    <div className="relative flex items-center justify-center gap-3">
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
          <span className="text-[13px] font-bold tracking-[0.25em] text-indigo-100 uppercase animate-pulse">
            Synthesizing
          </span>
        </>
      ) : (
        <span className="text-[13px] font-bold tracking-[0.1em] text-white  transition-all duration-500 ease-out uppercase">
          Generate Trip Itinerary
        </span>
      )}
    </div>
  </button>
</div>
      </form>
     </section>
    </div>
    </main>
  )
}

export default AIStrategist
