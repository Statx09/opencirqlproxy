import React, { useEffect, useRef, useState } from "react";
import { BadgeCheck, Camera, LoaderCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const BUCKET = "verification-videos";
const TABLE = "profile_verification_submissions";
const MAX_VIDEO_SIZE = 15 * 1024 * 1024;

export default function ProfileVerificationCard({ user }) {
  const [status, setStatus] = useState("loading");
  const [consented, setConsented] = useState(false);
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const videoUrlRef = useRef("");

  useEffect(() => {
    if (!user?.id) {
      setStatus("none");
      return;
    }

    let active = true;
    setStatus("loading");

    supabase
      .from(TABLE)
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;

        if (error) {
          console.error("Verification status lookup failed:", error);
          setStatus("error");
          setErrorMessage("Couldn't load verification status. Please refresh.");
          return;
        }

        setStatus(data?.status || "none");
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);

      streamRef.current?.getTracks().forEach((track) => track.stop());

      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
      }
    };
  }, []);

  const clearPreview = () => {
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = "";
    }

    setVideoUrl("");
    setVideoBlob(null);
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setRecording(false);
  };

  const startRecording = async () => {
    setErrorMessage("");

    if (!consented) {
      setErrorMessage("Please consent before recording.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setErrorMessage("Video recording isn't supported in this browser.");
      return;
    }

    try {
      clearPreview();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      const supportedTypes = [
        "video/webm;codecs=vp8,opus",
        "video/webm",
        "video/mp4",
      ];

      const mimeType = supportedTypes.find((type) =>
        MediaRecorder.isTypeSupported(type)
      );

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );

      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        setErrorMessage("Recording failed. Please try again.");
        stopCamera();
      };

      recorder.onstop = () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "video/webm",
        });

        stopCamera();

        if (!blob.size) {
          setErrorMessage("No video was captured. Please try again.");
          return;
        }

        if (blob.size > MAX_VIDEO_SIZE) {
          setErrorMessage("Video is too large. Please record a shorter video.");
          clearPreview();
          return;
        }

        const url = URL.createObjectURL(blob);
        videoUrlRef.current = url;

        setVideoBlob(blob);
        setVideoUrl(url);
      };

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      recorder.start();
      setRecording(true);

      // A short, simple selfie video for manual review.
      timerRef.current = window.setTimeout(() => {
        if (recorder.state !== "inactive") recorder.stop();
      }, 5000);
    } catch (error) {
      console.error("Verification camera failed:", error);
      stopCamera();
      setErrorMessage("Couldn't open the camera. Check camera permission and retry.");
    }
  };

  const submitVideo = async () => {
    if (!user?.id || !videoBlob || !consented || busy) return;

    setBusy(true);
    setErrorMessage("");

    let uploadedPath = null;

    try {
      const contentType = (videoBlob.type || "video/webm").split(";")[0];

      const extension = contentType === "video/mp4"
        ? "mp4"
        : contentType === "video/quicktime"
        ? "mov"
        : "webm";

      uploadedPath = `${user.id}/${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(uploadedPath, videoBlob, {
          contentType,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const submission = {
        user_id: user.id,
        status: "pending",
        video_path: uploadedPath,
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        reviewed_by: null,
      };

      let result;

      if (status === "rejected") {
        result = await supabase
          .from(TABLE)
          .update(submission)
          .eq("user_id", user.id)
          .eq("status", "rejected")
          .select("user_id")
          .maybeSingle();
      } else {
        result = await supabase
          .from(TABLE)
          .insert(submission)
          .select("user_id")
          .maybeSingle();
      }

      if (result.error) throw result.error;

      if (!result.data) {
        throw new Error("Submission wasn't saved. Refresh and try again.");
      }

      setStatus("pending");
      clearPreview();
      setConsented(false);
    } catch (error) {
      console.error("Verification submission failed:", error);

      if (uploadedPath) {
        // Best-effort cleanup if the submission row couldn't be saved.
        await supabase.storage
          .from(BUCKET)
          .remove([uploadedPath])
          .catch(() => {});
      }

      setErrorMessage(
        error?.message || "Couldn't submit the video. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const buttonStyle = {
    border: "1px solid rgba(148,163,184,.35)",
    borderRadius: 10,
    padding: "10px 14px",
    background: "#172033",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  };

  return (
    <section
      style={{
        margin: "14px 0",
        padding: 15,
        borderRadius: 14,
        border: "1px solid rgba(148,163,184,.25)",
        background: "rgba(100,116,139,.08)",
        color: "inherit",
      }}
    >
      {status === "verified" ? (
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <BadgeCheck size={23} color="#38BDF8" />
          <div>
            <strong>Selfie verified</strong>
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              Your profile has been verified.
            </div>
          </div>
        </div>
      ) : status === "pending" ? (
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <LoaderCircle size={21} />
          <div>
            <strong>Verification pending</strong>
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              Your video has been submitted for review.
            </div>
          </div>
        </div>
      ) : status === "loading" ? (
        <div style={{ fontSize: 13, opacity: 0.75 }}>
          Checking verification status…
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Camera size={22} />
            <strong>Verify your profile</strong>
          </div>

          <p style={{ margin: "8px 0 12px", fontSize: 13, opacity: 0.8 }}>
            Record a short selfie video for review. Your video stays private.
          </p>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            <input
              type="checkbox"
              checked={consented}
              onChange={(event) => setConsented(event.target.checked)}
            />
            I agree to submit this video for verification review.
          </label>

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              display: recording ? "block" : "none",
              width: "100%",
              maxHeight: 260,
              borderRadius: 10,
              background: "#000",
              marginBottom: 10,
            }}
          />

          {videoUrl && !recording && (
            <video
              src={videoUrl}
              controls
              playsInline
              style={{
                width: "100%",
                maxHeight: 260,
                borderRadius: 10,
                background: "#000",
                marginBottom: 10,
              }}
            />
          )}

          {recording && (
            <p style={{ fontSize: 13 }}>Recording selfie… hold still.</p>
          )}

          {errorMessage && (
            <p role="alert" style={{ color: "#ef4444", fontSize: 13 }}>
              {errorMessage}
            </p>
          )}

          {!recording && !videoBlob && (
            <button
              type="button"
              style={buttonStyle}
              onClick={startRecording}
              disabled={!consented || busy}
            >
              <Camera size={16} />
              Record selfie video
            </button>
          )}

          {recording && (
            <button
              type="button"
              style={buttonStyle}
              onClick={() => {
                if (recorderRef.current?.state !== "inactive") {
                  recorderRef.current?.stop();
                }
              }}
            >
              Finish recording
            </button>
          )}

          {videoBlob && !recording && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                style={buttonStyle}
                onClick={submitVideo}
                disabled={busy || !consented}
              >
                {busy ? "Submitting…" : "Submit for review"}
              </button>

              <button
                type="button"
                style={{ ...buttonStyle, background: "transparent" }}
                onClick={() => {
                  clearPreview();
                  setErrorMessage("");
                }}
                disabled={busy}
              >
                Retake
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}