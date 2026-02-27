import { create } from "zustand";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config";


const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],

  connectSocket: (userId) => {
    const { socket } = get();
    if (socket?.connected) return;

    const newSocket = io(SOCKET_URL, {
      query: { userId },
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },
}));

export default useSocketStore;
