import { Link } from 'react-router-dom';
import { ChipListComponent, ChipsDirective, ChipDirective } from '@syncfusion/ej2-react-buttons';
import { cn, getFirstWord } from '../lib/utils';

const UserTripCard = ({ id, name, location, imgUrl, tags, price }: TripCardProps) => {
  return (
    <Link 
      to={`/Home/my-itinerary/${id}`}
      className='group relative flex flex-col overflow-hidden rounded-[24px] bg-white/70 p-3 backdrop-blur-xl transition-all duration-500 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/20'
    >
      {/* IMAGE CONTAINER */}
      <div className="relative h-48 w-full overflow-hidden rounded-[18px]">
        <img 
          src={imgUrl} 
          alt={name} 
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* FLOATING PRICE PILL */}
        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-gray-800 backdrop-blur-md shadow-sm">
          {price}
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-2 pt-4 pb-2">
        <article className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
            {name}
          </h2>
          <figure className="flex items-center gap-1.5 opacity-60">
            <img src="/assets/icons/location-mark.svg" className="size-3.5" alt="location" />
            <figcaption className="text-xs font-medium">{location}</figcaption>
          </figure>
        </article>

        {/* TAGS (SYNCFUSION CHIPS) */}
        <div className="mt-4 overflow-hidden">
          <ChipListComponent id={`trip-chip-${id}`} enableDelete={false}>
            <ChipsDirective>
              {tags.map((tag, index) => (
                <ChipDirective
                  key={index}
                  text={getFirstWord(tag)}
                  cssClass={cn(
                    "custom-chip",
                    index === 1 
                      ? "!bg-pink-100/50 !text-pink-600 border-none" 
                      : "!bg-blue-100/50 !text-blue-600 border-none"
                  )}
                />
              ))}
            </ChipsDirective>
          </ChipListComponent>
        </div>
      </div>
    </Link>
  );
};

export default UserTripCard;