import React from "react";
import { useNavigate } from "react-router-dom";

interface FlightDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: any | null;
  userId?: string;
}

export const FlightDetailsModal: React.FC<FlightDetailsModalProps> = ({ isOpen, onClose, flight, userId }) => {
  const navigate = useNavigate();

  if (!isOpen || !flight) return null;

  const handleViewAllFlights = () => {
    onClose();
    // Navigate using the nested route structure under /Home/flight-details/:flightId
    if (userId) {
      navigate(`/Home/flight-details/${userId}`, { state: { user: { $id: userId } } });
    } else {
      navigate(`/Home/flight-details/archive`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-6 p-6 md:p-8 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono font-bold text-sky-600 uppercase tracking-widest block">
              Telemetry Record
            </span>
            <h3 className="text-lg font-bold text-zinc-900">Flight Manifest Overview</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Flight Route Overview */}
        <div className="bg-zinc-50 border border-zinc-200/70 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="bg-sky-100 text-sky-800 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md">
              {flight.airline || "Commercial Carrier"}
            </span>
            <span className="text-xs font-mono font-bold text-zinc-700">
              Flight #{flight.flightNumber || "N/A"}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Departure Hub</span>
              <span className="text-sm font-bold text-zinc-900 font-mono">
                {flight.departureAirport || flight.country || "Origin Terminal"}
              </span>
            </div>
            <div className="text-zinc-400 font-mono text-sm">———— ✈ ————</div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Arrival Hub</span>
              <span className="text-sm font-bold text-zinc-900 font-mono">
                {flight.arrivalAirport || flight.name || "Destination Terminal"}
              </span>
            </div>
          </div>
        </div>

        {/* Passenger & Ticket Breakdown */}
        <div className="grid grid-cols-2 gap-4 font-mono text-xs">
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase block">Passenger</span>
            <span className="font-bold text-zinc-800 block truncate">
              {flight.passengerName || flight.passengerEmail || "Verified Traveler"}
            </span>
          </div>
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase block">Seat Class</span>
            <span className="font-bold text-zinc-800 block">
              {flight.seatClass || "Economy"}
            </span>
          </div>
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase block">Payment Status</span>
            <span className="font-bold text-emerald-600 block uppercase">
              {flight.paymentStatus || "Confirmed"}
            </span>
          </div>
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase block">Reference ID</span>
            <span className="font-bold text-zinc-800 block truncate">
              #{flight.bookingID || flight.BookingID || flight.$id || "N/A"}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <button
            onClick={handleViewAllFlights}
            className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-mono text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <span>View All Flights Archive</span>
            <span>➔</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
          >
            Close Telemetry
          </button>
        </div>

      </div>
    </div>
  );
};