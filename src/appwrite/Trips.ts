import { Query } from "appwrite";
import { appwriteConfig, database } from "./client";

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

    // Allow access if trip is anonymous or IDs match
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