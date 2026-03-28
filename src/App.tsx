import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route } from "react-router-dom";
import Dashboard from "./sections/admin/Dashboard";
import AdminLayout, { clientLoader as adminLoader } from "./sections/admin/AdminLayout";
import TripDetails , {loader as tripDetailsLoader} from "./sections/admin/TripDetails";
import SignIn, { clientLoader as signInLoader } from "./sections/root/sign-in";
import AllUser, { loader as allUserLoader } from './sections/admin/AllUser'; // Import the loader!
import Trips from "./sections/admin/Trips";
import CreateTrips , {loader as createTripsLoader} from "./sections/admin/CreateTrips";

 // Import your action
 import { action as createTripAction } from "./sections/api/AICreateTrip";
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Sign In Route: If logged in, this loader kicks you to Dashboard */}
      <Route 
        path="/sign-in" 
        element={<SignIn />} 
        loader={signInLoader} 
      />

      {/* API ROUTE TS */ }



      
    

      {/* Admin Protected Routes: If NOT logged in, this loader kicks you to Sign-In */}
      <Route 
        element={<AdminLayout />} 
        loader={adminLoader}
      > 
        <Route path="/" element={<Dashboard />} />
        <Route path="/all-users" loader={allUserLoader} element={<AllUser />} />
        <Route path="/trips" element={<Trips/>}/>
        <Route path="/trips/create" loader={createTripsLoader}
        action= {createTripAction}
        element={<CreateTrips/>}/>
     
      <Route 
          path="/trips/:id" 
          element={<TripDetails />} 
          loader={tripDetailsLoader}
        />
         </Route>
    </>
  )
);

function App() {
  return <RouterProvider router={router}  />;
}

export default App;
