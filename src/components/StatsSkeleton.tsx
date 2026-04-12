const StatsSkeleton = () => {
  // Common shimmer style to keep code clean
  const shimmerStyle = {
    animation: 'shimmer 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
    width: '200%'
  };

  return (
    <div className="w-full space-y-10 mt-4 animate-in fade-in duration-700">
      
      {/* 1. TOP STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative h-[160px] bg-white/50 backdrop-blur-xl border border-slate-200/60 rounded-[24px] p-6 overflow-hidden shadow-sm">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg]" style={shimmerStyle} />
            <div className="relative z-10 space-y-4">
              <div className="h-4 w-24 bg-slate-200/70 rounded-md animate-pulse" />
              <div className="h-9 w-32 bg-slate-300/40 rounded-lg animate-pulse" />
              <div className="pt-4 border-t border-slate-100/50">
                <div className="h-4 w-40 bg-slate-100 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. MAIN CONTENT & SIDEBAR SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LARGE GRID (Simulating your "Created Trips") */}
        <div className="xl:col-span-2 space-y-6">
          <div className="h-7 w-48 bg-slate-200/60 rounded-lg animate-pulse" /> {/* Section Title */}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[280px] bg-white border border-slate-100 rounded-[24px] overflow-hidden">
                {/* Image Placeholder */}
                <div className="h-40 bg-slate-100 animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg]" style={shimmerStyle} />
                </div>
                {/* Content Placeholder */}
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 bg-slate-200/70 rounded-md" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-6 w-16 bg-indigo-50/50 rounded-full" />
                    <div className="h-6 w-16 bg-slate-50 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR/ACTIVITY LIST (Simulating "Mapped Users" or Growth) */}
        <div className="space-y-6">
          <div className="h-7 w-32 bg-slate-200/60 rounded-lg animate-pulse" /> {/* Section Title */}
          
          <div className="bg-white/30 backdrop-blur-md border border-slate-200/50 rounded-[24px] p-6 space-y-6">
            {[1, 2, 3, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-200/60 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-slate-200/70 rounded-md" />
                  <div className="h-3 w-2/3 bg-slate-100 rounded-md" />
                </div>
              </div>
            ))}
            {/* Call to action placeholder */}
            <div className="h-12 w-full bg-indigo-500/10 rounded-xl mt-4 border border-indigo-100/50" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default StatsSkeleton;