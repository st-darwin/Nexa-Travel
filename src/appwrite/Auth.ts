
import { ID, OAuthProvider, Query } from "appwrite";
import { account, appwriteConfig } from "./client";
import { redirect } from "react-router-dom";
import { database } from "./client";

export const loginWithGoogle = async () => {
    try {
        // We define where the user goes after the Google pop-up finishes
        const successUrl = `${window.location.origin}/`; // Goes to your Dashboard
        const failureUrl = `${window.location.origin}/sign-in`; // Goes back to Sign-In if they cancel

        await account.createOAuth2Session(
            OAuthProvider.Google,
            successUrl,
            failureUrl
        );
    } catch (error) {
        console.error("Google login failed:", error);
    }
}



export const logoutUser =async() =>{
    try {
        account.deleteSession("current") // delete the current user session to log out the user
        redirect('/sign-in') // redirect to sign-in page after logging out
        return true
}
catch (error) {
    console.error("Logout failed", error);
}
}

export const getUser = async () => {
    try {
        // 1. Get the current account session
        const user = await account.get(); 

        // 2. Check the database for this specific accountId
        const { documents } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [
                // check accountid = $id 
                Query.equal("accountId", user.$id),
               Query.select([
                    "$id", 
                    "name", 
                    "email", 
                    "imageUrl", 
                    "accountId", 
                    "dateTime"
                   
                ])
            ]
        );

        // 3. If user exists in DB, return them
        if (documents.length > 0) {
            return documents[0];
        }

        // 4. If session exists but no DB document, create one
        return await storeUserData();

    } catch (error) {
        // Appwrite throws a 401 if no session exists. 
        // We log it and return null so the Loader can handle the redirect.
        console.error("Auth Utility: No session or user found", error);
        return null; 
    }
};



export const getGooglePicture =async() =>{  
    try {
        const session = await account.getSession("current") // get the current user session
        const oAuth2Token = session.providerAccessToken // get the OAuth2 access token from the session
        if(!oAuth2Token) {
            console.log("No access token available for Google login.")
            return null} // return null if no access token is available

            const response = await fetch("https://people.googleapis.com/v1/people/me?personFields=photos", {
                headers: {
                    Authorization: `Bearer ${oAuth2Token}` // use the access token to fetch user info from Google
                }
            })
            if (!response.ok) {
                console.error("Failed to fetch user info from Google:", response.statusText)
                return null // return null if the API request fails
            }
            const data = await response.json()
            const photoUrl = data.photos && data.photos.length > 0 ? data.photos[0].url : null // extract the photo URL from the API response
            return photoUrl // return the photo URL
}
catch (error) {
    console.error("Google getGooglePicture failed:", error);
}
}

export const storeUserData = async () => {
    try {
        
        const user = await account.get();
        const googlePhoto = user.prefs?.avatar || "";
        if (!user) return null;

        // Check if exists first
        const { documents } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", user.$id)]
        );

        if (documents.length > 0) return documents[0];

        // Create new if doesn't exist
        const newUser = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: user.$id,
                name: user.name,
                email: user.email,
               
                dateTime: new Date().toISOString(),
                imageUrl: googlePhoto || `https://ui-avatars.com/api/?name=${user.name}&background=random`,

            }
        );
        return newUser;
    } catch (error) {
        console.error("Store user data failed:", error);
        return null;
    }
};


export const getExistingUser =async() =>{
    try {
        // gets thet current account session and checks if user data exists in the database, if it does return the user data, else return null
       const currentAccount = await account.get()
       if(!currentAccount) return null

      const {documents}= await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]

       )
   if(documents.length === 0) return null
   return documents[0]



        
}
catch (error) {
    console.error("Google getExistingUser failed:", error);
}
}

export const getAllUser = async(limit : number , offset: number ) =>{
 try{
   const {documents : users , total } =  await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
   [ Query.limit(limit) , Query.offset(offset)]
   )
   if(total === 0) return { users : [] , total : 0}

   //else
   return {users , total}



 }
 catch(e) {
    console.log( e , "Error fetching all the users ") 
    return {users: [] , total: 0}

 }
}
