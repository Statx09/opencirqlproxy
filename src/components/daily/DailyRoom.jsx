import React, { useCallback, useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  SwitchCamera,
} from "lucide-react";

function getVideoTrack(participant) {
  const video = participant?.tracks?.video;
  if (!video || !["playable", "loading"].includes(video.state)) return null;

  const track = video.persistentTrack;
  return track?.readyState === "live" ? track : null;
}

function getAudioTrack(participant) {
  const audio = participant?.tracks?.audio;
  if (audio?.state !== "playable") return null;

  const track = audio.persistentTrack;
  return track?.readyState === "live" ? track : null;
}

function VideoTile({ participant, local = false }) {
  const videoRef = useRef(null);
  const track = getVideoTrack(participant);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!track) {
      video.srcObject = null;
      return;
    }

    video.srcObject = new MediaStream([track]);
    video.play().catch(() => {});

    return () => {
      video.srcObject = null;
    };
  }, [track]);

  return (
    <div className={`upcall-video-tile${local ? " upcall-self-tile" : ""}`}>
      {track ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-label={local ? "Your camera preview" : "Other participant video"}
        />
      ) : (
        <div className="upcall-camera-off">
          <div className="upcall-avatar">
            {(participant?.user_name || (local ? "You" : "Guest"))
              .trim()
              .charAt(0)
              .toUpperCase()}
          </div>
          <span>{local ? "Your camera is off" : "Camera is off"}</span>
        </div>
      )}

      <div className="upcall-video-name">
        {local ? "You" : participant?.user_name || "Participant"}
      </div>
    </div>
  );
}

function RemoteAudio({ participant }) {
  const audioRef = useRef(null);
  const track = getAudioTrack(participant);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!track) {
      audio.srcObject = null;
      return;
    }

    audio.srcObject = new MediaStream([track]);
    audio.play().catch((error) => {
      console.warn("Remote audio playback needs browser permission:", error);
    });

    return () => {
      audio.srcObject = null;
    };
  }, [track]);

  return <audio ref={audioRef} autoPlay />;
}

export default function DailyRoom({
  roomUrl = "https://cirqll.daily.co/cirqll",
  displayName = "OpenCall User",
  onLeave,
  onJoined,
}) {
  const callRef = useRef(null);
  const callbacksRef = useRef({ onLeave, onJoined });
  const cleaningUpRef = useRef(false);
  const leaveNotifiedRef = useRef(false);
  const joinedNotifiedRef = useRef(false);

  const [participants, setParticipants] = useState([]);
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [cameraSwitching, setCameraSwitching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    callbacksRef.current = { onLeave, onJoined };
  }, [onLeave, onJoined]);

  const refreshParticipants = useCallback((call) => {
    const current = call.participants();
    setParticipants(Object.values(current || {}));
  }, []);

  useEffect(() => {
    let cancelled = false;
    cleaningUpRef.current = false;
    leaveNotifiedRef.current = false;
    joinedNotifiedRef.current = false;

    async function initDaily() {
      let call;

      try {
        call = DailyIframe.createCallObject();
        callRef.current = call;

        const syncParticipants = () => refreshParticipants(call);

        const handleJoined = () => {
          if (cancelled) return;

          setJoined(true);
          setErrorMessage("");
          syncParticipants();

          if (!joinedNotifiedRef.current) {
            joinedNotifiedRef.current = true;
            callbacksRef.current.onJoined?.();
          }
        };

        const handleLeft = () => {
          setJoined(false);
          setParticipants([]);

          if (cleaningUpRef.current || leaveNotifiedRef.current) return;

          leaveNotifiedRef.current = true;
          callbacksRef.current.onLeave?.();
        };

        const handleError = (event) => {
          console.error("Daily call error:", event);
          if (!cancelled) {
            setErrorMessage(
              event?.errorMsg || "The call encountered a problem. Please try again."
            );
          }
        };

        call.on("joined-meeting", handleJoined);
        call.on("participant-joined", syncParticipants);
        call.on("participant-updated", syncParticipants);
        call.on("participant-left", syncParticipants);
        call.on("track-started", syncParticipants);
        call.on("track-stopped", syncParticipants);
        call.on("left-meeting", handleLeft);
        call.on("error", handleError);
        call.on("camera-error", handleError);

        console.log("DAILY JOIN START:", new Date().toISOString());

        await call.join({
          url: roomUrl,
          userName: displayName,
        });

        if (cancelled) return;

        console.log("DAILY JOIN COMPLETE:", new Date().toISOString());

        if (call.meetingState() === "joined-meeting") {
          handleJoined();
        }
      } catch (error) {
        console.error("Daily initialization failed:", error);

        if (!cancelled) {
          setErrorMessage(
            error?.message || "Unable to join the call. Check camera and microphone permissions."
          );
        }
      }
    }

    initDaily();

    return () => {
      cancelled = true;
      cleaningUpRef.current = true;

      const call = callRef.current;
      callRef.current = null;

      if (call) {
        try {
          call.leave();
        } catch (error) {
          console.warn("Daily cleanup leave:", error);
        }

        try {
          call.destroy();
        } catch (error) {
          console.warn("Daily cleanup destroy:", error);
        }
      }
    };
  }, [roomUrl, displayName, refreshParticipants]);

  const toggleMicrophone = async () => {
    const call = callRef.current;
    if (!call) return;

    try {
      await call.setLocalAudio(muted);
      setMuted(!muted);
    } catch (error) {
      console.error("Could not change microphone state:", error);
      setErrorMessage("Could not change microphone settings.");
    }
  };

  const toggleCamera = async () => {
    const call = callRef.current;
    if (!call) return;

    try {
      await call.setLocalVideo(cameraOff);
      setCameraOff(!cameraOff);
    } catch (error) {
      console.error("Could not change camera state:", error);
      setErrorMessage("Could not change camera settings.");
    }
  };

  const switchCamera = async () => {
    const call = callRef.current;
    if (!call || cameraSwitching) return;

    try {
      setCameraSwitching(true);
      await call.cycleCamera();
    } catch (error) {
      console.error("Could not switch camera:", error);
      setErrorMessage("Camera switching is not available on this device.");
    } finally {
      setCameraSwitching(false);
    }
  };

  const leaveCall = async () => {
    const call = callRef.current;
    if (!call) return;

    try {
      await call.leave();
    } catch (error) {
      console.error("Could not leave Daily call cleanly:", error);

      if (!leaveNotifiedRef.current) {
        leaveNotifiedRef.current = true;
        callbacksRef.current.onLeave?.();
      }
    }
  };

  const localParticipant = participants.find((participant) => participant.local);
  const remoteParticipants = participants.filter((participant) => !participant.local);
  const remoteParticipant = remoteParticipants[0];

  return (
    <div className="upcall-call">
      <style>{`
        .upcall-call {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: #08090c;
          color: #fff;
          font-family: inherit;
        }
        .upcall-main-video {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: #101116;
        }
        .upcall-video-tile {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #171920;
        }
        .upcall-video-tile video {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: #101116;
        }
        .upcall-camera-off {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          background: radial-gradient(ellipse at center, #292d38 0%, #101116 72%);
          color: #d8dbe3;
          font-size: 14px;
        }
        .upcall-avatar {
          display: grid;
          place-items: center;
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: #363b49;
          color: #fff;
          font-size: 34px;
          font-weight: 650;
        }
        .upcall-video-name {
          position: absolute;
          bottom: 14px;
          left: 14px;
          max-width: calc(100% - 28px);
          overflow: hidden;
          padding: 7px 11px;
          border-radius: 9px;
          background: rgba(0,0,0,.58);
          color: #fff;
          font-size: 13px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .upcall-self-preview {
          position: absolute;
          z-index: 8;
          top: 88px;
          right: 18px;
          width: clamp(150px, 22vw, 270px);
          aspect-ratio: 3 / 4;
          max-height: 40vh;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,.78);
          border-radius: 17px;
          background: #171920;
          box-shadow: 0 8px 28px rgba(0,0,0,.38);
        }
        .upcall-self-tile video {
          transform: scaleX(-1);
        }
        .upcall-self-preview .upcall-video-name {
          bottom: 8px;
          left: 8px;
          font-size: 12px;
        }
        .upcall-waiting {
          position: absolute;
          z-index: 2;
          top: 50%;
          left: 50%;
          width: min(80%, 340px);
          transform: translate(-50%, -50%);
          color: #d8dbe3;
          text-align: center;
          pointer-events: none;
        }
        .upcall-call-error {
          position: absolute;
          z-index: 15;
          top: 64px;
          left: 50%;
          width: min(90%, 420px);
          transform: translateX(-50%);
          padding: 10px 14px;
          border: 1px solid rgba(248,113,113,.45);
          border-radius: 10px;
          background: rgba(65,20,24,.94);
          color: #fff;
          font-size: 13px;
          text-align: center;
        }
        .upcall-call-controls {
          position: absolute;
          z-index: 10;
          bottom: max(24px, env(safe-area-inset-bottom));
          left: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transform: translateX(-50%);
          padding: 12px 16px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 22px;
          background: rgba(20,22,29,.86);
          box-shadow: 0 8px 28px rgba(0,0,0,.3);
          backdrop-filter: blur(14px);
        }
        .upcall-control-button {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          flex: 0 0 auto;
          border: 0;
          border-radius: 50%;
          background: #393d48;
          color: #fff;
          cursor: pointer;
          touch-action: manipulation;
        }
        .upcall-control-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }
        .upcall-control-button[aria-pressed="true"] {
          background: #6b2930;
        }
        .upcall-control-button.upcall-hangup {
          width: 58px;
          border-radius: 18px;
          background: #e5484d;
        }
        .upcall-control-button:focus-visible {
          outline: 2px solid #fff;
          outline-offset: 3px;
        }
        @media (max-width: 600px) {
          .upcall-self-preview {
            top: 76px;
            right: 12px;
            width: clamp(112px, 34vw, 160px);
            max-height: 28vh;
            border-radius: 13px;
          }
          .upcall-call-controls {
            bottom: max(18px, env(safe-area-inset-bottom));
            gap: 9px;
            padding: 9px 11px;
            border-radius: 19px;
          }
          .upcall-control-button {
            width: 44px;
            height: 44px;
          }
          .upcall-control-button.upcall-hangup {
            width: 52px;
          }
          .upcall-avatar {
            width: 68px;
            height: 68px;
            font-size: 27px;
          }
          .upcall-waiting {
            top: 44%;
            width: 56%;
            margin-left: -15%;
            font-size: 13px;
          }
        }
        @media (max-width: 360px) {
          .upcall-call-controls {
            gap: 6px;
            padding: 8px;
          }
          .upcall-control-button {
            width: 40px;
            height: 40px;
          }
          .upcall-control-button.upcall-hangup {
            width: 46px;
          }
        }
      `}</style>

      <div className="upcall-main-video">
        {remoteParticipant ? (
          <>
            <VideoTile participant={remoteParticipant} />
            <RemoteAudio participant={remoteParticipant} />
          </>
        ) : (
          <div className="upcall-waiting">
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>
              {joined ? "Waiting for the other person…" : "Connecting to your call…"}
            </div>
            <div style={{ opacity: 0.75, lineHeight: 1.5 }}>
              {joined
                ? "Your video will fill this screen when the other participant joins."
                : "Please allow camera and microphone access if your browser asks."}
            </div>
          </div>
        )}
      </div>

      {localParticipant && (
        <div className="upcall-self-preview">
          <VideoTile participant={localParticipant} local />
        </div>
      )}

      {errorMessage && (
        <div className="upcall-call-error" role="status">
          {errorMessage}
        </div>
      )}

      <div className="upcall-call-controls" aria-label="Call controls">
        <button
          type="button"
          className="upcall-control-button"
          onClick={toggleMicrophone}
          disabled={!joined}
          aria-label={muted ? "Turn microphone on" : "Mute microphone"}
          aria-pressed={muted}
          title={muted ? "Turn microphone on" : "Mute microphone"}
        >
          {muted ? <MicOff size={21} /> : <Mic size={21} />}
        </button>

        <button
          type="button"
          className="upcall-control-button"
          onClick={toggleCamera}
          disabled={!joined}
          aria-label={cameraOff ? "Turn camera on" : "Turn camera off"}
          aria-pressed={cameraOff}
          title={cameraOff ? "Turn camera on" : "Turn camera off"}
        >
          {cameraOff ? <VideoOff size={21} /> : <Video size={21} />}
        </button>

        <button
          type="button"
          className="upcall-control-button"
          onClick={switchCamera}
          disabled={!joined || cameraSwitching}
          aria-label="Switch camera"
          title="Switch camera"
        >
          <SwitchCamera size={21} />
        </button>

        <button
          type="button"
          className="upcall-control-button upcall-hangup"
          onClick={leaveCall}
          aria-label="Leave call"
          title="Leave call"
        >
          <PhoneOff size={22} />
        </button>
      </div>
    </div>
  );
}
