
// ai planner 
import { ComboBoxComponent } from "@syncfusion/ej2-react-dropdowns";
import { useLoaderData, useNavigate } from "react-router-dom";
import UserHeader from "../../components/UserHeader"
import { useState , useEffect } from "react";
import { useFetcher } from "react-router-dom";
import { account } from "../../appwrite/client";
export const loader = async () => {
  // 1. Ask for ALL the fields you plan to use in your .map()
  const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flag,latlng,maps');
  
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  

  // converts the response to json format and then we can use it in our component
  const data = await res.json();

  // 2. Format the data once here. 
  // Syncfusion fields 'text' and 'value' are standard names to use.

  // return an object that has the coutry name , value and cooredinates 
  return data.map((country: any) => ({
    text: `${country.flag} ${country.name.common}`,
    value: country.cca2,
    coordinates: country.latlng,
    openStreetmap: country.maps?.openStreetMap
  })).sort((a: any, b: any) => a.text.localeCompare(b.text)); // Sort A-Z
}


const AIStrategist = () => {
  const countries = useLoaderData() as any[];
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [error, setError] = useState<string | null>(null);
  const [formData , setFormData] = useState({
     country: "",
    travelStyle: "",
    interest: "",
    budget: "",
    duration: 0,
    groupType: "",
   // initial form data state, can be empty or have default values


  })
    
   const selectedCountry = countries.find((c: any) => c.value === formData.country);

     useEffect(() => {
       // if darta gotten from the ai response is ready...navigate to the trip details
       if (fetcher.data?.id) {
         navigate(`/trips/${fetcher.data.id}`);
       } else if (fetcher.data?.error) {
         setError(fetcher.data.error);
       }
     }, [fetcher.data, navigate]);

      const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if(
      !formData.country || !formData.budget ||
       !formData.duration || !formData.groupType ||
       !formData.interest|| !formData.travelStyle
    ){ 
      setError("Please the provide the values of all fields..")
      return; 
    }

    if(formData.duration < 1 || formData.duration > 10 ){
      setError("Duration must be between 1 - 10 days ! ")
      return ;
    } 
    
    setError(null)

    try {
      // gets the current session
      const user = await account.get()
      
      if(!user.$id) {
        setError("This user is not authenticated")
        return;
      }

      // Submit to the Route Action instead of manual fetch
      fetcher.submit(
        {
          country: formData.country,
          numberOfDays: formData.duration,
          travelStyle: formData.travelStyle,
          interests: formData.interest, // Mapping singular to plural for the action
          budget: formData.budget,
          groupType: formData.groupType,
          userId: user.$id, // userId was submitted in the action, now we get it from the session and pass it along with the form data
          email: user.email,
        name: user.name,

        },
        { method: "post", encType: "application/json" }
      );

    } catch(err) {
      console.log("Auth error :" , err)
      setError("Authentication failed. Please log in again.")
    }
  }

   // to handle change on the combo box 
   // update the the value of the form data 
   const handleChange = ( key : keyof TripFormData , value : string | number) =>{
    setFormData((prev) => ({...prev , [key]:value}))
  }
    const mapData = [
    {
        country: selectedCountry ? selectedCountry.text.split(' ').slice(1).join(' ') : '',
        color : '#1E90FF',
        coordinatess : selectedCountry?.coordinates || []
    }
  ]

  return (
    <div>
     <UserHeader
     title="Personalized AI Strategist"
      description="Transform raw intent into curated journeys. Nexa leverages deep-learning to synthesize routes, budgets, and experiences in real-time."
      ctaText="view Trip Archive"
      ctaUrl="/Home/archive"
     />

     <section className="mt-4 xl:mt-10 wrapper-md">
      <form className="trip-form" onSubmit={handleSubmit}>
     
                 {/* COMBO BOX  FOR COUNTRY*/}
               <div className="flex flex-col gap-2">
               
                 <label htmlFor="country" className="font-semibold text-slate-700">
                   Country
                 </label>
                 <ComboBoxComponent
                   id="country"
                   dataSource={countries} 
                   fields={{ text: 'text', value: 'value' }}
                   placeholder='Select a country'
                   className="combo-box"
                   cssClass="e-soft-custom"
                   change={(e : {value:string | undefined}) =>{
                     if(e.value){
                         handleChange('country' , e.value )
                     }
                   } }
                    allowFiltering={true}
                    filtering={(e) =>{
                     const query = e.text.toLowerCase();
                     e.updateData(
                       // filter the coutries then matches with the query(in smalls lettes )then return the text and value of the matched country to be shown in the combo box
                      countries.filter((c: any) => c.text.toLowerCase().includes(query)).map((c: any) => ({ text: c.text, value: c.value }))
                     )
                    }}
                 />
               </div>
                {/*Duration */}
               <div>
                    <label htmlFor="duration" className="font-semibold text-slate-700">
                   Duration
                 </label>
                 <input
                   id="duration"
                   name="duration"
                   className="form-input placeholder:text-gray-100"
                   onChange={(e) => handleChange("duration", Number(e.target.value))}
                   type="number"
                   placeholder='Enter the number of days...'
                 />

               </div>

      </form>
     </section>




     




    </div>
  )
}

export default AIStrategist
