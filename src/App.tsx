import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route } from "react-router-dom";
import Dashboard , {DashboardLoader as AdminLoader }  from "./sections/admin/Dashboard";
import AdminLayout, { clientLoader as adminLoader } from "./sections/admin/AdminLayout";
import TripDetails , {loader as tripDetailsLoader} from "./sections/admin/TripDetails";
import SignIn, { clientLoader as signInLoader } from "./sections/root/sign-in";
import AllUser, { loader as allUserLoader } from './sections/admin/AllUser'; // Import the loader!
import Trips ,  {loader as TripsLoader } from "./sections/admin/Trips";
import CreateTrips , {loader as createTripsLoader} from "./sections/admin/CreateTrips";
import Logout from "./sections/admin/Logout";

 // Import your action
 import { action as createTripAction } from "./sections/api/AICreateTrip";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Admin Protected Group */}
      <Route element={<AdminLayout />} loader={adminLoader}>
        {/* Use 'index' for the root of the protected group */}
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
        <Route path="/logout" element={<Logout />} />
      </Route>

      {/* Public Routes - Kept outside the AdminLayout guard */}
      
      <Route path="/sign-in" element={<SignIn />} loader={signInLoader} />
    </>
  )
);

function App() {
  return <RouterProvider router={router}  fallbackElement={<div className="h-screen bg-slate-50" />} />;
}

export default App;
