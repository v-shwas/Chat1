import Conversation from "../models/convModel.js";
import Message from "../models/msgModel.js";

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }
    const newMsg = new Message({
      senderId,
      receiverId,
      message,
    });

    if (newMsg) {
      conversation.messages.push(newMsg._id);
    }
    // await conversation.save();
    // await newMsg.save();

    Promise.all([conversation.save(), newMsg.save()]);

    res.status(201).json(newMsg);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    });
  } catch (error) {
    console.log("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export { sendMessage, getMessages };
