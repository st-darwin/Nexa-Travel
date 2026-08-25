import React, { useState, useEffect, useRef } from 'react';
import { useFetcher, useNavigate } from 'react-router-dom';
import { account, appwriteConfig, database } from '../../appwrite/client';
import { Query } from 'appwrite';
import { Lock } from 'lucide-react';

type ChatStep =
  | 'DESTINATION'
  | 'DURATION'
  | 'BUDGET'
  | 'TRAVEL_STYLE'
  | 'READY'
  | 'LIMIT_REACHED';

interface TripConstraints {
  country: string;
  numberOfDays: number;
  budget: string;
  travelStyle: string;
  interests: string;
  groupType: string;
  userId: string | null;
}

interface UserDocument {
  $id: string;
  accountId: string;
  subscriptionStatus?: string;
  generationsToday?: number;
  lastGenerationDate?: string;
  itineraryCreated?: number;
}

interface FetcherData {
  id?: string;
  error?: string;
}

const FREE_LIMIT = 3;

const getTodayUTC = (): string => {
  return new Date().toISOString().split('T')[0];
};

const parseLocationInput = (input: unknown): string => {
  if (!input) return '';

  if (typeof input === 'string') {
    return input;
  }

  if (typeof input === 'object' && input !== null) {
    const location = input as Record<string, unknown>;

    return String(
      location.city ??
        location.country ??
        location.name ??
        location.destination ??
        JSON.stringify(location)
    );
  }

  return String(input);
};

export const TripConciergeChat: React.FC = () => {
  const navigate = useNavigate();
  const fetcher = useFetcher<FetcherData>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<ChatStep>('DESTINATION');
  const [input, setInput] = useState('');
  const [isPro, setIsPro] = useState(false);
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  const [constraints, setConstraints] = useState<TripConstraints>({
    country: '',
    numberOfDays: 3,
    budget: 'Moderate',
    travelStyle: 'Leisure',
    interests: 'Sightseeing & Culture',
    groupType: 'Solo',
    userId: null,
  });

  const [messages, setMessages] = useState<
    Array<{ sender: 'ai' | 'user'; text: string }>
  >([
    {
      sender: 'ai',
      text: "Hey there! I'm Darwin, your personal AI travel companion. 🌍 Where are we jetting off to on your next adventure?",
    },
  ]);

  /**
   * Load user/profile information and determine today's actual usage.
   */
  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        setIsCheckingUser(true);

        const user = await account.get();

        if (!isMounted || !user.$id) {
          return;
        }

        setConstraints((prev) => ({
          ...prev,
          userId: user.$id,
        }));

        const response = await database.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          [Query.equal('accountId', user.$id)]
        );

        if (!isMounted) return;

        if (response.documents.length === 0) {
          console.warn('No user document found for account ID:', user.$id);
          return;
        }

        const userDoc = response.documents[0] as unknown as UserDocument;

        const activePro = userDoc.subscriptionStatus === 'active';
        const today = getTodayUTC();

        /**
         * IMPORTANT:
         * If the saved lastGenerationDate is not today,
         * today's usage must be treated as 0.
         */
        const usedToday =
          userDoc.lastGenerationDate === today
            ? Number(userDoc.generationsToday || 0)
            : 0;

        setIsPro(activePro);
        setGenerationsUsed(usedToday);

        if (!activePro && usedToday >= FREE_LIMIT) {
          setStep('LIMIT_REACHED');

          setMessages((prev) => {
            const alreadyShown = prev.some(
              (message) =>
                message.sender === 'ai' &&
                message.text.includes('free limit')
            );

            if (alreadyShown) {
              return prev;
            }

            return [
              ...prev,
              {
                sender: 'ai',
                text: `⚠️ You've hit your free limit of ${FREE_LIMIT} itinerary generations for today! Upgrade to Nexa Pro to continue chatting with Darwin.`,
              },
            ];
          });
        }
      } catch (error) {
        console.error(
          'Failed to fetch user session or profile data:',
          error
        );

        if (isMounted) {
          setMessages((prev) => [
            ...prev,
            {
              sender: 'ai',
              text: '⚠️ We could not verify your account right now. Please refresh and try again.',
            },
          ]);
        }
      } finally {
        if (isMounted) {
          setIsCheckingUser(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Auto-scroll chat.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, fetcher.state]);

  /**
   * Handle server responses.
   */
  useEffect(() => {
    const data = fetcher.data;

    if (!data) return;

    if (data.id) {
      navigate(`/Home/my-itinerary/${data.id}`);
      return;
    }

    if (data.error) {
      console.error('Trip creation failed:', data.error);

      const isLimitError =
        fetcher.state === 'idle' &&
        (data.error.toLowerCase().includes('limit') ||
          data.error.toLowerCase().includes('quota'));

      if (isLimitError) {
        setStep('LIMIT_REACHED');
        setGenerationsUsed(FREE_LIMIT);

        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text:
              data.error ||
              `⚠️ You've reached your ${FREE_LIMIT}-itinerary daily limit.`,
          },
        ]);

        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ Error building your trip: ${data.error}`,
        },
      ]);

      setStep('TRAVEL_STYLE');
    }
  }, [fetcher.data, fetcher.state, navigate]);

  /**
   * Process each user answer.
   */
  const processUserAnswer = (answerText: unknown) => {
    if (step === 'LIMIT_REACHED') {
      navigate('/Home/upgrade');
      return;
    }

    // Prevent another submission while the trip is being generated.
    if (step === 'READY' || fetcher.state !== 'idle') {
      return;
    }

    const rawText = parseLocationInput(answerText);
    const userText = rawText.trim();

    if (!userText) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: userText,
      },
    ]);

    setInput('');

    setTimeout(() => {
      if (step === 'DESTINATION') {
        if (userText.length < 2 || /^[0-9]+$/.test(userText)) {
          setMessages((prev) => [
            ...prev,
            {
              sender: 'ai',
              text: "Hmm, that doesn't quite sound like a valid destination! 😅 Care to give me a proper city or country name?",
            },
          ]);
          return;
        }

        setConstraints((prev) => ({
          ...prev,
          country: userText,
        }));

        setStep('DURATION');

        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `Ooh, ${userText} is an absolute vibe! ✨ How many days are we planning to stay? (Drop a digit, e.g., 5)`,
          },
        ]);

        return;
      }

      if (step === 'DURATION') {
        const numbers = userText.match(/\d+/);
        const days = numbers ? parseInt(numbers[0], 10) : NaN;

        if (Number.isNaN(days) || days <= 0) {
          setMessages((prev) => [
            ...prev,
            {
              sender: 'ai',
              text: "Oops! That doesn't look like a valid number of days. Try entering a clear digit like 3, 5, or 7! ⏳",
            },
          ]);
          return;
        }

        if (days > 30) {
          setMessages((prev) => [
            ...prev,
            {
              sender: 'ai',
              text: `Whoa, ${days} days is a massive journey! 🏔️ Let's keep this custom planner under a month—try a shorter duration.`,
            },
          ]);
          return;
        }

        setConstraints((prev) => ({
          ...prev,
          numberOfDays: days,
        }));

        setStep('BUDGET');

        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `Got it—a solid ${days}-day escape. What's the wallet situation looking like? (e.g., Budget-friendly, Moderate, or Luxury)`,
          },
        ]);

        return;
      }

      if (step === 'BUDGET') {
        setConstraints((prev) => ({
          ...prev,
          budget: userText,
        }));

        setStep('TRAVEL_STYLE');

        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: "Almost at the finish line! What's your main vibe or travel style? (e.g., Coastal chill, deep history, foodie tour, or outdoor adventure)",
          },
        ]);

        return;
      }

      if (step === 'TRAVEL_STYLE') {
        const finalConstraints: TripConstraints = {
          ...constraints,
          travelStyle: userText,
          interests: userText,
        };

        if (!finalConstraints.userId) {
          setMessages((prev) => [
            ...prev,
            {
              sender: 'ai',
              text: '⚠️ Hang on! We are still verifying your login session. Please try again.',
            },
          ]);

          setStep('TRAVEL_STYLE');
          return;
        }

        /**
         * UI-side quota check.
         *
         * The backend is still the real authority.
         * This just prevents obviously unnecessary requests.
         */
        if (!isPro && generationsUsed >= FREE_LIMIT) {
          setStep('LIMIT_REACHED');

          setMessages((prev) => [
            ...prev,
            {
              sender: 'ai',
              text: `⚠️ You've reached your free limit of ${FREE_LIMIT} itinerary generations for today.`,
            },
          ]);

          return;
        }

        setConstraints(finalConstraints);
        setStep('READY');

        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: "All cozy details locked in! 🚀 Handing this over to my neural engine to stitch together your custom itinerary...",
          },
        ]);

        fetcher.submit(finalConstraints, {
          method: 'POST',
          encType: 'application/json',
        });
      }
    }, 400);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    processUserAnswer(input);
  };

  const renderSuggestions = () => {
    if (step === 'LIMIT_REACHED') {
      return ['✨ Upgrade to Pro Now'];
    }

    if (step === 'DURATION') {
      return ['3 Days', '5 Days', '7 Days', '10 Days'];
    }

    if (step === 'BUDGET') {
      return [
        'Backpacker / Budget',
        'Moderate & Comfortable',
        'High-end Luxury',
      ];
    }

    if (step === 'TRAVEL_STYLE') {
      return [
        'Coastal & Chill',
        'Historical & Culture',
        'Nature & Adventure',
        'Urban & Foodie',
      ];
    }

    return [];
  };

  const isSubmitting = fetcher.state !== 'idle';

  return (
    <div className="w-full max-w-xl mx-auto bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.07)] flex flex-col h-[85vh] sm:h-[640px] max-h-[820px] overflow-hidden font-sans">
      {/* SaaS Header */}
      <div className="bg-black px-6 py-4.5 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center font-black text-xs tracking-wider shadow-sm">
            D
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold tracking-tight text-white">
                Darwin AI
              </h4>

              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>

            <p className="text-[10px] text-slate-400 font-medium">
              {isPro
                ? 'Pro Assistant 🌟'
                : `Free Tier (${generationsUsed}/${FREE_LIMIT} used)`}
            </p>
          </div>
        </div>

        <div className="text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800 px-3.5 py-1.5 rounded-full uppercase tracking-wider font-semibold">
          {step === 'READY'
            ? 'Generating...'
            : isPro
              ? 'Pro Session'
              : 'Free Session'}
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/30">
        {isCheckingUser && (
          <div className="flex items-center gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-sm">
              D
            </div>

            <div className="bg-white border border-slate-200/80 px-4 py-3 rounded-2xl text-xs text-slate-700 shadow-sm">
              Checking your daily itinerary allowance...
            </div>
          </div>
        )}

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-end gap-2.5 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mb-1 shadow-sm">
                D
              </div>
            )}

            <div
              className={`max-w-[80%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-xs leading-relaxed font-normal transition-all ${
                m.sender === 'user'
                  ? 'bg-black text-white rounded-br-none shadow-md'
                  : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none shadow-[0_4px_12px_rgba(0,0,0,0.03)]'
              }`}
            >
              {parseLocationInput(m.text)}
            </div>
          </div>
        ))}

        {isSubmitting && step === 'READY' && (
          <div className="flex items-center gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-sm">
              D
            </div>

            <div className="bg-white border border-slate-200/80 px-4 py-3 rounded-2xl text-xs text-slate-700 flex items-center gap-3 shadow-sm">
              <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span className="font-medium tracking-tight">
                Darwin is painting your custom itinerary...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      {renderSuggestions().length > 0 && (
        <div className="px-6 py-3 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {renderSuggestions().map((suggestion, i) => (
            <button
              key={i}
              type="button"
              disabled={isCheckingUser || isSubmitting}
              onClick={() => {
                if (step === 'LIMIT_REACHED') {
                  navigate('/Home/upgrade');
                } else {
                  processUserAnswer(suggestion);
                }
              }}
              className="text-[11px] font-medium bg-slate-100 hover:bg-black hover:text-white text-slate-700 border border-slate-200/60 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer active:scale-95 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      {step !== 'READY' && step !== 'LIMIT_REACHED' && (
        <form
          onSubmit={handleSend}
          className="p-4 sm:p-5 bg-white border-t border-slate-200/70 flex gap-2.5 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isCheckingUser || isSubmitting}
            placeholder="Type your message to Darwin..."
            className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:border-black focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 shadow-inner disabled:opacity-60"
          />

          <button
            type="submit"
        /*    disabled={
              isCheckingUser ||
              isSubmitting ||
              !input.trim()
            }  */
            className="px-6 py-3.5 bg-black hover:bg-slate-800 text-white text-xs font-semibold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      )}

      {/* Limit Banner */}
      {step === 'LIMIT_REACHED' && (
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />

            <span className="text-xs font-medium">
              Free limit reached
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/Home/upgrade')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Upgrade Plan
          </button>
        </div>
      )}
    </div>
  );
};

export default TripConciergeChat;