import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { account, functions, appwriteConfig, database } from '../../appwrite/client';
import { getUserTripById } from '../../appwrite/Trips';
import { createRecommendationBooking } from '../../appwrite/recommendationsBooking';
import { parseTripData } from '../../lib/utils';
import { BROWSE_RECOMMENDATIONS } from '../../constants/recommendations';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, any>) => {
        openIframe: () => void;
      };
    };
  }
}

interface BookingState {
  distance: number;
  flightCost: number;
  platformFee: number;
  totalPrice: number;
  preloadedTrip?: any;
}

type TransportMode = 'flight' | 'taxi';
type TravelClass = 'economy' | 'premium' | 'business' | 'first';

interface LiveFlightPayload {
  baseTicketCost: number;
  platformFee: number;
  totalPriceToPay: number;
  airlineName: string;
  offerId: string;
}

const CLASS_MULTIPLIERS: Record<TravelClass, number> = {
  economy: 1.0,
  premium: 1.35,
  business: 1.85,
  first: 2.50,
};

const convertToIATA = (locationStr: string, defaultFallback = 'LOS'): string => {
  if (!locationStr) return defaultFallback;
  const normalized = locationStr.trim().toUpperCase();

  if (normalized.includes('LAGOS') || normalized.includes('LOS')) return 'LOS';
  if (normalized.includes('LONDON') || normalized.includes('LHR')) return 'LHR';
  if (normalized.includes('ABUJA') || normalized.includes('ABV')) return 'ABV';
  if (normalized.includes('NEW YORK') || normalized.includes('JFK')) return 'JFK';
  if (normalized.includes('PARIS') || normalized.includes('CDG')) return 'CDG';
  if (normalized.includes('DUBAI') || normalized.includes('DXB')) return 'DXB';
  if (normalized.includes('NAIROBI') || normalized.includes('NBO')) return 'NBO';
  if (normalized.includes('PORT HARCOURT') || normalized.includes('PHC')) return 'PHC';

  if (/^[A-Z]{3}$/.test(normalized)) return normalized;

  const bracketMatch = normalized.match(/\(([A-Z]{3})\)/);
  if (bracketMatch) return bracketMatch[1];

  return defaultFallback;
};

export const TripBooking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const telemetry = (location.state as BookingState) || {
    distance: 0,
    flightCost: 0,
    platformFee: 0,
    totalPrice: 0,
  };

  const [transportMode, setTransportMode] = useState<TransportMode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isFetchingFlight, setIsFetchingFlight] = useState<boolean>(false);
  const [liveFlight, setLiveFlight] = useState<LiveFlightPayload | null>(null);
  const [isPreloaded, setIsPreloaded] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    origin: 'Detecting Position...',
    destination: 'Resolving Destination...',
    departureDate: '',
    departureTime: '',
    travelClass: 'economy' as TravelClass,
    specialRequests: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'm' as 'm' | 'f',
  });

  // Load Route/Ecosystem Context
// 1. STRICT DETECTION IN useEffect
useEffect(() => {
  let isMounted = true;

  const fetchEcosystemData = async () => {
    try {
      let activeUser = null;
      try {
        activeUser = await account.get();
      } catch {
        // Unauthenticated or guest fallback
      }

      let parsedTrip: any = null;

      // Check if this is EXPLICITLY a Browse Recommendation item
      const isStaticBrowseRec = BROWSE_RECOMMENDATIONS.some((rec) => rec.id === id);

      if (isStaticBrowseRec) {
        // BROWSE RECOMMENDATION PATH
        parsedTrip = BROWSE_RECOMMENDATIONS.find((rec) => rec.id === id);
        if (isMounted) setIsPreloaded(true);
      } else if (id && activeUser?.$id) {
        // CUSTOM AI TRIP PATH (Main Trip Collection)
        try {
          const tripDocument = await getUserTripById(id, activeUser.$id);
          if (tripDocument) {
            parsedTrip = parseTripData(tripDocument);
            if (isMounted) setIsPreloaded(false); // 👈 Forces Custom AI Trip path
          }
        } catch (err) {
          console.warn("Could not query DB for trip ID:", err);
        }
      }

      const geo = await fetch('https://api.db-ip.com/v2/free/self')
        .then((r) => r.json())
        .catch(() => ({ city: 'Lagos', countryCode: 'NG' }));

      const sanitizedCity = geo.countryCode === 'MU' ? 'Lagos' : geo.city || 'Lagos';
      const sanitizedCountry = geo.countryCode === 'MU' ? 'NG' : geo.countryCode || 'NG';

      const destinationName = 
        parsedTrip?.location?.city || 
        parsedTrip?.location?.name || 
        parsedTrip?.name || 
        parsedTrip?.title || 
        parsedTrip?.destination || 
        'Destination';

      if (isMounted) {
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || activeUser?.name || '',
          email: prev.email || activeUser?.email || '',
          destination: destinationName,
          origin: prev.origin !== 'Detecting Position...' ? prev.origin : `${sanitizedCity}, ${sanitizedCountry}`,
        }));
      }
    } catch (error) {
      console.error('Data ingestion breakdown:', error);
    } finally {
      if (isMounted) setIsLoadingData(false);
    }
  };

  fetchEcosystemData();
  return () => {
    isMounted = false;
  };
}, [id]);

  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const fetchFlightQuote = useCallback(async () => {
    setIsFetchingFlight(true);
    try {
      const sanitizedOrigin = convertToIATA(formData.origin, 'LOS');
      const sanitizedDestination = convertToIATA(formData.destination, 'LHR');

      const validDepartureDate = formData.departureDate && formData.departureDate > new Date().toISOString().split('T')[0]
        ? formData.departureDate
        : getTomorrowDateString();

      const execution = await functions.createExecution(
        appwriteConfig.functionId,
        JSON.stringify({
          origin: sanitizedOrigin,
          destination: sanitizedDestination,
          departureDate: validDepartureDate,
          departureTime: formData.departureTime || '12:00',
          travelClass: formData.travelClass,
        })
      );

      const responseData = JSON.parse(execution.responseBody);
      if (responseData.success) {
        setLiveFlight(responseData);
      } else {
        console.error('Duffel Core Pricing Refusal:', responseData.error);
      }
    } catch (err) {
      console.error('Cloud network handshake timeout:', err);
    } finally {
      setIsFetchingFlight(false);
    }
  }, [formData.origin, formData.destination, formData.departureDate, formData.departureTime, formData.travelClass]);

  // Dynamic Pricing Computation
  let finalFlightCost = telemetry.flightCost || 0;
  let finalPlatformFee = telemetry.platformFee || 0;
  let finalGrandTotal = telemetry.totalPrice || 0;

  if (transportMode === 'flight' && liveFlight) {
    const classMultiplier = CLASS_MULTIPLIERS[formData.travelClass] || 1;
    finalFlightCost = liveFlight.baseTicketCost * classMultiplier;
    finalPlatformFee = liveFlight.platformFee * classMultiplier;
    finalGrandTotal = finalFlightCost + finalPlatformFee;
  } else if (transportMode === 'taxi') {
    finalFlightCost = (telemetry.flightCost || 100) * 0.65;
    finalPlatformFee = finalFlightCost * 0.08;
    finalGrandTotal = finalFlightCost + finalPlatformFee;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectTransport = (mode: TransportMode) => {
    setTransportMode(mode);
    setIsModalOpen(false);

    if (mode === 'flight') {
      fetchFlightQuote();
    }
  };

// 2. SEPARATED FULFILLMENT LOGIC
const handlePostPaymentFulfillment = async (response: { reference: string }) => {
  const nameParts = formData.fullName.trim().split(' ');
  const firstName = nameParts[0] || 'Passenger';
  const lastName = nameParts.slice(1).join(' ') || firstName;

  try {
    const user = await account.get();

    // =========================================================
    // PATH A: BROWSE RECOMMENDATIONS ONLY
    // Target: appwriteConfig.recommendationCollectionId
    // =========================================================
    if (isPreloaded) {
      const generatedBookingID = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const bookingDoc = await createRecommendationBooking({
        userID: user.$id,
        recommendationId: id || 'rec-unknown',
        tripName: formData.destination,
        totalPrice: finalGrandTotal,
        distance: telemetry.distance || 0,
        bookingStatus: 'confirmed',
        paymentStatus: 'paid',
        bookingID: generatedBookingID,
        passengerName: formData.fullName,
        amount: finalGrandTotal,
        transportMode: transportMode || 'flight',
        carrier: liveFlight?.airlineName || 'Nexa Air',
        departureDate: formData.departureDate,
      });

      navigate(`/booking-success/${bookingDoc.$id}`, {
        state: {
          price: finalGrandTotal,
          mode: transportMode,
          passengerName: formData.fullName,
          destination: formData.destination,
          bookingId: generatedBookingID,
        },
      });
      return; // Exit completely for Browse Recommendations
    }

    // =========================================================
    // PATH B: CUSTOM AI TRIPS
    // Target: appwriteConfig.tripCollectionId
    // =========================================================
    let realBookingId = response.reference; // Default to Paystack Reference
    let carrierName = liveFlight?.airlineName || (transportMode === 'taxi' ? 'Nexa Ground Fleet' : 'Nexa Air');

    if (transportMode === 'flight' && liveFlight) {
      try {
        const execution = await functions.createExecution(
          appwriteConfig.functionId,
          JSON.stringify({
            action: 'create_order',
            offerId: liveFlight.offerId,
            paymentReference: response.reference,
            passenger: {
              first_name: firstName,
              last_name: lastName,
              email: formData.email,
              phone_number: formData.phoneNumber,
              born_on: formData.dateOfBirth,
              gender: formData.gender,
            },
          })
        );

        const bookingResponse = JSON.parse(execution.responseBody);
        if (bookingResponse.success && bookingResponse.data) {
          realBookingId = bookingResponse.data.booking_reference || bookingResponse.data.id || response.reference;
        }
      } catch (funcErr) {
        console.warn("Function execution warning, falling back to payment ref:", funcErr);
      }
    } else if (transportMode === 'taxi') {
      realBookingId = `TAXI-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // Single Atomic Update to your Main AI Trip Document
  // Single Atomic Update to your Main AI Trip Document
if (id) {
  await database.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.tripCollectionId,
    id,
    {
      bookingStatus: 'confirmed',
      paymentStatus: 'successful', // 👈 Fixed: must be 'successful', not 'paid'
      paymentAmount: finalGrandTotal,
      amount: finalGrandTotal,
      paystackRef: response.reference,
      BookingID: realBookingId,    // 👈 Fixed: capitalized 'B' to match Appwrite schema
      passengerName: formData.fullName,
      transportMode: transportMode || 'flight',
      destination: formData.destination,
      departureDate: formData.departureDate,
      carrier: carrierName,
      passengers: JSON.stringify([
        {
          given_name: firstName,
          family_name: lastName,
          email: formData.email,
          phone: formData.phoneNumber,
        },
      ]),
    }
  );
}

    navigate(`/booking-success/${realBookingId}`, {
      state: {
        price: finalGrandTotal,
        mode: transportMode,
        passengerName: formData.fullName,
        destination: formData.destination,
        bookingId: realBookingId,
      },
    });
  } catch (backendError: any) {
    console.error('Payment finalized but fulfillment failed:', backendError);
    alert(`Payment received, but ticket update failed: ${backendError.message}`);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phoneNumber.trim()) {
      alert('Please complete all required passenger manifest fields.');
      return;
    }

    if (!formData.dateOfBirth) {
      alert('Date of Birth is required for passenger registration.');
      return;
    }

    if (!window.PaystackPop) {
      alert('Payment gateway engine is still initializing. Please check your internet connection.');
      return;
    }

    setIsSubmitting(true);

    const NGN_EXCHANGE_RATE = 1500;
    const totalAmountInKobo = Math.round(finalGrandTotal * NGN_EXCHANGE_RATE * 100);

    try {
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: formData.email,
        amount: totalAmountInKobo,
        currency: 'NGN',
        ref: `NEXA_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        metadata: {
          custom_fields: [
            { display_name: 'Passenger Name', variable_name: 'passenger_name', value: formData.fullName },
            { display_name: 'Passenger Phone', variable_name: 'passenger_phone', value: formData.phoneNumber },
            { display_name: 'Transit Protocol', variable_name: 'transit_protocol', value: transportMode || 'unknown' },
          ],
        },
        callback: function (response: { reference: string }) {
          handlePostPaymentFulfillment(response);
        },
        onClose: () => {
          setIsSubmitting(false);
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error('Gateway engine failure:', error);
      setIsSubmitting(false);
      alert('Could not load payment interface.');
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/60 backdrop-blur-md">
        <div className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200/50 rounded-full shadow-sm">
          <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-bold text-slate-800 font-mono tracking-wider uppercase">
            Syncing Manifest Records...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 min-h-screen bg-slate-50/30 font-sans antialiased relative selection:bg-slate-900 selection:text-white">
      {isFetchingFlight && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <span className="w-6 h-6 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            Querying Global Airline Matrix...
          </p>
        </div>
      )}

      {/* Transport Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-md transition-all duration-300">
          <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl p-6 md:p-7 relative overflow-hidden">
            <div className="space-y-1 mb-6">
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-mono">
                Transit Strategy
              </span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Select Transfer Protocol</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Choose your primary infrastructure route setup to authorize your terminal access.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSelectTransport('flight')}
                className="w-full text-left p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 hover:bg-indigo-50/40 transition-all duration-150 group flex items-start gap-4 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                  <svg className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div className="space-y-0.5 pr-16">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900">Aviation Transit</h4>
                    <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-600 rounded">
                      Optimal
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-normal">
                    High-altitude routes calculated via our AI optimization core.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTransport('taxi')}
                className="w-full text-left p-4 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/60 transition-all duration-150 group flex items-start gap-4 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-600 flex-shrink-0">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">Ground Hub Taxi</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-normal">
                    Regional direct point-to-point network layouts.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 transition-all duration-500 ${isModalOpen || isFetchingFlight ? 'blur-md opacity-30 pointer-events-none scale-[0.99]' : 'opacity-100 scale-100'}`}>
        
        {/* Left Side: Form */}
        <form onSubmit={handleSubmitBooking} className="lg:col-span-7 space-y-6 bg-white p-6 md:p-8 rounded-2xl border border-slate-200/50 shadow-sm">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">Passenger Telemetry Intake</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Verify your automatically synchronized routing profiles.</p>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-mono">Assigned Departure Point</label>
                <input 
                  type="text" 
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  className="w-full text-xs font-bold px-3.5 py-3 bg-slate-50/50 border border-slate-200/70 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-800 font-mono"
                  placeholder="e.g. Lagos, NG"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-mono">Target AI Destination</label>
                <input 
                  type="text" 
                  disabled
                  value={formData.destination}
                  className="w-full text-xs font-bold px-3.5 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-800 select-none cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-mono">Departure Date</label>
                <input 
                  type="date" 
                  name="departureDate"
                  required
                  value={formData.departureDate}
                  onChange={handleInputChange}
                  className="w-full text-xs font-medium px-3.5 py-3 bg-slate-50/50 border border-slate-200/70 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-800 font-mono text-center"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-mono">Departure Window</label>
                <input 
                  type="time" 
                  name="departureTime"
                  required
                  value={formData.departureTime}
                  onChange={handleInputChange}
                  className="w-full text-xs font-medium px-3.5 py-3 bg-slate-50/50 border border-slate-200/70 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-800 font-mono text-center"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-mono">Service Configuration</label>
                <div className="relative">
                  <select 
                    name="travelClass"
                    value={formData.travelClass}
                    onChange={handleInputChange}
                    className="w-full text-xs font-bold px-3.5 py-3 bg-slate-50/50 border border-slate-200/70 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-800 appearance-none font-mono cursor-pointer"
                  >
                    <option value="economy">Economy Tier</option>
                    <option value="premium">Premium Hub</option>
                    <option value="business">Business Spec</option>
                    <option value="first">First Protocol</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-mono">Full Legal Name</label>
                <input 
                  type="text" 
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full text-xs font-medium px-3.5 py-3 bg-slate-50/50 border border-slate-200/70 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-mono">Digital Mail Coordinates</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="johndoe@nexa.io"
                  className="w-full text-xs font-medium px-3.5 py-3 bg-slate-50/50 border border-slate-200/70 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-mono">Telecom Link</label>
                <input 
                  type="tel" 
                  name="phoneNumber"
                  required
                  placeholder="+234...."
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full text-xs font-medium px-3.5 py-3 bg-slate-50/50 border border-slate-200/70 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-800 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-mono">Date of Birth</label>
                <input 
                  type="date" 
                  name="dateOfBirth"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full text-xs font-medium px-3.5 py-3 bg-slate-50/50 border border-slate-200/70 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-800 font-mono text-center"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-mono">Gender Metric</label>
                <div className="relative">
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full text-xs font-bold px-3.5 py-3 bg-slate-50/50 border border-slate-200/70 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-800 appearance-none font-mono cursor-pointer"
                  >
                    <option value="m">Male Protocol</option>
                    <option value="f">Female Protocol</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-mono">Special Directives (Optional)</label>
              <textarea 
                name="specialRequests"
                rows={3}
                value={formData.specialRequests}
                onChange={handleInputChange}
                placeholder="Dietary choices, seat configurations, or specific ground luggage handling notes..."
                className="w-full text-xs font-medium px-3.5 py-3 bg-slate-50/50 border border-slate-200/70 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-800 resize-none"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            {transportMode && (
              <button 
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-3 py-2 text-[9px] font-bold uppercase font-mono tracking-wider border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors cursor-pointer text-center"
              >
                Change Asset: {transportMode}
              </button>
            )}
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto cursor-pointer sm:ml-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="font-mono">Securing Route...</span>
                </>
              ) : (
                `Complete Booking — $${finalGrandTotal.toFixed(2)}`
              )}
            </button>
          </div>
        </form>

        {/* Right Side: Matrix Ledger */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Booking Matrix Breakdown</h3>
              <p className="text-[10px] text-slate-400 font-medium font-mono">ID: {id?.slice(0, 8).toUpperCase() || 'NEXA-PROTOTYPE'}..</p>
            </div>

            <div className="bg-slate-50/70 border border-slate-100 p-3.5 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-mono">Route Distance</span>
                <p className="text-xs font-black font-mono text-slate-800">{telemetry.distance} km</p>
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-mono">Transport Asset</span>
                <p className="text-[10px] font-bold uppercase font-mono text-slate-700 block">
                  {transportMode === 'flight' && liveFlight ? `${liveFlight.airlineName}` : (transportMode || 'Pending')}
                </p>
              </div>
            </div>

            {transportMode === 'flight' && (
              <div className="text-slate-500 border border-dashed border-slate-200 rounded-xl p-3 text-[10px] font-mono flex justify-between items-center bg-slate-50/30">
                <span className="uppercase text-[8px] font-bold text-slate-400">Class Protocol:</span>
                <span className="font-bold text-slate-900 uppercase tracking-wider">{formData.travelClass}</span>
              </div>
            )}

            <div className="space-y-2.5 pt-1 text-[11px] font-medium">
              <div className="flex justify-between items-center text-slate-500">
                <span>Calculated Tariff Base Rate</span>
                <span className="font-mono font-bold text-slate-800">${finalFlightCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-500">
                <span className="flex items-center gap-1.5">
                  Platform Fee
                  <span className="text-[8px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded font-mono">8%</span>
                </span>
                <span className="font-mono text-slate-800 font-bold">${finalPlatformFee.toFixed(2)}</span>
              </div>

              <div className="w-full h-[1px] bg-slate-100 my-1" />

              <div className="flex justify-between items-end pt-2">
                <div>
                  <span className="text-slate-900 font-black text-xs tracking-tight block">Aggregated Total</span>
                  <span className="text-[9px] text-slate-400 font-normal">Dynamic agency fees included</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-900 font-black font-mono text-lg tracking-tighter">${finalGrandTotal.toFixed(2)}</span>
                  <span className="text-[8px] text-slate-400 font-mono block uppercase font-bold tracking-wider">USD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TripBooking;