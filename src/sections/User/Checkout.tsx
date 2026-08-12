import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createDuffelOrder } from '../../appwrite/Trips';

export const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flight } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [passenger, setPassenger] = useState({
    first_name: '',
    last_name: '',
    gender: 'm',
    born_on: '1995-06-15',
    email: '',
    phone_number: '+2348012345678',
  });

  if (!flight) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xs font-bold uppercase tracking-wider mb-2">No Flight Selected</h2>
        <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl">
          Back to Search
        </button>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPassenger((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderResult = await createDuffelOrder(flight.offerId, passenger);
      alert(`Booking Confirmed! PNR Reference: ${orderResult.bookingReference}`);
      navigate('/Home');
    } catch (err: any) {
      alert(err.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-[2.5rem] shadow-sm p-6 sm:p-8 font-sans my-6">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-sm font-bold text-black uppercase tracking-wider">Passenger Manifest Checkout</h2>
        <p className="text-xs text-slate-500 mt-0.5">Finalizing seat reservation with {flight.airlineName}.</p>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl mb-6 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase">Carrier</span>
          <span className="font-bold text-black">{flight.airlineName}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase">Total Payable</span>
          <span className="font-bold text-black">${flight.totalPriceToPay.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleCheckoutSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">First Name (As on ID)</label>
            <input 
              type="text" 
              name="first_name" 
              required
              value={passenger.first_name}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Last Name</label>
            <input 
              type="text" 
              name="last_name" 
              required
              value={passenger.last_name}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Gender</label>
            <select 
              name="gender" 
              value={passenger.gender}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-black"
            >
              <option value="m">Male</option>
              <option value="f">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Date of Birth</label>
            <input 
              type="date" 
              name="born_on" 
              required
              value={passenger.born_on}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Email Address</label>
          <input 
            type="email" 
            name="email" 
            required
            value={passenger.email}
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-black"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-3.5 bg-black hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Issuing Ticket Order...</span>
            </>
          ) : (
            'Confirm & Issue Ticket'
          )}
        </button>
      </form>
    </div>
  );
};

export default Checkout;