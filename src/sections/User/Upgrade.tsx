import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import { account } from "../../appwrite/client";

export default function UpgradePage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = await account.get();
      if (!user) {
        navigate("/login");
        return;
      }

      const amount = selectedPlan === "weekly" ? 2000 : 8000;
      
      console.log(`Initiating upgrade for ${user.email} - Plan: ${selectedPlan} (${amount} NGN)`);


      setTimeout(() => {
        setLoading(false);
        alert(`Redirecting to secure payment for ₦${amount.toLocaleString()}...`);
      }, 1000);

    } catch (err) {
      console.error("Subscription error:", err);
      setError("Unable to initialize payment session. Please log in again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50/50 p-4 sm:p-6 md:p-10 space-y-6 md:space-y-8 antialiased selection:bg-zinc-900 selection:text-white">
      <UserHeader
        title="Upgrade to Nexa Pro 🌟"
        description="Unlock unlimited AI itinerary generations, priority route routing, and zero daily restrictions."
        ctaText="Back to Dashboard"
        ctaUrl="/Home"
      />

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
              <span>Preparing Secure Checkout...</span>
            ) : (
              <span>Proceed to Payment (₦{selectedPlan === "weekly" ? "2,000" : "8,000"})</span>
            )}
          </button>
          <p className="text-center text-[11px] text-zinc-400 font-mono mt-3">
            Secure payments processed via Paystack. Subscription activates instantly upon confirmation.
          </p>
        </div>

      </div>
    </main>
  );
}