const authRouter = require("express").Router();
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
authRouter.get("/me", async (req, res) => {
	const Authtoken = req.cookies.Authtoken;
	if (!Authtoken) {
		return res.status(401).json({ message: "Unauthorized" });
	}
	try {
		const decoded = jwt.verify(Authtoken, process.env.Jwt_Secret);
		const user = await User.findById(decoded.userId).select("-password");
		if (!user) {
			return res.status(401).json({ message: "Unauthorized" });
		}
	return	res.status(200).json({ user });
	} catch (error) {
		console.error(error);
	return	res.status(401).json({ message: "Unauthorized" });
	}
});

authRouter.post("/signup", async (req, res) => {
	try {
		console.log(req.body);

		const { name, email, password } = req.body;
		console.log(name, email, password);

		if (!name || !email || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		const newUser = await User.create({ name, email, password });

		const Authtoken = jwt.sign({ userId: newUser._id }, process.env.Jwt_Secret);
		res.cookie("Authtoken", Authtoken, {
			httpOnly: true,
			maxAge: 24 * 60 * 60 * 1000, // 1 day
			sameSite: "none",
			secure: true,
		});
		res.status(201).json({
			message: "User registered successfully",
			user: newUser,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
});

authRouter.post("/login", async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email, password });

	if (!user) {
		return res.status(400).json({ message: "Invalid email or password" });
	}

	const Authtoken = jwt.sign({ userId: user._id }, process.env.Jwt_Secret);
	res.cookie("Authtoken", Authtoken, {
		httpOnly: true,
		maxAge: 24 * 60 * 60 * 1000, // 1 day
		sameSite: "none",
		secure: true,
	});

	res.status(200).json({ message: "Login successful", user });
	res.send("Login Route");
});

module.exports = authRouter;
