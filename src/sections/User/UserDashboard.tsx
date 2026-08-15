import { 
  useLoaderData, 
  useNavigate, 
  useSearchParams, 
  type LoaderFunctionArgs 
} from "react-router-dom";
import { useState } from "react";
import UserHeader from "../../components/UserHeader";
import { account, database } from "../../appwrite/client";
import { Query } from "appwrite";
import { getUserTrips, getUserNormalTrips } from "../../appwrite/Trips";
import { parseTripData } from "../../lib/utils";
import { AIBookingRateCard } from "./AIBookingRateCard";
import { TripWeather } from "../../components/TripWeather";
import WeatherRecommendations from "../../components/WeatherRecommendations";
import { GetRecommendedTrips } from "../../appwrite/recommendationsBooking";
import { FlightDetailsModal } from "../../components/FlightDetailsModal";

export interface DashboardTrip {
  id: string;
  name: string;
  imgUrl: string;
  location: string;
  estimatedPrice: number | string;
  tags: string[];
  isBooked: boolean;
  bookingId: string;
  createdAt: string;
  paymentAmount: number | null;
}

export interface DashboardLoaderData {
  user: string | null;
  allTrips: DashboardTrip[];
  totalGenerated: number;
  totalBooked: number;
  currentBookedTrip: DashboardTrip | null;
  currentPage: number;
  totalPages: number;
  recdoc: any | null;
  normaltripCount: number;
  currentLiveFlight: any | null;
  isPro: boolean;
  generationsToday: number;
}

export const UserDashboardLoader = async ({ request }: LoaderFunctionArgs): Promise<DashboardLoaderData> => {
  const limit = 6; 
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const offset = (page - 1) * limit;

  try {
    const user = await account.get();
    
    const { trips, total } = await getUserTrips(user.$id, limit, offset);
    const normalTripsResult = await getUserNormalTrips(user.$id, limit, offset);
    const normaltripCount = normalTripsResult?.total ?? 0;
    
    const normalTripsDocs = normalTripsResult?.trips || [];
    const currentLiveFlight = normalTripsDocs.length > 0 ? normalTripsDocs[0] : null;
    
    let recdoc = null;
    try {
      recdoc = await GetRecommendedTrips(user.$id, limit, offset);
    } catch (recError) {
      recdoc = null;
    }

    // Fetch User Subscription & generationsToday from Database Collection
    let isPro = false;
    let generationsToday = 0;
    try {
      const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID || "database_id";
      const usersCollectionId = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID || "users";

      const profileResponse = await database.listDocuments(
        databaseId,
        usersCollectionId,
        [Query.equal("accountId", user.$id)]
      );

      if (profileResponse.documents.length > 0) {
        const userDoc = profileResponse.documents[0];
        isPro = userDoc.subscriptionStatus === "active";
        
        const todayStr = new Date().toISOString().split('T')[0];
        if (userDoc.lastGenerationDate === todayStr) {
          generationsToday = userDoc.generationsToday || 0;
        }
      }
    } catch (dbError) {
      console.warn("Could not fetch user profile document from database", dbError);
    }

    const mappedTrips: DashboardTrip[] = trips.map((raw: Record<string, any>) => {
      const parsed = parseTripData(raw);
      const locationString =
        typeof parsed?.location === "object"
          ? parsed.location.city || "Global"
          : parsed?.location || raw.destination || "Destination Unknown";

      const isBooked =
        raw.isBooked === true ||
        raw.bookingStatus === "confirmed" ||
        raw.paymentStatus === "successful" ||
        raw.paymentStatus === "paid" ||
        Boolean(raw.bookingID || raw.BookingID || raw.bookingId || raw.paystackRef);

      const rawTags = [parsed?.travelStyle, ...(Array.isArray(parsed?.interests) ? parsed.interests : [parsed?.interests])];
      const normalizedTags = rawTags.filter(Boolean) as string[];

      const actualPaidAmount = raw.amount || raw.paymentAmount || raw.totalPrice || null;
      const resolvedBookingId = raw.bookingID || raw.BookingID || raw.bookingId || raw.paystackRef || raw.$id;

      return {
        id: raw.$id,
        name: parsed?.name || raw.tripName || raw.destination || "Untitled Trip",
        imgUrl:
          raw.imgUrls?.[0] ||
          `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80`,
        location: locationString,
        estimatedPrice: actualPaidAmount || parsed?.estimatedPrice || raw.price || 0,
        tags: normalizedTags,
        isBooked,
        paymentAmount: actualPaidAmount,
        bookingId: resolvedBookingId,
        createdAt: raw.$createdAt,
      };
    });

    const currentBookedTrip = mappedTrips.find((trip) => trip.isBooked) || null;
    const totalPages = Math.ceil(total / limit) || 1;
    const confirmedCount = mappedTrips.filter((t) => t.isBooked).length;

    return {
      user: user.name,
      totalGenerated: total,
      totalBooked: confirmedCount,
      currentBookedTrip,
      allTrips: mappedTrips,
      currentPage: page,
      totalPages,
      recdoc: recdoc || null,
      normaltripCount,
      currentLiveFlight,
      isPro,
      generationsToday,
    };
  } catch (error) {
    console.error("Nexa OS Loader Error:", error);
    return {
      user: null,
      allTrips: [],
      totalGenerated: 0,
      totalBooked: 0,
      currentBookedTrip: null,
      currentPage: 1,
      totalPages: 1,
      recdoc: null,
      normaltripCount: 0,
      currentLiveFlight: null,
      isPro: false,
      generationsToday: 0,
    };
  }
};

const UserDashboard = () => {
  const data = useLoaderData() as DashboardLoaderData;
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  
  const [selectedFlight, setSelectedFlight] = useState<any | null>(null);
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  
  const sampleDestinations = [
    { id: "1", name: "Santorini", country: "Greece", temp: 26, condition: "Sunny & Clear", tag: "Beach & Views" },
    { id: "2", name: "Positano", country: "Italy", temp: 24, condition: "Mainly Clear", tag: "Coastal Walk" },
    { id: "3", name: "Kyoto", country: "Japan", temp: 22, condition: "Clear Sky", tag: "Outdoor Culture" },
  ];

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > data.totalPages) return;
    setSearchParams((prev) => {
      prev.set("page", newPage.toString());
      return prev;
    });
  };

  const openFlightModal = (flightData: any) => {
    setSelectedFlight(flightData);
    setIsFlightModalOpen(true);
  };

  return (
    <div className="w-full min-h-screen bg-zinc-50/50 p-4 sm:p-6 md:p-10 space-y-6 md:space-y-8 antialiased selection:bg-zinc-900 selection:text-white overflow-x-hidden">
      <UserHeader
        title={data.user ? `Welcome back, ${data.user} 👋` : "Welcome Guest 👋"}
        description="Your world, organized and synchronized in real-time."
      />

      {/* Subscription / Upgrade Card */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden transition-all">
        {data.isPro && (
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        )}
        
        <div className="flex items-center gap-4 relative z-10">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${data.isPro ? 'bg-amber-50 border-amber-200/60 text-amber-600' : 'bg-zinc-50 border-zinc-200/60 text-zinc-600'}`}>
            {data.isPro ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            )}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-mono font-bold text-zinc-900 uppercase tracking-wider">
                {data.isPro ? 'Nexa Pro Tier Active' : 'Free Tier Workspace'}
              </h4>
              {data.isPro && (
                <span className="px-2 py-0.5 text-[9px] font-mono font-extrabold bg-amber-500 text-white rounded-full tracking-wider uppercase shadow-xs">
                  Pro 🌟
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 font-mono">
              {data.isPro ? 'Unlimited high-speed itinerary generations enabled.' : `Generations used today: ${data.generationsToday} / 3 free trips.`}
            </p>
          </div>
        </div>

        {!data.isPro && (
          <button
            type="button"
            onClick={() => navigate('/Home/upgrade')}
            className="relative z-10 w-full sm:w-auto px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <span>Upgrade to Pro</span>
          </button>
        )}
      </div>

      {/* Stats Grid including Pro & Quota Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Generated Itineraries */}
        <div
          onClick={() => navigate("archive")}
          className="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-zinc-300 transition-colors"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              Generated Itineraries
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-zinc-900 tracking-tight">
                {data.totalGenerated}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                routes total
              </span>
            </div>
          </div>
          <div className="w-10 h-10 bg-zinc-50 border border-zinc-200/60 rounded-xl flex items-center justify-center text-zinc-600 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
        </div>

        {/* Confirmed Bookings */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              Confirmed Bookings
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-600 tracking-tight">
                {data.totalBooked}
              </span>
              <span className="text-[10px] text-emerald-600/80 font-mono font-medium">
                manifests issued
              </span>
            </div>
          </div>
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-200/60 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18m-3-12h15a2.25 2.25 0 012.25 2.25v9.5A2.25 2.25 0 0119.5 19.5h-15A2.25 2.25 0 012.25 17.25v-9.5A2.25 2.25 0 014.5 6z" />
            </svg>
          </div>
        </div>

        {/* Normal Flights */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              Normal Flights
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-sky-600 tracking-tight">
                {data.normaltripCount}
              </span>
              <span className="text-[10px] text-sky-600/80 font-mono font-medium">
                flights booked 
              </span>
            </div>
          </div>
          <div className="w-10 h-10 bg-sky-50 border border-sky-200/60 rounded-xl flex items-center justify-center text-sky-600 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </div>
        </div>

        {/* AI Quota & Pro Status Card */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              {data.isPro ? "Nexa Pro Status" : "AI Quota (Today)"}
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${data.isPro ? "text-amber-600" : "text-zinc-900"}`}>
                {data.isPro ? "UNLIMITED" : `${data.generationsToday} / 3`}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {data.isPro ? "Active Tier" : "generations"}
              </span>
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${data.isPro ? "bg-amber-50 border-amber-200/60 text-amber-600" : "bg-zinc-50 border-zinc-200/60 text-zinc-600"}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
        </div>
      </div>

      <WeatherRecommendations recommendations={sampleDestinations} />
      <AIBookingRateCard />

      {/* Live Flight */}
      {data.currentLiveFlight && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
              Active Flight Telemetry
            </h3>
            <span className="text-[10px] font-mono text-sky-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500" />
              </span>
              Live Sync
            </span>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-sky-50 border border-sky-200/60 text-sky-700 text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md">
                  {data.currentLiveFlight.airline || "Commercial Flight"}
                </span>
                <span className="text-xs font-mono font-bold text-zinc-500 truncate">
                  Flight #{data.currentLiveFlight.flightNumber || "N/A"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">Origin</span>
                  <span className="text-sm sm:text-base font-bold text-zinc-900 font-mono break-words">
                    {data.currentLiveFlight.departureAirport || data.currentLiveFlight.country || "Origin Hub"}
                  </span>
                </div>
                <div className="text-zinc-300 font-mono">➔</div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">Destination</span>
                  <span className="text-sm sm:text-base font-bold text-zinc-900 font-mono break-words">
                    {data.currentLiveFlight.arrivalAirport || data.currentLiveFlight.name || "Arrival Hub"}
                  </span>
                </div>
              </div>

              <div className="text-xs font-mono text-zinc-500 flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="truncate">Passenger: <strong className="text-zinc-800">{data.currentLiveFlight.passengerName || data.currentLiveFlight.passengerEmail || "Verified Traveler"}</strong></span>
                <span className="hidden sm:inline">•</span>
                <span>Class: <strong className="text-zinc-800">{data.currentLiveFlight.seatClass || "Economy"}</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-zinc-100">
              <div className="text-left lg:text-right font-mono">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">
                  Status
                </span>
                <span className="text-xs font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200/60 inline-block mt-0.5">
                  {data.currentLiveFlight.paymentStatus || "Confirmed"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => openFlightModal(data.currentLiveFlight)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Flight Info</span>
                </button>

                <button
                  onClick={() => navigate(`/Home/ticket-view/${data.currentLiveFlight.$id}`)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 group/btn"
                >
                  <span>View Ticket</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom generated trip & Weather Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {data.currentBookedTrip && (
          <div className="space-y-3 w-full min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
                Active Journey Manifest
              </h3>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                System Live
              </span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-4 sm:p-6 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 group-hover:bg-zinc-800/30 transition-all duration-700" />

              <div className="relative z-10 flex flex-col gap-6">
                <div className="space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-200 text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-inner">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                      </span>
                      Confirmed Booking
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 truncate">
                      ID: #{data.currentBookedTrip.bookingId ? data.currentBookedTrip.bookingId.slice(-6).toUpperCase() : data.currentBookedTrip.id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-zinc-100 transition-colors break-words">
                      {data.currentBookedTrip.name}
                    </h2>

                    <div className="text-xs font-mono text-zinc-400 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-zinc-300 flex items-center gap-1.5 truncate">
                        <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span className="truncate">{data.currentBookedTrip.location}</span>
                      </span>
                      <span className="text-zinc-600 hidden sm:inline">•</span>
                      <span className="text-zinc-500 text-[11px]">
                        Created {new Date(data.currentBookedTrip.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {data.currentBookedTrip.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {data.currentBookedTrip.tags.map((tag: string, i: number) => (
                        <span key={i} className="bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[9px] font-medium px-2 py-0.5 rounded-md truncate max-w-[150px]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-zinc-900 pt-4 w-full">
                  <div className="font-mono">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">
                      Total Fare
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      {data.currentBookedTrip.paymentAmount !== null && data.currentBookedTrip.paymentAmount !== undefined
                        ? `$${Number(data.currentBookedTrip.paymentAmount).toFixed(2)}`
                        : data.currentBookedTrip.estimatedPrice
                        ? `$${Number(data.currentBookedTrip.estimatedPrice).toFixed(2)}`
                        : "Paid"}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        `/booking-success/${
                          data.currentBookedTrip?.bookingId ||
                          data.currentBookedTrip?.id
                        }`
                      )
                    }
                    className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-zinc-200 active:scale-95 text-zinc-950 font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-white/5 flex items-center justify-center gap-2 group/btn shrink-0"
                  >
                    <span>View Ticket</span>
                    <svg className="w-4 h-4 text-zinc-950 transition-transform group-hover/btn:translate-x-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18m-3-12h15a2.25 2.25 0 012.25 2.25v9.5A2.25 2.25 0 0119.5 19.5h-15A2.25 2.25 0 012.25 17.25v-9.5A2.25 2.25 0 014.5 6z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full min-w-0">
          <TripWeather destinationCity={data.currentBookedTrip?.location || ''} />
        </div>
      </div>
      
      {data.recdoc && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
              Recent Recommendation Booking
            </h3>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              Curated Spot
            </span>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 bg-zinc-100 rounded-xl overflow-hidden shrink-0">
                <img 
                  src={data.recdoc.imgUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80"} 
                  alt={data.recdoc.name || "Destination"} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                    {data.recdoc.paymentStatus || "Booked"}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 truncate">
                    ID: #{data.recdoc.bookingID ? data.recdoc.bookingID.slice(-6).toUpperCase() : data.recdoc.$id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <h4 className="font-semibold text-zinc-900 text-base truncate">
                  {data.recdoc.name || data.recdoc.destination || "Recommended Destination"}
                </h4>
                <p className="text-xs text-zinc-500 font-mono truncate">
                  {data.recdoc.country || data.recdoc.location || "Curated Experience"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-zinc-100">
              <div className="text-left md:text-right font-mono">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">
                  Amount Paid
                </span>
                <span className="text-sm font-bold text-zinc-900">
                  ${Number(data.recdoc.amount || data.recdoc.price || 0).toFixed(2)}
                </span>
              </div>

              <button
                onClick={() =>
                  navigate(
                    `/booking-success/${
                      data.recdoc.bookingID ||
                      data.recdoc.$id
                    }`
                  )
                }
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <span>View Ticket</span>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18m-3-12h15a2.25 2.25 0 012.25 2.25v9.5A2.25 2.25 0 0119.5 19.5h-15A2.25 2.25 0 012.25 17.25v-9.5A2.25 2.25 0 014.5 6z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
            Recent custom Trips
          </h3>
          <button
            onClick={() => navigate("strategist")}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <span>Generate Trip</span>
            <svg className="w-3 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        {data.allTrips.length === 0 ? (
          <div className="bg-white border border-zinc-200/70 rounded-2xl p-10 text-center space-y-3">
            <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
              No Manifest Telemetry
            </p>
            <p className="text-xs text-zinc-500">
              You haven't generated any trips yet.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.allTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="group bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-2xs hover:border-zinc-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div
                    onClick={() => navigate(`my-itinerary/${trip.id}`)}
                    className="cursor-pointer"
                  >
                    <div className="h-36 w-full bg-zinc-100 relative overflow-hidden">
                      <img
                        src={trip.imgUrl}
                        alt={trip.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <span
                          className={`text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border backdrop-blur-md ${
                            trip.isBooked
                              ? "bg-emerald-500/90 text-white border-emerald-400"
                              : "bg-zinc-900/80 text-zinc-200 border-zinc-700"
                          }`}
                        >
                          {trip.isBooked ? "CONFIRMED" : "DRAFT"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 block truncate">
                        {trip.location}
                      </span>
                      <h4 className="font-semibold text-sm text-zinc-900 group-hover:text-zinc-700 transition-colors truncate">
                        {trip.name}
                      </h4>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-700 font-bold truncate pr-2">
                      {trip.estimatedPrice ? `$${trip.estimatedPrice}` : "Flex Pricing"}
                    </span>

                    {trip.isBooked ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/booking-success/${trip.bookingId || trip.id}`);
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <span>Ticket</span>
                        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18m-3-12h15a2.25 2.25 0 012.25 2.25v9.5A2.25 2.25 0 0119.5 19.5h-15A2.25 2.25 0 012.25 17.25v-9.5A2.25 2.25 0 014.5 6z" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`my-itinerary/${trip.id}`)}
                        className="text-[10px] text-zinc-400 group-hover:text-zinc-900 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <span>Details</span>
                        <span>➔</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-200/60 pt-4 font-mono text-xs">
                <button
                  disabled={data.currentPage <= 1}
                  onClick={() => handlePageChange(data.currentPage - 1)}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors cursor-pointer text-center"
                >
                  ← Previous
                </button>
                <span className="text-zinc-500 text-[11px]">
                  Page {data.currentPage} of {data.totalPages}
                </span>
                <button
                  disabled={data.currentPage >= data.totalPages}
                  onClick={() => handlePageChange(data.currentPage + 1)}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors cursor-pointer text-center"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <FlightDetailsModal 
        isOpen={isFlightModalOpen} 
        onClose={() => setIsFlightModalOpen(false)} 
        flight={selectedFlight} 
      />
    </div>
  );
};

export default UserDashboard;