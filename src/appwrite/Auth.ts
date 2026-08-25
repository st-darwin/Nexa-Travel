import { ID, OAuthProvider, Query } from "appwrite";
import { account, appwriteConfig } from "./client";
import { database } from "./client";

export const loginWithGoogle = async () => {
  try {
    const successUrl = `${window.location.origin}/`;
    const failureUrl = `${window.location.origin}/sign-in`;

    await account.createOAuth2Session(
      OAuthProvider.Google,
      successUrl,
      failureUrl
    );
  } catch (error) {
    console.error("Google login failed:", error);
  }
};

export const logoutUser = async () => {
  try {
    await account.deleteSession("current");
    window.location.hash = ""; 
    return true; 
  } catch (error) {
    console.error("Logout failed", error);
    return false;
  }
};

export const getUser = async () => {
  try {
    const user = await account.get(); 

    const { documents } = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [
        Query.equal("accountId", user.$id),
        Query.select([
          "$id", 
          "name", 
          "email", 
          "imageUrl", 
          "accountId", 
          "dateTime",
          "isPro",
          "subscriptionStatus",
          "generationsToday",
          "lastGenerationDate",
          "itineraryCreated",
          "subscriptionType",
        ])
      ]
    );

    if (documents.length > 0) {
      return documents[0];
    }

    return await storeUserData();

  } catch (error) {
    console.error("Auth Utility: No session or user found", error);
    return null; 
  }
};

export const getGooglePicture = async () => {  
  try {
    const session = await account.getSession("current");
    const oAuth2Token = session.providerAccessToken;
    if (!oAuth2Token) {
      console.log("No access token available for Google login.");
      return null;
    }

    const response = await fetch("https://people.googleapis.com/v1/people/me?personFields=photos", {
      headers: {
        Authorization: `Bearer ${oAuth2Token}`
      }
    });

    if (!response.ok) {
      console.error("Failed to fetch user info from Google:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.photos && data.photos.length > 0 ? data.photos[0].url : null;
  } catch (error) {
    console.error("Google getGooglePicture failed:", error);
    return null;
  }
};

export const storeUserData = async () => {
  try {
    const user = await account.get();
    const googlePhoto = await getGooglePicture();
    if (!user) return null;

    const { documents } = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", user.$id)]
    );

    if (documents.length > 0) return documents[0];

    const todayStr = new Date().toISOString().split('T')[0];

    const newUser = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: user.$id,
        name: user.name,
        email: user.email,
        dateTime: new Date().toISOString(),
        imageUrl: googlePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
        subscriptionStatus: "inactive",
        subscriptionType: "free",
        generationsToday: 0,
        lastGenerationDate: todayStr,
        itineraryCreated: 0,
      }
    );
    return newUser;
  } catch (error) {
    console.error("Store user data failed:", error);
    return null;
  }
};

export const getExistingUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) return null;

    const { documents } = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (documents.length === 0) return null;
    return documents[0];
  } catch (error) {
    console.error("Google getExistingUser failed:", error);
    return null;
  }
};

export const getAllUser = async (limit: number, offset: number) => {
  try {
    const { documents: users, total } = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.limit(limit), Query.offset(offset)]
    );
    if (total === 0) return { users: [], total: 0 };

    return { users, total };
  } catch (e) {
    console.log(e, "Error fetching all the users ");
    return { users: [], total: 0 };
  }
};

/**
 * Increments the user's daily AI generation count.
 * Automatically checks if the date has rolled over to reset generationsToday to 1.
 */
export const incrementUserGeneration = async (accountId: string) => {
  try {
    const { documents } = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", accountId)]
    );

    if (documents.length === 0) {
      console.error("No user document found for this account ID");
      return false;
    }

    const userDoc = documents[0];
    const todayStr = new Date().toISOString().split('T')[0];

    let newGenerationsToday = 1;
    if (userDoc.lastGenerationDate === todayStr) {
      newGenerationsToday = (userDoc.generationsToday || 0) + 1;
    }

    await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userDoc.$id,
      {
        generationsToday: newGenerationsToday,
        lastGenerationDate: todayStr,
        itineraryCreated: (userDoc.itineraryCreated || 0) + 1
      }
    );
    
    console.log("Generation quota & trip count updated successfully!");
    return true;
  } catch (error) {
    console.error("Failed to increment generation count:", error);
    return false;
  }
};

// Legacy alias if needed elsewhere
export const incrementUserTripCount = incrementUserGeneration;
