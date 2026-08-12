import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchLiveFlights } from '../../appwrite/Trips';

export const FlightSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    from: 'LOS',
    to: 'ABV',
    date: '2026-08-25',
  });

  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHasSearched(false);

    try {
      const results = await searchLiveFlights(
        searchParams.from.toUpperCase(),
        searchParams.to.toUpperCase(),
        searchParams.date
      );
      setFlights(results || []);
      setHasSearched(true);
    } catch (err: any) {
      setError(err.message || "Could not retrieve live flights.");
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFlight = (flight: any) => {
    navigate('/Home/checkout', {
      state: { flight, searchParams },
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 font-sans py-6 px-4">
      {/* Search Header Card */}
      <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-[2.5rem] shadow-sm p-6 sm:p-8">
        <div className="mb-5 border-b border-slate-100 pb-4">
          <h2 className="text-sm font-bold text-black uppercase tracking-wider">Live Flight Search Engine</h2>
          <p className="text-xs text-slate-500 mt-0.5">Query global airline inventories instantly.</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">From (Airport Code)</label>
              <input 
                type="text" 
                name="from" 
                required
                maxLength={3}
                value={searchParams.from}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-black uppercase"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">To (Airport Code)</label>
              <input 
                type="text" 
                name="to" 
                required
                maxLength={3}
                value={searchParams.to}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-black uppercase"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Departure Date</label>
              <input 
                type="date" 
                name="date" 
                required
                value={searchParams.date}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-black hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Querying Global Inventories...</span>
              </>
            ) : (
              'Search Live Flights'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">Available Flights</h3>
            <span className="text-xs text-slate-500 font-medium">{flights?.length || 0} live offers found</span>
          </div>

          <div className="space-y-3">
            {flights?.length > 0 ? (
              flights.map((flight) => {
                const slice = flight.slices?.[0];
                const segment = slice?.segments?.[0];
                
                return (
                  <div key={flight.offerId} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-black">{flight.airlineName}</span>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-semibold">
                          {segment?.marketing_carrier?.iata_code || 'FL'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="font-bold text-slate-900">{segment ? new Date(segment.departing_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Direct'}</span>
                        <span className="text-slate-400">({searchParams.from})</span>
                        <span>⟶</span>
                        <span className="font-bold text-slate-900">{segment ? new Date(segment.arriving_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                        <span className="text-slate-400">({searchParams.to})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-black text-black block">${flight.totalPriceToPay.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide">Total ({flight.currency})</span>
                      </div>
                      <button 
                        onClick={() => handleSelectFlight(flight)}
                        className="px-5 py-2.5 bg-black hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
                      >
                        Select Offer
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                No flights match your route criteria for this date.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightSearch;