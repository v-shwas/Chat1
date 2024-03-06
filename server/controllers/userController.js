import User from "../models/userModel.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req._id;

    const allUsers = await User.find({ _id: { $ne: loggedInUserId } }).select([
      "-password",
      "-createdAt",
      "-updatedAt",
      "-__v",
    ]);

    res.status(200).json(allUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
