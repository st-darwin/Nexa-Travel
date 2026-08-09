import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import {BROWSE_RECOMMENDATIONS, type RecommendationTrip } from "../../constants/recommendations";
import { Sun, MapPin, Clock, ArrowRight, Filter } from "lucide-react";

const BrowseRecommendations = () => {
  const navigate = useNavigate();
  const [selectedTag, setSelectedTag] = useState<string>("All");

  const tags = ["All", "Beach", "Luxury", "Culture", "Nature", "Wellness"];

  const filteredTrips = selectedTag === "All" 
    ? BROWSE_RECOMMENDATIONS 
    : BROWSE_RECOMMENDATIONS.filter(trip => trip.tags.includes(selectedTag));

  const handleSelectTrip = (trip: RecommendationTrip) => {
    // Navigate directly to the itinerary view passing the trip object in state
    // (skipping AI generation completely!)
    navigate(`/Home/my-itinerary/${trip.id}`, { state: { preloadedTrip: trip } });
  };

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      <UserHeader
        title="Curated Recommendations"
        description="Skip the prompt engineering. Browse hand-crafted itineraries curated for optimal weather, top ratings, and unforgettable vibes."
        ctaText="Back to AI Strategist"
        ctaUrl="/Home/strategist"
      />

      <section className="mt-8 max-w-6xl mx-auto px-4 space-y-6">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-500">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                selectedTag === tag
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => handleSelectTrip(trip)}
              className="group cursor-pointer bg-white rounded-3xl border border-slate-100 p-3 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image & Weather Tag */}
              <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src={trip.imageUrl}
                  alt={trip.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Weather Pill */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-amber-600 shadow-sm">
                  <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{trip.weatherTemp}</span>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg text-[11px] font-medium text-white">
                  <Clock className="w-3 h-3 text-slate-300" />
                  <span>{trip.duration} Days</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <MapPin className="w-3 h-3 text-indigo-500" />
                  <span>{trip.location}, {trip.country}</span>
                </div>

                <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {trip.name}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {trip.description}
                </p>
              </div>

              {/* Footer */}
              <div className="p-3 pt-0 flex items-center justify-between border-t border-slate-50 mt-2">
                <span className="text-xs font-mono font-semibold text-slate-700">
                  {trip.budget}
                </span>
                
                <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default BrowseRecommendations;