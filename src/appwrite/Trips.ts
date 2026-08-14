import { Query } from "appwrite";
import { ID } from "appwrite";
import { appwriteConfig, database, functions } from "./client";

export const getALlTrips = async (limit: number, offset: number) => {
  const allTrips = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.tripCollectionId,
    [Query.limit(limit), Query.offset(offset), Query.orderDesc("$createdAt")]
  );
  if (!allTrips.total) {
    return {
      allTrips: [],
      total: 0,
    };
  }
  return {
    allTrips: allTrips.documents,
    total: allTrips.total,
  };
};

export const getTripById = async (tripId: string) => {
  const trip = await database.getDocument(
    appwriteConfig.databaseId,
    appwriteConfig.tripCollectionId,
    tripId
  );
  if (!trip.$id) {
    console.log("Trip not found");
    return null;
  }
  return trip;
};

export const getUserTrips = async (userId: string, limit: number = 6, offset: number = 0) => {
  try {
    if (!userId) throw new Error("User ID is required to fetch trips");

    const response = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.tripCollectionId,
      [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return {
      trips: response.documents,
      total: response.total,
    };
  } catch (error) {
    console.error("Nexa OS :: getUserTrips Error:", error);
    return { trips: [], total: 0 };
  }
};

export const getUserTripById = async (tripId: string, userId: string) => {
  try {
    const trip = await database.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.tripCollectionId,
      tripId
    );

    if (trip.userId && trip.userId !== 'anonymous' && trip.userId !== userId) {
      console.warn("Unauthorized access attempt to trip:", tripId);
      return null;
    }

    return trip;
  } catch (error) {
    console.error("getUserTripById Error:", error);
    return null;
  }
};

export const finalizeTripById = async (tripId: string) => {
  try {
    const trip = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.tripCollectionId,
      tripId,
      {
        status: "finalized",
      }
    );
    return trip;
  } catch (error) {
    console.error("Unable to finalize trip", error);
    throw error;
  }
};

export const confirmPaymentStatus = async (tripId: string) => {
  try {
    const trip = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.tripCollectionId,
      tripId,
      {
        paymentStatus: "successful",
      }
    );
    return trip;
  } catch (error) {
    console.error("Unable to confirm payment status", error);
    throw error;
  }
};

export const confirmBookingStatus = async (tripId: string) => {
  try {
    const trip = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.tripCollectionId,
      tripId,
      {
        bookingStatus: "confirmed",
      }
    );
    return trip;
  } catch (error) {
    console.error("Unable to confirm booking status", error);
    throw error;
  }
};

export const storePaymentReference = async (tripId: string, paymentReference: string) => {
  try {
    const trip = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.tripCollectionId,
      tripId,
      {
        paystackRef: paymentReference,
      }
    );
    return trip;
  } catch (error) {
    console.error("Unable to store payment reference", error);
    throw error;
  }
};

export const storePaymentAmount = async (tripId: string, paymentAmount: number) => {
  try {
    const trip = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.tripCollectionId,
      tripId,
      {
        paymentAmount: paymentAmount,
      }
    );
    return trip;
  } catch (e) {
    console.error("Unable to store payment amount", e);
    throw e;
  }
};

export const StoreBookingid = async (tripId: string, bookingId: string) => {
  try {
    const trip = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.tripCollectionId,
      tripId,
      {
        BookingID: bookingId,
      }
    );
    return trip;
  } catch (error) {
    console.error("Unable to store booking ID", error);
    throw error;
  }
};

// --- NORMAL TRIP & MANUAL BOOKING METHODS ---

export const createNormalTrip = async (tripData: {
  userId: string;
  country: string;
  numberOfDays: number;
  budget: string;
  travelStyle: string;
  interests?: string;
  groupType?: string;
  name: string;
  description?: string;
  estimatedPrice?: string;
  itinerary: string;
  flightNumber?: string;
  airline?: string;
  seatClass?: string;
  passengerName?: string;
  paymentStatus?: string;
  paystackRef?: string;
}) => {
  try {
    const response = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.normalCollectionID,
      ID.unique(),
      {
        ...tripData,
        paymentStatus: tripData.paymentStatus || "pending",
      }
    );
    return response;
  } catch (error) {
    console.error("Nexa OS :: createNormalTrip Error:", error);
    throw error;
  }
};

export const getNormalTripById = async (tripId: string, userId: string) => {
  try {
    const trip = await database.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.normalCollectionID,
      tripId
    );

    if (trip.userId && trip.userId !== 'anonymous' && trip.userId !== userId) {
      console.warn("Unauthorized access attempt to normal trip:", tripId);
      return null;
    }

    return trip;
  } catch (error) {
    console.error("getNormalTripById Error:", error);
    return null;
  }
};

export const getUserNormalTrips = async (userId: string, limit: number = 6, offset: number = 0) => {
  try {
    if (!userId) throw new Error("User ID is required");

    const response = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.normalCollectionID,
      [
        Query.or([
          Query.equal("userId", userId),
          Query.equal("userId", "anonymous")
        ]),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return {
      trips: response.documents,
      total: response.total,
    };
  } catch (error) {
    console.error("Nexa OS :: getUserNormalTrips Error:", error);
    return { trips: [], total: 0 };
  }
};

export const confirmNormalTripPayment = async (tripId: string, paystackRef: string) => {
  try {
    const trip = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.normalCollectionID,
      tripId,
      {
        paymentStatus: "successful",
        paystackRef: paystackRef,
      }
    );
    return trip;
  } catch (error) {
    console.error("Unable to confirm normal trip payment", error);
    throw error;
  }
};

export const createFlightBooking = async (bookingData: {
  userId: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  flightDate: string;
  seatClass: string;
  passengerName: string;
  passengerEmail: string;
  ticketPrice: string;
  paymentStatus?: string;
  paystackRef?: string;
}) => {
  try {
    const response = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.normalCollectionID,
      ID.unique(),
      {
        ...bookingData,
        paymentStatus: bookingData.paymentStatus || "pending",
      }
    );
    return response;
  } catch (error) {
    console.error("Nexa OS :: createFlightBooking Error:", error);
    throw error;
  }
};

// --- LIVE DUFFEL FLIGHT INTEGRATION METHODS ---

export const searchLiveFlights = async (origin: string, destination: string, departureDate: string) => {
  try {
    const execution = await functions.createExecution(
      appwriteConfig.functionId,
      JSON.stringify({
        origin,
        destination,
        departureDate,
      }),
      false
    );

    const result = JSON.parse(execution.responseBody);
    if (!result.success) throw new Error(result.error || "Failed to fetch live flights");
    return result.offers;
  } catch (error: any) {
    console.error("Nexa OS :: Live Flight Search Error:", error);
    throw error;
  }
};

export const createDuffelOrder = async (
  offerId: string, 
  passenger: {
    first_name: string;
    last_name: string;
    gender: string;
    born_on: string;
    email: string;
    phone_number: string;
  }
) => {
  try {
    const execution = await functions.createExecution(
      appwriteConfig.functionId,
      JSON.stringify({
        action: 'create_order',
        offerId,
        passenger,
      }),
      false
    );

    const result = JSON.parse(execution.responseBody);
    if (!result.success) throw new Error(result.error || "Order execution failed");
    return result.data;
  } catch (error: any) {
    console.error("Nexa OS :: Duffel Order Error:", error);
    throw error;
  }
};