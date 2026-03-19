import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChipListComponent, ChipsDirective, ChipDirective } from '@syncfusion/ej2-react-buttons';
import { cn, getFirstWord } from '../lib/utils';


const TripCard = ({id , name , location , imgUrl , tags , price}: TripCardProps) => {
   const path = useLocation()
  return (

   
  <Link 
   className='trip-card'
  to={ path.pathname === "/" || path.pathname === "/travel" ? `/travel/${id}` : `/trips${id}`}>
  <img src={imgUrl} alt={name} 
    
  />
  <article>
    <h2>{name}</h2>
    <figure>
      <img src="/assets/icons/location-mark.svg" className='size-4' alt="location" />
      <figcaption>{location}</figcaption>
    </figure>
  </article>

    {/* TAGS */}
   <div className='mt-5 pl-[18px] pr-3.5 pb-5' >
   <ChipListComponent id="travel-chip" >
       <ChipsDirective>
        {tags.map((tag , index)=>(
          <ChipDirective
          key={index}
          text={getFirstWord(tag)}
          cssClass={cn(index===1 ? "!bg-pink-50 !text-pink-500" : "!bg-success-50 !text-success-700" )}
          />

         
        ))}
       </ChipsDirective>

   </ChipListComponent>
   </div>
        <article className='tripCard-pill'>
           {price}

        </article>
    


  </Link>
  )
}

export default TripCard
