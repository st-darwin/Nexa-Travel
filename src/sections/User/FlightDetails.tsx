import { 
  useLoaderData, 
  useNavigate, 
  useSearchParams, 
  useLocation,
  type LoaderFunctionArgs 
} from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import { account } from "../../appwrite/client";
import { getUserNormalTrips } from "../../appwrite/Trips";

export interface FlightArchiveItem {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  passengerName: string;
  seatClass: string;
  paymentStatus: string;
  bookingID: string;
  amount: number | null;
  createdAt: string;
  email: string;
  paystackRef: string;
}

export interface FlightArchiveLoaderData {
  flights: FlightArchiveItem[];
  totalFlights: number;
  currentPage: number;
  totalPages: number;
}

export const FlightArchiveLoader = async ({ request }: LoaderFunctionArgs): Promise<FlightArchiveLoaderData> => {
  const limit = 8;
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const offset = (page - 1) * limit;

  try {
    const user = await account.get();
    const result = await getUserNormalTrips(user.$id, limit, offset);
    
    const rawTrips = result?.trips || [];
    const total = result?.total || 0;

    const flights: FlightArchiveItem[] = rawTrips.map((raw: Record<string, any>) => ({
      id: raw.$id,
      airline: raw.airline || "Commercial Carrier",
      flightNumber: raw.flightNumber || raw.flight_number || "N/A",
      departureAirport: raw.departureAirport || raw.departure_airport || raw.country || "Origin Hub",
      arrivalAirport: raw.arrivalAirport || raw.arrival_airport || raw.name || "Arrival Hub",
      passengerName: raw.passengerName || raw.passenger_name || raw.passengerEmail || raw.email || "Verified Traveler",
      seatClass: raw.seatClass || raw.seat_class || "Economy",
      paymentStatus: raw.paymentStatus || raw.payment_status || "Confirmed",
      bookingID: raw.bookingID || raw.BookingID || raw.bookingId || raw.$id,
      amount: raw.amount || raw.paymentAmount || raw.totalPrice || raw.price || null,
      createdAt: raw.$createdAt,
      email: raw.passengerEmail || raw.passenger_email || raw.email || '',
      paystackRef: raw.paystackRef || raw.paymentReference || raw.payment_reference || raw.bookingID || raw.BookingID || raw.$id,
    }));

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      flights,
      totalFlights: total,
      currentPage: page,
      totalPages,
    };
  } catch (error) {
    console.error("Flight Archive Loader Error:", error);
    return {
      flights: [],
      totalFlights: 0,
      currentPage: 1,
      totalPages: 1,
    };
  }
};

const FlightDetails = () => {
  const data = useLoaderData() as FlightArchiveLoaderData;
  const navigate = useNavigate();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();

  const passedUser = location.state?.user;
  const userId = passedUser?.$id;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > data.totalPages) return;
    setSearchParams((prev) => {
      prev.set("page", newPage.toString());
      return prev;
    });
  };

  return (
    <div className="w-full min-h-screen bg-zinc-50/50 p-4 sm:p-6 md:p-10 space-y-6 md:space-y-8 antialiased selection:bg-zinc-900 selection:text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <UserHeader
          title="Flight Bookings Archive"
          description={`Complete historical telemetry and manifests. ${userId ? `(User ID: ${userId})` : ""}`}
        />
        <button
          onClick={() => navigate(-1)}
          className="self-start sm:self-auto px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-2"
        >
          <span>← Back to Dashboard</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              Total Logged Flights
            </span>
            <span className="text-2xl font-bold font-mono text-zinc-900 tracking-tight">
              {data.totalFlights}
            </span>
          </div>
          <div className="w-10 h-10 bg-sky-50 border border-sky-200/60 rounded-xl flex items-center justify-center text-sky-600 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {data.flights.length === 0 ? (
          <div className="bg-white border border-zinc-200/70 rounded-2xl p-12 text-center space-y-3">
            <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
              No Flight Records Found
            </p>
            <p className="text-xs text-zinc-500">
              You haven't booked any normal flights yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.flights.map((flight) => (
              <div
                key={flight.id}
                className="bg-white border border-zinc-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-zinc-300 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-sky-50 border border-sky-200/60 text-sky-700 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                      {flight.airline}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-500">
                      #{flight.flightNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase block">Origin</span>
                      <span className="text-sm font-bold text-zinc-900 font-mono truncate block">
                        {flight.departureAirport}
                      </span>
                    </div>
                    <div className="text-zinc-300 font-mono text-sm shrink-0">———— ✈ ————</div>
                    <div className="text-right min-w-0 pl-2">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase block">Destination</span>
                      <span className="text-sm font-bold text-zinc-900 font-mono truncate block">
                        {flight.arrivalAirport}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono border-t border-zinc-100">
                    <div className="truncate">
                      <span className="text-[9px] text-zinc-400 uppercase block">Passenger</span>
                      <strong className="text-zinc-800">{flight.passengerName}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-zinc-400 uppercase block">Class / Fare</span>
                      <strong className="text-zinc-800">
                        {flight.seatClass} {flight.amount ? `($${Number(flight.amount).toFixed(2)})` : ""}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 font-mono">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                    {flight.paymentStatus}
                  </span>

<button
  onClick={() => navigate(`/Home/ticket-view/${flight.id}`)}
  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
>
  <span>View Ticket</span>
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18m-3-12h15a2.25 2.25 0 012.25 2.25v9.5A2.25 2.25 0 0119.5 19.5h-15A2.25 2.25 0 012.25 17.25v-9.5A2.25 2.25 0 014.5 6z" />
  </svg>
</button>
                </div>
              </div>
            ))}
          </div>
        )}

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
      </div>
    </div>
  );
};

export default FlightDetails;