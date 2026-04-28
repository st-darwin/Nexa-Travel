
import Header from '../../components/Header'
import TripCard from '../../components/TripCard'
import StatsCard from '../../components/StatsCard'
import { useNavigate , useNavigation } from 'react-router-dom'
import { useLoaderData } from 'react-router-dom'
import { getAllUser, getUser } from '../../appwrite/Auth'
import { getTripsByTravelStyle, getUserGrowthPerDay, getUsersAndTripsStats } from '../../appwrite/dashboard'
import { getALlTrips } from '../../appwrite/Trips'
import { 
  ChartComponent, SeriesCollectionDirective, SeriesDirective, Inject, 
  LineSeries, DateTime, Legend, Tooltip, DataLabel, 
  AccumulationChartComponent, AccumulationSeriesCollectionDirective, AccumulationSeriesDirective, PieSeries, AccumulationTooltip, AccumulationLegend, AccumulationDataLabel
} from '@syncfusion/ej2-react-charts';

import StatsSkeleton from '../../components/StatsSkeleton'



export const DashboardLoader = async () => {
const [user , dashboardStats , trips , userGrowth , tripsByTravelStyle ,allUsers ] = await Promise.all([
   await getUser(),
   await getUsersAndTripsStats(),
   await getALlTrips(4,0),
   await getUserGrowthPerDay(),
   await getTripsByTravelStyle(),
   await getAllUser(4 ,0 )

])
const allTrips = trips.allTrips.map(({ $id, tripDetail, imgUrls }) => {
  // If tripDetail is a string, parse it. If it's already an object, use it.
  const details = typeof tripDetail === 'string' 
    ? JSON.parse(tripDetail) 
    : tripDetail;



    

  return {
    id: $id,
    name: details?.name ?? "No Name",
    imageUrls: imgUrls ?? [],
    location: details?.itinerary?.[0]?.location ?? "No Location",
    tags: [
      details?.interest ?? "General",
      details?.travelStyle ?? "Trip"
    ],
    estimatedPrice: details?.estimatedPrice ?? 0
  };
});


const mappedUsers : UsersItineraryCount[] = allUsers.users.map((user : any ) => ({
  imageUrl : user.imageUrl ?? '',
  name : user.name,
  count : user.itineraryCount
}))
return {
  user , dashboardStats , allTrips , userGrowth , tripsByTravelStyle , mappedUsers}
}

const Dashboard = () => {
  const data = useLoaderData() as any;
  const navigate = useNavigate();
  const navigation = useNavigation()

  const loading = navigation.state === "loading"

  if(loading && !data){
    return <StatsSkeleton />
  }
 const {user, dashboardStats , allTrips , userGrowth , tripsByTravelStyle , mappedUsers } = data 
  return (


    <>

   
    

<main className={`dashboard wrapper transition-all duration-700 ease-in-out ${loading ? 'opacity-40 blur-sm scale-[0.98]' : 'opacity-100 blur-0 scale-100'}`}>
     
   
     <Header
    title={`Welcome, ${user ? user.name : 'Guest'}! ✌️`}
    description="Here's an overview of your dashboard and recent activities."
   />

   <section className='flex flex-col'>
  <div className='grid  grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full '>
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
  {
  
  allTrips.length === 0 ? (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center col-span-full bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 mt-4 transition-all hover:bg-gray-50">
   
    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4 ring-8 ring-gray-50">
      <svg 
        className="w-8 h-8 text-gray-400" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>

    {/* Text content */}
    <h3 className="text-lg font-semibold text-gray-900">No trips created yet</h3>
    <p className="text-sm text-gray-500 max-w-[280px] mt-1 leading-relaxed">
      Your travel adventures will appear here once you start planning your next journey.
    </p>

    {/* Soft Call to Action Button */}
    <button 
    onClick={()=> navigate('trips/create')}
    className="mt-6 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200/50 flex items-center gap-2">
      <span>+  Create New Trip</span>
    </button>
  </div>
)  : (
  allTrips.slice(0, 4).map((trip: any) => (
    <TripCard 
      key={trip.id}
      id={trip.id.toString()}
      name={trip.name}          
      imgUrl={trip.imageUrls[0]} 
      
      // FIX: Use the names you defined in the DashboardLoader
      location={trip.location}   
      tags={trip.tags}           
      price={trip.estimatedPrice} 
    />
  )))}
</div>
   
   </section>

   <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-10">
          
          {/* USER GROWTH LINE CHART (2/3 width on large screens) */}
          <div className="xl:col-span-2 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-semibold text-dark-100 mb-4">User Acquisition Flow</h3>
            <ChartComponent 
              id='charts' 
              primaryXAxis={{ valueType: 'DateTime', labelFormat: 'MMM dd', edgeLabelPlacement: 'Shift', majorGridLines: { width: 0 } }} 
              primaryYAxis={{ labelFormat: '{value}', lineStyle: { width: 0 }, majorTickLines: { width: 0 } }}
              chartArea={{ border: { width: 0 } }}
              tooltip={{ enable: true }}
              height="300px"
            >
              <Inject services={[LineSeries, DateTime, Legend, Tooltip, DataLabel]} />
              <SeriesCollectionDirective>
                <SeriesDirective 
                  dataSource={userGrowth} 
                  xName='date' 
                  yName='count' 
                  width={3} 
                  marker={{ visible: true, width: 10, height: 10, fill: '#175cd3' }} 
                  type='Line' 
                  fill='#256ff1'
                />
              </SeriesCollectionDirective>
            </ChartComponent>
          </div>

     {/* The travel style */}
          {/* TRAVEL STYLE PIE CHART (1/3 width) */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Travel Styles</h3>
            <AccumulationChartComponent 
              id='pie-chart' 
              height="300px" 
              legendSettings={{ visible: true, position: 'Bottom' }}
              tooltip={{ enable: true }}
            >
              <Inject services={[PieSeries, AccumulationTooltip, AccumulationLegend, AccumulationDataLabel]} />
              <AccumulationSeriesCollectionDirective>
                <AccumulationSeriesDirective 
                  dataSource={tripsByTravelStyle} 
                  xName='style' 
                  yName='count' 
                  innerRadius="60%" 
                  dataLabel={{ visible: true, position: 'Inside', name: 'text', font: { fontWeight: '600', color: '#fff' } }}
                  palettes={['#256ff1', '#12b76a', '#c11574', '#026aa2', '#ff543d']}
                />
              </AccumulationSeriesCollectionDirective>
            </AccumulationChartComponent>
          </div>
        </section>

   
   
</main>
 </>
  )
}

export default Dashboard
