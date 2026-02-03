const postRoute = require("express").Router();
const multer = require("multer");
const Post = require("../models/post.model.js");
const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");

const ImageKit = require("imagekit");

const imagekit = new ImageKit({
	publicKey: process.env.ImageKit_Public_Key,
	privateKey: process.env.ImageKit_Private_Key,
	urlEndpoint: process.env.ImageKit_URL_EndPoint,
});
postRoute.post("/createpost", multer().single("file"), async (req, res) => {
	const Authtoken = req.cookies.Authtoken;
	console.log(Authtoken);
	const decoded = jwt.verify(Authtoken, process.env.Jwt_Secret);
	if (!decoded) {
		return res.status(401).json({ message: "Unauthorized" });
	}
	try {
		const user = User.findById(decoded.userId)
		console.log(user)
		const { text } = req.body;
		const file = req.file ? req.file.buffer : null;
		console.log(req.file, text);

		if (!text && !file) {
			return res.status(400).json({ message: "Post cannot be empty" });
		}

		const uploadFile = req.file
			? await imagekit.upload({
					file: file,
					fileName: req.file.originalname + Date.now().toString(),
				})
			: null;

		console.log(uploadFile);

		const image = null;

		console.log(image);
		console.log(decoded);

		const userId = decoded.userId;
		const newPost = await Post.create({ text, file: image, userId });
		res.status(201).json({
			message: "Post created successfully",
			post: newPost,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
});


postRoute.get("/getposts", async (req, res) => {
	const Authtoken = req.cookies.Authtoken;
	const decoded = jwt.verify(Authtoken, process.env.Jwt_Secret);
	if (!decoded) {
		return res.status(401).json({ message: "Unauthorized" });
	}
	try {
		const Allposts = await Post.find().sort({ createdAt: -1 });
		const posts = Allposts.map((post) => {
			const plainPost = post.toObject();

			return {
				_id: plainPost._id,
				text: plainPost.text,
				file: plainPost.file,
				userId: plainPost.userId,
				likes: plainPost.likes,
				comments: plainPost.comments,
				isLike: plainPost.likes.some(
					(like) => like.userId.toString() === userId,
				),
			};
		});
		res.status(200).json({ posts });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
});

postRoute.get("/getpost/:id", async (req, res) => {
	const postID = req.params.id;
	const token = req.cookies.token;
	const decoded = jwt.verify(token, process.env.Jwt_Secret);
	if (!decoded) {
		return res.status(401).json({ message: "Unauthorized" });
	}
	if (!postID) {
		return res.status(201).json({ message: "Can access post" });
	}
	const post = await Post.findById(postID);
	if (!post) {
		res.status(500).json({ message: "invalid post" });
	}

	res.status(400).json({ post });
});

postRoute.post("/comment/:id", async (req, res) => {
	const postID = req.params.id;
	const Authtoken= req.cookies.Authtoken;
	const decoded = jwt.verify(Authtoken, process.env.Jwt_Secret);

	const { message } = req.body;
	if (!postID) {
		return req.status(500).json({ message: "Post is invalid" });
	}

	await Post.findByIdAndUpdate(
		postID,
		{
			$push: {
				comments: {
					userId: decoded.userId,
					text: message,
				},
			},
		},
		{ new: true },
	);
});

postRoute.post("/like/:id", async (req, res) => {
	try {
		const postId = req.params.id;
		console.log(req.params.id);
		console.log(postId);
		const Authtoken = req.cookies.Authtoken;
		// console.log(token)

		if (!Authtoken) return res.status(401).json({ message: "Unauthorized" });

		const decoded = jwt.verify(Authtoken, process.env.Jwt_Secret);
		if (!decoded) {
			return res.status(401).json({ message: "Invalid token" });
		}

		const userId = decoded.userId;
		console.log(userId);

		const post = await Post.findById(postId);
		if (!post) return res.status(404).json({ message: "Post not found" });

		// Toggle like/unlike
		const alreadyLiked = post.likes.some(
			(like) => like.userId.toString() === userId,
		);
		const Updatepost = await Post.findByIdAndUpdate(
			postId,
			alreadyLiked
				? { $pull: { likes: { userId } } }
				: { $addToSet: { likes: { userId } } },
			{ new: true },
		);

		// Send response only once
		return res.status(200).json({ Updatepost });
	} catch (err) {
		console.error(err);
		if (!res.headersSent) {
			res.status(500).json({ message: "Server error" });
		}
	}
});

module.exports = postRoute;
