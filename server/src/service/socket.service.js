const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Post = require("../models/post.model");

const setUpSocket = (httpServer) => {
  const io = new Server(httpServer, {
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

      if (!token) {
        console.log("No token in socket cookies");
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId || decoded.id;

      const user = await User.findById(userId);
      if (!user) {
        console.log("User not found");
        return next(new Error("Unauthorized"));
      }

      socket.user = user;
      console.log("Socket authenticated:", user._id.toString());
      next();
    } catch (err) {
      console.log("Socket auth error:", err.message);
      next(new Error("Unauthorized"));
    }
  });

  // ✅ ONLY AUTHENTICATED SOCKETS REACH HERE
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("get-posts", async () => {
      console.log("📩 get-posts received");

      const allPosts = await Post.find().sort({ createdAt: -1 });
      const currentUserId = socket.user._id.toString();

      const posts = allPosts.map((post) => {
        const plainPost = post.toObject();
        return {
          _id: plainPost._id,
          text: plainPost.text,
          file: plainPost.file,
          userId: plainPost.userId,
          likes: plainPost.likes,
          comments: plainPost.comments,
          isLike: plainPost.likes.some(
            (like) => like.userId.toString() === currentUserId
          ),
        };
      });

      socket.emit("recived-data", { posts });
    });

    socket.on("get-post-id", async ({ postID }) => {
      const post = await Post.findById(postID);
      socket.emit("recived-post-id", { post });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

module.exports = setUpSocket;
