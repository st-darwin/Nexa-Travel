import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { Query } from 'appwrite';
import { database, appwriteConfig, account } from '../../appwrite/client';
import { parseTripData } from '../../lib/utils';

interface TicketPassenger {
  id: string;
  given_name: string;
  family_name: string;
}

interface TicketSlice {
  id: string;
  origin: { name: string; iata_code: string };
  destination: { name: string; iata_code: string };
}

interface LiveTicketData {
  bookingReference: string;
  id: string;
  carrier: string;
  passengers: TicketPassenger[];
  slices?: TicketSlice[];
  seatClass?: string;
  departureTime?: string;
  arrivalTime?: string;
  FlightNumber?: string;
  arrivalAirport?: string;
  departureAirport?: string;
  destination?: string;
}

interface SuccessState {
  ticket?: LiveTicketData;
  price: number;
  mode: 'flight' | 'taxi';
  destination?: string;
  passengerName?: string;
  bookingId?: string;
  seatClass?: string;
  departureTime?: string;
  arrivalTime?: string;
  FlightNumber?: string;
  arrivalAirport?: string;
  departureAirport?: string;
}

export const BookingSuccess = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialState = location.state as SuccessState | undefined;

  const [ticketState, setTicketState] = useState<SuccessState | null>(initialState || null);
  const [loading, setLoading] = useState<boolean>(!initialState || !initialState.price || !initialState.destination);
  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [, setShared] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isHotelPopupOpen, setIsHotelPopupOpen] = useState(true);

  const ticketRef = useRef<HTMLDivElement>(null);

  const extractPassengerDetails = (
    passengersList?: TicketPassenger[],
    fallbackName?: string
  ): TicketPassenger[] => {
    if (passengersList && passengersList.length > 0 && passengersList[0]?.given_name) {
      return passengersList;
    }

    const cleanName = (fallbackName || '').trim();
    if (!cleanName) {
      return [{ id: '1', given_name: 'Verified', family_name: 'Explorer' }];
    }

    const nameParts = cleanName.split(' ');
    return [
      {
        id: '1',
        given_name: nameParts[0] || 'Verified',
        family_name: nameParts.slice(1).join(' ') || 'Explorer',
      },
    ];
  };

  useEffect(() => {
    const fetchTicketFromAppwrite = async () => {
      try {
        setLoading(true);
        setError(null);

        let activeUser: any = null;
        try {
          activeUser = await account.get();
        } catch (e) {
          console.warn('No active session found for user ID lookup:', e);
        }

        let doc: any = null;

        if (bookingId && bookingId !== 'undefined') {
          try {
            const recResponse = await database.listDocuments(
              appwriteConfig.databaseId,
              appwriteConfig.recommendationCollectionId,
              [Query.equal('bookingID', bookingId)]
            );
            if (recResponse.documents.length > 0) doc = recResponse.documents[0];
          } catch (err) {
            console.warn('Query by recommendation bookingID failed:', err);
          }

          if (!doc) {
            try {
              const response = await database.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.tripCollectionId,
                [Query.equal('paystackRef', bookingId)]
              );
              if (response.documents.length > 0) doc = response.documents[0];
            } catch (err) {
              console.warn('Query by paystackRef failed:', err);
            }
          }

          if (!doc) {
            try {
              const upperResponse = await database.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.tripCollectionId,
                [Query.equal('BookingID', bookingId)]
              );
              if (upperResponse.documents.length > 0) doc = upperResponse.documents[0];
            } catch {
              try {
                const lowerResponse = await database.listDocuments(
                  appwriteConfig.databaseId,
                  appwriteConfig.tripCollectionId,
                  [Query.equal('bookingID', bookingId)]
                );
                if (lowerResponse.documents.length > 0) doc = lowerResponse.documents[0];
              } catch (err) {
                console.warn('Query by bookingID/BookingID failed:', err);
              }
            }
          }

          if (!doc) {
            try {
              doc = await database.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.tripCollectionId,
                bookingId
              );
            } catch {
              try {
                doc = await database.getDocument(
                  appwriteConfig.databaseId,
                  appwriteConfig.recommendationCollectionId,
                  bookingId
                );
              } catch {
                // Ignore direct ID failure
              }
            }
          }
        }

        if (!doc && activeUser?.$id) {
          try {
            const userTripsRes = await database.listDocuments(
              appwriteConfig.databaseId,
              appwriteConfig.tripCollectionId,
              [
                Query.equal('userId', activeUser.$id),
                Query.orderDesc('$createdAt'),
                Query.limit(1)
              ]
            );
            if (userTripsRes.documents.length > 0) {
              doc = userTripsRes.documents[0];
            }
          } catch (userQueryErr) {
            console.warn('Failed to query trips by user ID:', userQueryErr);
          }

          if (!doc) {
            try {
              const userRecsRes = await database.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.recommendationCollectionId,
                [
                  Query.equal('userId', activeUser.$id),
                  Query.orderDesc('$createdAt'),
                  Query.limit(1)
                ]
              );
              if (userRecsRes.documents.length > 0) {
                doc = userRecsRes.documents[0];
              }
            } catch (recQueryErr) {
              console.warn('Failed to query recommendations by user ID:', recQueryErr);
            }
          }
        }

        if (!doc) {
          if (initialState && initialState.price) {
            setTicketState(initialState);
            setLoading(false);
            return;
          }
          throw new Error('Document not found');
        }

        let activeAccountName = activeUser?.name || '';
        const parsed = parseTripData(doc);

        const fetchedName =
          doc?.passengerName ||
          doc?.userName ||
          doc?.fullName ||
          parsed?.passengerName ||
          parsed?.userName ||
          parsed?.fullName ||
          activeAccountName ||
          initialState?.passengerName ||
          'Verified Explorer';

        let parsedPassengers: TicketPassenger[] | undefined = doc?.passengers;
        if (typeof doc?.passengers === 'string') {
          try {
            parsedPassengers = JSON.parse(doc.passengers);
          } catch {
            parsedPassengers = undefined;
          }
        }

        let parsedSlices: TicketSlice[] = doc?.slices || parsed?.slices || [];
        if (typeof doc?.slices === 'string') {
          try {
            parsedSlices = JSON.parse(doc.slices);
          } catch {
            parsedSlices = [];
          }
        }

        const resolvedPassengers = extractPassengerDetails(parsedPassengers, fetchedName);

        const resolvedPrice = Number(
          doc?.amount ??
          doc?.paymentAmount ??
          doc?.totalPrice ??
          doc?.price ??
          parsed?.estimatedPrice ??
          initialState?.price ??
          0
        );

        const resolvedMode: 'flight' | 'taxi' =
          doc?.mode || doc?.transportMode || parsed?.mode || initialState?.mode || 'flight';

        const resolvedDestination =
          typeof parsed?.location === 'object'
            ? parsed?.location?.city
            : parsed?.location || doc?.destination || doc?.location || doc?.tripName || initialState?.destination || '';

        const resolvedPNR =
          doc?.BookingID ||
          doc?.bookingID ||
          doc?.bookingReference ||
          doc?.paystackRef ||
          bookingId ||
          initialState?.bookingId ||
          `NX-${doc.$id.slice(-6).toUpperCase()}`;

        const seatClass = doc?.seatClass || parsed?.seatClass || initialState?.seatClass || 'economy';
        const departureTime = doc?.departureTime || parsed?.departureTime || initialState?.departureTime || '--:--';
        const arrivalTime = doc?.arrivalTime || parsed?.arrivalTime || initialState?.arrivalTime || '--:--';
        const flightNumber = doc?.flightNumber || parsed?.FlightNumber || parsed?.flightNumber || initialState?.FlightNumber || 'NX-404';
        const arrivalAirport = doc?.arrivalAirport || parsed?.arrivalAirport || initialState?.arrivalAirport || resolvedDestination;
        const departureAirport = doc?.departureAirport || parsed?.departairport || parsed?.departureAirport || initialState?.departairport || 'LOS';

        setTicketState({
          price: resolvedPrice,
          mode: resolvedMode,
          passengerName: fetchedName,
          destination: resolvedDestination,
          bookingId: resolvedPNR,
          seatClass,
          departureTime,
          arrivalTime,
          FlightNumber: flightNumber,
          arrivalAirport,
          departureAirport,
          ticket: {
            id: doc.$id,
            bookingReference: resolvedPNR,
            carrier: doc.carrier || parsed?.carrier || (resolvedMode === 'flight' ? 'Nexa Air' : 'Nexa Drive Protocol'),
            passengers: resolvedPassengers,
            slices: parsedSlices,
            seatClass,
            departureTime,
            arrivalTime,
            FlightNumber: flightNumber,
            arrivalAirport,
            departureAirport,
          },
        });
      } catch (err: any) {
        console.error('Failed to retrieve manifest telemetry:', err);
        if (initialState && initialState.price) {
          setTicketState(initialState);
        } else {
          setError('Unable to locate ticket record matching identifier.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTicketFromAppwrite();
  }, [bookingId, initialState]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 font-mono text-xs antialiased">
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-600 font-bold uppercase tracking-wider">
            Preparing Ticket...
          </span>
        </div>
      </div>
    );
  }

  if (!ticketState || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 antialiased">
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-5 shadow-sm">
          <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mx-auto">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H10m0-6h4m-2-4v16M4 4h16v16H4V4z" />
            </svg>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              Session Terminated
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              {error || 'No active manifest telemetry detected in this routing engine thread.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/Home')}
            className="w-full py-3.5 bg-slate-900 text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  const { ticket, price, mode, passengerName, seatClass, departureTime, arrivalTime, FlightNumber, arrivalAirport, departureAirport, destination } = ticketState;

  const mainPassenger = ticket?.passengers?.[0];
  const displayName =
    passengerName ||
    (mainPassenger && mainPassenger.given_name
      ? `${mainPassenger.given_name} ${mainPassenger.family_name}`.trim()
      : 'Verified Explorer');

  const pnrCode =
    ticket?.bookingReference ||
    ticketState.bookingId ||
    bookingId ||
    'NX-CONFIRMED-OK';

  const handleCopyPNR = () => {
    navigator.clipboard.writeText(pnrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Nexa Travel Booking Manifest',
      text: `Check out my Nexa Travel booking manifest! PNR Code: ${pnrCode}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleStartHotelBooking = () => {
    navigate('/Home/hotel-search', {
      state: {
        bookingId: pnrCode,
        arrivalAirport: arrivalAirport,
      },
    });
  };

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;
    setIsDownloading(true);

    try {
      const element = ticketRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`Nexa_Ticket_${pnrCode}.pdf`);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/60 px-4 py-8 sm:py-12 md:py-20 flex flex-col justify-center items-center antialiased">
      
      {/* Pop-up Container Stack (Fixed Top Right with Safe Mobile Spacing) */}
      <div className="fixed top-4 sm:top-6 right-4 sm:right-6 left-4 sm:left-auto z-50 flex flex-col gap-2.5 w-auto sm:w-[90%] max-w-sm pointer-events-none">
        
        {/* Ticket Download Notification Pop-up */}
        <div
          className={`pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-xl transition-all duration-300 ease-out flex items-center justify-between gap-3 ${
            isOpen
              ? 'translate-y-0 opacity-100 scale-100'
              : '-translate-y-4 opacity-0 scale-95'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 bg-slate-100 border border-slate-200/70 rounded-xl flex items-center justify-center text-slate-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="space-y-0.5 truncate">
              <h5 className="text-xs font-bold text-slate-900 tracking-tight">Ticket Ready</h5>
              <p className="text-[11px] text-slate-500 font-medium truncate">Download your digital pass</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isDownloading ? 'Saving...' : 'Download'}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Hotel Booking Notification Pop-up */}
        <div
          className={`pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-xl transition-all duration-300 ease-out flex items-center justify-between gap-3 ${
            isHotelPopupOpen
              ? 'translate-y-0 opacity-100 scale-100'
              : '-translate-y-4 opacity-0 scale-95'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 bg-slate-100 border border-slate-200/70 rounded-xl flex items-center justify-center text-slate-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="space-y-0.5 truncate">
              <h5 className="text-xs font-bold text-slate-900 tracking-tight">Accommodation</h5>
              <p className="text-[11px] text-slate-500 font-medium truncate">Find stays near {arrivalAirport}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleStartHotelBooking}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <span>Explore Stays</span>
            </button>
            <button
              onClick={() => setIsHotelPopupOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

      </div>

      <div className="text-center space-y-2.5 mb-8 mt-12 sm:mt-6 animate-in fade-in duration-500">
        <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-900 shadow-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">
            Protocol Securely Manifested
          </h2>
          <p className="text-xs text-slate-500">
            Your transit routing configuration parameters have been committed.
          </p>
        </div>
      </div>

      {/* Ticket Card Component */}
      <div
        ref={ticketRef}
        className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative"
      >
        <div className="bg-slate-900 px-5 sm:px-6 py-4 flex items-center justify-between text-white">
          <div className="space-y-0.5">
            <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase font-bold">
              Platform System Node
            </span>
            <h4 className="text-xs font-bold font-mono tracking-wider">NEXA TRAVEL LOGISTICS</h4>
          </div>
          <div className="text-right space-y-0.5">
            <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase font-bold">
              Status Flag
            </span>
            <p className="text-[9px] font-mono font-medium uppercase tracking-widest bg-slate-800 text-slate-200 border border-slate-700 px-2 py-0.5 rounded-md">
              ISSUED // CONFIRMED
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-3 items-center gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[8px] font-bold tracking-widest text-slate-400 uppercase font-mono block">
                Transit Class
              </span>
              <p className="text-xs font-bold text-slate-800 uppercase font-mono mt-1">
                {seatClass || 'Economy'}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="text-[8px] font-bold font-mono text-slate-500 tracking-widest px-2 py-0.5 border border-slate-200 rounded bg-slate-50">
                {FlightNumber || 'NX-404'}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[8px] font-bold tracking-widest text-slate-400 uppercase font-mono block">
                Fulfillment Host
              </span>
              <p className="text-xs font-bold text-slate-800 font-mono mt-1 uppercase truncate">
                {mode === 'flight' ? ticket?.carrier || 'Nexa Air' : 'Nexa Drive Protocol'}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-[8px] font-bold tracking-widest text-slate-400 uppercase block">Departure Airport</span>
              <span className="font-bold text-slate-900 text-sm">{departureAirport || 'LOS'}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{departureTime}</span>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-bold tracking-widest text-slate-400 uppercase block">Arrival Airport</span>
              <span className="font-bold text-slate-900 text-sm">{arrivalAirport || 'LHR'}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{arrivalTime}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
            <div className="space-y-1">
              <span className="text-[8px] font-bold tracking-widest text-slate-400 uppercase font-mono block">
                Primary Passenger
              </span>
              <p className="font-semibold text-slate-800 truncate">{displayName}</p>
            </div>

            <div className="space-y-1 text-right">
              <span className="text-[8px] font-bold tracking-widest text-slate-400 uppercase font-mono block">
                Record Locator (PNR)
              </span>
              <div className="inline-flex items-center gap-1.5 justify-end">
                <button
                  onClick={handleCopyPNR}
                  className="font-mono text-[11px] font-bold text-slate-900 tracking-wider uppercase bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <span className="truncate max-w-[100px] sm:max-w-none">{pnrCode}</span>
                  <svg className={`w-3 h-3 flex-shrink-0 ${copied ? 'text-slate-900' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>

                <button
                  onClick={handleShare}
                  className="p-1 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-md text-slate-400 hover:text-slate-700 transition-all cursor-pointer shadow-2xs flex-shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-bold tracking-widest text-slate-400 uppercase font-mono block">
                Financial Ledger
              </span>
              <p className="font-mono font-semibold text-slate-800 text-[13px]">
                ${Number(price).toFixed(2)} <span className="text-[10px] font-normal text-slate-400">USD</span>
              </p>
            </div>

            <div className="space-y-1 text-right">
              <span className="text-[8px] font-bold tracking-widest text-slate-400 uppercase font-mono block">
                Destination Target
              </span>
              <p className="font-mono text-[11px] font-medium text-slate-800 truncate max-w-[140px] sm:max-w-[160px] ml-auto">
                {arrivalAirport || 'Global Node'} - {destination}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col items-center justify-center space-y-2 text-center">
          <div className="flex items-center gap-[2px] opacity-75 h-7 overflow-hidden max-w-full">
            {[1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2].map(
              (w, idx) => (
                <div key={idx} className="bg-slate-800 h-full rounded-xs flex-shrink-0" style={{ width: `${w}px` }} />
              )
            )}
          </div>
          <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">
            *{pnrCode}*
          </span>
        </div>
      </div>

      <div className="mt-6 w-full max-w-lg">
        <button
          onClick={() => navigate('/Home')}
          className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-mono text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default BookingSuccess;