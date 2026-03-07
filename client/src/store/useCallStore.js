import { create } from "zustand";
import useSocketStore from "./useSocketStore";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

const useCallStore = create((set, get) => ({
  callStatus: "idle", // idle | calling | ringing | inCall
  callType: null, // audio | video
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  callerId: null,
  callerName: null,
  receiverId: null,
  callDuration: 0,
  callTimer: null,
  incomingSignal: null,
  iceCandidateBuffer: [], // Buffer ICE candidates until PC is ready

  // Start a call (caller side)
  startCall: async (receiverId, callType, callerName) => {
    try {
      console.log("[CALL] Starting call to:", receiverId, "type:", callType);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });
      console.log("[CALL] Got local media stream");

      const pc = new RTCPeerConnection(ICE_SERVERS);
      const remoteStream = new MediaStream();

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        console.log("[CALL] Received remote track");
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
        set({ remoteStream });
      };

      pc.oniceconnectionstatechange = () => {
        console.log("[CALL] ICE connection state:", pc.iceConnectionState);
        if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
          console.log("[CALL] ICE connection failed/disconnected");
          get().cleanup();
        }
      };

      const socket = useSocketStore.getState().socket;

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", {
            to: receiverId,
            candidate: event.candidate,
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("[CALL] Created and set local offer");

      socket.emit("callUser", {
        to: receiverId,
        signal: offer,
        callType,
        callerName,
      });

      set({
        callStatus: "calling",
        callType,
        localStream: stream,
        remoteStream,
        peerConnection: pc,
        receiverId,
        iceCandidateBuffer: [],
      });
    } catch (err) {
      console.error("[CALL] Error starting call:", err);
      get().cleanup();
    }
  },

  // Answer an incoming call
  answerCall: async () => {
    const { incomingSignal, callType, callerId } = get();
    console.log("[CALL] Answering call from:", callerId, "type:", callType);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });
      console.log("[CALL] Got local media stream for answer");

      const pc = new RTCPeerConnection(ICE_SERVERS);
      const remoteStream = new MediaStream();

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        console.log("[CALL] Received remote track (answer side)");
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
        set({ remoteStream });
      };

      pc.oniceconnectionstatechange = () => {
        console.log("[CALL] ICE connection state (answer):", pc.iceConnectionState);
        if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
          console.log("[CALL] ICE connection failed/disconnected (answer side)");
          get().cleanup();
        }
      };

      const socket = useSocketStore.getState().socket;

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", {
            to: callerId,
            candidate: event.candidate,
          });
        }
      };

      // Set the remote offer
      await pc.setRemoteDescription(new RTCSessionDescription(incomingSignal));
      console.log("[CALL] Set remote description (offer)");

      // Flush buffered ICE candidates now that PC is ready
      const buffered = get().iceCandidateBuffer;
      console.log("[CALL] Flushing", buffered.length, "buffered ICE candidates");
      for (const candidate of buffered) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn("[CALL] Error adding buffered ICE candidate:", e);
        }
      }

      // Create and send answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log("[CALL] Created and set local answer");

      socket.emit("answerCall", {
        to: callerId,
        signal: answer,
      });

      // Start call timer
      const timer = setInterval(() => {
        set({ callDuration: get().callDuration + 1 });
      }, 1000);

      set({
        callStatus: "inCall",
        localStream: stream,
        remoteStream,
        peerConnection: pc,
        callTimer: timer,
        iceCandidateBuffer: [],
      });

      console.log("[CALL] Answer complete, status: inCall");
    } catch (err) {
      console.error("[CALL] Error answering call:", err);
      // Don't emit endCall here — just clean up locally
      // The other side will detect the disconnect via ICE state
      const { localStream, peerConnection } = get();
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
      if (peerConnection) peerConnection.close();
      set({
        callStatus: "idle",
        localStream: null,
        peerConnection: null,
        incomingSignal: null,
        iceCandidateBuffer: [],
      });
    }
  },

  // Reject incoming call
  rejectCall: () => {
    const { callerId } = get();
    const socket = useSocketStore.getState().socket;
    if (callerId) {
      socket.emit("rejectCall", { to: callerId });
    }
    get().cleanup();
  },

  // End current call
  endCall: () => {
    const { receiverId, callerId } = get();
    const socket = useSocketStore.getState().socket;
    const targetId = receiverId || callerId;
    if (targetId && socket) {
      socket.emit("endCall", { to: targetId });
    }
    get().cleanup();
  },

  // Toggle mute
  toggleMute: () => {
    const { localStream } = get();
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled; // returns true if muted
      }
    }
  },

  // Toggle camera
  toggleCamera: () => {
    const { localStream } = get();
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  },

  // Clean up all call resources
  cleanup: () => {
    console.log("[CALL] Cleaning up call resources");
    const { localStream, peerConnection, callTimer } = get();
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    if (callTimer) {
      clearInterval(callTimer);
    }
    set({
      callStatus: "idle",
      callType: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      callerId: null,
      callerName: null,
      receiverId: null,
      callDuration: 0,
      callTimer: null,
      incomingSignal: null,
      iceCandidateBuffer: [],
    });
  },

  // Setup socket listeners for call events
  setupCallListeners: (socket) => {
    if (!socket) return;

    socket.on("incomingCall", ({ from, signal, callType, callerName }) => {
      console.log("[CALL] Incoming call from:", from, "type:", callType);
      set({
        callStatus: "ringing",
        callType,
        callerId: from,
        callerName: callerName || "Unknown",
        incomingSignal: signal,
        iceCandidateBuffer: [],
      });
    });

    socket.on("callAccepted", async ({ signal }) => {
      console.log("[CALL] Call accepted, setting remote description");
      const { peerConnection } = get();
      if (peerConnection) {
        try {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(signal)
          );

          // Flush any buffered ICE candidates
          const buffered = get().iceCandidateBuffer;
          console.log("[CALL] Flushing", buffered.length, "buffered ICE candidates (caller)");
          for (const candidate of buffered) {
            try {
              await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.warn("[CALL] Error adding buffered ICE candidate:", e);
            }
          }

          // Start timer
          const timer = setInterval(() => {
            set({ callDuration: get().callDuration + 1 });
          }, 1000);
          set({ callStatus: "inCall", callTimer: timer, iceCandidateBuffer: [] });
          console.log("[CALL] Call connected!");
        } catch (err) {
          console.error("[CALL] Error in callAccepted:", err);
        }
      } else {
        console.warn("[CALL] No peer connection when callAccepted received");
      }
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      const { peerConnection } = get();
      if (peerConnection && peerConnection.remoteDescription) {
        // PC is ready, add directly
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn("[CALL] Error adding ICE candidate:", e);
        }
      } else {
        // Buffer it for later
        console.log("[CALL] Buffering ICE candidate (PC not ready)");
        set({ iceCandidateBuffer: [...get().iceCandidateBuffer, candidate] });
      }
    });

    socket.on("callEnded", () => {
      console.log("[CALL] Call ended by remote");
      get().cleanup();
    });

    socket.on("callRejected", () => {
      console.log("[CALL] Call rejected by remote");
      get().cleanup();
    });
  },

  removeCallListeners: (socket) => {
    if (!socket) return;
    socket.off("incomingCall");
    socket.off("callAccepted");
    socket.off("iceCandidate");
    socket.off("callEnded");
    socket.off("callRejected");
  },
}));

export default useCallStore;
