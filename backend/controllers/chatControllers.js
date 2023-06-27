const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = asyncHandler(async (req, res) => {
  // fetching one-on-one chats

  // get the userId that the current user is trying to chat with
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  // here, we check if a chat exists between the current user and the userId
  // since this is to fetch 1 on 1 chats, we set isGroupChat to false (already false by default)
  let isChat = await Chat.find({
    // isGroupChat: false,
    // using $and because both userId and req.user._id have to be true/valid values
    $and: [
      // equal to the current user that's logged in
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  // if the chat exists, then return the existing chat
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    // if the chat doesn't exist, create a new chat
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(FullChat);
    } catch (err) {
      re.status(400);
      throw new Error(err.message);
    }
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    // check which user is logged in and query all of the existing chats that the user is a part of
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  // when a user creates a group chat, they have to provide the group chat name and all of the users they want to add, so
  // we're going to take all the users and take the name of the group chat from the req.body
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all of the fields" });
  }
  // users is sent in a JSON.stringify format, so in the b/e, we need to parse that string into an object
  let users = JSON.parse(req.body.users);

  // a group chat must have more than 2 users (not including current user)
  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }
  // ofc we can't forget to add the current user to the group chat
  users.push(req.user);

  try {
    // here, we create the group chat
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    // after we create the gc and it's saved, we fetch it and send it
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  // getting the chat id and the new chat name
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    {
      // set new to true to return the new name. If new isn't set to true, it returns the old name
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  // if the updatedChat has nothing/doesn't exist, send errors
  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

const addToGroup = asyncHandler(async (req, res) => {
  // get the gc id and the user we want to add
  const { chatId, userId } = req.body;

  const addedToGroup = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!addedToGroup) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(addedToGroup);
  }
});

const removeFromGroup = asyncHandler(async (req, res) => {
  // get the gc id and the user we want to add
  const { chatId, userId } = req.body;

  const removedFromGroup = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removedFromGroup) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removedFromGroup);
  }
});

const changeGroupAdmin = asyncHandler(async (req, res) => {
  const { chatId, newAdminId } = req.body;

  const changedAdmin = await Chat.findByIdAndUpdate(
    chatId,
    {
      groupAdmin: newAdminId,
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!changedAdmin) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(changedAdmin);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  changeGroupAdmin,
};
