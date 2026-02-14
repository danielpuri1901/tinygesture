"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const HeartParticle = ({ delay, left }: { delay: number; left: number }) => (
  <div
    className="absolute text-2xl animate-fall pointer-events-none"
    style={{
      left: `${left}%`,
      animationDelay: `${delay}s`,
      top: -20,
    }}
  >
    💕
  </div>
);

export default function Thanks() {
  const [copied, setCopied] = useState(false);
  const [particles, setParticles] = useState<{ delay: number; left: number }[]>([]);
  const emailSent = useRef(false);

  useEffect(() => {
    const newParticles = Array.from({ length: 12 }, () => ({
      delay: Math.random() * 2,
      left: Math.random() * 100,
    }));
    setParticles(newParticles);

    // Send email for Stripe payments (Tikkie sends on main page)
    const sendEmailToRecipient = async () => {
      if (emailSent.current) return;
      emailSent.current = true;

      const recipientEmail = localStorage.getItem('recipientEmail');
      const gestureId = localStorage.getItem('gestureId');

      if (recipientEmail && gestureId) {
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientEmail,
              gestureId,
            }),
          });
          // Clear localStorage after sending
          localStorage.removeItem('recipientEmail');
          localStorage.removeItem('gestureId');
        } catch (e) {
          console.error('Failed to send email:', e);
        }
      }
    };

    sendEmailToRecipient();
  }, []);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText("https://hackathon-five-khaki.vercel.app");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Tiny Gesture",
          text: "I just sent a tiny gesture to someone I care about! Send one too 💕",
          url: "https://hackathon-five-khaki.vercel.app",
        });
      } catch (e) {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {particles.map((p, i) => (
        <HeartParticle key={i} delay={p.delay} left={p.left} />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-white to-rose-50/30 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-[300px] text-center">
        <div className="text-6xl mb-4 animate-bounce">💕</div>

        <h1 className="text-[28px] font-bold text-gray-900 mb-2 font-serif italic">
          You're amazing!
        </h1>

        <p className="text-[15px] text-gray-600 mb-6 leading-relaxed">
          Your tiny gesture is on its way.<br />
          You just made someone's day a little brighter.
        </p>

        <div className="flex flex-col gap-3 w-full mb-6">
          <Link
            href="/"
            className="w-full h-[50px] bg-rose-500 active:bg-rose-600 text-white font-medium rounded-xl text-[15px] transition-transform active:scale-[0.98] flex items-center justify-center"
          >
            Send Another Gesture 💕
          </Link>

          <button
            onClick={handleShare}
            className="w-full h-[50px] bg-black active:bg-gray-800 text-white font-medium rounded-xl text-[15px] transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Share with Friends
          </button>
        </div>

        <div className="w-full p-3 bg-white rounded-xl border border-gray-200">
          <p className="text-[12px] text-gray-500 mb-2">Share the love</p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value="hackathon-five-khaki.vercel.app"
              className="flex-1 h-[40px] px-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-600"
            />
            <button
              onClick={handleCopyLink}
              className={`h-[40px] px-4 rounded-lg text-[13px] font-medium transition-all ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-rose-500 active:bg-rose-600 text-white"
              }`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-[13px] text-gray-400">
          Join 400+ people spreading tiny gestures
        </p>
      </div>

      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
