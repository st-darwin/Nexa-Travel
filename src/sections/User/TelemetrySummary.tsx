import { useState, useEffect, useMemo } from 'react';
import { account } from '../../appwrite/client';
import { 
  MapsComponent, LayersDirective, LayerDirective, 
  MarkersDirective, MarkerDirective, NavigationLinesDirective, 
  NavigationLineDirective, Inject, Marker, NavigationLine, Zoom 
} from '@syncfusion/ej2-react-maps';
import { useLoaderData, type LoaderFunctionArgs, useNavigate, useLocation } from 'react-router-dom';
import { getUserTripById } from '../../appwrite/Trips';
import { parseTripData } from '../../lib/utils';
import { BROWSE_RECOMMENDATIONS } from '../../constants/recommendations';

interface Coordinates {
  lat: number;
  lng: number;
}

interface LoadingStep {
  id: number;
  label: string;
  subtext: string;
}

const calculateHaversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; 
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const result = R * c;
  return isNaN(result) ? 0 : parseFloat(result.toFixed(1));
};

export const GetIdUsingParams = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;
  if (!id) throw new Error('Unable to get id from the usertripdetails');

  // 1. Resolve static recommendations locally to avoid Appwrite 404 errors
  const staticTrip = BROWSE_RECOMMENDATIONS.find((rec) => rec.id === id);
  if (staticTrip) {
    return { id, trip: staticTrip, isPreloaded: true, userId: null };
  }

  // 2. Fetch user-generated trips from Appwrite Database
  try {
    const user = await account.get();
    const tripDocument = await getUserTripById(id, user.$id);
    
    return { 
      id, 
      userId: user.$id, 
      trip: tripDocument ? parseTripData(tripDocument) : null,
      isPreloaded: false 
    };
  } catch (error) {
    console.warn("Could not load trip from Appwrite, using fallback checks:", error);
    return { id, userId: null, trip: null, isPreloaded: false };
  }
};

const LOADING_STAGES: LoadingStep[] = [
  { id: 1, label: 'Consulting AI Strategist', subtext: 'Analyzing global destinations based on your custom travel profile...' },
  { id: 2, label: 'Sourcing Flight Paths', subtext: 'Pinging regional aviation routers to extract optimal transit corridors...' },
  { id: 3, label: 'Locking Route Allocations', subtext: 'Pre-allocating coordinates onto high-fidelity geographical layers...' },
  { id: 4, label: 'Calculating Itinerary Math', subtext: 'Executing spherical trigonometric equations to resolve route mileage...' },
  { id: 5, label: 'Compiling Final Package', subtext: 'Structuring real-time ticket tariffs and bundling your random getaway...' }
];

export const TelemetrySummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const raw = useLoaderData() as { id: string; userId: string | null; trip: any; isPreloaded?: boolean };

  const [currentLoc, setCurrentLoc] = useState<Coordinates | null>(null);
  const [destLoc, setDestLoc] = useState<Coordinates | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [warningPopup, setWarningPopup] = useState<boolean>(true);
  
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCompiling, setIsCompiling] = useState<boolean>(true);
  const [isLocationDenied, setIsLocationDenied] = useState<boolean>(false);

  // Evaluate active trip payload across navigation state, preloaded static data, or loader document
  const activeTrip = useMemo(() => {
    return location.state?.preloadedTrip || raw.trip || BROWSE_RECOMMENDATIONS.find(rec => rec.id === raw.id);
  }, [location.state?.preloadedTrip, raw.trip, raw.id]);

  const safeDistance = useMemo(() => (isNaN(distance) ? 0 : distance), [distance]);
  const estimatedBaseFare = 45.00; 
  const estimatedDistanceTariff = useMemo(() => safeDistance * 0.08, [safeDistance]); 
  
  const projectedFlightCost = useMemo(() => estimatedBaseFare + estimatedDistanceTariff, [estimatedDistanceTariff]);
  
  const nexaCommissionRate = 0.08;
  const projectedNexaFee = useMemo(() => projectedFlightCost * nexaCommissionRate, [projectedFlightCost]);
  
  const estimatedGrandTotal = useMemo(() => projectedFlightCost + projectedNexaFee, [projectedFlightCost, projectedNexaFee]);

  const carbonEmissions = useMemo(() => parseFloat((safeDistance * 0.12).toFixed(1)), [safeDistance]);
  const loadingPercentage = (currentStep / LOADING_STAGES.length) * 100;

  useEffect(() => {
    let isMounted = true;

    const runSimulationSequence = async (targetCoords: Coordinates, clientCoords: Coordinates, isDenied: boolean) => {
      const groundDistance = calculateHaversine(clientCoords.lat, clientCoords.lng, targetCoords.lat, targetCoords.lng);
      
      if (!isMounted) return;
      setCurrentLoc(clientCoords);
      setDistance(groundDistance);
      setIsLocationDenied(isDenied);

      await new Promise((res) => setTimeout(res, 800));
      if (!isMounted) return; setCurrentStep(3);
      
      await new Promise((res) => setTimeout(res, 800));
      if (!isMounted) return; setCurrentStep(4);
      
      await new Promise((res) => setTimeout(res, 600));
      if (!isMounted) return; setCurrentStep(5);
      
      await new Promise((res) => setTimeout(res, 500));
      if (!isMounted) return; setIsCompiling(false);
    };

    const syncEcosystemTelemetry = async () => {
      try {
        if (!activeTrip) {
          console.warn("Telemetry resolution skipped: activeTrip context not available.");
          if (isMounted) setIsCompiling(false);
          return;
        }

        // Robust coordinate resolution supporting arrays, objects, or flat properties
        let destinationTarget: Coordinates = { lat: 36.3932, lng: 25.4615 }; // Default fallback (Santorini)

        const rawCoords = activeTrip?.location?.coordinates || activeTrip?.coordinates;
        if (rawCoords) {
          if (Array.isArray(rawCoords) && rawCoords.length >= 2) {
            const parsedLat = parseFloat(rawCoords[0]);
            const parsedLng = parseFloat(rawCoords[1]);
            if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
              destinationTarget = { lat: parsedLat, lng: parsedLng };
            }
          } else if (typeof rawCoords === 'object' && rawCoords !== null) {
            const parsedLat = parseFloat(rawCoords.lat ?? rawCoords.latitude);
            const parsedLng = parseFloat(rawCoords.lng ?? rawCoords.longitude);
            if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
              destinationTarget = { lat: parsedLat, lng: parsedLng };
            }
          }
        }

        if ((isNaN(destinationTarget.lat) || isNaN(destinationTarget.lng)) && activeTrip?.latitude && activeTrip?.longitude) {
          const pLat = parseFloat(activeTrip.latitude);
          const pLng = parseFloat(activeTrip.longitude);
          if (!isNaN(pLat) && !isNaN(pLng)) {
            destinationTarget = { lat: pLat, lng: pLng };
          }
        }

        if (!isMounted) return;
        setDestLoc(destinationTarget);
        setCurrentStep(2);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              runSimulationSequence(
                destinationTarget, 
                { lat: position.coords.latitude, lng: position.coords.longitude }, 
                false
              );
            },
            (geoError) => {
              console.warn("Hardware geolocation stream blocked. Initializing hub fallback protocols.", geoError);
              runSimulationSequence(
                destinationTarget, 
                { lat: 6.5244, lng: 3.3792 }, // Default origin: Lagos
                true
              );
            }
          );
        } else {
          runSimulationSequence(
            destinationTarget, 
            { lat: 6.5244, lng: 3.3792 }, 
            true
          );
        }
      } catch (error) {
        console.error("Telemetry resolution engine failure:", error);
        if (isMounted) setIsCompiling(false);
      }
    };

    if (raw.id) syncEcosystemTelemetry();

    return () => {
      isMounted = false;
    };
  }, [raw.id, activeTrip]);

  const handleProceedToBooking = () => {
const resolvedDestination = 
      typeof activeTrip?.location === 'string' 
        ? activeTrip.location || activeTrip.country 
        :  activeTrip.country ||  activeTrip?.location?.city || activeTrip?.destination || activeTrip?.arrivalAirport || 'LHR';

    navigate(`/Home/custom-flight-search/${raw.id}`, {
      state: {
        distance: safeDistance,
        flightCost: projectedFlightCost,
        platformFee: projectedNexaFee,
        totalPrice: estimatedGrandTotal,
        preloadedTrip: activeTrip,
        origin: 'LOS',
        destination: resolvedDestination,
        travelClass: 'economy'
      }
    });
  };

  const calculateETA = (km: number) => {
    if (km === 0 || isNaN(km)) return "0m";
    const averageFlightSpeedKmh = 750; 
    const totalHours = km / averageFlightSpeedKmh;
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours % 1) * 60);
    
    return hours === 0 ? `${minutes} mins` : `${hours}h ${minutes}m`;
  };

  if (isCompiling || !currentLoc || !destLoc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 font-sans select-none antialiased">
        <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-xl p-8 relative overflow-hidden">
          <div className="flex justify-center mb-8 relative">
            <div className="absolute inset-0 bg-slate-900/5 rounded-full blur-xl transform scale-75 animate-pulse" />
            <div className="relative w-23 h-23 bg-slate-100 rounded-full flex items-center justify-center shadow-lg">
              <img className='w-15' src="/assets/icons/logo1.svg" alt="Nexa Travel" />
            </div>
          </div>

          <div className="space-y-6 relative z-10 text-center">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Assembling Your Surprise Getaway</h3>
              <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
                Our AI engine is currently mapping your route path and calculating ground distance estimates.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Itinerary Generation</span>
                <span className="text-xs font-black font-mono text-slate-900">{Math.round(loadingPercentage)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${loadingPercentage}%` }}
                />
              </div>
            </div>

            <div className="text-left space-y-3.5 pt-2">
              {LOADING_STAGES.map((stage) => {
                const isPassed = currentStep > stage.id;
                const isActive = currentStep === stage.id;
                
                return (
                  <div 
                    key={stage.id} 
                    className={`flex items-start gap-4 transition-all duration-300 p-3 rounded-xl border border-transparent ${
                      isActive ? 'bg-slate-50/80 border-slate-200/60 shadow-xs' : ''
                    }`}
                  >
                    <div className="mt-0.5">
                      {isPassed ? (
                        <div className="w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : isActive ? (
                        <div className="w-5 h-5 bg-indigo-50 border border-indigo-200 rounded-full flex items-center justify-center relative">
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping absolute" />
                          <span className="w-2 h-2 rounded-full bg-indigo-600 relative" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className={`text-xs font-bold tracking-tight transition-colors ${
                        isPassed ? 'text-slate-400 line-through decoration-slate-200' : isActive ? 'text-slate-900' : 'text-slate-300'
                      }`}>
                        {stage.label}
                      </p>
                      {isActive && (
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          {stage.subtext}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen rounded-3xl border border-slate-200/50 antialiased">
      
      {/* High-Fidelity SaaS Notification Banner */}
      <div 
        className={`fixed top-6 right-6 z-50  w-[90%] max-w-md bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4.5 transition-all duration-500 ease-out flex items-start gap-4 shadow-[0_20px_50px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] select-none ${
          warningPopup ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-6 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex-shrink-0 w-8 h-8 bg-amber-50/70 border border-amber-200/50 rounded-xl flex items-center justify-center relative mt-0.5">
          <span className="animate-pulse absolute inline-flex h-2 w-2 rounded-full bg-amber-400/60" />
          <svg className="w-4 h-4 text-amber-600 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div className="flex-1 space-y-1 min-w-0">
          <h5 className="text-xs font-bold text-slate-900 tracking-tight">Cost Projection Notice</h5>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            This pricing configuration reflects an initial estimate computed from geometric distance variables. Definitive ticket and live operational tariffs will execute in the final booking dashboard.
          </p>
        </div>

        <button 
          onClick={() => setWarningPopup(false)}
          className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-all duration-200 cursor-pointer active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Route Preview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900" />
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Trip Generation Summary</h2>
            <span className={`px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-mono font-bold border rounded-md ${
              isLocationDenied ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              {isLocationDenied ? 'Approximate Mapping' : 'Precision Match'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Secured Trip ID: <span className="font-mono font-bold text-slate-700">{raw.id}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Map & Waypoints */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white p-2 relative h-[480px] shadow-xs">
            <MapsComponent 
              id="maps" 
              centerPosition={{ 
                latitude: (currentLoc.lat + destLoc.lat) / 2, 
                longitude: (currentLoc.lng + destLoc.lng) / 2 
              }} 
              zoomSettings={{ enable: true, zoomFactor: 6 }}
            >
              <Inject services={[Marker, NavigationLine, Zoom]} />
              <LayersDirective>
                <LayerDirective urlTemplate="https://basemaps.cartocdn.com/light_all/level/tileX/tileY.png">
                  <MarkersDirective>
                    <MarkerDirective visible={true} shape="Circle" fill={isLocationDenied ? "#f59e0b" : "#10b981"} width={14} height={14} dataSource={[{ latitude: currentLoc.lat, longitude: currentLoc.lng }]} />
                    <MarkerDirective visible={true} shape="Diamond" fill={isLocationDenied ? "#f59e0b" : "#10b981"} width={14} height={14} dataSource={[{ latitude: destLoc.lat, longitude: destLoc.lng }]} />
                  </MarkersDirective>
                  <NavigationLinesDirective>
                    <NavigationLineDirective visible={true} latitude={[currentLoc.lat, destLoc.lat]} longitude={[currentLoc.lng, destLoc.lng]} color={isLocationDenied ? "#f59e0b" : "#2563eb"} width={3.5} dashArray="4" />
                  </NavigationLinesDirective>
                </LayerDirective>
              </LayersDirective>
            </MapsComponent>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Calculated Waypoints</h4>
            <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2.5 before:bottom-2.5 before:w-[1.5px] before:bg-dashed before:bg-slate-200">
              <RouteNode title="Departure Origin" subtitle={isLocationDenied ? 'Regional Fallback' : 'Current GPS'} coords={currentLoc} highlightColor={isLocationDenied ? 'border-amber-500' : 'border-emerald-500'} />
              <RouteNode title="Surprise Destination" subtitle="AI Target" coords={destLoc} highlightColor="border-indigo-600" />
            </div>
          </div>
        </div>

        {/* Right Column: Analytics & Cost Estimation Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard title="Ground Distance" primaryValue={safeDistance} unit="km" />
            <MetricCard title="Est. Flight Time" primaryValue={calculateETA(safeDistance)} />
            <MetricCard title="Route Class" statusMode={true} statusText="AI Explorer Pack" isWarning={false} />
            <MetricCard title="Carbon Footprint" primaryValue={carbonEmissions} unit="kg CO₂" />
          </div>

          {/* Transparent Rate Estimate Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between min-h-[355px]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-black text-slate-900 tracking-tight">Projected Price Estimate</h3>
              </div>
              <p className="text-xs text-slate-400 mb-6 font-medium">Estimated rates calculated across live geographic vector distances.</p>
              
              <div className="space-y-4 text-xs font-medium">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Estimated Ticket Base Rate</span>
                  <span className="font-mono font-bold text-slate-800">${estimatedBaseFare.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center text-slate-500">
                  <div className="space-y-0.5">
                    <span>Distance Multiplier Fee</span>
                    <p className="text-[10px] text-slate-400 font-mono font-normal">Rate: $0.08 per km</p>
                  </div>
                  <span className="font-mono font-bold text-slate-800">${estimatedDistanceTariff.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-500">
                  <span className="flex items-center gap-1.5 text-indigo-950 font-semibold">
                    Nexa Travel Booking Commission
                    <span className="text-[9px] bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.2 rounded-full border border-indigo-200/60 font-mono">8%</span>
                  </span>
                  <span className="font-mono text-indigo-600 font-bold">+${projectedNexaFee.toFixed(2)}</span>
                </div>
                
                <div className="w-full h-[1px] bg-slate-100 my-2" />
                
                <div className="flex justify-between items-center pt-2">
                  <div>
                    <span className="text-slate-900 font-black text-sm tracking-tight block">Estimated Cost</span>
                    <span className="text-[10px] text-slate-400 font-normal">Subject to live booking validation</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-900 font-black font-mono text-2xl tracking-tighter">${estimatedGrandTotal.toFixed(2)}</span>
                    <span className="text-[9px] text-slate-400 font-mono block uppercase font-bold">USD</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleProceedToBooking}
              className="w-full cursor-pointer mt-6 py-4 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest transition-all duration-200 hover:bg-slate-800 active:scale-[0.99] shadow-xs"
            >
              Proceed to Booking →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  primaryValue?: string | number;
  unit?: string;
  statusMode?: boolean;
  statusText?: string;
  isWarning?: boolean;
}

const MetricCard = ({ title, primaryValue, unit, statusMode, statusText, isWarning }: MetricCardProps) => {
  const safePrimaryValue = typeof primaryValue === 'number' && isNaN(primaryValue) ? 0 : primaryValue;
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-2xs flex flex-col justify-between h-[105px] transition-transform duration-300 hover:-translate-y-0.5">
      <span className="text-[10px] font-bold tracking-widest text-slate-400 block uppercase font-mono">{title}</span>
      {statusMode ? (
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isWarning ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-ping'}`} />
          <span className={`text-xs font-black font-mono uppercase tracking-wider ${isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
            {statusText}
          </span>
        </div>
      ) : (
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-2xl font-black font-mono text-slate-900 tracking-tight">{safePrimaryValue}</span>
          {unit && <span className="text-xs font-bold text-slate-400 font-mono uppercase">{unit}</span>}
        </div>
      )}
    </div>
  );
};

interface RouteNodeProps {
  title: string;
  subtitle: string;
  coords: Coordinates;
  highlightColor: string;
}

const RouteNode = ({ title, subtitle, coords, highlightColor }: RouteNodeProps) => {
  const safeLat = coords && !isNaN(coords.lat) ? coords.lat : 0;
  const safeLng = coords && !isNaN(coords.lng) ? coords.lng : 0;

  return (
    <div className="relative group">
      <span className={`absolute left-[-25px] top-1 w-4 h-4 rounded-full border-4 bg-white ${highlightColor}`} />
      <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-1 sm:gap-4">
        <div className="sm:col-span-1">
          <span className="text-xs font-bold text-slate-800 block">{title}</span>
          <span className="text-[10px] text-slate-400 font-medium tracking-tight uppercase font-mono">{subtitle}</span>
        </div>
        <div className="sm:col-span-3 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/50 font-mono text-xs text-slate-600">
          Lat: <span className="text-slate-900 font-semibold">{safeLat.toFixed(6)}</span> • Lng: <span className="text-slate-900 font-semibold">{safeLng.toFixed(6)}</span>
        </div>
      </div>
    </div>
  );
};

export default TelemetrySummary;