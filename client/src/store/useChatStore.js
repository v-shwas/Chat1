import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import useAuthStore from "./useAuthStore";
import { API_BASE } from "../config";


const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const res = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ users: res.data });
    } catch (error) {
      toast.error("Failed to load users");
      console.error("getUsers error:", error);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const res = await axios.get(`${API_BASE}/message/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ messages: res.data });
    } catch (error) {
      toast.error("Failed to load messages");
      console.error("getMessages error:", error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;
    try {
      const token = useAuthStore.getState().token;
      const res = await axios.post(
        `${API_BASE}/message/send/${selectedUser._id}`,
        messageData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error("Failed to send message");
      console.error("sendMessage error:", error);
    }
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user, messages: [] });
  },

  subscribeToMessages: (socket) => {
    const { selectedUser } = get();
    if (!selectedUser || !socket) return;

    socket.on("newMessage", (newMessage) => {
      // Only add if it's from the currently selected conversation
      if (newMessage.senderId === selectedUser._id) {
        set({ messages: [...get().messages, newMessage] });
      }
    });
  },

  unsubscribeFromMessages: (socket) => {
    if (socket) {
      socket.off("newMessage");
    }
  },
}));

export default useChatStore;
