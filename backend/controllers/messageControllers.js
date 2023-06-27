const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

// @description   Create new messages
// @route         POST /api/message/
// @access        Protected

const sendMessage = asyncHandler(async (req, res) => {
  // chat id, actual message, sender of the message
  const { content, chatId } = req.body;

  if (!chatId || !content) {
    console.log("Invalid data passed into request");
    // sendStatus sets the status and sends it to the client, while status only sets the status
    return res.sendStatus(400);
  }

  try {
    // all required fields from Message Model
    var message = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId,
    });

    message = await // populating message instance
    (
      await message.populate("sender", "name pic")
    ).populate({
      // populating chat
      path: "chat",
      select: "chatName isGroupChat users",
      model: "Chat",
      // populating the User model
      populate: { path: "users", select: "name email pic", model: "User" },
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { sendMessage, allMessages };
