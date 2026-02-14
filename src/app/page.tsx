"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

// Tikkie checkmark icon
const TikkieIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" fill="white">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

// Apple logo
const AppleLogo = () => (
  <svg viewBox="0 0 384 512" className="h-4" fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-90.9zm-56.6-176.1c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
);

// Google G logo
const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="h-4">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const PixelHeart3D = () => {
  const [rotationY, setRotationY] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotationY(r => r + 2);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const heartSVG = (color: string, highlight?: boolean) => (
    <svg
      width="64"
      height="58"
      viewBox="0 0 11 9"
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="1" y="0" width="3" height="1" fill={color}/>
      <rect x="6" y="0" width="3" height="1" fill={color}/>
      <rect x="0" y="1" width="5" height="1" fill={color}/>
      {highlight && <rect x="1" y="1" width="1" height="1" fill="#ff7090"/>}
      <rect x="6" y="1" width="5" height="1" fill={color}/>
      <rect x="0" y="2" width="11" height="2" fill={color}/>
      <rect x="1" y="4" width="9" height="1" fill={color}/>
      <rect x="2" y="5" width="7" height="1" fill={color}/>
      <rect x="3" y="6" width="5" height="1" fill={color}/>
      <rect x="4" y="7" width="3" height="1" fill={color}/>
      <rect x="5" y="8" width="1" height="1" fill={color}/>
    </svg>
  );

  return (
    <div className="mb-6 select-none" style={{ perspective: "300px" }}>
      <div
        style={{
          width: 64,
          height: 58,
          position: "relative",
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotationY}deg)`,
        }}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              transform: `translateZ(${i - 4}px)`,
              opacity: i === 7 ? 1 : i === 0 ? 1 : 0.95,
            }}
          >
            {heartSVG(
              i === 7 ? "#ff2d55" : i === 0 ? "#b01030" : "#d01840",
              i === 7
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple email validation
const isValidEmail = (email: string) => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
};

// Sanitize input
const sanitizeInput = (input: string) => {
  return input.replace(/[<>]/g, '').slice(0, 254);
};

export default function Home() {
  const [gestureCount, setGestureCount] = useState(434);
  const [copied, setCopied] = useState(false);
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [showContent, setShowContent] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | undefined>();
  const [yourEmail, setYourEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const fullTitle = "Tiny Gesture";

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < fullTitle.length) {
        setDisplayedTitle(fullTitle.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => setShowContent(true), 300);
      }
    }, 100);
    return () => clearInterval(typeInterval);
  }, []);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { count } = await supabase
          .from("clicks")
          .select("*", { count: "exact", head: true });
        if (count !== null) {
          setGestureCount(434 + count);
        }
      } catch (e) {
        console.error("Failed to fetch count:", e);
      }
    };
    fetchCount();
  }, []);

  const trackClick = async (paymentMethod: "tikkie" | "stripe") => {
    const now = Date.now();
    if (now - lastSubmitTime < 3000 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setLastSubmitTime(now);

    try {
      const sanitizedRecipientEmail = sanitizeInput(email);
      const sanitizedSenderEmail = sanitizeInput(yourEmail);
      const sanitizedPhone = phone ? phone.slice(0, 20) : null;

      if (!isValidEmail(sanitizedRecipientEmail) || !isValidEmail(sanitizedSenderEmail)) {
        console.error("Invalid email format");
        setIsSubmitting(false);
        return;
      }

      await supabase.from("clicks").insert({
        payment_method: paymentMethod,
        clicked_at: new Date().toISOString(),
        recipient_email: sanitizedRecipientEmail || null,
        recipient_phone: sanitizedPhone,
        sender_email: sanitizedSenderEmail || null,
        quantity: quantity,
      });
      setGestureCount((prev) => prev + quantity);
    } catch (e) {
      console.error("Failed to track click:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTikkieClick = () => {
    trackClick("tikkie");
    window.location.href = "https://tikkie.me/pay/6i4f00j4kmf5pcsh1cg3";
  };

  const handleStripeClick = async () => {
    trackClick("stripe");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      const { url, error } = await res.json();

      if (error) {
        console.error("Checkout error:", error);
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (e) {
      console.error("Failed to create checkout:", e);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText("https://hackathon-five-khaki.vercel.app");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen h-full bg-[#fafafa] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-rose-50/20 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-[300px]">
        <PixelHeart3D />

        <h1 className="text-[26px] font-bold text-gray-900 tracking-tight mb-2 font-serif italic">
          {displayedTitle}
          <span className="animate-pulse">|</span>
        </h1>

        <div className={`transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-[14px] text-gray-500 mb-5 text-center leading-snug">
            A €1 thing you send to people<br/>you care about way too much.
          </p>

          {/* Your email */}
          <input
            type="email"
            value={yourEmail}
            onChange={(e) => setYourEmail(e.target.value)}
            placeholder="Your email"
            className="w-full h-[46px] px-3 mb-3 bg-white border border-gray-200 rounded-xl text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-300"
          />

          {/* Loved one's details */}
          <div className="mb-4 p-3 bg-rose-50 rounded-xl border border-rose-200">
            <p className="text-[14px] font-semibold text-rose-600 mb-2 text-center">
              💕 Your loved one's details
            </p>
            <div className="flex gap-2 w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Their email"
                className="flex-1 h-[44px] px-3 bg-white border border-gray-200 rounded-lg text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-300"
              />
              <PhoneInput
                international
                defaultCountry="NL"
                value={phone}
                onChange={setPhone}
                placeholder="Their phone"
                className="flex-1 h-[44px] px-3 bg-white border border-gray-200 rounded-lg text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus-within:border-rose-300 focus-within:ring-1 focus-within:ring-rose-300"
              />
            </div>
          </div>

          {/* Quantity selector */}
          <div className="mb-4 flex items-center justify-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-full bg-gray-100 active:bg-gray-200 text-gray-700 font-bold text-xl flex items-center justify-center"
            >
              −
            </button>
            <div className="text-center">
              <span className="text-[28px] font-bold text-gray-900">{quantity}</span>
              <p className="text-[12px] text-gray-500">gesture{quantity > 1 ? 's' : ''} · €{quantity}</p>
            </div>
            <button
              onClick={() => setQuantity(Math.min(99, quantity + 1))}
              className="w-10 h-10 rounded-full bg-rose-500 active:bg-rose-600 text-white font-bold text-xl flex items-center justify-center"
            >
              +
            </button>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 w-full">
            {quantity === 1 && (
              <button
                onClick={handleTikkieClick}
                className="w-full h-[50px] bg-[#00c853] active:bg-[#00a844] text-white font-medium rounded-xl text-[15px] transition-transform active:scale-[0.98] flex items-center justify-center"
              >
                <TikkieIcon />
                Pay €1 with Tikkie
              </button>
            )}

            <button
              onClick={handleStripeClick}
              className="w-full h-[50px] bg-black active:bg-gray-800 text-white font-medium rounded-xl text-[15px] transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <AppleLogo />
              <span className="text-gray-500">|</span>
              <GoogleLogo />
              <span className="ml-1">Pay €{quantity}</span>
            </button>
          </div>

          {quantity > 1 && (
            <p className="text-[11px] text-gray-400 text-center mt-2">
              Tikkie only supports €1. Use Apple/Google Pay for multiple gestures.
            </p>
          )}

          {/* Counter */}
          <div className="mt-5 text-center">
            <span className="text-[36px] font-bold text-rose-500">{gestureCount.toLocaleString()}</span>
            <p className="text-[13px] text-gray-400">tiny gestures sent already</p>
          </div>

          {/* Copy link */}
          <div className="mt-4 w-full">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                readOnly
                value="hackathon-five-khaki.vercel.app"
                className="flex-1 h-[38px] px-3 bg-white border border-gray-200 rounded-lg text-[12px] text-gray-500"
              />
              <button
                onClick={handleCopyLink}
                className={`h-[38px] px-4 rounded-lg text-[13px] font-medium transition-all ${
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-rose-500 active:bg-rose-600 text-white"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
