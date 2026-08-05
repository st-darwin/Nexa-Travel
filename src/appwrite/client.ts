
import { Client,  Account, Databases , Storage, Functions } from "appwrite";

export const appwriteConfig = {


  endpointUrl: import.meta.env.VITE_APPWRITE_API_ENDPOINT ,
  project: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  apikey: import.meta.env.VITE_APPWRITE_API_KEY,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID ,    
 userCollectionId: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID ,
 tripCollectionId: import.meta.env.VITE_APPWRITE_TRIPS_COLLECTION_ID ,
 functionId: import.meta.env.VITE_NEXA_BOOKING_FUNCTION_ID
}

const client = new Client()
.setEndpoint(appwriteConfig.endpointUrl)
.setProject(appwriteConfig.project)


const account = new Account(client);
const database = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);
export { client, account, database, storage, functions };

