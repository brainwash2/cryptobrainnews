'use client';
import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = document.cookie.includes('cbn_consent=true');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    document.cookie = 'cbn_consent=true; max-age=31536000; path=/; SameSite=Lax';
    setVisible(false);
  };

  const decline = () => {
    document.cookie = 'cbn_consent=false; max-age=31536000; path=/; SameSite=Lax';
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[2000] bg-black border-t border-[#1a1a1a] px-4 py-4">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[10px] text-[#888] font-mono max-w-xl">
          We use cookies and analytics (Vercel Analytics, Microsoft Clarity) to improve your experience.
          By continuing, you consent to our{' '}
          <a href="/privacy" className="text-[#FABF2C] hover:underline">
            Privacy Policy
          </a>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={decline}
            className="border border-[#1a1a1a] text-[#555] hover:text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="bg-[#FABF2C] text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
