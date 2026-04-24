import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route,  } from "react-router-dom";
import Dashboard , {DashboardLoader as AdminLoader }  from "./sections/admin/Dashboard";
import AdminLayout, { clientLoader as adminLoader } from "./sections/admin/AdminLayout";
import TripDetails , {loader as tripDetailsLoader} from "./sections/admin/TripDetails";
import SignIn, { clientLoader as signInLoader } from "./sections/root/sign-in";
import AllUser, { loader as allUserLoader } from './sections/admin/AllUser'; // Import the loader!
import Trips ,  {loader as TripsLoader } from "./sections/admin/Trips";
import CreateTrips , {loader as createTripsLoader} from "./sections/admin/CreateTrips";
import Logout from "./sections/admin/Logout";
import UserDashboard , {UserDashboradLoader} from "./sections/User/UserDashboard";
import { action as createTripAction } from "./sections/api/AICreateTrip";
import UserLayout ,{ UserClientLoader} from "./sections/User/UserLayout";
import Archive from "./sections/User/Archive";
import Settings from "./sections/User/Settings";
import MyItinerary from "./sections/User/MyItinerary";
import AIStrategist from "./sections/User/AIStrategist";


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
        <Route index element={<UserDashboard />}  loader={UserDashboradLoader}/>
          <Route path="strategist" element={<AIStrategist/>} />
        <Route path="archive" element={<Archive />} />
        <Route path="settings" element={<Settings />} />
        <Route path="my-itinerary" element={<MyItinerary />} />
      </Route>

      {/* 3. PUBLIC */}
      <Route path="/sign-in" element={<SignIn />} loader={signInLoader} />
    </>
  )
);

function App() {
  return <RouterProvider router={router}  fallbackElement={<div className="h-screen bg-slate-50" />} />;
}

export default App;
