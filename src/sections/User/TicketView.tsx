import React, { useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

export const TicketView: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, flight, passenger, paystackRef, searchParams } = location.state || {};
  
  const ticketRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Styling configuration
    doc.setFillColor(15, 23, 42); // Slate 900 header block
    doc.rect(15, 15, 180, 25, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('NEXA OS FLIGHT MANIFEST', 22, 28);
    
    doc.setFontSize(9);
    doc.setFont('courier', 'normal');
    doc.text(`PNR: ${currentBookingRef}`, 145, 28);

    // Body container styling
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 45, 180, 110, 3, 3, 'FD');

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    // Section 1: Carrier & Route
    doc.text('CARRIER', 22, 55);
    doc.text('ROUTE', 110, 55);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text(flight?.airlineName || 'N/A', 22, 62);
    doc.text(`${searchParams?.from || segment?.origin?.iata_code || 'ORIGIN'} ➔ ${searchParams?.to || segment?.destination?.iata_code || 'DEST'}`, 110, 62);

    // Section 2: Times & Flight No.
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('DEPARTURE TIME', 22, 78);
    doc.text('ARRIVAL TIME', 75, 78);
    doc.text('FLIGHT NO.', 130, 78);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(segment ? new Date(segment.departing_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled', 22, 85);
    doc.text(segment ? new Date(segment.arriving_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled', 75, 85);
    doc.setFont('courier', 'bold');
    doc.text(segment?.marketing_carrier_flight_number || segment?.id || 'NX-FL', 130, 85);

    // Divider Line
    doc.setDrawColor(203, 213, 225);
    doc.line(22, 98, 188, 98);

    // Section 3: Passenger & Meta Info
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('PASSENGER NAME', 22, 110);
    doc.text('GENDER / DOB', 110, 110);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(passenger ? `${passenger.first_name} ${passenger.last_name}`.toUpperCase() : 'PASSENGER', 22, 117);
    doc.text(passenger ? `${passenger.gender} | ${passenger.born_on}` : 'N/A', 110, 117);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('PAYMENT REFERENCE', 22, 132);
    doc.text('ISSUE STATUS', 110, 132);

    doc.setTextColor(15, 23, 42);
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.text(paystackRef || 'VERIFIED', 22, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIRMED', 110, 139);

    // Footer note
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.text('Generated securely via Nexa OS Flight Systems. Please present this manifest at boarding.', 15, 165);

    // Save PDF
    doc.save(`Ticket-${currentBookingRef}.pdf`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 font-sans py-6 px-4">
      {/* Success Notification Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-center">
        <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider block mb-1">✓ Payment Successful & Ticket Issued</span>
        <p className="text-[11px] text-emerald-700">Your seat has been confirmed on {flight?.airlineName || 'your selected carrier'}.</p>
      </div>

      {/* Boarding Pass Card */}
      <div ref={ticketRef} className="bg-white border border-slate-200/90 rounded-[2.5rem] shadow-sm p-6 sm:p-8 space-y-6">
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
            onClick={handleDownloadPDF}
            className="w-full py-3.5 bg-black hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            <span>Download PDF Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketView;