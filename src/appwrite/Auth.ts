
import { ID, OAuthProvider, Query } from "appwrite";
import { account, appwriteConfig } from "./client";
import { redirect } from "react-router-dom";
import { database } from "./client";

export const loginWithGoogle =async() =>{
    try {
        account.createOAuth2Session(
            OAuthProvider.Google
        )
}
catch (error) {
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


export const getUser =async() =>{
    try {
        const user = await account.get() // get the current user session

        if(!user) return redirect('/sign-in') // redirect to sign-in if no user session exists
       // check if user data exists in the database, if not create a new user document and return it
        const {documents} =await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [
                Query.equal("accountId", user.$id),
                Query.select(["name", "email" , "imageUrl" ,"dateTime" , "accountId" ])
            ]
        )
        if(documents.length === 0){
            return await storeUserData() // if no user data exists in the database, create a new user document and return it
        }
        
}
catch (error) {
    console.error("Google getUser failed:", error);
}
}



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


export const storeUserData =async() =>{
    try {
          const user = await account.get() // get the current user session
          
          if(!user) return redirect('/sign-in') // redirect to sign-in if no user session exists

          const {documents} =await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [
                Query.equal("accountId", user.$id),
            ]
        )
        if (documents.length > 0) return documents[0] // if user data already exists in the database, return it
         // else create a new user document in the database with the user's information
         
         const imageUrl = await getGooglePicture() // get the user's profile picture from Google
         const newUser = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: user.$id,
                name: user.name,
                email: user.email,
                imageUrl: imageUrl,
                dateTime: new Date()
            }
        )
        return newUser // return the newly created user document

}
catch (error) {
    console.error("Google storeUserData failed:", error);
}
}

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