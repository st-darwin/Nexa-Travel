import { ID, Query } from 'appwrite';
import { database , appwriteConfig } from './client';


export interface RecommendationBookingData {
  userID: string;
  recommendationId: string;
  tripName: string;
  totalPrice: number;
  distance: number;
  bookingStatus: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid' | 'failed';
  bookingID?: string;
  passengerName?: string;
  amount?: number;
  transportMode?: string;
  carrier?: string;
  departureDate?: string;
  passengers?: any;
  seatClass?: string;
   departureTime: string;
    arrivalTime: string;
    flightNumber: string;
    arrivalAirport:string;
   departureAirport: string;

}


export const createRecommendationBooking = async (bookingData: RecommendationBookingData) => {
  try {
    const bookingIDGenerated = bookingData.bookingID || `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payload = {
      userID: String(bookingData.userID || ''),
      recommendationId: String(bookingData.recommendationId || ''),
      tripName: String(bookingData.tripName || 'Unknown Destination'),
      totalPrice: Number(bookingData.totalPrice) || 0,
      distance: Number(bookingData.distance) || 0,
      bookingStatus: bookingData.bookingStatus,
      paymentStatus: bookingData.paymentStatus,
      bookingID: bookingIDGenerated,
      passengerName: bookingData.passengerName || '',
      amount: Number(bookingData.totalPrice) || 0,
      transportMode: bookingData.transportMode || 'flight',
      carrier: bookingData.carrier || 'Nexa Travel Hub',
      departureDate: bookingData.departureDate || new Date().toISOString().split('T')[0],
      seatClass : bookingData.seatClass,
      arrivalTime : bookingData.arrivalTime,
      departureTime: bookingData.departureTime,
      flightNumber : bookingData.flightNumber,
      arrivalAirport : bookingData.arrivalAirport,
      departureAirport : bookingData.departureAirport

    };

    const response = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.recommendationCollectionId,
      ID.unique(),
      payload
    );

    return response;
  } catch (error) {
    console.error('Error creating recommendation booking:', error);
    throw error;
  }
};

export const GetRecommendedTrips = async(userID: string, limit: number, offset: number) => {


  const docResponse = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.recommendationCollectionId,
    [
      Query.equal('userID', userID),
      Query.limit(limit),
      Query.offset(offset)
    ]
  );
  if (!docResponse || !docResponse.documents) {
    throw new Error('No recommended trips found for the user.');
  }
  if (docResponse.documents.length === 0) {
    throw new Error('No recommended trips found for the user.');
  }
 const  doc = docResponse.documents[0];


  return doc;
}