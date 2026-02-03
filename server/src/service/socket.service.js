const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Post = require("../models/post.model");

let io; 

const setUpSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "https://social-gilt-seven.vercel.app",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log("Socket setup initialized");

  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.Authtoken;

      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId || decoded.id;

      const user = await User.findById(userId);
      if (!user) return next(new Error("Unauthorized"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("get-posts", async () => {
      const allPosts = await Post.find().sort({ createdAt: -1 });
      const currentUserId = socket.user._id.toString();

      const posts = allPosts.map((post) => {
        const p = post.toObject();
        return {
          ...p,
          isLike: p.likes.some(
            (l) => l.userId.toString() === currentUserId
          ),
          totalLikes: p.likes.length,
        };
      });

      socket.emit("recived-data", { posts });
    });

    socket.on("join-post", (postId) => {
      socket.join(postId);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

const getIO = () => io;

module.exports = { setUpSocket, getIO };
