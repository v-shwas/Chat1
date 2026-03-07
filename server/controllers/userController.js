import User from "../models/userModel.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const allUsers = await User.find({ _id: { $ne: loggedInUserId } }).select([
      "-password",
      "-__v",
    ]);

    res.status(200).json(allUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -__v");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getProfile:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullname, about, profilePic } = req.body;

    const updates = {};
    if (fullname) updates.fullname = fullname;
    if (about !== undefined) updates.about = about;
    if (profilePic !== undefined) updates.profilePic = profilePic;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password -__v");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateProfile:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
