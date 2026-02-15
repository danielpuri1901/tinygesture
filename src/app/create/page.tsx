"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

type CreateStep = "voice" | "photo" | "uploading" | "done";

// Typewriter component
function Typewriter({
  text,
  onComplete,
  speed = 100,
}: {
  text: string;
  onComplete?: () => void;
  speed?: number;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let index = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (index < text.length) {
        index++;
        setDisplayedText(text.slice(0, index));
      } else {
        clearInterval(interval);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayedText}</span>;
}

// 8-bit Microphone button
function MicButton({ recording, onClick }: { recording: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 120,
        height: 120,
        borderRadius: "50%",
        backgroundColor: recording ? "#ef4444" : "#171717",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
        animation: recording ? "pulse 1s ease-in-out infinite" : "none",
      }}
    >
      <svg width="48" height="48" viewBox="0 0 16 16" fill="white">
        <rect x="6" y="2" width="4" height="7" fill="white" />
        <rect x="5" y="9" width="6" height="1" fill="white" />
        <rect x="4" y="7" width="1" height="3" fill="white" />
        <rect x="11" y="7" width="1" height="3" fill="white" />
        <rect x="7" y="10" width="2" height="2" fill="white" />
        <rect x="5" y="12" width="6" height="2" fill="white" />
      </svg>
    </button>
  );
}

// 8-bit Camera button
function CameraButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        backgroundColor: "#171717",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="32" height="32" viewBox="0 0 16 16" fill="white">
        <rect x="2" y="5" width="12" height="9" fill="white" />
        <rect x="5" y="3" width="6" height="2" fill="white" />
        <rect x="6" y="7" width="4" height="4" fill="black" />
        <rect x="7" y="8" width="2" height="2" fill="white" />
      </svg>
    </button>
  );
}

export default function Create() {
  const router = useRouter();
  const [step, setStep] = useState<CreateStep>("voice");
  const [fadeState, setFadeState] = useState<"in" | "out">("in");
  const [typewriterDone, setTypewriterDone] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Photo capture state
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get gestureId from localStorage
  const [gestureId, setGestureId] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("gestureId");
    const email = localStorage.getItem("recipientEmail");
    setGestureId(id);
    setRecipientEmail(email);

    if (!id) {
      // No gesture ID, redirect to home
      router.push("/");
    }
  }, [router]);

  const fontStyle = { fontFamily: "'Anonymous Pro', monospace" };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Try to use mp4/aac for better compatibility, fallback to webm
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      }

      console.log("Using audio mimeType:", mimeType);

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log("Recording complete, blob type:", blob.type, "size:", blob.size);
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 15) {
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Please allow microphone access to record your message.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const goToPhoto = () => {
    setFadeState("out");
    setTimeout(() => {
      setStep("photo");
      setFadeState("in");
      setTypewriterDone(false);
    }, 500);
  };

  // Photo capture functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Failed to start camera:", err);
      alert("Please allow camera access to take a photo.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              setPhotoBlob(blob);
              setPhotoPreview(URL.createObjectURL(blob));
              // Stop camera
              streamRef.current?.getTracks().forEach((track) => track.stop());
            }
          },
          "image/jpeg",
          0.8
        );
      }
    }
  };

  const retakePhoto = () => {
    setPhotoBlob(null);
    setPhotoPreview(null);
    startCamera();
  };

  // Start camera when entering photo step
  useEffect(() => {
    if (step === "photo" && typewriterDone && !photoPreview) {
      startCamera();
    }
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [step, typewriterDone, photoPreview]);

  // Upload and send
  const handleSendGesture = async () => {
    if (!audioBlob || !photoBlob || !gestureId) return;

    setFadeState("out");
    setTimeout(() => {
      setStep("uploading");
      setFadeState("in");
    }, 500);

    try {
      // Upload voice - determine extension from blob type
      const voiceExt = audioBlob.type.includes('mp4') ? 'mp4' :
                       audioBlob.type.includes('ogg') ? 'ogg' : 'webm';
      const voiceFormData = new FormData();
      voiceFormData.append("file", audioBlob, `voice.${voiceExt}`);
      voiceFormData.append("gestureId", gestureId);
      voiceFormData.append("type", "voice");

      console.log("Uploading voice...", { size: audioBlob.size, type: audioBlob.type });
      const voiceRes = await fetch("/api/upload", {
        method: "POST",
        body: voiceFormData,
      });
      const voiceData = await voiceRes.json();
      console.log("Voice upload response:", voiceData);

      // Upload photo
      const photoFormData = new FormData();
      photoFormData.append("file", photoBlob, "photo.jpg");
      photoFormData.append("gestureId", gestureId);
      photoFormData.append("type", "photo");

      console.log("Uploading photo...", { size: photoBlob.size, type: photoBlob.type });
      const photoRes = await fetch("/api/upload", {
        method: "POST",
        body: photoFormData,
      });
      const photoData = await photoRes.json();
      console.log("Photo upload response:", photoData);

      // Send email
      if (recipientEmail) {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientEmail,
            gestureId,
          }),
        });
      }

      // Clear localStorage
      localStorage.removeItem("gestureId");
      localStorage.removeItem("recipientEmail");

      // Show done
      setFadeState("out");
      setTimeout(() => {
        setStep("done");
        setFadeState("in");
      }, 500);
    } catch (err) {
      console.error("Failed to send gesture:", err);
      alert("Failed to send gesture. Please try again.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#fffefa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "0 24px",
      }}
    >
      {/* VOICE RECORDING STEP */}
      {step === "voice" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 400,
            opacity: fadeState === "in" ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <p
            style={{
              textAlign: "center",
              color: "#171717",
              fontSize: 18,
              lineHeight: 1.6,
              marginBottom: 32,
              ...fontStyle,
            }}
          >
            <Typewriter
              text="Record a tiny message for them..."
              onComplete={() => setTypewriterDone(true)}
              speed={100}
            />
          </p>

          {typewriterDone && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
              }}
            >
              <MicButton recording={isRecording} onClick={handleMicClick} />

              <p
                style={{
                  fontSize: 24,
                  color: isRecording ? "#ef4444" : "#171717",
                  ...fontStyle,
                }}
              >
                {isRecording
                  ? `${15 - recordingTime}s`
                  : audioBlob
                  ? "Recording saved!"
                  : "Tap to record"}
              </p>

              {audioBlob && !isRecording && (
                <button
                  onClick={goToPhoto}
                  style={{
                    marginTop: 16,
                    padding: "12px 32px",
                    backgroundColor: "#171717",
                    color: "white",
                    border: "none",
                    fontSize: 16,
                    cursor: "pointer",
                    ...fontStyle,
                  }}
                >
                  Next
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* PHOTO CAPTURE STEP */}
      {step === "photo" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 400,
            opacity: fadeState === "in" ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <p
            style={{
              textAlign: "center",
              color: "#171717",
              fontSize: 18,
              lineHeight: 1.6,
              marginBottom: 24,
              ...fontStyle,
            }}
          >
            <Typewriter
              text="Now take a photo for them..."
              onComplete={() => setTypewriterDone(true)}
              speed={100}
            />
          </p>

          {typewriterDone && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              {!photoPreview ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: "100%",
                      maxWidth: 300,
                      aspectRatio: "1",
                      objectFit: "cover",
                      borderRadius: 8,
                      backgroundColor: "#171717",
                    }}
                  />
                  <CameraButton onClick={capturePhoto} />
                </>
              ) : (
                <>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxWidth: 300,
                      aspectRatio: "1",
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      onClick={retakePhoto}
                      style={{
                        padding: "12px 24px",
                        backgroundColor: "transparent",
                        color: "#171717",
                        border: "1px solid #171717",
                        fontSize: 14,
                        cursor: "pointer",
                        ...fontStyle,
                      }}
                    >
                      Retake
                    </button>
                    <button
                      onClick={handleSendGesture}
                      style={{
                        padding: "12px 24px",
                        backgroundColor: "#171717",
                        color: "white",
                        border: "none",
                        fontSize: 14,
                        cursor: "pointer",
                        ...fontStyle,
                      }}
                    >
                      Send Gesture
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      )}

      {/* UPLOADING STEP */}
      {step === "uploading" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: fadeState === "in" ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              animation: "heartbeatContinuous 1.5s ease-in-out infinite",
            }}
          >
            <Image
              src="/heart.png"
              alt="Heart"
              width={100}
              height={100}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <p
            style={{
              marginTop: 24,
              textAlign: "center",
              color: "#171717",
              fontSize: 18,
              ...fontStyle,
            }}
          >
            Sending your tiny gesture...
          </p>
        </div>
      )}

      {/* DONE STEP */}
      {step === "done" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: fadeState === "in" ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
            }}
          >
            <Image
              src="/heart.png"
              alt="Heart"
              width={100}
              height={100}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <p
            style={{
              marginTop: 24,
              textAlign: "center",
              color: "#171717",
              fontSize: 18,
              lineHeight: 1.6,
              ...fontStyle,
            }}
          >
            <Typewriter
              text="Your tiny gesture has been sent..."
              speed={100}
            />
          </p>
          <button
            onClick={() => router.push("/")}
            style={{
              marginTop: 32,
              padding: "12px 32px",
              backgroundColor: "transparent",
              color: "#171717",
              border: "1px solid #171717",
              fontSize: 14,
              cursor: "pointer",
              ...fontStyle,
            }}
          >
            Send another
          </button>
        </div>
      )}

      {/* Small heart at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <Image
          src="/heart.png"
          alt=""
          width={40}
          height={40}
          style={{ objectFit: "contain" }}
        />
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
