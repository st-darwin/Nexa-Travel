import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Query } from 'appwrite';
import { database, appwriteConfig } from '../../appwrite/client';
import jsPDF from 'jspdf';

export const HotelConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { bookingId?: string } | undefined;

  const bookingId = state?.bookingId;

  const [bookingRecord, setBookingRecord] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleDownloadPDF = () => {
    if (!bookingRecord) return;

    try {
      setDownloading(true);
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header Background
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 45, 'F');

      // Header Text
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFontSize(8);
      doc.text('CONFIRMED BOOKING PASS', 15, 15);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text(bookingRecord.hotelName || 'Hotel Reservation', 15, 24);

      doc.setFontSize(10);
      doc.setTextColor(203, 213, 225); // slate-300
      doc.text(bookingRecord.hotelAddress || '', 15, 32);

      // Reference Box (Right aligned)
      doc.setFillColor(255, 255, 255, 0.1);
      doc.roundedRect(pageWidth - 75, 12, 60, 24, 3, 3, 'F');
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7);
      doc.text('BOOKING REFERENCE', pageWidth - 70, 18);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text(bookingRecord.bookingReference || 'N/A', pageWidth - 70, 27);

      // Body Section
      let currentY = 60;
      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFontSize(8);

      // Guest Details Grid
      const addField = (label: string, value: string, x: number, y: number) => {
        doc.setTextColor(148, 163, 184);
        doc.text(label.toUpperCase(), x, y);
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(10);
        doc.text(value || 'N/A', x, y + 5);
        doc.setFontSize(8);
      };

      addField('Primary Guest', bookingRecord.fullName, 15, currentY);
      addField('Contact Email', bookingRecord.email, pageWidth / 2, currentY);

      currentY += 18;
      addField('Phone Number', bookingRecord.phoneNumber, 15, currentY);
      addField('Associated Trip ID', bookingRecord.bookingId, pageWidth / 2, currentY);

      // Special Requests Section
      if (bookingRecord.specialRequests) {
        currentY += 20;
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, currentY, pageWidth - 30, 20, 2, 2, 'F');
        doc.setTextColor(148, 163, 184);
        doc.text('SPECIAL REQUESTS', 20, currentY + 6);
        doc.setTextColor(51, 65, 85);
        doc.text(bookingRecord.specialRequests, 20, currentY + 13, { maxWidth: pageWidth - 40 });
        currentY += 10;
      }

      // Payment Breakdown Section
      currentY += 25;
      doc.setTextColor(148, 163, 184);
      doc.text('PAYMENT BREAKDOWN', 15, currentY);

      currentY += 4;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, currentY, pageWidth - 30, 35, 3, 3, 'F');

      const addPaymentRow = (label: string, value: string, y: number, isBold = false) => {
        doc.setTextColor(100, 116, 139);
        doc.text(label, 22, y);
        if (isBold) {
          doc.setTextColor(15, 23, 42);
          doc.setFontSize(11);
        } else {
          doc.setTextColor(15, 23, 42);
          doc.setFontSize(9);
        }
        doc.text(value, pageWidth - 22, y, { align: 'right' });
        doc.setFontSize(8);
      };

      addPaymentRow('Payment Status', bookingRecord.paymentStatus || 'Paid', currentY + 10);
      addPaymentRow('Payment Reference', bookingRecord.paymentReference || 'N/A', currentY + 18);
      
      doc.setDrawColor(226, 232, 240);
      doc.line(22, currentY + 22, pageWidth - 22, currentY + 22);

      addPaymentRow(
        `Total Paid (${bookingRecord.currency || 'USD'})`,
        `$${bookingRecord.totalAmount?.toLocaleString() || 0}`,
        currentY + 30,
        true
      );

      // Footer Notice
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text(
        'Please present this confirmation pass or your reference number upon check-in at the hotel front desk.',
        pageWidth / 2,
        currentY + 55,
        { align: 'center' }
      );

      doc.save(`Hotel-Reservation-${bookingRecord?.bookingReference || 'Ticket'}.pdf`);
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
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            
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