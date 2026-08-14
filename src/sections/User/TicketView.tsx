import React, { useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';

export const TicketView: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  
  // Extract state passed via router, or fallback to empty object
  const state = location.state || {};
  const booking = state.booking;
  const passenger = state.passenger;
  const paystackRef = state.paystackRef || booking?.paystackRef;
  const searchParams = state.searchParams;

  const ticketRef = useRef<HTMLDivElement>(null);

  // Fallback identifiers if state wasn't passed
  const currentBookingRef = booking?.bookingReference || booking?.bookingId || bookingId;
  
  const slice = state.flight?.slices?.[0];
  const segment = slice?.segments?.[0];

  const airlineName = state.flight?.airlineName || booking?.airline || 'Commercial Flight';
  const originCode = searchParams?.from || segment?.origin?.iata_code || booking?.departureAirport || 'ORIGIN';
  const destinationCode = searchParams?.to || segment?.destination?.iata_code || booking?.arrivalAirport || 'DEST';
  
  const flightNum = segment?.marketing_carrier_flight_number || segment?.id || booking?.flightNumber || 'NX-FL';
  const flightDate = searchParams?.date || booking?.flightDate || (segment ? new Date(segment.departing_at).toLocaleDateString() : 'N/A');

  const departureTimeString = segment?.departing_at || booking?.departureTime;
  const arrivalTimeString = segment?.arriving_at || booking?.arrivalTime;

  const formattedDepTime = departureTimeString 
    ? new Date(departureTimeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : 'Scheduled';

  const formattedArrTime = arrivalTimeString 
    ? new Date(arrivalTimeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : 'Scheduled';

  const passengerFullName = passenger 
    ? `${passenger.first_name || passenger.firstName || ''} ${passenger.last_name || passenger.lastName || ''}`.trim()
    : booking?.passengerName || booking?.fullName || 'Verified Traveler';

  // Robust fallbacks checking multiple possible database property names
  const passengerGender = passenger?.gender || booking?.gender || 'N/A';
  const passengerDob = passenger?.born_on || passenger?.dateOfBirth || booking?.DOB || booking?.dateOfBirth || 'N/A';
  const passengerGenderDob = `${passengerGender} | ${passengerDob}`;

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Styling configuration
    doc.setFillColor(15, 23, 42);
    doc.rect(15, 15, 180, 25, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('NEXA OS FLIGHT MANIFEST', 22, 28);
    
    doc.setFontSize(9);
    doc.setFont('courier', 'normal');
    doc.text(`PNR: ${currentBookingRef}`, 145, 28);

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 45, 180, 110, 3, 3, 'FD');

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    doc.text('CARRIER', 22, 55);
    doc.text('ROUTE', 110, 55);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text(airlineName, 22, 62);
    doc.text(`${originCode} ➔ ${destinationCode}`, 110, 62);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('DEPARTURE TIME', 22, 78);
    doc.text('ARRIVAL TIME', 75, 78);
    doc.text('FLIGHT NO.', 130, 78);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(formattedDepTime, 22, 85);
    doc.text(formattedArrTime, 75, 85);
    doc.setFont('courier', 'bold');
    doc.text(flightNum, 130, 85);

    doc.setDrawColor(203, 213, 225);
    doc.line(22, 98, 188, 98);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('PASSENGER NAME', 22, 110);
    doc.text('GENDER / DOB', 110, 110);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(passengerFullName.toUpperCase(), 22, 117);
    doc.text(passengerGenderDob.toUpperCase(), 110, 117);

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

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.text('Generated securely via Nexa OS Flight Systems. Please present this manifest at boarding.', 15, 165);

    doc.save(`Ticket-${currentBookingRef}.pdf`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 font-sans py-6 px-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-center">
        <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider block mb-1">✓ Payment Successful & Ticket Issued</span>
        <p className="text-[11px] text-emerald-700">Your seat has been confirmed on {airlineName}.</p>
      </div>

      <div ref={ticketRef} className="bg-white border border-slate-200/90 rounded-[2.5rem] shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Booking Reference (PNR)</span>
            <h1 className="text-xl font-black text-black tracking-tight">{currentBookingRef}</h1>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Carrier</span>
            <h2 className="text-sm font-bold text-black">{airlineName}</h2>
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Route</span>
              <span className="font-bold text-black text-sm">
                {originCode} ⟶ {destinationCode}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Departure Date</span>
              <span className="font-bold text-black text-sm">
                {flightDate}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Departure Time</span>
              <span className="font-bold text-black">{formattedDepTime}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Arrival Time</span>
              <span className="font-bold text-black">{formattedArrTime}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Flight No.</span>
              <span className="font-bold text-black font-mono">{flightNum}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Passenger</span>
            <span className="font-bold text-black uppercase">{passengerFullName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Gender / DOB</span>
            <span className="font-bold text-black uppercase">{passengerGenderDob}</span>
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