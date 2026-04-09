import React, { useEffect, useRef } from "react";
import useCallStore from "../../store/useCallStore";

const CallModal = () => {
  const {
    callStatus,
    callType,
    callerName,
    localStream,
    remoteStream,
    callDuration,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
  } = useCallStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // Include callStatus so effects re-run once the elements are mounted
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callStatus]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callStatus]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (callStatus === "idle") return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Hidden audio element for remote audio (always needed when in call) */}
        <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: "none" }} />

        {/* Video elements — always mounted when callType is video so refs are ready */}
        {callType === "video" && (
          <div style={{
            ...styles.videoContainer,
            display: callStatus === "inCall" ? "block" : "none",
          }}>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={styles.remoteVideo}
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={styles.localVideo}
            />
          </div>
        )}

        {/* Call info */}
        <div style={styles.callInfo}>
          {callType === "video" && callStatus === "inCall" ? null : (
            <div style={styles.callerAvatar}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}

          {callStatus === "ringing" && (
            <>
              <h3 style={styles.callerNameText}>{callerName || "Unknown"}</h3>
              <p style={styles.callStatusText}>
                INCOMING {callType?.toUpperCase()} CALL
              </p>
              <div style={styles.pulseRing} />
            </>
          )}

          {callStatus === "calling" && (
            <>
              <h3 style={styles.callerNameText}>Calling...</h3>
              <p style={styles.callStatusText}>
                INITIATING {callType?.toUpperCase()} LINK
              </p>
            </>
          )}

          {callStatus === "inCall" && callType === "audio" && (
            <>
              <h3 style={styles.callerNameText}>{callerName || "Connected"}</h3>
              <p style={styles.callTimer}>{formatTime(callDuration)}</p>
            </>
          )}

          {callStatus === "inCall" && callType === "video" && (
            <p style={styles.callTimerOverlay}>{formatTime(callDuration)}</p>
          )}
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          {callStatus === "ringing" && (
            <>
              <button onClick={answerCall} style={styles.acceptBtn} title="Accept">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </button>
              <button onClick={rejectCall} style={styles.rejectBtn} title="Reject">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </>
          )}

          {(callStatus === "calling" || callStatus === "inCall") && (
            <>
              <button onClick={toggleMute} style={styles.controlBtn} title="Mute">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
              </button>
              {callType === "video" && (
                <button onClick={toggleCamera} style={styles.controlBtn} title="Camera">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </button>
              )}
              <button onClick={endCall} style={styles.rejectBtn} title="End Call">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                  <line x1="23" y1="1" x2="1" y2="23" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(6, 10, 19, 0.95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(20px)",
  },
  modal: {
    width: "100%",
    maxWidth: "480px",
    padding: "40px",
    borderRadius: "var(--r-xl)",
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    boxShadow: "var(--glass-shadow)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
    position: "relative",
  },
  videoContainer: {
    width: "100%",
    height: "320px",
    borderRadius: "var(--r-md)",
    overflow: "hidden",
    position: "relative",
    background: "#000",
  },
  remoteVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  localVideo: {
    position: "absolute",
    bottom: "12px",
    right: "12px",
    width: "120px",
    height: "90px",
    borderRadius: "var(--r-sm)",
    objectFit: "cover",
    border: "2px solid rgba(0, 229, 255, 0.3)",
  },
  callInfo: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    position: "relative",
  },
  callerAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "rgba(0, 229, 255, 0.08)",
    border: "2px solid rgba(0, 229, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--cyan)",
  },
  callerNameText: {
    fontFamily: "var(--font-display)",
    fontSize: "18px",
    fontWeight: "700",
    color: "var(--text-primary)",
    letterSpacing: "0.1em",
    margin: 0,
  },
  callStatusText: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    color: "var(--cyan)",
    letterSpacing: "0.2em",
    animation: "glow-pulse 2s infinite",
    margin: 0,
  },
  callTimer: {
    fontFamily: "var(--font-mono)",
    fontSize: "24px",
    color: "var(--cyan)",
    letterSpacing: "0.1em",
    margin: 0,
  },
  callTimerOverlay: {
    position: "absolute",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    fontFamily: "var(--font-mono)",
    fontSize: "14px",
    color: "var(--cyan)",
    background: "rgba(0, 0, 0, 0.5)",
    padding: "4px 12px",
    borderRadius: "var(--r-full)",
    margin: 0,
  },
  pulseRing: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    border: "2px solid var(--cyan)",
    position: "absolute",
    top: "-12px",
    animation: "pulse-cyan 1.5s infinite",
    opacity: 0.4,
    pointerEvents: "none",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginTop: "8px",
  },
  acceptBtn: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, #00e676, #00c853)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0, 230, 118, 0.4)",
    transition: "transform 0.2s",
  },
  rejectBtn: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, #ff1744, #d50000)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(255, 23, 68, 0.4)",
    transition: "transform 0.2s",
  },
  controlBtn: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "1px solid var(--border)",
    background: "rgba(0, 229, 255, 0.08)",
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

export default CallModal;
