import { useState, useRef } from "react";
import { Mic, X, Send } from "lucide-react";

const VoiceRecorder = ({ onSend }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        if (onSend && blob.size > 0) onSend(blob, duration);
        setDuration(0);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

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
          <X size={14} />
        </button>
        <div style={styles.recordingIndicator}>
          <span style={styles.recordingDot} />
          <span style={styles.recordingTime}>{formatTime(duration)}</span>
        </div>
        <button onClick={stopRecording} style={styles.sendBtn}>
          <Send size={16} />
        </button>
      </div>
    );
  }

  return (
    <button onClick={startRecording} style={styles.micBtn} title="Record voice">
      <Mic size={16} />
    </button>
  );
};

const styles = {
  micBtn: {
    width: "36px", height: "36px", borderRadius: "50%",
    border: "none", background: "transparent",
    color: "var(--text-muted)", display: "flex",
    alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
  },
  recordingBar: { display: "flex", alignItems: "center", gap: "8px", flex: 1 },
  cancelBtn: {
    width: "32px", height: "32px", borderRadius: "50%",
    border: "1px solid rgba(239,68,68,0.3)",
    background: "rgba(239,68,68,0.1)",
    color: "var(--red)", display: "flex",
    alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
  },
  recordingIndicator: {
    flex: 1, display: "flex", alignItems: "center", gap: "8px",
    padding: "6px 12px", borderRadius: "var(--r-full)",
    background: "rgba(215,107,98,0.08)",
    border: "1px solid rgba(215,107,98,0.18)",
  },
  recordingDot: {
    width: "8px", height: "8px", borderRadius: "50%",
    background: "var(--red)", animation: "pulse-dot 1s infinite", flexShrink: 0,
  },
  recordingTime: { fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-primary)" },
  sendBtn: {
    width: "36px", height: "36px", borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, var(--accent-soft), var(--accent-strong))",
    color: "#241a00", display: "flex",
    alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
  },
};

export default VoiceRecorder;
