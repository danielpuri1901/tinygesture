"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";


// Types
type JourneyStep = "email" | "name" | "photo" | "voice" | "payment" | "confirmation" | "preview";

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
  // const router = useRouter();
  const [step, setStep] = useState<JourneyStep>("email");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderPhoto, setSenderPhoto] = useState<File | null>(null);
  const [senderVoice, setSenderVoice] = useState<Blob | null>(null);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');
  const [emailTypewriterDone, setEmailTypewriterDone] = useState(false);
  const [nameTypewriterDone, setNameTypewriterDone] = useState(false);
  const [photoTypewriterDone, setPhotoTypewriterDone] = useState(false);
  const [voiceTypewriterDone, setVoiceTypewriterDone] = useState(false);
  const [paymentTypewriterDone, setPaymentTypewriterDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gestureId, setGestureId] = useState<string | null>(null);

  // Step transitions
  const goToStep = (next: JourneyStep) => {
    setFadeState('out');
    setTimeout(() => {
      setStep(next);
      setFadeState('in');
    }, 500);
  };

  // Step-by-step handlers
  const handleEmailContinue = () => {
    if (!isValidEmail(recipientEmail)) return;
    goToStep("name");
  };

  const handleNameContinue = () => {
    if (!senderName.trim()) return;
    goToStep("photo");
  };

  // Photo upload (simple base64 for demo)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSenderPhoto(file);
  };
  const handlePhotoContinue = () => {
    if (!senderPhoto) return;
    goToStep("voice");
  };

  // Voice note (simple audio recorder)
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    // Prefer 'audio/webm' but fallback to 'audio/ogg' if not supported
    let mimeType = '';
    if (MediaRecorder.isTypeSupported('audio/webm')) {
      mimeType = 'audio/webm';
    } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
      mimeType = 'audio/ogg';
    }
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];
    recorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
      setSenderVoice(blob);
      // Stop all tracks to release the mic
      stream.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
    };
    recorder.start();
    setRecording(true);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };
  const handleVoiceContinue = () => {
    if (!senderVoice) return;
    goToStep("payment");
  };

  // Track click and create gesture record (now after all info is collected)
  const trackClick = async (paymentMethod: "tikkie" | "stripe") => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const sanitizedEmail = sanitizeInput(recipientEmail);
      await supabase.from("clicks").insert({
        payment_method: paymentMethod,
        clicked_at: new Date().toISOString(),
        recipient_email: sanitizedEmail || null,
      });
      // Upload photo and voice to storage if present
      let photoUrl = null;
      let voiceUrl = null;
      if (senderPhoto) {
        const photoPath = `photos/${crypto.randomUUID()}.${senderPhoto.name.split('.').pop()}`;
        const { data: photoData, error: photoError } = await supabase.storage
          .from('gestures')
          .upload(photoPath, senderPhoto);
        if (photoError) throw photoError;
        photoUrl = supabase.storage.from('gestures').getPublicUrl(photoPath).data.publicUrl;
      }
      if (senderVoice) {
        const voicePath = `voices/${crypto.randomUUID()}.webm`;
        const { data: voiceData, error: voiceError } = await supabase.storage
          .from('gestures')
          .upload(voicePath, senderVoice);
        if (voiceError) throw voiceError;
        voiceUrl = supabase.storage.from('gestures').getPublicUrl(voicePath).data.publicUrl;
      }
      // Create gesture record and get ID
      const newGestureId = crypto.randomUUID();
      setGestureId(newGestureId);
      await supabase.from("gestures").insert({
        id: newGestureId,
        recipient_email: sanitizedEmail || null,
        sender_name: senderName || null,
        sender_photo: photoUrl || null,
        sender_voice: voiceUrl || null,
        created_at: new Date().toISOString(),
      });
      // Send email to recipient
      await sendEmail(newGestureId, sanitizedEmail);
      return newGestureId;
    } catch (e) {
      console.error("Failed to track:", e);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send email to recipient
  const sendEmail = async (gestureId: string, email: string) => {
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
  const handleTikkieClick = async () => {
    window.open("https://tikkie.me/pay/6i4f00j4kmf5pcsh1cg3", "_blank");
    await trackClick("tikkie");
    goToStep("confirmation");
  };

  // Handle Stripe payment
  const handleStripeClick = async () => {
    await trackClick("stripe");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 1 }),
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
    goToStep("confirmation");
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

      {/* EMAIL STEP */}
      {step === "email" && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 400, opacity: fadeState === 'in' ? 1 : 0, transition: 'opacity 0.5s ease' }}>
          <p style={{ textAlign: 'left', color: '#171717', fontSize: 18, lineHeight: 1.6, marginBottom: 24, width: '100%', ...fontStyle }}>
            <Typewriter text="Put in the email of the person you want to give a Tiny Gesture" onComplete={() => setEmailTypewriterDone(true)} speed={100} />
          </p>
          <div style={{ width: '100%', opacity: emailTypewriterDone ? 1 : 0, transition: 'opacity 0.5s ease' }}>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailContinue()}
              placeholder="Their email"
              autoFocus
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #171717', backgroundColor: 'transparent', color: '#171717', fontSize: 16, outline: 'none', boxSizing: 'border-box', ...fontStyle }}
            />
            <button
              onClick={handleEmailContinue}
              disabled={!isValidEmail(recipientEmail)}
              style={{ marginTop: 16, width: '100%', padding: '12px 16px', border: '1px solid #171717', backgroundColor: 'transparent', color: '#171717', fontSize: 16, cursor: isValidEmail(recipientEmail) ? 'pointer' : 'not-allowed', opacity: isValidEmail(recipientEmail) ? 1 : 0.3, ...fontStyle }}
            >
              Continue
            </button>
          </div>
          <SmallHeart />
        </div>
      )}

      {/* NAME STEP */}
      {step === "name" && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 400, opacity: fadeState === 'in' ? 1 : 0, transition: 'opacity 0.5s ease' }}>
          <p style={{ textAlign: 'left', color: '#171717', fontSize: 18, lineHeight: 1.6, marginBottom: 24, width: '100%', ...fontStyle }}>
            <Typewriter text="What's your name?" onComplete={() => setNameTypewriterDone(true)} speed={100} />
          </p>
          <div style={{ width: '100%', opacity: nameTypewriterDone ? 1 : 0, transition: 'opacity 0.5s ease' }}>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameContinue()}
              placeholder="Your name"
              autoFocus
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #171717', backgroundColor: 'transparent', color: '#171717', fontSize: 16, outline: 'none', boxSizing: 'border-box', ...fontStyle }}
            />
            <button
              onClick={handleNameContinue}
              disabled={!senderName.trim()}
              style={{ marginTop: 16, width: '100%', padding: '12px 16px', border: '1px solid #171717', backgroundColor: 'transparent', color: '#171717', fontSize: 16, cursor: senderName.trim() ? 'pointer' : 'not-allowed', opacity: senderName.trim() ? 1 : 0.3, ...fontStyle }}
            >
              Continue
            </button>
          </div>
          <SmallHeart />
        </div>
      )}

      {/* PHOTO STEP */}
      {step === "photo" && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 400, opacity: fadeState === 'in' ? 1 : 0, transition: 'opacity 0.5s ease' }}>
          <p style={{ textAlign: 'left', color: '#171717', fontSize: 18, lineHeight: 1.6, marginBottom: 24, width: '100%', ...fontStyle }}>
            <Typewriter text="Add a photo of yourself" onComplete={() => setPhotoTypewriterDone(true)} speed={100} />
          </p>
          <div style={{ width: '100%', opacity: photoTypewriterDone ? 1 : 0, transition: 'opacity 0.5s ease' }}>
            <input
              type="file"
              accept="image/*"
              capture="user"
              id="photo-upload-input"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
            <button
              type="button"
              onClick={() => document.getElementById('photo-upload-input')?.click()}
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #171717', backgroundColor: '#f3f3f3', color: '#171717', fontSize: 16, cursor: 'pointer', ...fontStyle }}
            >
              {senderPhoto ? 'Change Photo' : 'Choose or Take Photo'}
            </button>
            {senderPhoto && (
              <Image
                src={URL.createObjectURL(senderPhoto)}
                alt="Your photo"
                width={120}
                height={120}
                style={{ objectFit: 'cover', borderRadius: '50%', marginTop: 16 }}
              />
            )}
            <button
              onClick={handlePhotoContinue}
              disabled={!senderPhoto}
              style={{ marginTop: 16, width: '100%', padding: '12px 16px', border: '1px solid #171717', backgroundColor: 'transparent', color: '#171717', fontSize: 16, cursor: senderPhoto ? 'pointer' : 'not-allowed', opacity: senderPhoto ? 1 : 0.3, ...fontStyle }}
            >
              Continue
            </button>
          </div>
          <SmallHeart />
        </div>
      )}

      {/* VOICE STEP */}
      {step === "voice" && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 400, opacity: fadeState === 'in' ? 1 : 0, transition: 'opacity 0.5s ease' }}>
          <p style={{ textAlign: 'left', color: '#171717', fontSize: 18, lineHeight: 1.6, marginBottom: 24, width: '100%', ...fontStyle }}>
            <Typewriter text="Record a voice note" onComplete={() => setVoiceTypewriterDone(true)} speed={100} />
          </p>
          <div style={{ width: '100%', opacity: voiceTypewriterDone ? 1 : 0, transition: 'opacity 0.5s ease' }}>
            {!recording && <button onClick={handleStartRecording} style={{ padding: '12px 32px', backgroundColor: '#171717', color: 'white', border: 'none', fontSize: 14, cursor: 'pointer', borderRadius: 8, fontFamily: "'Anonymous Pro', monospace" }}>Start Recording</button>}
            {recording && <button onClick={handleStopRecording} style={{ padding: '12px 32px', backgroundColor: '#ef4444', color: 'white', border: 'none', fontSize: 14, cursor: 'pointer', borderRadius: 8, fontFamily: "'Anonymous Pro', monospace" }}>Stop Recording</button>}
            {senderVoice && (
              <audio src={URL.createObjectURL(senderVoice)} controls style={{ marginTop: 16 }}>
                Your browser does not support the audio element.
              </audio>
            )}
            <button
              onClick={handleVoiceContinue}
              disabled={!senderVoice}
              style={{ marginTop: 16, width: '100%', padding: '12px 16px', border: '1px solid #171717', backgroundColor: 'transparent', color: '#171717', fontSize: 16, cursor: senderVoice ? 'pointer' : 'not-allowed', opacity: senderVoice ? 1 : 0.3, ...fontStyle }}
            >
              Continue
            </button>
          </div>
          <SmallHeart />
        </div>
      )}

      {/* PAYMENT STEP */}
      {step === "payment" && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 400, opacity: fadeState === 'in' ? 1 : 0, transition: 'opacity 0.5s ease' }}>
          <p style={{ textAlign: 'center', color: '#171717', fontSize: 18, lineHeight: 1.6, marginBottom: 24, width: '100%', ...fontStyle }}>
            <Typewriter text="It's just one euro to send a tiny gesture" onComplete={() => setPaymentTypewriterDone(true)} speed={100} showDots={false} />
          </p>
          <div style={{ width: '100%', opacity: paymentTypewriterDone ? 1 : 0, transition: 'opacity 0.5s ease' }}>
            <button onClick={handleTikkieClick} disabled={isSubmitting} style={{ width: '100%', padding: 12, marginBottom: 12, backgroundColor: '#00c853', color: 'white', fontSize: 16, border: 'none', cursor: 'pointer', ...fontStyle }}>Pay with Tikkie</button>
            <button onClick={handleStripeClick} disabled={isSubmitting} style={{ width: '100%', padding: 12, backgroundColor: '#171717', color: 'white', fontSize: 16, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...fontStyle }}>
              <AppleLogo />
              <span style={{ color: '#666' }}>|</span>
              <GoogleLogo />
              <span style={{ marginLeft: 4 }}>Pay €1</span>
            </button>
          </div>
          <SmallHeart />
        </div>
      )}

      {/* CONFIRMATION STEP */}
      {step === "confirmation" && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 400, opacity: fadeState === 'in' ? 1 : 0, transition: 'opacity 0.5s ease' }}>
          <p style={{ textAlign: 'left', color: '#171717', fontSize: 18, lineHeight: 1.6, width: '100%', ...fontStyle }}>
            <Typewriter text="A Tiny Gesture will be sent to your loved one" speed={120} />
          </p>
          <button onClick={() => goToStep("preview")}
            style={{ marginTop: 24, width: '100%', padding: '12px 16px', border: '1px solid #171717', backgroundColor: 'transparent', color: '#171717', fontSize: 16, cursor: 'pointer', ...fontStyle }}>
            Preview your gesture
          </button>
          <SmallHeart />
        </div>
      )}

      {/* PREVIEW STEP */}
      {step === "preview" && gestureId && (
        <iframe
          src={`/enjoy/${gestureId}`}
          style={{ width: '100%', maxWidth: 420, height: 700, border: 'none', borderRadius: 16, background: '#fff' }}
          title="Preview Tiny Gesture"
        />
      )}
    </div>
  );
}
