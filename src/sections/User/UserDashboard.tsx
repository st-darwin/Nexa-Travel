import { 
  useLoaderData, 
  useNavigate, 
  useSearchParams, 
  type LoaderFunctionArgs 
} from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import { account } from "../../appwrite/client";
import { getUserTrips } from "../../appwrite/Trips";
import { parseTripData } from "../../lib/utils";
import { AIBookingRateCard } from "./AIBookingRateCard";
import { TripWeather } from "../../components/TripWeather";
import WeatherRecommendations from "../../components/WeatherRecommendations";
import { GetRecommendedTrips } from "../../appwrite/recommendationsBooking";
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
  recdoc: any | null; // Add this line to include recommended trips data
}

export const UserDashboardLoader = async ({ request }: LoaderFunctionArgs): Promise<DashboardLoaderData> => {
  const limit = 6; 
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const offset = (page - 1) * limit;

  try {
    const user = await account.get();
    
    // Fetch paginated trips alongside total user stats
    const { trips, total } = await getUserTrips(user.$id, limit, offset);
    const recdoc = await GetRecommendedTrips(user.$id, limit, offset); // fetch all recommended trips

    // fetch all recommended trips 

    


    const mappedTrips: DashboardTrip[] = trips.map((raw: Record<string, any>) => {
      const parsed = parseTripData(raw);
      const locationString =
        typeof parsed?.location === "object"
          ? parsed.location.city || "Global"
          : parsed?.location || raw.destination || "Destination Unknown";

      // Robust booked check covering varied Appwrite schemas
      const isBooked =
        raw.isBooked === true ||
        raw.bookingStatus === "confirmed" ||
        raw.paymentStatus === "successful" ||
        raw.paymentStatus === "paid" ||
        Boolean(raw.bookingID || raw.BookingID || raw.paystackRef);

      const rawTags = [parsed?.travelStyle, ...(Array.isArray(parsed?.interests) ? parsed.interests : [parsed?.interests])];
      const normalizedTags = rawTags.filter(Boolean) as string[];

      // Support varying case variations for Appwrite fields
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

    // Locate the primary booked trip for the Active Journey banner
    const currentBookedTrip = mappedTrips.find((trip) => trip.isBooked) || null;
    const totalPages = Math.ceil(total / limit) || 1;

    // Filter confirmed count
    const confirmedCount = mappedTrips.filter((t) => t.isBooked).length;

    return {
      user: user.name,
      totalGenerated: total,
      totalBooked: confirmedCount,
      currentBookedTrip,
      allTrips: mappedTrips,
      currentPage: page,
      totalPages,
      recdoc: recdoc || null, // Include recommended trips data
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
      recdoc: null, // Ensure recommended trips data is null on error
    };
  }
};

const UserDashboard = () => {
  const data = useLoaderData() as DashboardLoaderData;
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  
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

  return (
    <div className="w-full min-h-screen bg-zinc-50/50 p-6 md:p-10 space-y-8 antialiased selection:bg-zinc-900 selection:text-white">
      {/* Header */}
      <UserHeader
        title={data.user ? `Welcome back, ${data.user} 👋` : "Welcome Guest 👋"}
        description="Your world, organized and synchronized in real-time."
      />

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Stat Card 1: Generated Itineraries */}
        <div
          onClick={() => navigate("archive")}
          className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-zinc-300 transition-colors"
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
          <div className="w-10 h-10 bg-zinc-50 border border-zinc-200/60 rounded-xl flex items-center justify-center text-zinc-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
        </div>

        {/* Stat Card 2: Booked Trips */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
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
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-200/60 rounded-xl flex items-center justify-center text-emerald-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18m-3-12h15a2.25 2.25 0 012.25 2.25v9.5A2.25 2.25 0 0119.5 19.5h-15A2.25 2.25 0 012.25 17.25v-9.5A2.25 2.25 0 014.5 6z" />
            </svg>
          </div>
        </div>
      </div>

      <WeatherRecommendations recommendations={sampleDestinations} />

      {/* AI Booking Rate Card */}
      <AIBookingRateCard />

      {/* Active Journey Manifest Banner */}
      {data.currentBookedTrip && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
              Active Journey Manifest
            </h3>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              System Live
            </span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 group-hover:bg-zinc-800/30 transition-all duration-700" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-200 text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-inner">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                    </span>
                    Confirmed Booking
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    ID: #{data.currentBookedTrip.bookingId ? data.currentBookedTrip.bookingId.slice(-6).toUpperCase() : data.currentBookedTrip.id.slice(-6).toUpperCase()}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white group-hover:text-zinc-100 transition-colors">
                    {data.currentBookedTrip.name}
                  </h2>

                  <div className="text-xs font-mono text-zinc-400 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-zinc-300 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {data.currentBookedTrip.location}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-500">
                      Created{" "}
                      {new Date(data.currentBookedTrip.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {data.currentBookedTrip.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {data.currentBookedTrip.tags.map((tag: string, i: number) => (
                      <span key={i} className="bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[9px] font-medium px-2.5 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-5 border-t lg:border-t-0 border-zinc-900 pt-5 lg:pt-0">
                {/* FIXED TOTAL FARE DISPLAY */}
                <div className="text-left lg:text-right font-mono">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">
                    Total Fare
                  </span>
                  <span className="text-xl font-bold text-white tracking-tight">
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
                  className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-zinc-200 active:scale-95 text-zinc-950 font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-white/5 flex items-center justify-center gap-2 group/btn"
                >
                  <span>View Ticket</span>
                  <svg className="w-4 h-4 text-zinc-950 transition-transform group-hover/btn:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18m-3-12h15a2.25 2.25 0 012.25 2.25v9.5A2.25 2.25 0 0119.5 19.5h-15A2.25 2.25 0 012.25 17.25v-9.5A2.25 2.25 0 014.5 6z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Weather forecast */}
      <TripWeather destinationCity={data.currentBookedTrip?.location || ''} />
    
    {/* Recent Recommendation Booking Card */}
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

    <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0">
          <img 
            src={data.recdoc.imgUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80"} 
            alt={data.recdoc.name || "Destination"} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              {data.recdoc.paymentStatus || "Booked"}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              ID: #{data.recdoc.bookingID ? data.recdoc.bookingID.slice(-6).toUpperCase() : data.recdoc.$id.slice(-6).toUpperCase()}
            </span>
          </div>
          <h4 className="font-semibold text-zinc-900 text-base">
            {data.recdoc.name || data.recdoc.destination || "Recommended Destination"}
          </h4>
          <p className="text-xs text-zinc-500 font-mono">
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
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
        >
          <span>View Ticket</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18m-3-12h15a2.25 2.25 0 012.25 2.25v9.5A2.25 2.25 0 0119.5 19.5h-15A2.25 2.25 0 012.25 17.25v-9.5A2.25 2.25 0 014.5 6z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
)}


      {/* Recent Trips Feed */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-zinc-200/60 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
            Recent custom Trips
          </h3>
          <button
            onClick={() => navigate("strategist")}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <span>Generate Trip</span>
            <svg className="w-3 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.allTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="group bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-2xs hover:border-zinc-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div
                    onClick={() => navigate(`my-itinerary/${trip.id}`)}
                    className="cursor-pointer"
                  >
                    {/* Image Banner */}
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

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                        {trip.location}
                      </span>
                      <h4 className="font-semibold text-sm text-zinc-900 group-hover:text-zinc-700 transition-colors truncate">
                        {trip.name}
                      </h4>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-700 font-bold">
                      {trip.estimatedPrice
                        ? `$${trip.estimatedPrice}`
                        : "Flex Pricing"}
                    </span>

                    {trip.isBooked ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/booking-success/${trip.bookingId || trip.id}`
                          );
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>Ticket</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18m-3-12h15a2.25 2.25 0 012.25 2.25v9.5A2.25 2.25 0 0119.5 19.5h-15A2.25 2.25 0 012.25 17.25v-9.5A2.25 2.25 0 014.5 6z" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`my-itinerary/${trip.id}`)}
                        className="text-[10px] text-zinc-400 group-hover:text-zinc-900 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Details</span>
                        <span>➔</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-200/60 pt-4 font-mono text-xs">
                <button
                  disabled={data.currentPage <= 1}
                  onClick={() => handlePageChange(data.currentPage - 1)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  ← Previous
                </button>
                <span className="text-zinc-500 text-[11px]">
                  Page {data.currentPage} of {data.totalPages}
                </span>
                <button
                  disabled={data.currentPage >= data.totalPages}
                  onClick={() => handlePageChange(data.currentPage + 1)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;