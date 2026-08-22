import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Query, ID } from 'appwrite';
import { usePaystackPayment } from 'react-paystack';
import { database, appwriteConfig, functions } from '../../appwrite/client';

export const CustomHotelBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { hotel?: any; bookingId?: string } | undefined;

  const hotel = state?.hotel;
  const bookingId = state?.bookingId;

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields (Autofilled from Appwrite trip records)
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  useEffect(() => {
    const fetchUserBookingContext = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let doc: any = null;

        const collections = [
          appwriteConfig.tripCollectionId,
          appwriteConfig.normalCollectionID,
          appwriteConfig.recommendationCollectionId,
        ];

        // Search across collections for the booking record
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
              // Keep checking
            }
          }
        }

        if (doc) {
          const name = doc.fullName || doc.passengerName || doc.name || `${doc.firstName || ''} ${doc.lastName || ''}`.trim();
          setFullName(name);
          setEmail(doc.email || doc.userEmail || doc.passengerEmail || '');
          setPhoneNumber(doc.phoneNumber || doc.phone || '');
        }
      } catch (err: any) {
        console.error('Error fetching user context for booking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookingContext();
  }, [bookingId]);

  // Currency Conversion logic: Database amount is in USD, Paystack expects NGN (Kobo)
  const amountInUSD = parseFloat(hotel?.cheapest_rate_total_amount || '0');
  const USD_TO_NGN_RATE = 1500; 
  const amountInNaira = amountInUSD * USD_TO_NGN_RATE;
  const amountInLowestUnit = Math.round(amountInNaira * 100);

  // Paystack configuration config
  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: email || 'guest@example.com',
    amount: amountInLowestUnit > 0 ? amountInLowestUnit : 1000, 
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '', 
    currency: 'NGN',
    metadata: {
      custom_fields: [
        {
          display_name: 'Full Name',
          variable_name: 'full_name',
          value: fullName,
        },
        {
          display_name: 'Phone Number',
          variable_name: 'phone_number',
          value: phoneNumber,
        },
        {
          display_name: 'Hotel Name',
          variable_name: 'hotel_name',
          value: hotel?.accommodation?.name || 'Hotel Booking',
        },
      ],
    },
  };

  const initializePaystackPayment = usePaystackPayment(paystackConfig);

  // Success handler triggered once Paystack confirms payment
  const handlePaystackSuccess = async (reference: any) => {
    try {
      setSubmitting(true);
      setError(null);

      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || 'Guest';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      // 1. Call Appwrite Function to execute backend reservation fulfillment
      const execution = await functions.createExecution(
        appwriteConfig.functionId,
        JSON.stringify({
          action: 'create_hotel_order',
          searchResultId: hotel.id,
          rateId: hotel.cheapest_rate_id || 'rate_default',
          paystackReference: reference.reference,
          guest: {
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone_number: phoneNumber,
            hotelName: hotel.accommodation?.name,
            amount: amountInUSD,
            currency: 'USD'
          }
        }),
        false
      );

      const rawBody = execution.responseBody?.trim() || '';
      const result = JSON.parse(rawBody);

      if (!result.success) {
        throw new Error(result.error || 'Failed to complete hotel reservation processing.');
      }

      const bookingData = result.data;

      // 2. Save record into your 'Hotel_booking' collection table (store hotel details here since we are only passing bookingId forward)
      await database.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.hotelBookingCollectionId, 
        ID.unique(),
        {
          bookingReference: bookingData.bookingReference || reference.reference,
          hotelName: hotel?.accommodation?.name || '',
          hotelAddress: `${hotel?.accommodation?.address?.line_one || ''}, ${hotel?.accommodation?.address?.city_name || ''}`,
          hotelImageUrl: hotel?.accommodation?.photos?.[0]?.url || '',
          fullName: fullName,
          email: email,
          phoneNumber: phoneNumber,
          totalAmount: amountInUSD.toString(),
          currency: 'USD',
          bookingId: bookingId || 'N/A',
          specialRequests: specialRequests || '',
          paymentStatus: 'Paid',
          paymentReference: reference.reference,
          createdAt: new Date().toISOString()
        }
      );

      // 3. Navigate to confirmation view passing ONLY the bookingId
      navigate('/Home/hotel-confirmation', { 
        state: { bookingId } 
      });

    } catch (err: any) {
      console.error('Hotel booking save error:', err);
      setError(err.message || 'Payment was successful, but saving your reservation encountered an issue. Please contact support.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaystackClose = () => {
    setError('Payment window was closed. Complete payment to secure your room.');
    setSubmitting(false);
  };

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotel) {
      setError('No hotel selected. Please go back and select a room.');
      return;
    }
    if (!email || !fullName) {
      setError('Please ensure your name and email are filled out.');
      return;
    }

    setSubmitting(true);
    setError(null);

    initializePaystackPayment({
      onSuccess: (ref) => handlePaystackSuccess(ref),
      onClose: () => handlePaystackClose(),
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] font-mono text-xs px-4">
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-sm max-w-sm w-full justify-center">
          <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="text-slate-600 font-medium">Preparing booking profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] px-4 sm:px-6 lg:px-8 py-8 md:py-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xs">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              Secure Checkout via Paystack (Converted to NGN)
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Complete Your Hotel Reservation</h2>
          </div>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-mono text-xs rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
          >
            Back
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-mono">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSubmitClick} className="lg:col-span-2 bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              Guest Information (Auto-filled)
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-600 uppercase mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-600 uppercase mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-600 uppercase mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-600 uppercase mb-1.5">
                  Special Requests (Optional)
                </label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Late check-in, king bed preference, quiet room..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-slate-900 text-white font-mono text-xs font-bold rounded-xl hover:bg-slate-800 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <span>Pay NGN {amountInNaira.toLocaleString()} (${amountInUSD.toFixed(2)} USD)</span>
              )}
            </button>
          </form>

          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4 h-fit">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              Booking Summary
            </h3>

            {hotel?.accommodation?.photos?.[0]?.url && (
              <img
                src={hotel.accommodation.photos[0].url}
                alt={hotel.accommodation.name}
                className="w-full h-36 object-cover rounded-2xl"
              />
            )}

            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">{hotel?.accommodation?.name}</h4>
              <p className="text-xs text-slate-500">
                {hotel?.accommodation?.address?.line_one}, {hotel?.accommodation?.address?.city_name}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Room Rate (USD)</span>
                <span>${amountInUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Exchange Rate</span>
                <span>1 USD = ₦{USD_TO_NGN_RATE.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-100 text-sm">
                <span>Total (NGN)</span>
                <span>₦{amountInNaira.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomHotelBooking;