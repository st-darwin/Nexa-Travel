import { Route , Routes  } from "react-router-dom"
import Dashboard from "./sections/admin/Dashboard"
import AdminLayout from "./sections/admin/AdminLayout"
import User from "./sections/admin/AllUser"
function App() {
  return (
  <Routes>

    <Route element={<AdminLayout/>}> 
      <Route path="/" element={<Dashboard />} />
       <Route path="/All-users" element={<User />} />

    </Route>
     

  </Routes>
  )
}

export default App