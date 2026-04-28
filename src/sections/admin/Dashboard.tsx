
import { appwriteConfig, database } from "./client";
import { parseTripData } from "../lib/utils";

type Document ={
    [key : string] : any
}

type  FilterByDate =(
    items : Document[],
    key : string,
    start : string,
    end?: string,) => number;



export const getUsersAndTripsStats = async() :Promise<DashboardStats>  =>{
  const d = new Date();
  // the start of the current month 
  const startCurrent = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
  const startPrev = new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString();
  const endPrev = new Date(d.getFullYear(), d.getMonth(), 0).toISOString();


  const [users , trips] = await Promise.all([
    database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
    ),
        database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.tripCollectionId,
    ),
    
  ]) 

  const filterByDate : FilterByDate = (items , key , start , end ) => 

    // check the time the itme was created, and if its same or greater than the start of the month,
    //  and if end is provided check if its less than or equal to end of the month..if true then if can be selected for the count
  items.filter((item) => (
    item[key] >= start && (!end || item[key] <= end)
  )).length

  const filteruserByRole =(role : string) =>{
    return users.documents.filter((user: Document) => user.status === role )
  }

    return {
        totalUsers : users.total,
        usersJoined : {
            currentMonth : filterByDate(
                users.documents ,
                '$createdAt' ,
                startCurrent,
                undefined,
             ),
             lastMonth : filterByDate(
                users.documents ,
                '$createdAt' ,
                startPrev,
                endPrev
             ),
        },
                userRole : {
                total : filteruserByRole('user').length,    
                 currentMonth : filterByDate(
                filteruserByRole('user') ,
                '$createdAt' ,
                startCurrent,
                undefined,
             ),
             lastMonth : filterByDate(
                filteruserByRole('user') ,
                '$createdAt' ,
                startPrev,
                endPrev
             ),
        },
        totalTrips : trips.total,

                tripsCreated  : {
              
                 currentMonth : filterByDate(
                trips.documents ,
                '$createdAt' ,
                startCurrent,
                undefined,
             ),
             lastMonth : filterByDate(
                trips.documents ,
                '$createdAt' ,
                startPrev,
                endPrev
             ),
        },



    }
}

 export const getUserGrowthPerDay = async () => {
    const users = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId
    );

    const userGrowth = users.documents.reduce(
        (acc: { [key: string]: number }, user: Document) => {
            const date = new Date(user.$createdAt);
            const day = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        },
        {}
    );

    return Object.entries(userGrowth).map(([day, count]) => ({
        count: Number(count),
        day,
    }));
};

export const getTripsCreatedPerDay = async () => {
    const trips = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.tripCollectionId
    );

    const tripsGrowth = trips.documents.reduce(
        (acc: { [key: string]: number }, trip: Document) => {
            const date = new Date(trip.$createdAt);
            const day = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        },
        {}
    );

    return Object.entries(tripsGrowth).map(([day, count]) => ({
        count: Number(count),
        day,
    }));
};

export const getTripsByTravelStyle = async () => {
    const trips = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.tripCollectionId
    );

    const travelStyleCounts = trips.documents.reduce(
        (acc: { [key: string]: number }, trip: Document) => {
            const tripDetail = parseTripData(trip.tripDetail);

            if (tripDetail && tripDetail.travelStyle) {
                const travelStyle = tripDetail.travelStyle;
                acc[travelStyle] = (acc[travelStyle] || 0) + 1;
            }
            return acc;
        },
        {}
    );

    return Object.entries(travelStyleCounts).map(([travelStyle, count]) => ({
        count: Number(count),
        travelStyle,
    }));
};
