import { useState, useEffect } from 'react';

export const usePaystack = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if script already exists in document body
    if (window.hasOwnProperty('PaystackPop')) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;

    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => console.error('Paystack SDK failed to initialize.');

    document.body.appendChild(script);

    return () => {
      // Clean up script if component unmounts entirely
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return isScriptLoaded;
};