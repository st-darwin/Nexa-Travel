import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Query } from 'appwrite';
import { database, appwriteConfig, functions } from '../../appwrite/client';

export const CustomHotelSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { bookingId?: string; arrivalAirport?: string } | undefined;

  const bookingId = state?.bookingId;
  const [arrivalAirport, setArrivalAirport] = useState<string>(state?.arrivalAirport || '');
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveAirportAndFetchHotels = async () => {
      try {
        setLoading(true);
        setError(null);
        let resolvedAirport = arrivalAirport;

        // 1. If arrivalAirport isn't in state, fetch the record from Appwrite using bookingId
        if (!resolvedAirport && bookingId) {
          let doc: any = null;

          const collections = [
            appwriteConfig.tripCollectionId,
            appwriteConfig.normalCollectionID,
            appwriteConfig.recommendationCollectionId,
          ];

          for (const colId of collections) {
            try {
              const res = await database.listDocuments(
                appwriteConfig.databaseId,
                colId,
                [Query.equal('BookingID', bookingId)]
              );
              if (res.documents.length > 0) {
                doc = res.documents[0];
                break;
              }
            } catch (err) {
              try {
                const resAlt = await database.listDocuments(
                  appwriteConfig.databaseId,
                  colId,
                  [Query.equal('bookingID', bookingId)]
                );
                if (resAlt.documents.length > 0) {
                  doc = resAlt.documents[0];
                  break;
                }
              } catch (e) {
                // Continue searching other collections
              }
            }
          }

          if (doc) {
            resolvedAirport = doc.arrivalAirport || doc.destination || 'LHR';
          }
        }

        if (!resolvedAirport) {
          resolvedAirport = 'LOS'; 
        }

        setArrivalAirport(resolvedAirport);

        // 2. Use the resolved arrival airport as input to get closest hotels via Appwrite Function
        const checkInDate = new Date().toISOString().split('T')[0];
        const checkOutDate = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];

        const execution = await functions.createExecution(
          appwriteConfig.functionId,
          JSON.stringify({
            action: 'search_hotels',
            locationQuery: resolvedAirport,
            checkInDate,
            checkOutDate,
          }),
          false
        );

        console.log("Function Status:", execution.status);
        console.log("Function Response Body:", execution.responseBody);

        const rawBody = execution.responseBody?.trim() || '';
        if (!rawBody.startsWith('{') && !rawBody.startsWith('[')) {
          throw new Error(`Server function returned plain text or timeout: "${rawBody}"`);
        }

        const result = JSON.parse(rawBody);

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch hotels');
        }

        setHotels(result.results || []);
      } catch (err: any) {
        console.error('Hotel search resolution error:', err);
        setError(err.message || 'Could not retrieve hotels for this arrival destination.');
      } finally {
        setLoading(false);
      }
    };

    resolveAirportAndFetchHotels();
  }, [bookingId, arrivalAirport]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] font-mono text-xs px-4">
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm max-w-sm w-full justify-center text-center">
          <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="text-slate-600 font-medium tracking-wide truncate">
            Finding closest hotels for ({arrivalAirport || bookingId})...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] px-4 sm:px-6 lg:px-8 py-8 md:py-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
              Context Linked ({bookingId || 'N/A'})
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              Hotels near Airport: <span className="font-mono text-slate-900">{arrivalAirport}</span>
            </h2>
          </div>
          <button
            onClick={() => navigate('/Home')}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 text-white font-mono text-xs font-semibold rounded-xl hover:bg-slate-800 transition-all cursor-pointer shadow-xs text-center"
          >
            Dashboard
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50/90 border border-rose-100 text-rose-600 rounded-2xl text-xs font-mono shadow-xs">
            {error}
          </div>
        )}

        {/* Hotel Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {hotels.map((hotel: any) => (
            <div 
              key={hotel.id} 
              className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {hotel.accommodation?.photos?.[0]?.url && (
                  <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-100">
                    <img
                      src={hotel.accommodation.photos[0].url}
                      alt={hotel.accommodation.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-4 sm:p-5 space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                    {hotel.accommodation?.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {hotel.accommodation?.address?.line_one}, {hotel.accommodation?.address?.city_name}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 pt-0 flex items-center justify-between border-t border-slate-50 mt-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Rate</span>
                  <span className="font-mono font-bold text-slate-900 text-sm sm:text-base">
                    ${hotel.cheapest_rate_total_amount} <span className="text-xs font-normal text-slate-500">{hotel.cheapest_rate_public_currency}</span>
                  </span>
                </div>
                <button
                  onClick={() => navigate('/Home/book-hotel', { state: { hotel, bookingId } })}
                  className="px-4 py-2.5 bg-slate-900 text-white font-mono text-xs font-bold rounded-xl hover:bg-slate-800 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  Select Room
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomHotelSearch;