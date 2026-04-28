
import { calculateTrendPercentage } from '../lib/utils'

const StatsCard = ({ headerTitle, total, currentMonthCount, lastMonthCount } : StatsCard) => {
  const { trend, percentage } = calculateTrendPercentage(currentMonthCount, lastMonthCount)
  const isDecrement = trend === "decrement"

  return (
    <article className='stats-card p-6 bg-white border border-slate-100 rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300'>
      {/* Header */}
      <h3 className='text-slate-500 text-sm font-medium mb-4 tracking-tight'>
        {headerTitle}
      </h3>
     
      <div className='flex items-end justify-between gap-4'>
        <div className='flex flex-col gap-2'>
          {/* Main Figure */}
          <h2 className='text-3xl font-bold text-slate-900 tracking-tight'>
            {total}
          </h2>

          {/* Trend Indicator */}
          <div className='flex items-center gap-2 bg-slate-50/50 w-fit px-2 py-1 rounded-full'>
                  
            <figure className='flex  items-center gap-1'>

              <img
                className='size-4'
                src={`/assets/icons/${isDecrement ? "arrow-down-red.svg" : "arrow-up-green.svg"}`} 
                alt="arrow" 
              />
              <figcaption className={`${isDecrement ? "text-red-500" : "text-green-600"} text-xs font-semibold`}>
                {Math.round(percentage)}% 
              </figcaption>
            </figure>
            <span className='text-[10px]  xl:text-[0.5ururem] text-slate-400 font-medium  uppercase tracking-wider'>vs last month</span>
            
          </div>
        </div>

        {/* The Chart/Graph Section */}
        <div className='w-24 h-16 flex items-end'>
          <img
            className='w-full h-auto object-contain opacity-80 hover:opacity-100 transition-opacity'
            src={`/assets/icons/${isDecrement ? "decrement.svg" : "increment.svg"}`} 
            alt="trend-graph" 
          />
        </div>
      </div>
    </article>
  )
}

export default StatsCard
