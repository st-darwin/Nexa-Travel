import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Query } from 'appwrite';
import { database, appwriteConfig } from '../../appwrite/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const HotelConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { bookingId?: string } | undefined;

  const bookingId = state?.bookingId;

  const [bookingRecord, setBookingRecord] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError('No booking ID context found.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await database.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.hotelBookingCollectionId,
          [Query.equal('bookingId', bookingId)]
        );

        if (response.documents.length > 0) {
          setBookingRecord(response.documents[0]);
        } else {
          setError('No reservation record found for this booking ID.');
        }
      } catch (err: any) {
        console.error('Error fetching ticket confirmation:', err);
        setError('Failed to load your ticket information.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleDownloadPDF = async () => {
    const element = ticketRef.current;
    if (!element) return;

    try {
      setDownloading(true);
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        // onclone strips or overrides oklch styles injected by Tailwind v4 during canvas parsing
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('ticket-container');
          if (clonedElement) {
            clonedElement.style.color = '#0f172a';
            clonedElement.style.backgroundColor = '#ffffff';
          }
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`Hotel-Reservation-${bookingRecord?.bookingReference || 'Ticket'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to download PDF ticket.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] font-mono text-xs px-4">
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-sm max-w-sm w-full justify-center">
          <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="text-slate-600 font-medium">Retrieving confirmation ticket...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] px-3 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs print:hidden">
          <div>
            <span className="inline-block text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-lg">
              Payment Confirmed
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">Hotel Reservation Ticket</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-slate-900 text-white font-mono text-xs rounded-xl hover:bg-slate-800 transition-all cursor-pointer shadow-sm text-center disabled:opacity-50"
            >
              {downloading ? 'Generating PDF...' : 'Download PDF'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-slate-100 text-slate-700 font-mono text-xs rounded-xl hover:bg-slate-200 transition-all cursor-pointer text-center"
            >
              Home
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-mono">
            {error}
          </div>
        )}

        {bookingRecord && (
          <div id="ticket-container" ref={ticketRef} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Header Banner */}
            <div className="bg-slate-900 text-white p-5 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <p className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-widest">Confirmed Booking Pass</p>
                <h1 className="text-xl sm:text-2xl font-bold leading-tight">{bookingRecord.hotelName}</h1>
                <p className="text-xs text-slate-300">{bookingRecord.hotelAddress}</p>
              </div>
              <div className="w-full sm:w-auto bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-left sm:text-right font-mono">
                <span className="block text-[10px] text-slate-400 uppercase">Booking Reference</span>
                <span className="text-xs sm:text-sm font-bold text-white break-all">{bookingRecord.bookingReference}</span>
              </div>
            </div>

            {/* Hotel Image */}
            {bookingRecord.hotelImageUrl && (
              <div className="w-full h-40 sm:h-56 md:h-64 overflow-hidden bg-slate-100">
                <img
                  src={bookingRecord.hotelImageUrl}
                  alt={bookingRecord.hotelName}
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Ticket Content */}
            <div className="p-5 sm:p-8 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Primary Guest</span>
                  <p className="text-sm font-bold text-slate-900 break-words">{bookingRecord.fullName}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Contact Email</span>
                  <p className="text-sm font-bold text-slate-900 break-all">{bookingRecord.email}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Phone Number</span>
                  <p className="text-sm font-bold text-slate-900">{bookingRecord.phoneNumber}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Associated Trip ID</span>
                  <p className="text-sm font-bold font-mono text-slate-900 break-all">{bookingRecord.bookingId}</p>
                </div>
              </div>

              {bookingRecord.specialRequests && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Special Requests</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{bookingRecord.specialRequests}</p>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Payment Breakdown</h3>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Payment Status</span>
                    <span className="text-emerald-600 font-bold">{bookingRecord.paymentStatus}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center text-slate-600 gap-1 sm:gap-0">
                    <span>Payment Reference</span>
                    <span className="text-slate-900 break-all sm:text-right">{bookingRecord.paymentReference}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-900 font-bold pt-2.5 border-t border-slate-200 text-sm">
                    <span>Total Paid ({bookingRecord.currency})</span>
                    <span>${bookingRecord.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                  Please present this confirmation pass or your reference number upon check-in at the hotel front desk.
                </p>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default HotelConfirmation;