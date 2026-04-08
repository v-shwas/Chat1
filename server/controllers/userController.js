import User from "../models/userModel.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const allUsers = await User.find({ _id: { $ne: loggedInUserId } })
      .select("-password -__v")
      .sort({ lastSeen: -1 })
      .limit(100); // Prevent loading unlimited users

    res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -__v");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getProfile:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullname, about, profilePic } = req.body;

    const updates = {};

    if (fullname !== undefined) {
      const trimmed = fullname.trim();
      if (trimmed.length < 2 || trimmed.length > 50) {
        return res.status(400).json({ error: "Full name must be 2-50 characters" });
      }
      updates.fullname = trimmed;
    }

    if (about !== undefined) {
      if (about.length > 200) {
        return res.status(400).json({ error: "About must be under 200 characters" });
      }
      updates.about = about;
    }

    if (profilePic !== undefined) {
      updates.profilePic = profilePic;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No updates provided" });
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password -__v");
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in updateProfile:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
