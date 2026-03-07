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
  typingUsers: {}, // { [userId]: true }
  replyingTo: null, // message object being replied to

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
    const { selectedUser, messages, replyingTo } = get();
    if (!selectedUser) return;
    try {
      const token = useAuthStore.getState().token;
      const payload = { ...messageData };
      if (replyingTo) {
        payload.replyTo = replyingTo._id;
      }
      const res = await axios.post(
        `${API_BASE}/message/send/${selectedUser._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ messages: [...messages, res.data], replyingTo: null });
    } catch (error) {
      toast.error("Failed to send message");
      console.error("sendMessage error:", error);
    }
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user, messages: [], replyingTo: null });
  },

  setReplyingTo: (message) => {
    set({ replyingTo: message });
  },

  cancelReply: () => {
    set({ replyingTo: null });
  },

  // Mark messages as read
  markAsRead: async (senderId) => {
    try {
      const token = useAuthStore.getState().token;
      await axios.post(
        `${API_BASE}/message/read/${senderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("markAsRead error:", error);
    }
  },

  // React to a message
  reactToMessage: async (messageId, emoji) => {
    try {
      const token = useAuthStore.getState().token;
      await axios.post(
        `${API_BASE}/message/react/${messageId}`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update locally
      const messages = get().messages.map((m) => {
        if (m._id === messageId) {
          const userId = useAuthStore.getState().authUser?._id;
          let reactions = (m.reactions || []).filter(
            (r) => r.userId !== userId && r.userId?._id !== userId
          );
          if (emoji) {
            reactions.push({ userId, emoji });
          }
          return { ...m, reactions };
        }
        return m;
      });
      set({ messages });
    } catch (error) {
      console.error("reactToMessage error:", error);
    }
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    try {
      const token = useAuthStore.getState().token;
      await axios.delete(`${API_BASE}/message/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const messages = get().messages.map((m) =>
        m._id === messageId ? { ...m, isDeleted: true, message: "" } : m
      );
      set({ messages });
    } catch (error) {
      toast.error("Failed to delete message");
    }
  },

  subscribeToMessages: (socket) => {
    const { selectedUser } = get();
    if (!selectedUser || !socket) return;

    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId === selectedUser._id) {
        set({ messages: [...get().messages, newMessage] });
      }
    });

    // Typing indicators
    socket.on("userTyping", ({ userId }) => {
      if (userId === selectedUser._id) {
        set({ typingUsers: { ...get().typingUsers, [userId]: true } });
      }
    });

    socket.on("userStopTyping", ({ userId }) => {
      if (userId === selectedUser._id) {
        const typingUsers = { ...get().typingUsers };
        delete typingUsers[userId];
        set({ typingUsers });
      }
    });

    // Reaction updates
    socket.on("messageReaction", ({ messageId, reactions }) => {
      const messages = get().messages.map((m) =>
        m._id === messageId ? { ...m, reactions } : m
      );
      set({ messages });
    });

    // Message deletion
    socket.on("messageDeleted", ({ messageId }) => {
      const messages = get().messages.map((m) =>
        m._id === messageId ? { ...m, isDeleted: true, message: "" } : m
      );
      set({ messages });
    });

    // Read receipts
    socket.on("messagesMarkedRead", () => {
      const messages = get().messages.map((m) => ({
        ...m,
        status: "read",
      }));
      set({ messages });
    });
  },

  unsubscribeFromMessages: (socket) => {
    if (socket) {
      socket.off("newMessage");
      socket.off("userTyping");
      socket.off("userStopTyping");
      socket.off("messageReaction");
      socket.off("messageDeleted");
      socket.off("messagesMarkedRead");
    }
  },
}));

export default useChatStore;
