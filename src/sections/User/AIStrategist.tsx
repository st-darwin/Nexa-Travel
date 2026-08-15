import { useLoaderData, useNavigate, useFetcher } from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import { useState, useEffect, useRef } from "react";
import { Loader2, ChevronDown, Check, Sparkles, Lock } from "lucide-react";
import { account, database } from "../../appwrite/client";
import { Query } from "appwrite";
import { world_map } from "../../constants/world_map";
import { comboBoxItems, selectItems } from "../../constants";
import { MapsComponent, LayerDirective, LayersDirective } from "@syncfusion/ej2-react-maps";
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
    return FALLBACK_COUNTRIES;
  }
};

// Custom Minimal Select Component
const MinimalSelect = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  id
}: {
  options: { text: string; value: string }[] | string[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  label?: string;
  id: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { text: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find((o) => o.value === value);

  return (
    <div className="flex flex-col gap-1.5 my-2 w-full" ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          id={id}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200/85 rounded-xl text-slate-800 text-sm font-medium shadow-sm hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
        >
          <span className={`truncate pr-2 ${selectedOption ? "text-slate-900" : "text-slate-400"}`}>
            {selectedOption ? selectedOption.text : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto bg-white border border-slate-100 rounded-xl shadow-lg shadow-slate-200/50 py-1 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-150">
            {normalizedOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
                  value === option.value ? "bg-indigo-50/60 text-indigo-600 font-semibold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="truncate pr-2">{option.text}</span>
                {value === option.value && <Check className="w-4 h-4 shrink-0 text-indigo-600" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AIStrategist = () => {
  const countries = useLoaderData() as any[];
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const loading = fetcher.state !== "idle";

  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [generationsUsed, setGenerationsUsed] = useState<number>(0);
  const FREE_LIMIT = 3;

  const [formData, setFormData] = useState({
    country: "",
    travelStyle: "",
    interest: "",
    budget: "",
    duration: 0,
    groupType: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchUserData() {
      try {
        const user = await account.get();
        if (!isMounted || !user.$id) return;

        // Query the custom 'users' collection using accountId
        const response = await database.listDocuments(
          '69bb1c70000c9d476c30', // Your Database ID
          'users',              // Your Collection ID
          [Query.equal('accountId', user.$id)]
        );

        if (isMounted && response.documents.length > 0) {
          const userDoc = response.documents[0];
          const activePro = userDoc.subscriptionStatus === 'active';
          const used = Number(userDoc.generationsToday || 0);

          setIsPro(activePro);
          setGenerationsUsed(used);
        }
      } catch (err) {
        console.warn("Could not fetch user profile data from database:", err);
      }
    }

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCountry = countries.find((c: any) => c.value === formData.country);

  useEffect(() => {
    if (fetcher.data?.id) {
      navigate(`/Home/my-itinerary/${fetcher.data.id}`);
    } else if (fetcher.data?.error) {
      setError(fetcher.data.error);
    }
  }, [fetcher.data, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isPro && generationsUsed >= FREE_LIMIT) {
      setError(`Free generation limit reached (${FREE_LIMIT}/${FREE_LIMIT}). Upgrade to Pro for unlimited AI itineraries!`);
      return;
    }

    if (!formData.country || !formData.budget || !formData.duration || !formData.groupType || !formData.interest || !formData.travelStyle) {
      setError("Please provide values for all fields.");
      return;
    }

    if (formData.duration < 1 || formData.duration > 10) {
      setError("Duration must be between 1 - 10 days!");
      return;
    }

    setError(null);

    try {
      const user = await account.get();
      if (!user.$id) {
        setError("This user is not authenticated");
        return;
      }

      fetcher.submit(
        {
          country: formData.country,
          numberOfDays: formData.duration,
          travelStyle: formData.travelStyle,
          interests: formData.interest,
          budget: formData.budget,
          groupType: formData.groupType,
          userId: user.$id,
          email: user.email,
          name: user.name,
        },
        { method: "post", encType: "application/json" }
      );
    } catch (err) {
      console.log("Auth error:", err);
      setError("Authentication failed. Please log in again.");
    }
  };

  const handleChange = (key: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const mapData = [
    {
      country: selectedCountry ? selectedCountry.text.split(' ').slice(1).join(' ') : '',
      color: '#4F46E5',
      coordinates: selectedCountry?.coordinates || []
    }
  ];

  const sassyQuotes = [
    "Main character energy only. Please hold...",
    "Scanning for spots that aren't on TikTok yet.",
    "Deleting the tourist traps. You're welcome.",
    "Consulting the vibes. They're currently immaculate.",
    "Ensuring your Instagram feed stays top-tier.",
    "Gatekeeping the best spots, just for you."
  ];

  const [currentQuote, setCurrentQuote] = useState<string>(sassyQuotes[0]);

  useEffect(() => {
    if (loading) {
      const randomQuote = sassyQuotes[Math.floor(Math.random() * sassyQuotes.length)];
      setCurrentQuote(randomQuote);
    }
  }, [loading]);

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20 overflow-x-hidden">
      {loading && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-slate-50/40 backdrop-blur-[24px] px-4 transition-all duration-1000 ease-in-out">
          <div className="relative bg-white p-6 sm:p-10 rounded-[36px] sm:rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)] border border-white/60 flex flex-col items-center max-w-sm w-full space-y-8 sm:space-y-10">
            <div className="relative flex items-center justify-center size-20 sm:size-24 rounded-full bg-white shadow-sm border border-slate-100">
              <div className="absolute inset-0 rounded-full border-[2px] border-indigo-500/10 border-t-indigo-500 animate-spin [animation-duration:1.5s]" />
              <img src="/assets/icons/logo1.svg" className="size-8 sm:size-10 drop-shadow-sm" alt="AI" />
            </div>

            <div className="w-full space-y-4 sm:space-y-5 relative z-10 text-center">
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-indigo-500/80 uppercase tracking-[0.3em]">Processing Trip 🍃</p>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                  Nexa <span className="text-slate-400 font-light">Intelligence</span>
                </h2>
              </div>
              <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-50/50 rounded-2xl sm:rounded-3xl border border-slate-100/50">
                <p className="text-slate-500 text-xs sm:text-[13px] font-medium italic leading-relaxed">
                  "{currentQuote}"
                </p>
              </div>
            </div>
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

        <section className="mt-6 max-w-4xl mx-auto px-4 sm:px-6">
           {/* Subscription / Usage Banner */}
           <div className="mb-6 p-4 sm:p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden transition-all duration-300">
    {/* Subtle ambient background glow for Pro */}
    {isPro && (
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-zinc-900/[0.02] rounded-full blur-2xl pointer-events-none" />
    )}
    
    <div className="flex items-center gap-3.5 relative z-10">
      {/* Minimalist tier badge container */}
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors duration-300 ${isPro ? 'bg-zinc-900 border-zinc-800 text-white shadow-xs' : 'bg-zinc-100 border-zinc-200/80 text-zinc-600'}`}>
        <span className="font-mono text-[10px] font-bold tracking-wider">{isPro ? 'PRO' : 'FREE'}</span>
      </div>
      
      <div className="space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-xs font-semibold text-zinc-900 tracking-tight">
            {isPro ? 'Nexa Pro Workspace' : 'Free Tier Workspace'}
          </h4>
          {isPro && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium bg-zinc-100 text-zinc-800 rounded-full border border-zinc-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-500 font-normal">
          {isPro ? 'Unlimited high-speed itinerary generations enabled.' : `Generations used: ${generationsUsed}/${FREE_LIMIT} free trips today.`}
        </p>
      </div>
    </div>

    {!isPro && (
      <button
        type="button"
        onClick={() => navigate('/Home/upgrade')}
        className="relative z-10 w-full sm:w-auto px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-xl shadow-xs transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shrink-0 group"
      >
        <span>Upgrade to Pro</span>
        <span className="text-zinc-400 group-hover:translate-x-0.5 transition-transform">→</span>
      </button>
    )}
  </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Form Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MinimalSelect
                id="country"
                label="Destination Country"
                placeholder="Select a country"
                options={countries}
                value={formData.country}
                onChange={(val) => handleChange("country", val)}
              />

              <div className="flex flex-col gap-1.5 my-2 w-full">
                <label htmlFor="duration" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Duration (Days)
                </label>
                <input
                  id="duration"
                  name="duration"
                  className="w-full px-4 py-3 bg-white border border-slate-200/80 rounded-xl text-slate-800 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  onChange={(e) => handleChange("duration", Number(e.target.value))}
                  type="number"
                  placeholder="e.g. 5"
                  min={1}
                  max={10}
                />
              </div>

              {selectItems.map((itemKey) => (
                <MinimalSelect
                  key={itemKey}
                  id={itemKey}
                  label={itemKey.replace(/([A-Z])/g, ' $1')}
                  placeholder={`Select ${itemKey}...`}
                  options={comboBoxItems[itemKey]}
                  value={formData[itemKey as keyof typeof formData] as string}
                  onChange={(val) => handleChange(itemKey, val)}
                />
              ))}
            </div>

            {/* MINIMAL MAP SECTION */}
            <div className="relative w-full mt-10">
              <div className="p-4 sm:p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Selected Region</span>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate max-w-full sm:max-w-md">
                      {selectedCountry ? selectedCountry.text : "Global Map View"}
                    </h3>
                  </div>
                  <span className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Preview
                  </span>
                </div>

                {/* Minimalist Map Container */}
                <div className="overflow-hidden bg-slate-50/50 border border-slate-100 rounded-2xl">
                  <MapsComponent 
                    background="transparent" 
                    margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
                    className="w-full h-[220px] sm:h-[280px]"
                  >
                    <LayersDirective>
                      <LayerDirective
                        dataSource={mapData}
                        shapeDataPath='country'
                        shapePropertyPath='name'
                        shapeSettings={{ 
                          colorValuePath: 'color',
                          fill: '#F1F5F9', 
                          border: { color: '#CBD5E1', width: 0.5 } 
                        }}
                        shapeData={world_map} 
                      />
                    </LayersDirective>
                  </MapsComponent>
                </div>

                {/* Streamlined Footer Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Target Lat/Long</p>
                    <p className="text-xs font-mono font-medium text-slate-700 mt-0.5 truncate">
                      {selectedCountry?.coordinates?.length ? `${selectedCountry.coordinates[0].toFixed(1)}°, ${selectedCountry.coordinates[1].toFixed(1)}°` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Selected Country Code</p>
                    <p className="text-xs font-mono font-medium text-slate-700 mt-0.5 truncate">{formData.country || "Universal"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Network Status</p>
                    <p className="text-xs font-mono font-medium text-slate-700 mt-0.5">Optimal</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium flex items-center justify-between gap-2">
                <span className="break-all">{error}</span>
                <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-bold shrink-0">✕</button>
              </div>
            )}

            {/* Submit CTA */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-8 rounded-xl bg-slate-900 cursor-pointer hover:bg-slate-800 text-white font-medium text-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    <span>Synthesizing Itinerary...</span>
                  </>
                ) : (
                  <span>Generate Trip Itinerary</span>
                )}
              </button>
            </div>

          </form>
        </section>
      </div>
    </main>
  );
};

export default AIStrategist;