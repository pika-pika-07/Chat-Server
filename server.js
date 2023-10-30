const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const {
  userJoin,
  getRoomUsers,
  getCurrentUser,
  fetchUsersWithSocketId,
  toggleUserStatus,
} = require("./utils/helpers");
const moment = require("moment");

const app = express();
const isDev = app.settings.env === "development";
const URL = isDev
  ? "http:localhost:3000"
  : "https://chat-appp-live.vercel.app/";
app.use(cors({ origin: URL }));
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: URL,
});

io.on("connection", (socket) => {
  socket.on("join-room", ({ user }) => {
    const newuser = userJoin(user);

    socket.join(newuser.room);

    // Welcome current User
    socket.emit("welcomeMessage", {
      message: `Welcome ${user.name} to ChatApp`,
      user: "Bot",
      time: moment().format("h:mm a"),
    });

    // Broadcast when a user connects
    socket.broadcast.to(newuser.room).emit("recieveChatMessage", {
      message: `${newuser.name} has joined`,
      time: moment().format("h:mm a"),
      user: "Bot",
    });

    // Send users and room info
    io.to(newuser.room).emit("roomUsers", {
      room: newuser.room,
      users: getRoomUsers(newuser.room),
    });
  });

  socket.on("sendChatMessage", (message) => {
    const currentUser = getCurrentUser(socket.id);
    io.to(currentUser?.room).emit("recieveChatMessage", {
      message: message,
      user: currentUser?.name,
      time: moment().format("h:mm a"),
    });
  });

  socket.on("disconnect", () => {
    let loggedoutuser = fetchUsersWithSocketId(socket.id);

    io.to(loggedoutuser[0]?.room).emit("recieveChatMessage", {
      message: `${loggedoutuser[0]?.name} has left the chat`,
      time: moment().format("h:mm a"),
      user: "Bot",
    });
    io.to(loggedoutuser[0]?.room).emit("roomUsers", {
      room: loggedoutuser[0]?.room,
      users: getRoomUsers(loggedoutuser[0]?.room),
    });
  });

  socket.on("offline", (user) => {
    toggleUserStatus(user, false);
    io.to(user?.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("online", (user) => {
    toggleUserStatus(user, true);
    io.to(user?.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
});

httpServer.listen(5600);
