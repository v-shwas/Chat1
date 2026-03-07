import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import useAuthStore from "./useAuthStore";
import { API_BASE } from "../config";

const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isGroupMessagesLoading: false,

  getMyGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const res = await axios.get(`${API_BASE}/groups/my-groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ groups: res.data });
    } catch (error) {
      console.error("getMyGroups error:", error);
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (groupData) => {
    try {
      const token = useAuthStore.getState().token;
      const res = await axios.post(`${API_BASE}/groups/create`, groupData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ groups: [...get().groups, res.data] });
      toast.success("Group created!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create group");
      return null;
    }
  },

  setSelectedGroup: (group) => {
    set({ selectedGroup: group, groupMessages: [] });
  },

  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const res = await axios.get(`${API_BASE}/groups/${groupId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ groupMessages: res.data });
    } catch (error) {
      console.error("getGroupMessages error:", error);
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  sendGroupMessage: async (messageData) => {
    const { selectedGroup, groupMessages } = get();
    if (!selectedGroup) return;
    try {
      const token = useAuthStore.getState().token;
      const res = await axios.post(
        `${API_BASE}/groups/${selectedGroup._id}/message`,
        messageData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ groupMessages: [...groupMessages, res.data] });
    } catch (error) {
      toast.error("Failed to send message");
    }
  },

  addMembers: async (groupId, members) => {
    try {
      const token = useAuthStore.getState().token;
      const res = await axios.post(
        `${API_BASE}/groups/${groupId}/add-members`,
        { members },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update group in list
      const groups = get().groups.map((g) =>
        g._id === groupId ? res.data : g
      );
      set({ groups });
      toast.success("Members added!");
    } catch (error) {
      toast.error("Failed to add members");
    }
  },

  leaveGroup: async (groupId) => {
    try {
      const token = useAuthStore.getState().token;
      await axios.post(
        `${API_BASE}/groups/${groupId}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const groups = get().groups.filter((g) => g._id !== groupId);
      set({ groups, selectedGroup: null, groupMessages: [] });
      toast.success("Left group");
    } catch (error) {
      toast.error("Failed to leave group");
    }
  },

  subscribeToGroupMessages: (socket) => {
    if (!socket) return;

    socket.on("newGroupMessage", ({ groupId, message }) => {
      const { selectedGroup, groupMessages } = get();
      if (selectedGroup?._id === groupId) {
        // Avoid duplicates
        const exists = groupMessages.find((m) => m._id === message._id);
        if (!exists) {
          set({ groupMessages: [...groupMessages, message] });
        }
      }
    });

    socket.on("newGroup", (group) => {
      const exists = get().groups.find((g) => g._id === group._id);
      if (!exists) {
        set({ groups: [...get().groups, group] });
      }
    });

    socket.on("groupUpdated", (group) => {
      const groups = get().groups.map((g) =>
        g._id === group._id ? group : g
      );
      set({ groups });
    });

    socket.on("removedFromGroup", (groupId) => {
      const groups = get().groups.filter((g) => g._id !== groupId);
      const { selectedGroup } = get();
      if (selectedGroup?._id === groupId) {
        set({ groups, selectedGroup: null, groupMessages: [] });
      } else {
        set({ groups });
      }
    });
  },

  unsubscribeFromGroupMessages: (socket) => {
    if (socket) {
      socket.off("newGroupMessage");
      socket.off("newGroup");
      socket.off("groupUpdated");
      socket.off("removedFromGroup");
    }
  },
}));

export default useGroupStore;
