const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const cors = require("cors");

const app = express();
dotenv.config();
connectDB();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// ----------------- Deployment -----------------

// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   const root = require("path").join(__dirname1, "../", "client", "build");

//   app.use(express.static(root));

//   app.get("*", (req, res) => {
//     res.sendFile("index.html", { root });
//     // res.sendFile(path.resolve(__dirname1, "client", "build", "index.html"));
//   });
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running");
//   });
// }

// ----------------- Deployment -----------------

// app.get("*", (req, res) => {
//   app.use(express.static(path.join(__dirname1, "/client/build")));

//   res.sendFile(path.resolve(__dirname1, "client", "build", "index.html"));
// });

app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/api/chats", (req, res) => {
  res.status(200).send("nice");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () =>
  console.log(`Server listening on ${PORT}`)
);

const io = require("socket.io")(server, {
  // amount of time it'll wait before it closes the connection in order to save bandwidth
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  // takes user data from f/e
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // takes the room id from f/e
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room: " + room);
  });

  // receives new message
  socket.on("new message", (newMessageReceived) => {
    let chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      // if the new message's sender is from us, do nothing.
      if (user._id === newMessageReceived.sender._id) return;

      // in means that inside the user's room, emit/send the message
      // the newMessageReceived obj in the f/e and compare to see which chat it belongs to
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });
});
