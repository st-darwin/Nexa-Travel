import React from 'react'
import Header from '../../components/Header'
import TripCard from '../../components/TripCard'
import StatsCard from '../../components/StatsCard'
import { dashboardStats, user , allTrips } from '../../constants'



const Dashboard = () => {
  const user = {
    name: "Darwin",
  }
 
  return (
<main className='dashboard wrapper'>
     <Header
    title={`Welcome, ${user.name}! ✌️`}
    description="Here's an overview of your dashboard and recent activities."
   />

   <section className='flex flex-col'>
  <div className='grid  grid-cols-1 md:grid-cols-3 gap-6 w-full '>
    <StatsCard
    headerTitle ="Total Users"
    total = {dashboardStats.totalUsers}
    currentMonthCount = {dashboardStats.usersJoined.currentMonth}
    lastMonthCount = {dashboardStats.usersJoined.lastMonth}
    />
        <StatsCard
    headerTitle ="Total Trips"
    total = {dashboardStats.totalTrips}
    currentMonthCount = {dashboardStats.tripsCreated.currentMonth}
    lastMonthCount = {dashboardStats.tripsCreated.lastMonth}
    />    <StatsCard
    headerTitle ="Active Users"
    total = {dashboardStats.userRole.total}
    currentMonthCount = {dashboardStats.userRole.currentMonth}
    lastMonthCount = {dashboardStats.userRole.lastMonth}
    />
    
  </div>
   </section>




   
   <section className="container">
    <h1 className='text-xl font-semiold text-dark-'> Created Trips </h1>
    <div className='trip-grid'>
      {allTrips.slice(0 , 4).map((trip) =>(
        <TripCard 
        key={trip.id}
        id={trip.id.toString()}
        
        name = {trip.name}
        imgUrl={trip.imageUrls[0]}
        location={trip.itinerary?.[0].location ?? ""}
        tags= {trip.tags}
        price = {trip.estimatedPrice}

        
        />
      )) }

    </div>
   
   </section>
   
</main>
  )
}

export default Dashboard
