// ✅ CORRECT IMPORTS
import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { Query } from 'appwrite';
import { database, appwriteConfig } from '../../appwrite/client';
import { parseTripData } from '../../lib/utils';
import { account } from '../../appwrite/client';

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
}

interface SuccessState {
  ticket?: LiveTicketData;
  price: number;
  mode: 'flight' | 'taxi';
  destination?: string;
  passengerName?: string; // Captures direct input passed from state or Appwrite
}

export const BookingSuccess = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialState = location.state as SuccessState | undefined;

  // Hydrate initial state if passed via router, otherwise start null
  const [ticketState, setTicketState] = useState<SuccessState | null>(initialState || null);
  const [loading, setLoading] = useState<boolean>(!initialState && !!bookingId);
  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const ticketRef = useRef<HTMLDivElement>(null);

  // Helper function to extract passenger names cleanly
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

  // 🔄 Updated Fetching Logic: Robust queries and multi-field fallback for dashboard clicks
useEffect(() => {
  if (ticketState || !bookingId) return;

  const fetchTicketFromAppwrite = async () => {
    try {
      setLoading(true);
      setError(null);

      let doc: any = null;

      // Query checks
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

      if (!doc) {
        try {
          const response = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            [Query.equal('BookingID', bookingId)]
          );
          if (response.documents.length > 0) doc = response.documents[0];
        } catch (err) {
          console.warn('Query by BookingID failed:', err);
        }
      }

      if (!doc) {
        doc = await database.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.tripCollectionId,
          bookingId
        );
      }

      if (!doc) throw new Error('Document not found');

      // Fetch user profile as active fallback if document field is missing
      let activeAccountName = '';
      try {
        const activeUser = await account.get();
        activeAccountName = activeUser?.name || '';
      } catch (e) {
        // Unauthenticated visitor fallback
        console.warn('Unable to fetch active account:', e);
      }

      const parsed = parseTripData(doc);

      const fetchedName =
        doc?.passengerName ||
        doc?.userName ||
        doc?.fullName ||
        parsed?.passengerName ||
        parsed?.userName ||
        parsed?.fullName ||
        activeAccountName ||
        'Verified Explorer';

      let parsedPassengers: TicketPassenger[] | undefined = doc?.passengers;
      if (typeof doc?.passengers === 'string') {
        try {
          parsedPassengers = JSON.parse(doc.passengers);
        } catch (e) {
          parsedPassengers = undefined;
          console.warn('Failed to parse passengers JSON:', e);
        }
      }

      let parsedSlices: TicketSlice[] = doc?.slices || parsed?.slices || [];
      if (typeof doc?.slices === 'string') {
        try {
          parsedSlices = JSON.parse(doc.slices);
        } catch (e) {
          parsedSlices = [];
          console.warn('Failed to parse slices JSON:', e);
        }
      }

      const resolvedPassengers = extractPassengerDetails(parsedPassengers, fetchedName);

      const resolvedPrice = Number(
        doc?.amount ??
        doc?.paymentAmount ??
        doc?.totalPrice ??
        doc?.price ??
        parsed?.estimatedPrice ??
        parsed?.amount ??
        0
      );

      const resolvedMode: 'flight' | 'taxi' =
        doc?.mode || doc?.transportMode || parsed?.mode || 'flight';

      const resolvedDestination =
        typeof parsed?.location === 'object'
          ? parsed?.location?.city
          : parsed?.location || doc?.destination || doc?.location || '';

      setTicketState({
        price: resolvedPrice,
        mode: resolvedMode,
        passengerName: fetchedName,
        destination: resolvedDestination,
        ticket: {
          id: doc.$id,
          bookingReference:
            doc.BookingID || doc.paystackRef || `NX-${doc.$id.slice(-6).toUpperCase()}`,
          carrier: doc.carrier || parsed?.carrier || (resolvedMode === 'flight' ? 'Nexa Air' : 'Nexa Drive Protocol'),
          passengers: resolvedPassengers,
          slices: parsedSlices,
        },
      });
    } catch (err: any) {
      console.error('Failed to retrieve manifest telemetry:', err);
      setError('Unable to locate ticket record matching identifier.');
    } finally {
      setLoading(false);
    }
  };

  fetchTicketFromAppwrite();
}, [bookingId, ticketState]);

  // Loading screen while fetching ticket via URL ID
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 p-4 font-mono text-xs antialiased">
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm">
          <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-600 font-bold uppercase tracking-wider">
            Preparing Ticket...
          </span>
        </div>
      </div>
    );
  }

  // Fallback UI for missing data or fetch errors
  if (!ticketState || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 p-4 antialiased">
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl border border-zinc-200/80 text-center space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="w-10 h-10 bg-zinc-50 border border-zinc-200/60 rounded-xl flex items-center justify-center mx-auto">
            <svg
              className="w-4 h-4 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m0-6h4m-2-4v16M4 4h16v16H4V4z"
              />
            </svg>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
              Session Terminated
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {error || 'No active manifest telemetry detected in this routing engine thread.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3.5 bg-zinc-900 text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-800 active:scale-[0.99] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  const { ticket, price, mode, destination, passengerName } = ticketState;

  // Resolve main passenger display name dynamically
  const mainPassenger = ticket?.passengers?.[0];
  const displayName =
    passengerName ||
    (mainPassenger && mainPassenger.given_name
      ? `${mainPassenger.given_name} ${mainPassenger.family_name}`.trim()
      : 'Verified Explorer');

  const pnrCode = ticket?.bookingReference || 'NX-PENDING-G2';

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
    <div className="w-full min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-50 via-slate-50/40 to-white px-4 py-12 md:py-20 flex flex-col justify-center items-center antialiased selection:bg-zinc-900 selection:text-white">
      {/* Floating Download Ticket Popup Alert */}
      <div
        className={`fixed top-6 right-6 z-50 w-[90%] max-w-md bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 transition-all duration-500 ease-out flex items-center justify-between gap-4 shadow-[0_20px_50px_rgba(15,23,42,0.1),inset_0_1px_0_rgba(255,255,255,0.8)] select-none ${
          isOpen
            ? 'translate-y-0 opacity-100 scale-100'
            : '-translate-y-6 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 bg-emerald-50 border border-emerald-200/60 rounded-xl flex items-center justify-center relative">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
            <svg
              className="w-4 h-4 text-emerald-600 relative z-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          <div className="space-y-0.5">
            <h5 className="text-xs font-bold text-slate-900 tracking-tight">Ticket Created</h5>
            <p className="text-[11px] text-slate-500 font-medium">
              Would you like to download your ticket?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
          >
            {isDownloading ? (
              <span>Saving...</span>
            ) : (
              <>
                <span>Download</span>
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </>
            )}
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-all cursor-pointer active:scale-95"
            title="Dismiss"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Upper Success Alert Banner */}
      <div className="text-center space-y-3 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-14 h-14 bg-emerald-50/60 border border-emerald-100/80 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.06)]">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
            Protocol Securely Manifested
          </h2>
          <p className="text-xs text-zinc-400 font-medium">
            Your transit routing configuration parameters have been committed.
          </p>
        </div>
      </div>

      {/* Premium Digital Boarding Pass */}
      <div
        ref={ticketRef}
        className="w-full max-w-lg bg-white border border-zinc-200/70 rounded-2xl shadow-[0_32px_64px_-20px_rgba(0,0,0,0.04)] overflow-hidden relative transition-all duration-300 hover:shadow-[0_32px_64px_-15px_rgba(0,0,0,0.06)] animate-in fade-in zoom-in-95 delay-150 duration-500"
      >
        {/* Top Header */}
        <div className="bg-zinc-900 px-6 py-4.5 flex items-center justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/40 via-transparent to-transparent pointer-events-none" />
          <div className="space-y-0.5 relative z-10">
            <span className="text-[8px] font-mono tracking-widest text-zinc-400 uppercase font-bold">
              Platform System Node
            </span>
            <h4 className="text-xs font-bold font-mono tracking-wider">NEXA TRAVEL LOGISTICS</h4>
          </div>
          <div className="text-right space-y-0.5 relative z-10">
            <span className="text-[8px] font-mono tracking-widest text-emerald-400 uppercase font-bold">
              Status Flag
            </span>
            <p className="text-[9px] font-mono font-medium uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              ISSUED // CONFIRMED
            </p>
          </div>
        </div>

        {/* Core Manifest Parameters */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 items-center gap-4 border-b border-zinc-100 pb-6">
            <div>
              <span className="text-[8px] font-bold tracking-widest text-zinc-400 uppercase font-mono block">
                Transit Class
              </span>
              <p className="text-xs font-bold text-zinc-800 uppercase font-mono mt-1 tracking-tight">
                {mode === 'flight' ? '✈️ Aviation Hub' : '🚗 Ground Route'}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center">
              {mode === 'flight' ? (
                <div className="w-full flex items-center justify-center gap-2.5 text-zinc-200">
                  <div className="h-[1px] bg-zinc-200 flex-grow border-t border-dashed" />
                  <div className="p-1 bg-zinc-50 border border-zinc-100 rounded-md shadow-sm">
                    <svg
                      className="w-3.5 h-3.5 text-zinc-400 transform rotate-90"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </div>
                  <div className="h-[1px] bg-zinc-200 flex-grow border-t border-dashed" />
                </div>
              ) : (
                <div className="text-[8px] font-bold font-mono text-zinc-300 tracking-widest px-2 py-0.5 border border-zinc-100 rounded bg-zinc-50/50">
                  SHUTTLE
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-[8px] font-bold tracking-widest text-zinc-400 uppercase font-mono block">
                Fulfillment Host
              </span>
              <p className="text-xs font-bold text-zinc-800 font-mono mt-1 uppercase truncate tracking-tight">
                {mode === 'flight' ? ticket?.carrier || 'Global Air' : 'Nexa Drive Protocol'}
              </p>
            </div>
          </div>

          {/* Passenger Data Grid */}
          <div className="grid grid-cols-2 gap-y-5 gap-x-6 text-xs">
            <div className="space-y-1">
              <span className="text-[8px] font-bold tracking-widest text-zinc-400 uppercase font-mono block">
                Primary Passenger
              </span>
              <p className="font-semibold text-zinc-800">{displayName}</p>
            </div>

            {/* PNR + Action Toolbar */}
            <div className="space-y-1 text-right">
              <span className="text-[8px] font-bold tracking-widest text-zinc-400 uppercase font-mono block">
                Record Locator (PNR)
              </span>
              <div className="inline-flex items-center gap-1.5 justify-end">
                <button
                  onClick={handleCopyPNR}
                  className="group font-mono text-[11px] font-bold text-zinc-900 tracking-wider uppercase bg-zinc-50 hover:bg-zinc-100/80 active:bg-zinc-200/60 border border-zinc-200/60 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Click to copy PNR"
                >
                  <span>{pnrCode}</span>
                  <svg
                    className={`w-3 h-3 transition-colors ${
                      copied ? 'text-emerald-500' : 'text-zinc-400 group-hover:text-zinc-600'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    {copied ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    )}
                  </svg>
                </button>

                <button
                  onClick={handleShare}
                  className="p-1 bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-200/60 border border-zinc-200/60 rounded-md text-zinc-400 hover:text-zinc-700 transition-all cursor-pointer shadow-2xs"
                  title="Share Ticket"
                >
                  {shared ? (
                    <svg
                      className="w-3.5 h-3.5 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-bold tracking-widest text-zinc-400 uppercase font-mono block">
                Financial Ledger
              </span>
              <p className="font-mono font-semibold text-zinc-800 text-[13px]">
                ${Number(price).toFixed(2)}{' '}
                <span className="text-[10px] font-normal text-zinc-400">USD</span>
              </p>
            </div>

            <div className="space-y-1 text-right">
              <span className="text-[8px] font-bold tracking-widest text-zinc-400 uppercase font-mono block">
                Global System ID
              </span>
              <p
                className="font-mono text-[10px] text-zinc-400 uppercase truncate max-w-[160px] ml-auto"
                title={ticket?.id}
              >
                {ticket?.id || 'node_0x82f42a'}
              </p>
            </div>
          </div>

          {/* Conditional Flight Routing Slice Blocks */}
          {ticket?.slices && ticket.slices.length > 0 && (
            <div className="mt-2 p-3.5 bg-zinc-50/60 rounded-xl border border-zinc-200/40 space-y-2">
              <span className="text-[8px] font-bold tracking-widest text-zinc-400 uppercase font-mono block">
                Routing Manifest Vector
              </span>
              <div className="space-y-1.5">
                {ticket.slices.map((slice, index) => (
                  <div
                    key={slice.id || index}
                    className="flex justify-between items-center text-[10px] font-mono text-zinc-500"
                  >
                    <span className="text-zinc-400 font-normal">Segment 0{index + 1}</span>
                    <span className="font-bold text-zinc-700 bg-white border border-zinc-200/50 px-1.5 py-0.5 rounded-sm shadow-2xs">
                      {slice.origin?.iata_code || 'LOS'} ➔ {slice.destination?.iata_code || 'LHR'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conditional Taxi / Ground Route Blocks */}
          {mode === 'taxi' && destination && (
            <div className="mt-2 p-3.5 bg-zinc-50/60 rounded-xl border border-zinc-200/40 space-y-1">
              <span className="text-[8px] font-bold tracking-widest text-zinc-400 uppercase font-mono block">
                Ground Destination Target
              </span>
              <p className="text-[11px] font-medium font-mono text-zinc-700 truncate">
                {destination}
              </p>
            </div>
          )}
        </div>

        {/* Ticket Perforation */}
        <div className="relative h-4 bg-zinc-50/40 border-t border-b border-dashed border-zinc-200/80 flex items-center justify-between px-4">
          <div className="w-3.5 h-7 rounded-r-full bg-zinc-50 border-r border-zinc-200/70 absolute -left-[1px] top-1/2 -translate-y-1/2" />
          <div className="w-full border-t border-dashed border-zinc-200/30" />
          <div className="w-3.5 h-7 rounded-l-full bg-zinc-50 border-l border-zinc-200/70 absolute -right-[1px] top-1/2 -translate-y-1/2" />
        </div>

        {/* Barcode Area */}
        <div className="p-5 bg-zinc-50/40 flex flex-col items-center justify-center space-y-2.5 text-center">
          <div className="flex items-center gap-[2px] opacity-80 h-8">
            {[1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2].map(
              (widthMultiplier, index) => (
                <div
                  key={index}
                  className="bg-zinc-800 h-full rounded-2xs"
                  style={{ width: `${widthMultiplier}px` }}
                />
              )
            )}
          </div>
          <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest">
            {ticket?.bookingReference
              ? `*${ticket.bookingReference}*`
              : '*NEXA-CORE-SECURITY-LEDGER-2026*'}
          </span>
        </div>
      </div>

      {/* Return Action */}
      <div className="mt-8 w-full max-w-lg">
        <button
          onClick={() => navigate('/Home')}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 hover:from-zinc-800 hover:to-zinc-800 text-white font-mono text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-200 shadow-lg shadow-zinc-900/10 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group border border-zinc-800"
        >
          <svg
            className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:-translate-x-1 transition-all duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default BookingSuccess;