import React, { useState, useEffect, useRef } from 'react';
import { useFetcher, useNavigate } from 'react-router-dom';
import { account } from '../../appwrite/client'; // Import your Appwrite client account service

type ChatStep = 'DESTINATION' | 'DURATION' | 'BUDGET' | 'TRAVEL_STYLE' | 'READY';

interface TripConstraints {
  country: string;
  numberOfDays: number;
  budget: string;
  travelStyle: string;
  interests: string;
  groupType: string;
  userId: any;
}

const parseLocationInput = (input: any): string => {
  if (!input) return '';
  if (typeof input === 'string') return input;
  if (typeof input === 'object') {
    return input.city || input.country || input.name || input.destination || JSON.stringify(input);
  }
  return String(input);
};

export const TripConciergeChat: React.FC = () => {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [step, setStep] = useState<ChatStep>('DESTINATION');
  const [input, setInput] = useState('');
  const [constraints, setConstraints] = useState<TripConstraints>({
    country: '',
    numberOfDays: 3,
    budget: 'Moderate',
    travelStyle: 'Leisure',
    interests: 'Sightseeing & Culture',
    groupType: 'Solo',
    userId: null,
  });

  // Fetch the active user session directly on mount
  useEffect(() => {
    let isMounted = true;
    account.get()
      .then((user) => {
        if (isMounted && user.$id) {
          setConstraints((prev) => ({ ...prev, userId: user.$id }));
        }
      })
      .catch((err) => {
        console.error("No active session found:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: "Hey there! I'm Darwin, your personal AI travel companion. 🌍 Where are we jetting off to on your next adventure?" }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, fetcher.state]);

  const processUserAnswer = (answerText: any) => {
    const rawText = parseLocationInput(answerText);
    const userText = rawText.trim();
    if (!userText) return;

    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    setTimeout(() => {
      if (step === 'DESTINATION') {
        if (userText.length < 2 || /^[0-9]+$/.test(userText)) {
          setMessages((prev) => [
            ...prev,
            { sender: 'ai', text: "Hmm, that doesn't quite sound like a valid destination! 😅 Care to give me a proper city or country name?" }
          ]);
          return;
        }

        setConstraints((prev) => ({ ...prev, country: userText }));
        setStep('DURATION');
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: `Ooh, ${userText} is an absolute vibe! ✨ How many days are we planning to stay? (Drop a digit, e.g., 5)` }
        ]);

      } else if (step === 'DURATION') {
        const numbers = userText.match(/\d+/);
        const days = numbers ? parseInt(numbers[0], 10) : NaN;

        if (isNaN(days) || days <= 0) {
          setMessages((prev) => [
            ...prev,
            { sender: 'ai', text: "Oops! That doesn't look like a valid number of days. Try entering a clear digit like 3, 5, or 7! ⏳" }
          ]);
          return;
        }

        if (days > 30) {
          setMessages((prev) => [
            ...prev,
            { sender: 'ai', text: `Whoa, ${days} days is a massive journey! 🏔️ Let's keep this custom planner under a month—try a shorter duration.` }
          ]);
          return;
        }

        setConstraints((prev) => ({ ...prev, numberOfDays: days }));
        setStep('BUDGET');
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: `Got it—a solid ${days}-day escape. What's the wallet situation looking like? (e.g., Budget-friendly, Moderate, or Luxury)` }
        ]);

      } else if (step === 'BUDGET') {
        setConstraints((prev) => ({ ...prev, budget: userText }));
        setStep('TRAVEL_STYLE');
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: "Almost at the finish line! What's your main vibe or travel style? (e.g., Coastal chill, deep history, foodie tour, or outdoor adventure)" }
        ]);

      } else if (step === 'TRAVEL_STYLE') {
        const finalConstraints = { ...constraints, travelStyle: userText, interests: userText };

        if (!finalConstraints.userId) {
          setMessages((prev) => [
            ...prev,
            { sender: 'ai', text: "⚠️ Hang on! We are verifying your login session. Please try clicking or sending again in a brief second." }
          ]);
          setStep('TRAVEL_STYLE');
          return;
        }

        setConstraints(finalConstraints);
        setStep('READY');
        
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: "All cozy details locked in! 🚀 Handing this over to my neural engine to stitch together your custom itinerary..." }
        ]);

        fetcher.submit(finalConstraints, { method: 'POST', encType: 'application/json' });
      }
    }, 400);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    processUserAnswer(input);
  };

  useEffect(() => {
    const data = fetcher.data as { id?: string; error?: string } | undefined;
    if (data?.id) {
      navigate(`/Home/my-itinerary/${data.id}`);
    } else if (data?.error) {
      console.error("Trip creation failed:", data.error);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: `⚠️ Error building your trip: ${data.error}` }
      ]);
      setStep('TRAVEL_STYLE'); 
    }
  }, [fetcher.data, navigate]);

  const renderSuggestions = () => {
    if (step === 'DURATION') return ['3 Days', '5 Days', '7 Days', '10 Days'];
    if (step === 'BUDGET') return ['Backpacker / Budget', 'Moderate & Comfortable', 'High-end Luxury'];
    if (step === 'TRAVEL_STYLE') return ['Coastal & Chill', 'Historical & Culture', 'Nature & Adventure', 'Urban & Foodie'];
    return [];
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.08)] flex flex-col h-[85vh] sm:h-[620px] max-h-[800px] overflow-hidden font-sans">
      <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
            D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold tracking-tight text-white">Darwin AI</h4>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Personal Travel Concierge</p>
          </div>
        </div>
        <div className="text-[10px] font-mono bg-slate-800 text-emerald-400 border border-slate-700/60 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
          {step === 'READY' ? 'Generating...' : 'Live Session'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-slate-50/60 to-slate-50/20">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-end gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.sender === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mb-1 shadow-sm">
                D
              </div>
            )}
            <div className={`max-w-[80%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-xs leading-relaxed font-medium transition-all ${
              m.sender === 'user' 
                ? 'bg-slate-900 text-white rounded-br-xs shadow-md' 
                : 'bg-white border border-slate-200/80 text-slate-700 rounded-bl-xs shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
            }`}>
              {parseLocationInput(m.text)}
            </div>
          </div>
        ))}

        {fetcher.state === 'submitting' && (
          <div className="flex items-center gap-2.5 justify-start">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-sm">
              D
            </div>
            <div className="bg-white border border-slate-200/80 px-4 py-3 rounded-2xl text-xs text-slate-600 flex items-center gap-2.5 shadow-sm">
              <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <span className="font-semibold">Darwin is painting your custom itinerary...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {step !== 'READY' && renderSuggestions().length > 0 && (
        <div className="px-6 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {renderSuggestions().map((suggestion, i) => (
            <button
              key={i}
              type="button"
              onClick={() => processUserAnswer(suggestion)}
              className="text-[11px] font-medium bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 border border-slate-200/80 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {step !== 'READY' && (
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200/80 flex gap-2.5 items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message to Darwin..." 
            className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 shadow-inner"
          />
          <button 
            type="submit"
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center flex-shrink-0"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
};

export default TripConciergeChat;