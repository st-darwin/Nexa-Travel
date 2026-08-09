import { Sun, CloudSun, MapPin, ArrowUpRight } from "lucide-react";
import  { useNavigate } from "react-router-dom";    

interface DestinationCard {
  id: string;
  name: string;
  country: string;
  temp: number;
  condition: string;
  image: string;
  tag: string;
}


const WeatherRecommendations = ({ recommendations }: { recommendations: DestinationCard[] }) => {
  
  const navigate = useNavigate();
    const handleClick = () =>{
    // Navigate to the Browse Recommendations page
    navigate('/Home/browse-recommendations');
  }
  
    return (
    <section className="my-10 space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/60 text-[10px] font-bold text-amber-600 uppercase tracking-wider">
              <Sun className="w-3 h-3 text-amber-500 fill-amber-500" /> Perfect Weather Now
            </span>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
            Weather-Guided <span className="text-slate-400 font-light">Recommendations</span>
          </h3>
        </div>

        <button 
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
          onClick={handleClick}
        >
          Explore all <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Responsive Horizontal Grid / Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {recommendations.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 flex flex-col justify-between space-y-4"
          >
            {/* Top Bar: Location & Weather Badge */}
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> {item.country}
                </p>
                <h4 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {item.name}
                </h4>
              </div>

              {/* Minimal Weather Pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50/80 border border-amber-100 rounded-xl text-amber-700">
                <CloudSun className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-mono font-bold">{item.temp}°C</span>
              </div>
            </div>

            {/* Condition & Tag */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
              <span className="text-slate-500 font-medium">{item.condition}</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium text-[11px]">
                {item.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WeatherRecommendations;