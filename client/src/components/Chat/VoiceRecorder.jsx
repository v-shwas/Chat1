import React, { useState, useRef } from "react";

const VoiceRecorder = ({ onSend }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        if (onSend && blob.size > 0) {
          onSend(blob, duration);
        }
        setDuration(0);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Timer
      let secs = 0;
      timerRef.current = setInterval(() => {
        secs++;
        setDuration(secs);
      }, 1000);
    } catch (err) {
      console.error("Mic access denied:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      clearInterval(timerRef.current);
      chunksRef.current = [];
      setIsRecording(false);
      setDuration(0);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (isRecording) {
    return (
      <div style={styles.recordingBar}>
        <button onClick={cancelRecording} style={styles.cancelBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div style={styles.recordingIndicator}>
          <span style={styles.recordingDot} />
          <span style={styles.recordingTime}>{formatTime(duration)}</span>
          <span style={styles.recordingLabel}>RECORDING</span>
        </div>
        <button onClick={stopRecording} style={styles.sendVoiceBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startRecording}
      style={styles.micButton}
      title="Record voice message"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  );
};

const styles = {
  micButton: {
    width: "36px",
    height: "36px",
    borderRadius: "var(--radius-md)",
    border: "none",
    background: "transparent",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "color var(--transition-fast)",
    flexShrink: 0,
  },
  recordingBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
  },
  cancelBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "var(--radius-md)",
    border: "1px solid rgba(255, 23, 68, 0.3)",
    background: "rgba(255, 23, 68, 0.08)",
    color: "var(--danger)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  recordingIndicator: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "var(--radius-md)",
    background: "rgba(255, 23, 68, 0.06)",
    border: "1px solid rgba(255, 23, 68, 0.15)",
  },
  recordingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "var(--danger)",
    animation: "pulse-dot 1s infinite",
    flexShrink: 0,
  },
  recordingTime: {
    fontFamily: "var(--font-mono)",
    fontSize: "14px",
    color: "var(--text-primary)",
    letterSpacing: "0.05em",
  },
  recordingLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "8px",
    color: "var(--danger)",
    letterSpacing: "0.15em",
    marginLeft: "auto",
  },
  sendVoiceBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "var(--radius-md)",
    border: "none",
    background: "linear-gradient(135deg, #7c4dff 0%, #651fff 100%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(124, 77, 255, 0.35)",
    flexShrink: 0,
  },
};

export default VoiceRecorder;
