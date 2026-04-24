// i am too lazyy brufff
import { useLoaderData } from "react-router-dom";
import { getUser } from "../../appwrite/Auth"
import { Header } from "../../components/Index";

export const UserDashboradLoader = async () =>{
 try{
   const user = await getUser()
 
   return user ;
  
  }

  catch(e){
    console.log( e , "Unable to get user data in the user dashborad")
  }
  

}

const UserDashboard = () => {
  const user = useLoaderData() as any;
  return (
     <>
     <Header
     title={user.$id ? `Welcome ${user.name} 👋` : "Welcome Guest 💕"}
     description="View and mnange ready-made itineraries"
     />
     </>
  )
}

export default UserDashboard
