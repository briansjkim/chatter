const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  changeGroupAdmin,
} = require("../controllers/chatControllers");

// endpoint for accessing or creating the chat
// user must be logged in to access this route, so we check for the token in the authorization header
router.route("/").post(protect, accessChat);

// going to get all of the chats from our db FOR that particular user
router.route("/").get(protect, fetchChats);

// endpoint for creating a group chat
router.route("/group").post(protect, createGroupChat);

// endpoint for renaming a group chat
router.route("/rename").put(protect, renameGroup);

// endpoint for removing someone from a group chat
router.route("/groupremove").put(protect, removeFromGroup);

// endpoint for adding someone to a group chat
router.route("/groupadd").put(protect, addToGroup);

// endpoint for changing group admin
router.route("/groupchangeadmin").put(protect, changeGroupAdmin);

module.exports = router;
