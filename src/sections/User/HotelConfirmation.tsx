import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Query } from 'appwrite';
import { database, appwriteConfig } from '../../appwrite/client';

export const HotelConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { bookingId?: string } | undefined;

  const bookingId = state?.bookingId;

  const [bookingRecord, setBookingRecord] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
        // Query the hotel booking collection table using the bookingId
        const response = await database.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.hotelBookingCollectionId,
          [Query.equal('bookingId', bookingId)]
        );

        if (response.documents.length > 0) {
          // Grab the most recent booking record matching this ID
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

  const handlePrint = () => {
    window.print();
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
    <div className="w-full min-h-screen bg-[#F8FAFC] px-4 sm:px-6 lg:px-8 py-8 md:py-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Action Toolbar (Hidden when printing) */}
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-100 shadow-xs print:hidden">
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-lg">
              Payment Confirmed
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Hotel Reservation Ticket</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 text-white font-mono text-xs rounded-xl hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
            >
              Print Ticket
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-mono text-xs rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden print:shadow-none print:border-none">
            
            {/* Header Banner */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Confirmed Booking Pass</p>
                <h1 className="text-2xl font-bold mt-0.5">{bookingRecord.hotelName}</h1>
                <p className="text-xs text-slate-300 mt-1">{bookingRecord.hotelAddress}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-right font-mono">
                <span className="block text-[10px] text-slate-400 uppercase">Booking Reference</span>
                <span className="text-sm font-bold text-white">{bookingRecord.bookingReference}</span>
              </div>
            </div>

            {/* Hotel Image */}
            {bookingRecord.hotelImageUrl && (
              <div className="w-full h-48 sm:h-64 overflow-hidden bg-slate-100">
                <img
                  src={bookingRecord.hotelImageUrl}
                  alt={bookingRecord.hotelName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Ticket Content */}
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Primary Guest</span>
                  <p className="text-sm font-bold text-slate-900">{bookingRecord.fullName}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Contact Email</span>
                  <p className="text-sm font-bold text-slate-900">{bookingRecord.email}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Phone Number</span>
                  <p className="text-sm font-bold text-slate-900">{bookingRecord.phoneNumber}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Associated Trip ID</span>
                  <p className="text-sm font-bold font-mono text-slate-900">{bookingRecord.bookingId}</p>
                </div>
              </div>

              {bookingRecord.specialRequests && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Special Requests</span>
                  <p className="text-xs text-slate-700">{bookingRecord.specialRequests}</p>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Payment Breakdown</h3>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Payment Status</span>
                    <span className="text-emerald-600 font-bold">{bookingRecord.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Payment Reference</span>
                    <span className="text-slate-900">{bookingRecord.paymentReference}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200 text-sm">
                    <span>Total Paid ({bookingRecord.currency})</span>
                    <span>${bookingRecord.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-400 font-mono">
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