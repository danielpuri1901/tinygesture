"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

// Types
type JourneyStep = "intro" | "email" | "name" | "payment" | "confirmation";

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

// Typewriter component - runs only once per text
function Typewriter({
  text,
  onComplete,
  speed = 120,
  showDots = true,
}: {
  text: string;
  onComplete?: () => void;
  speed?: number;
  showDots?: boolean;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const onCompleteRef = useRef(onComplete);

  // Update ref when onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Add dots to the text if showDots is true
    const fullText = showDots ? text + "..." : text;
    let index = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (index < fullText.length) {
        index++;
        setDisplayedText(fullText.slice(0, index));
      } else {
        clearInterval(interval);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, showDots]);

  return <span>{displayedText}</span>;
}

// Small decorative heart at bottom
function SmallHeart() {
  return (
    <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)' }}>
      <Image
        src="/heart.png"
        alt=""
        width={40}
        height={40}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}

// Simple email validation
const isValidEmail = (email: string) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
};

// Sanitize input
const sanitizeInput = (input: string) => {
  return input.replace(/[<>]/g, "").slice(0, 254);
};

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<JourneyStep>("intro");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  // Intro state
  const [typewriterDone, setTypewriterDone] = useState(false);

  // Email state
  const [emailTypewriterDone, setEmailTypewriterDone] = useState(false);

  // Name state
  const [nameTypewriterDone, setNameTypewriterDone] = useState(false);

  // Payment state
  const [paymentTypewriterDone, setPaymentTypewriterDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState("");

  // After typewriter completes, wait then transition
  useEffect(() => {
    if (typewriterDone && step === "intro") {
      const timer = setTimeout(() => {
        // Fade out
        setFadeState('out');
        // After fade, change step
        setTimeout(() => {
          setStep("email");
          setFadeState('in');
        }, 500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [typewriterDone, step]);

  // Handle email submit - go to name step
  const handleEmailSubmit = () => {
    if (!isValidEmail(recipientEmail)) return;
    localStorage.setItem('recipientEmail', recipientEmail);
    setFadeState('out');
    setTimeout(() => {
      setStep("name");
      setFadeState('in');
    }, 500);
  };

  // Handle name submit - go to payment step
  const handleNameSubmit = () => {
    if (!senderName.trim()) return;
    localStorage.setItem('senderName', senderName.trim());
    setFadeState('out');
    setTimeout(() => {
      setStep("payment");
      setFadeState('in');
    }, 500);
  };

  // Track click and create gesture record
  const trackClick = async (paymentMethod: "tikkie" | "stripe") => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const sanitizedEmail = sanitizeInput(recipientEmail);

      // Insert into clicks table
      await supabase.from("clicks").insert({
        payment_method: paymentMethod,
        clicked_at: new Date().toISOString(),
        recipient_email: sanitizedEmail || null,
      });

      // Create gesture record and get ID
      const gestureId = crypto.randomUUID();
      localStorage.setItem('gestureId', gestureId);

      // Insert gesture record
      const storedName = localStorage.getItem('senderName');
      await supabase.from("gestures").insert({
        id: gestureId,
        recipient_email: sanitizedEmail || null,
        sender_name: storedName || null,
        created_at: new Date().toISOString(),
      });

      return gestureId;
    } catch (e) {
      console.error("Failed to track:", e);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send email to recipient
  const sendEmail = async (gestureId: string) => {
    const email = localStorage.getItem('recipientEmail');
    if (!email || !gestureId) return;

    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: email,
          gestureId: gestureId,
        }),
      });
    } catch (e) {
      console.error("Failed to send email:", e);
    }
  };

  // Handle Tikkie payment
  const handleTikkieClick = () => {
    // Open link FIRST - must be synchronous for mobile browsers
    window.open("https://tikkie.me/pay/6i4f00j4kmf5pcsh1cg3", "_blank");

    // Track click (email sent after media upload on /create page)
    trackClick("tikkie");

    // Redirect to create page for media collection
    setFadeState('out');
    setTimeout(() => {
      router.push("/create");
    }, 500);
  };

  // Handle Stripe payment
  const handleStripeClick = async () => {
    // Create gesture record first (email will be sent on /thanks page)
    await trackClick("stripe");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 1, discountCode }),
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

  const fontStyle = { fontFamily: "'Anonymous Pro', monospace" };

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#fffefa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '0 24px',
    }}>

      {/* INTRO STEP */}
      {step === "intro" && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: fadeState === 'in' ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}>
          <div style={{
            width: 100,
            height: 100,
            animation: 'heartbeatContinuous 1.5s ease-in-out infinite',
          }}>
            <Image
              src="/heart.png"
              alt="Heart"
              width={100}
              height={100}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              priority
            />
          </div>
          <h1 style={{
            marginTop: 32,
            fontSize: 20,
            textAlign: 'center',
            color: '#171717',
            ...fontStyle,
          }}>
            <Typewriter
              text="A Tiny Gesture"
              onComplete={() => setTypewriterDone(true)}
              speed={200}
            />
          </h1>
        </div>
      )}

      {/* EMAIL STEP */}
      {step === "email" && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 400,
          opacity: fadeState === 'in' ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}>
          <p style={{
            textAlign: 'left',
            color: '#171717',
            fontSize: 18,
            lineHeight: 1.6,
            marginBottom: 24,
            width: '100%',
            ...fontStyle,
          }}>
            <Typewriter
              text="Put in the email of the person you want to give a Tiny Gesture"
              onComplete={() => setEmailTypewriterDone(true)}
              speed={100}
            />
          </p>

          <div style={{
            width: '100%',
            opacity: emailTypewriterDone ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
              placeholder="Their email"
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #171717',
                backgroundColor: 'transparent',
                color: '#171717',
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
                ...fontStyle,
              }}
            />
            <button
              onClick={handleEmailSubmit}
              disabled={!isValidEmail(recipientEmail)}
              style={{
                marginTop: 16,
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #171717',
                backgroundColor: 'transparent',
                color: '#171717',
                fontSize: 16,
                cursor: isValidEmail(recipientEmail) ? 'pointer' : 'not-allowed',
                opacity: isValidEmail(recipientEmail) ? 1 : 0.3,
                ...fontStyle,
              }}
            >
              Continue
            </button>
          </div>

          <SmallHeart />
        </div>
      )}

      {/* NAME STEP */}
      {step === "name" && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 400,
          opacity: fadeState === 'in' ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}>
          <p style={{
            textAlign: 'left',
            color: '#171717',
            fontSize: 18,
            lineHeight: 1.6,
            marginBottom: 24,
            width: '100%',
            ...fontStyle,
          }}>
            <Typewriter
              text="What's your name?"
              onComplete={() => setNameTypewriterDone(true)}
              speed={100}
            />
          </p>

          <div style={{
            width: '100%',
            opacity: nameTypewriterDone ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              placeholder="Your name"
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #171717',
                backgroundColor: 'transparent',
                color: '#171717',
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
                ...fontStyle,
              }}
            />
            <button
              onClick={handleNameSubmit}
              disabled={!senderName.trim()}
              style={{
                marginTop: 16,
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #171717',
                backgroundColor: 'transparent',
                color: '#171717',
                fontSize: 16,
                cursor: senderName.trim() ? 'pointer' : 'not-allowed',
                opacity: senderName.trim() ? 1 : 0.3,
                ...fontStyle,
              }}
            >
              Continue
            </button>
          </div>

          <SmallHeart />
        </div>
      )}

      {/* PAYMENT STEP */}
      {step === "payment" && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 400,
          opacity: fadeState === 'in' ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}>
          <p style={{
            textAlign: 'center',
            color: '#171717',
            fontSize: 18,
            lineHeight: 1.6,
            marginBottom: 24,
            width: '100%',
            ...fontStyle,
          }}>
            <Typewriter
              text="It's just one euro to send a tiny gesture"
              onComplete={() => setPaymentTypewriterDone(true)}
              speed={100}
              showDots={false}
            />
          </p>

          <div style={{
            width: '100%',
            opacity: paymentTypewriterDone ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}>
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Discount code (optional)"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #171717',
                backgroundColor: 'transparent',
                color: '#171717',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 12,
                ...fontStyle,
              }}
            />
            <button
              onClick={handleTikkieClick}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: 12,
                marginBottom: 12,
                backgroundColor: '#00c853',
                color: 'white',
                fontSize: 16,
                border: 'none',
                cursor: 'pointer',
                ...fontStyle,
              }}
            >
              Pay with Tikkie
            </button>

            <button
              onClick={handleStripeClick}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: 12,
                backgroundColor: '#171717',
                color: 'white',
                fontSize: 16,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                ...fontStyle,
              }}
            >
              <AppleLogo />
              <span style={{ color: '#666' }}>|</span>
              <GoogleLogo />
              <span style={{ marginLeft: 4 }}>{discountCode.toLowerCase() === 'odyssey' ? 'Pay €0' : 'Pay €1'}</span>
            </button>
          </div>

          <SmallHeart />
        </div>
      )}

      {/* CONFIRMATION STEP */}
      {step === "confirmation" && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 400,
          opacity: fadeState === 'in' ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}>
          <p style={{
            textAlign: 'left',
            color: '#171717',
            fontSize: 18,
            lineHeight: 1.6,
            width: '100%',
            ...fontStyle,
          }}>
            <Typewriter
              text="A Tiny Gesture will be sent to your loved one"
              speed={120}
            />
          </p>

          <SmallHeart />
        </div>
      )}
    </div>
  );
}
