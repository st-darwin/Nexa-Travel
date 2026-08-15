import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import { account, database } from "../../appwrite/client";
import { usePaystackPayment } from "react-paystack";
import { Query } from "appwrite";

export default function UpgradePage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Modal state for viewing active plan
  const [showActivePlanModal, setShowActivePlanModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);


  // Fetch current user and profile on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
        fetchUserProfile(currentUser.$id);
      } catch (err) {
        navigate("/sign-in");
      }
    }
    fetchUser();
  }, [navigate]);

  async function fetchUserProfile(accountId: string) {
    try {
      const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID || "database_id";
      const usersCollectionId = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID || "users";
      
      const response = await database.listDocuments(
        databaseId,
        usersCollectionId,
        [Query.equal("accountId", accountId)]
      );

      if (response.documents.length > 0) {
        setUserProfile(response.documents[0]);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  }

  const amountInNaira = selectedPlan === "weekly" ? 2000 : 8000;

  // Paystack Configuration (Amount must be in Kobo: Naira * 100)
  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: user?.email || "user@example.com",
    amount: amountInNaira * 100, 
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_your_public_key_here",
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  // Handle successful payment & update Appwrite database
const handleSuccess = async (reference: any) => {
    setLoading(true);
    try {
      const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID || "database_id";
      const usersCollectionId = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID || "users";

      // Calculate expiration date
      const expiresAt = new Date();
      if (selectedPlan === "weekly") {
        expiresAt.setDate(expiresAt.getDate() + 7);
      } else {
        expiresAt.setDate(expiresAt.getDate() + 30);
      }

      // Find user profile document in Appwrite
      const profileResponse = await database.listDocuments(
        databaseId,
        usersCollectionId,
        [Query.equal("accountId", user.$id)]
      );

      if (profileResponse.documents.length > 0) {
        const docId = profileResponse.documents[0].$id;
        const updatedDoc = await database.updateDocument(databaseId, usersCollectionId, docId, {
          subscriptionType: selectedPlan,
          subscriptionExpiresAt: expiresAt.toISOString(),
          subscriptionStatus: "active",
          isPro: true, 
        });
        setUserProfile(updatedDoc);
      }

      alert("Payment successful! Your Nexa Pro subscription is now active 🌟");
      setShowActivePlanModal(true);
    } catch (dbErr) {
      console.error("Failed to update subscription status in database:", dbErr);
      setError("Payment was successful, but we failed to update your account automatically. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    console.log("Payment modal closed by user.");
    setLoading(false);
  };

  const handleSubscribe = () => {
    if (!user) {
      navigate("/sign-in");
      return;
    }
    setError(null);
    setLoading(true);
    
    initializePayment({
      onSuccess: (ref) => handleSuccess(ref),
      onClose: handleClose,
    });
  };

  // Check if current plan is active
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <UserHeader
          title="Upgrade to Nexa Pro Membership"
          description="Unlock unlimited AI itinerary generations, priority route routing, and zero daily restrictions."
          ctaText="Back to Dashboard"
          ctaUrl="/Home"
        />
        <button
          type="button"
          onClick={() => setShowActivePlanModal(true)}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-900 font-mono text-xs font-bold hover:bg-zinc-100 transition-all shadow-xs cursor-pointer"
        >
          View Active Plan 🔍
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Pro Benefits Grid */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center font-bold">
              ∞
            </div>
            <h4 className="font-semibold text-zinc-900 text-sm">Unlimited Generations</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Generate as many customized travel itineraries as you want without hitting the daily 3-trip cap.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center font-bold">
              ⚡
            </div>
            <h4 className="font-semibold text-zinc-900 text-sm">Priority AI Processing</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Bypass server queues with lightning-fast routing synthesis and deep-learning recommendations.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center font-bold">
              🛡️
            </div>
            <h4 className="font-semibold text-zinc-900 text-sm">VIP Support & Perks</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Get early access to experimental travel telemetry tools, flight tracking upgrades, and live concierge support.
            </p>
          </div>
        </div>

        {/* Pricing Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          {/* Weekly Plan Card */}
          <div
            onClick={() => setSelectedPlan("weekly")}
            className={`cursor-pointer rounded-3xl p-6 sm:p-8 border transition-all flex flex-col justify-between relative bg-white ${
              selectedPlan === "weekly"
                ? "border-zinc-900 ring-2 ring-zinc-900/10 shadow-md"
                : "border-zinc-200/80 hover:border-zinc-300"
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                  Flex Pass
                </span>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === "weekly" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300"}`}>
                  {selectedPlan === "weekly" && <span className="text-[10px]">✓</span>}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-zinc-900">Weekly Access</h3>
                <p className="text-xs text-zinc-500 mt-1">Perfect for short trips and quick getaway planning.</p>
              </div>

              <div className="pt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold font-mono text-zinc-900">₦2,000</span>
                <span className="text-xs font-mono text-zinc-400">/ week</span>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100 mt-6 text-xs text-zinc-500 font-mono space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> Full unlimited AI routes for 7 days
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> Cancel or change anytime
              </div>
            </div>
          </div>

          {/* Monthly Plan Card (Best Value) */}
          <div
            onClick={() => setSelectedPlan("monthly")}
            className={`cursor-pointer rounded-3xl p-6 sm:p-8 border transition-all flex flex-col justify-between relative bg-zinc-950 text-white ${
              selectedPlan === "monthly"
                ? "border-amber-500/80 ring-2 ring-amber-500/20 shadow-xl"
                : "border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="absolute top-6 right-6">
              <span className="px-2.5 py-1 bg-amber-500 text-zinc-950 font-mono text-[9px] font-extrabold uppercase tracking-widest rounded-full">
                Best Value 🌟
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                  Pro Member
                </span>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === "monthly" ? "border-amber-400 bg-amber-400 text-zinc-950" : "border-zinc-700"}`}>
                  {selectedPlan === "monthly" && <span className="text-[10px] font-bold">✓</span>}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Monthly Workspace</h3>
                <p className="text-xs text-zinc-400 mt-1">Maximum savings for frequent travelers and digital nomads.</p>
              </div>

              <div className="pt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold font-mono text-white">₦8,000</span>
                <span className="text-xs font-mono text-zinc-400">/ month</span>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800 mt-6 text-xs text-zinc-400 font-mono space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">✓</span> Unlimited AI generations all month
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">✓</span> Save over 30% compared to weekly pass
              </div>
            </div>
          </div>

        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium flex items-center justify-between gap-2">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-bold">✕</button>
          </div>
        )}

        {/* Action Checkout Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubscribe}
            className="w-full py-4 px-8 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-sm font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Initializing Secure Checkout...</span>
            ) : (
              <span>Pay ₦{amountInNaira.toLocaleString()} via Paystack</span>
            )}
          </button>
          <p className="text-center text-[11px] text-zinc-400 font-mono mt-3">
            Secure payments processed via Paystack. Subscription activates instantly upon confirmation.
          </p>
        </div>

      </div>

      {/* Active Plan Popup Modal */}
      {showActivePlanModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
            <button
              type="button"
              onClick={() => setShowActivePlanModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                Subscription Status
              </span>
              <h3 className="text-xl font-bold text-zinc-900">Your Active Plan</h3>
            </div>

            {hasActivePlan() ? (
              <div className="bg-zinc-900 text-white rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-amber-400 text-zinc-950 font-mono text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                    {userProfile.subscriptionType.toUpperCase()} PRO ACTIVE ✨
                  </span>
                  <span className="text-xs font-mono text-emerald-400">● Live</span>
                </div>
                <div className="space-y-1 text-xs font-mono text-zinc-300">
                  <p>Plan Type: <strong className="text-white capitalize">{userProfile.subscriptionType} Access</strong></p>
                  <p>Expires On: <strong className="text-white">{new Date(userProfile.subscriptionExpiresAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</strong></p>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-zinc-200/60 mx-auto flex items-center justify-center text-zinc-500 text-lg">
                  🔒
                </div>
                <h4 className="font-bold text-zinc-900 text-sm">You don't have an active plan</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Upgrade to Nexa Pro to unlock unlimited AI itineraries and premium travel routing features.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowActivePlanModal(false);
                  navigate("/Home/ViewActivePlan");
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-mono text-xs font-bold transition-all cursor-pointer"
              >
                Open Full View ↗
              </button>
              <button
                type="button"
                onClick={() => setShowActivePlanModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}