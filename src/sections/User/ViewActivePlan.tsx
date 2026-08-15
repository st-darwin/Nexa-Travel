import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import { account, database } from "../../appwrite/client";
import { Query } from "appwrite";

export default function ViewActivePlan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchUserPlan() {
      try {
        const currentUser = await account.get();
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID || "database_id";
        const usersCollectionId = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID || "users";

        const response = await database.listDocuments(
          databaseId,
          usersCollectionId,
          [Query.equal("accountId", currentUser.$id)]
        );

        if (response.documents.length > 0) {
          setUserProfile(response.documents[0]);
        }
      } catch (err) {
        navigate("/sign-in");
      } finally {
        setLoading(false);
      }
    }
    fetchUserPlan();
  }, [navigate]);

  const hasActivePlan = () => {
    if (!userProfile || !userProfile.subscriptionType || userProfile.subscriptionType === "free") {
      return false;
    }
    if (userProfile.subscriptionExpiresAt) {
      return new Date(userProfile.subscriptionExpiresAt) > new Date();
    }
    return true;
  };

  return (
    <main className="min-h-screen bg-zinc-50/50 p-4 sm:p-6 md:p-10 space-y-6 md:space-y-8 antialiased selection:bg-zinc-900 selection:text-white">
      <UserHeader
        title="Active Subscription Plan"
        description="View your current membership tier, validity, and plan status."
        ctaText="Back to Dashboard"
        ctaUrl="/Home"
      />

      <div className="max-w-xl mx-auto pt-6">
        {loading ? (
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 text-center text-xs font-mono text-zinc-400">
            Loading subscription details...
          </div>
        ) : hasActivePlan() ? (
          <div className="bg-zinc-950 text-white border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-amber-400 text-zinc-950 font-mono text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                {userProfile.subscriptionType.toUpperCase()} PRO ACTIVE ✨
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Nexa Pro Member</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                You have full access to unlimited itinerary generations, priority AI routing, and VIP travel tools.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Selected Plan:</span>
                <span className="text-white capitalize font-bold">{userProfile.subscriptionType} Pass</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Expiration Date:</span>
                <span className="text-amber-400 font-bold">
                  {userProfile.subscriptionExpiresAt ? new Date(userProfile.subscriptionExpiresAt).toLocaleDateString(undefined, { dateStyle: 'full' }) : 'N/A'}
                </span>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => navigate("/upgrade")}
                className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-950 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                Change or Extend Plan
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 mx-auto flex items-center justify-center text-zinc-400 text-2xl border border-zinc-200/60">
              🏷️
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-zinc-900">You don't have an active plan</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                Your account is currently on the free tier. Upgrade to weekly or monthly Pro access to unlock unlimited trip generation.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate("/Home/upgrade")}
                className="w-full py-4 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                Explore Pro Plans 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}