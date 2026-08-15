import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route } from "react-router-dom";
import Dashboard, { DashboardLoader as AdminLoader } from "./sections/admin/Dashboard";
import AdminLayout, { clientLoader as adminLoader } from "./sections/admin/AdminLayout";
import TripDetails, { loader as tripDetailsLoader } from "./sections/admin/TripDetails";
import SignIn, { clientLoader as signInLoader } from "./sections/root/sign-in";
import AllUser, { loader as allUserLoader } from './sections/admin/AllUser';
import Trips, { loader as TripsLoader } from "./sections/admin/Trips";
import CreateTrips, { loader as createTripsLoader } from "./sections/admin/CreateTrips";
import Logout from "./sections/admin/Logout";
import UserDashboard, { UserDashboardLoader } from "./sections/User/UserDashboard";
import { action as createTripAction } from "./sections/api/AICreateTrip";
import UserLayout, { UserClientLoader } from "./sections/User/UserLayout";
import Archive, { loader as userArchiveloader } from "./sections/User/Archive";
import Settings from "./sections/User/Settings";
import MyItinerary, { Loader as myItineraryLoader } from "./sections/User/MyItinerary";
import AIStrategist, { Loader as StrategistLoader } from "./sections/User/AIStrategist";
import TripConciergeChat  from "./sections/User/Chatbot";
import TelemetrySummary, { GetIdUsingParams as loader } from "./sections/User/TelemetrySummary";
import TripBooking from "./sections/User/TripBooking";
import BookingSuccess from './sections/User/BookingSuccess';
import BrowseRecommendations from "./sections/User/BrowseRecommendations";
import FlightSearch from "./sections/User/FlightSearch";
import Checkout from "./sections/User/Checkout";
import TicketView from "./sections/User/TicketView";
import FlightDetails , {FlightArchiveLoader} from "./sections/User/FLightDetails"
import UpgradePage from "./sections/User/Upgrade";
import ViewActivePlan from "./sections/User/ViewActivePlan";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* 1. ADMIN AS THE BASE (No /admin prefix) */}
      <Route path="/" element={<AdminLayout />} loader={adminLoader}>
        <Route index element={<Dashboard />} loader={AdminLoader} />
        <Route path="all-users" element={<AllUser />} loader={allUserLoader} />
        <Route path="trips" element={<Trips />} loader={TripsLoader} />
        <Route 
          path="trips/create" 
          element={<CreateTrips />} 
          loader={createTripsLoader} 
          action={createTripAction} 
        />
        <Route 
          path="trips/:id" 
          element={<TripDetails />} 
          loader={tripDetailsLoader} 
        />
        <Route path="logout" element={<Logout />} />
      </Route>

      {/* 2. USER SECTION (Specifically under /Home) */}
      <Route path="/Home" element={<UserLayout />} loader={UserClientLoader}>
        <Route index element={<UserDashboard />} loader={UserDashboardLoader} />
        <Route 
          path="strategist" 
          element={<AIStrategist />} 
          loader={StrategistLoader}
          action={createTripAction} 
        />
        <Route path="book/:id" element={<TripBooking />} />
        <Route path="archive" element={<Archive />} loader={userArchiveloader} />
        <Route path="settings" element={<Settings />} />
        <Route path="my-itinerary/:id" element={<MyItinerary />} loader={myItineraryLoader} />
        <Route path="chatbot" element={<TripConciergeChat />}  action={createTripAction} />
        <Route path="telemetry/:id" element={<TelemetrySummary />} loader={loader} />
        <Route path="browse-recommendations" element={<BrowseRecommendations />} />
        <Route path="flight-search" element={<FlightSearch />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="ticket-view/:bookingId" element={<TicketView />} />
        <Route path="flight-details/:flightId" element={<FlightDetails />} loader={FlightArchiveLoader} />
        <Route path="upgrade" element={<UpgradePage />} />
        <Route path="ViewActivePlan" element={<ViewActivePlan />} />
      </Route>

      <Route path="/booking-success/:bookingId" element={<BookingSuccess />} />

      {/* 3. PUBLIC */}
      <Route path="/sign-in" element={<SignIn />} loader={signInLoader} />
    </>
  ),



  {
    basename: import.meta.env.BASE_URL, // 👈 Passes /Nexa-Travel/ to React Router automatically
  }
);

function App() {
  return <RouterProvider router={router} fallbackElement={<div className="h-screen bg-slate-50" />} />;
}

export default App;