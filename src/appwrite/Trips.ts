import {  Query } from "appwrite"
import { appwriteConfig , database } from "./client"

export const getALlTrips = async(limit : number , offset : number) =>{
    const allTrips = await  database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.tripCollectionId,
         [Query.limit(limit) , Query.offset(offset) , Query.orderDesc('$createdAt')]

    )
    if(!allTrips.total){
        return {
            allTrips : [],
            total : 0
        }
    }
    return{
        allTrips : allTrips.documents,
        total : allTrips.total
    }
    

    
}



export const getTripById = async(tripId : string) =>{
    const trip = await database.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.tripCollectionId,
        tripId,
    )
    if(!trip.$id){
        console.log('Trip not found')
        return null;
    }
    return trip;


}

// appwrite/Trips.js


// user trip related functions 

export const getUserTrips = async (userId: string, limit: number = 6 , offset: number = 0) => {
    try {
        // Validation: Ensure a userId is actually provided
        if (!userId) throw new Error("User ID is required to fetch trips");

        const response = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            [
                Query.equal('userId', userId),    // Crucial: Filters for THIS user only
                Query.orderDesc('$createdAt'),   // Shows newest trips first
                Query.limit(limit),              // Prevents loading too much at once
                Query.offset(offset)             // Implements pagination
            ]
        );

        return {
            trips: response.documents,
            total: response.total
        };
    } catch (error) {
        console.error("Nexa OS :: getUserTrips Error:", error);
        return { trips: [], total: 0 };
    }
};

/**
 * VERIFY AND GET SINGLE TRIP
 * Ensures the user actually owns the trip they are trying to view.
 */
export const getUserTripById = async (tripId: string, userId: string) => {
    try {
        // get the document
        const trip = await database.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            tripId
        );

        // Security Check: Does this trip belong to the person asking for it?
        if (trip.userId !== userId) {
            console.warn("Unauthorized access attempt to trip:", tripId);
            return null;
        }

        return trip;
    } catch (error) {
        console.error("getUserTripById Error:", error);
        return null;
    }
};
export const finalizeTripById = async(tripId: string) => {
    try {
        const trip = await database.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            tripId,
            {
                status  : "finalized"
            }
        );
        return trip
    }
    catch(error){
        console.error("Unable to finalized trip" , error)
        throw error
    }
}

export const confirmPaymentStatus = async(tripId : any) => {
   try{
    const trip = await database.updateDocument(
    appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            tripId,
    {

    paymentStatus : "successful"
   }
    )
    console.log("Payment status confirmed for trip:", tripId);
    return trip

   }
   catch(error){
    console.error("Unable to confirm payment status" , error)
    throw error
   }


}

export const confirmBookingStatus = async(tripId : any) => {
   try{
    const trip = await database.updateDocument(
    appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            tripId,
    {

    bookingStatus : "confirmed"
   }
    )
    console.log("Booking status confirmed for trip:", tripId);
    return trip

   }
   catch(error){
    console.error("Unable to confirm booking status" , error)
    throw error
   }


}

export const storePaymentReference = async(tripId : any , paymentReference : string) =>{

try {
       const trip = await database.updateDocument(
    appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            tripId,
    {

    paystackRef : paymentReference
   }
    )
    console.log("Payment reference stored for trip:", tripId);
    return trip
}
   catch(error){
    console.error("Unable to store payment reference" , error)
    throw error
   }


}



export const storePaymentAmount = async(tripId : any , paymentAmount : number)=>{

    try {
       const trip = await database.updateDocument(
    appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            tripId,
    {
        paymentAmount: paymentAmount

    
   }
    )
    console.log("Payment reference stored for trip:", tripId);
    return trip
    }
catch(e){
    console.error("Unable to store payment amount" , e)
    throw e
}
}


export const StoreBookingid = async(tripId : any , bookingId : string) =>{

    try {
        const trip = await database.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            tripId,
            {
                BookingID: bookingId
            }
        );
        console.log("Booking ID stored for trip:", tripId);
        return trip;
    }
    catch (error) {
        console.error("Unable to store booking ID", error);
        throw error;
    }
}