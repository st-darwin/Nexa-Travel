import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

export const TicketView: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, flight, passenger, paystackRef, searchParams } = location.state || {};

  if (!booking && !bookingId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xs font-bold uppercase tracking-wider mb-2">No Active Ticket Found</h2>
        <button onClick={() => navigate('/Home')} className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentBookingRef = booking?.bookingReference || bookingId;
  const slice = flight?.slices?.[0];
  const segment = slice?.segments?.[0];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 font-sans py-6 px-4">
      {/* Success Notification Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-center">
        <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider block mb-1">✓ Payment Successful & Ticket Issued</span>
        <p className="text-[11px] text-emerald-700">Your seat has been confirmed on {flight?.airlineName || 'your selected carrier'}.</p>
      </div>

      {/* Boarding Pass Card */}
      <div className="bg-white border border-slate-200/90 rounded-[2.5rem] shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Booking Reference (PNR)</span>
            <h1 className="text-xl font-black text-black tracking-tight">{currentBookingRef}</h1>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Carrier</span>
            <h2 className="text-sm font-bold text-black">{flight?.airlineName || 'N/A'}</h2>
          </div>
        </div>

        {/* Itinerary Details Section */}
        <div className="bg-slate-50 p-5 rounded-2xl space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Route</span>
              <span className="font-bold text-black text-sm">
                {searchParams?.from || segment?.origin?.iata_code || 'ORIGIN'} ⟶ {searchParams?.to || segment?.destination?.iata_code || 'DEST'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Departure Date</span>
              <span className="font-bold text-black text-sm">
                {searchParams?.date || (segment ? new Date(segment.departing_at).toLocaleDateString() : 'N/A')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Departure Time</span>
              <span className="font-bold text-black">
                {segment ? new Date(segment.departing_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Arrival Time</span>
              <span className="font-bold text-black">
                {segment ? new Date(segment.arriving_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Flight No.</span>
              <span className="font-bold text-black font-mono">{segment?.marketing_carrier_flight_number || segment?.id || 'NX-FL'}</span>
            </div>
          </div>
        </div>

        {/* Passenger & Payment Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Passenger</span>
            <span className="font-bold text-black uppercase">{passenger ? `${passenger.first_name} ${passenger.last_name}` : 'Passenger'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Gender / DOB</span>
            <span className="font-bold text-black uppercase">{passenger ? `${passenger.gender} | ${passenger.born_on}` : 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Payment Ref</span>
            <span className="font-bold text-black font-mono text-[10px]">{paystackRef || 'Verified'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button 
            onClick={() => window.print()}
            className="w-full py-3.5 bg-black hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-md"
          >
            Download Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketView;