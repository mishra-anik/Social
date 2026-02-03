const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Post = require("../models/post.model");

const setUpSocket = (httpServer) => {
	const io = new Server(httpServer, {
		cors: {
			origin: "http://localhost:5173",
			methods: ["GET", "POST"],
			credentials: true,
		},
	});

	console.log("🟢 Socket setup initialized");

	io.on("connection", async (socket) => {
		console.log("🔌 Socket connected:", socket.id);


		try {
			// Parse cookies from socket handshake
			const cookies = cookie.parse(socket.handshake.headers.cookie || "");

			if (!cookies.Authtoken) {
				console.log("❌ No token in cookies");
				socket.disconnect(true);
				return;
			}

			// Verify JWT
			const decoded = jwt.verify(cookies.Authtoken, process.env.JWT_SECRET);

			// Make sure you use the correct field from the token
			const userId = decoded.userId || decoded.id;

			const user = await User.findById(userId);
            console.log(user)
			if (!user) {
				console.log("❌ User not found");
				socket.disconnect(true);
				return;
			}

			socket.user = user;
			console.log("✅ User authenticated:", user._id.toString());
		} catch (err) {
			console.log("❌ Auth error:", err.message);
			socket.disconnect(true);
			return;
		}

		// ✅ EVENTS (ONLY AFTER AUTH)
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

        socket.on("get-post-id",async(id)=>{
            const post = await Post.findById(id);
            
            socket.emit("recived-post-id" , {post})
        })
	});
};

module.exports = setUpSocket;
