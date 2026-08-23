import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { getTripByDocId } from '../../appwrite/Trips'; // Update path if needed

export const TicketView: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTicketData = async () => {
      if (!bookingId) return;
      try {
        const data = await getTripByDocId(bookingId);
        setBooking(data);
        if (data) {
          // Trigger the download prompt modal once data is successfully loaded
          setShowDownloadModal(true);
        }
      } catch (error) {
        console.error("Failed to load ticket data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest animate-pulse">
          Retrieving Secure Manifest...
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="font-mono text-xs text-red-500 uppercase tracking-widest">
          Ticket Not Found or Unauthorized
        </div>
      </div>
    );
  }

  // --- Map the Real Data from Appwrite ---
  const currentBookingRef = booking.bookingID || booking.BookingID || booking.paystackRef || booking.$id;
  const airlineName = booking.airline || 'Commercial Flight';
  const originCode = booking.departureAirport || booking.country || 'ORIGIN';
  const destinationCode = booking.arrivalAirport || booking.name || 'DEST';
  const flightNum = booking.flightNumber || 'NX-FL';
  
  // Format Date
  const flightDate = booking.flightDate 
    ? new Date(booking.flightDate).toLocaleDateString() 
    : new Date(booking.$createdAt).toLocaleDateString();

  // Format Time Helper
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return 'Scheduled';
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    try { return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } 
    catch { return timeStr; }
  };

  const formattedDepTime = formatTime(booking.departureTime);
  const formattedArrTime = formatTime(booking.arrivalTime);

  const passengerFullName = booking.passengerName || booking.fullName || booking.passengerEmail || 'Verified Traveler';
  const passengerGender = booking.gender || booking.passengerGender || 'N/A';
  const passengerDob = booking.DOB || booking.dateOfBirth || 'N/A';
  const passengerGenderDob = `${passengerGender} | ${passengerDob}`;
  const paystackRef = booking.paystackRef || booking.paymentReference || 'VERIFIED';

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

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
    doc.text(paystackRef, 22, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIRMED', 110, 139);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.text('Generated securely via Nexa OS Flight Systems. Please present this manifest at boarding.', 15, 165);

    doc.save(`Ticket-${currentBookingRef}.pdf`);
    setShowDownloadModal(false);
    // Open hotel booking modal next or leave it for user action
    setShowHotelModal(true);
  };

  const handleStartHotelBooking = () => {
    navigate('/Home/hotel-search', {
      state: {
        bookingId: currentBookingRef,
        arrivalAirport: destinationCode,
      },
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 font-sans py-6 px-4 relative">
      
      {/* Download Confirmation Modal Popup */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-[2rem] max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center font-bold text-xl">
              ✓
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-black tracking-tight">Ticket Retrieved Successfully</h3>
              <p className="text-xs text-slate-500">Would you like to download your ticket as a PDF?</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  setShowHotelModal(true);
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                No, Thanks
              </button>
              <button
                onClick={handleDownloadPDF}
                className="w-full py-3 bg-black hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
              >
                Yes, Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hotel Booking Prompt Popup */}
      {showHotelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-[2rem] max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-2xl mx-auto flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-black tracking-tight">Need Accommodation?</h3>
              <p className="text-xs text-slate-500">Explore and book stays seamlessly near {destinationCode}.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowHotelModal(false)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Skip
              </button>
              <button
                onClick={handleStartHotelBooking}
                className="w-full py-3 bg-black hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
              >
                Find Stays
              </button>
            </div>
          </div>
        </div>
      )}

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
            <span className="font-bold text-black font-mono text-[10px]">{paystackRef}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button 
            onClick={() => setShowDownloadModal(true)}
            className="w-1/2 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Download PDF</span>
          </button>

          <button 
            onClick={() => navigate('/Home')}
            className="w-1/2 py-3.5 bg-black hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketView;