import { useState, useEffect } from "react";
import axios from "axios";

import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
	withCredentials: true,
});

const PostCard = ({ post }) => {
	const [open, setOpen] = useState(false);
	const [like , setLike] = useState(false)
	const [data, setData] = useState(post);
	const [message, setMessage] = useState("");
	if (data) {
		post = data;
	}
	const handleCommentBox = () => {
		setOpen(!open);
	};
	const handleComment = async (id) => {
		if (!message.trim()) return;

		try {
			// log message being sent
			console.log("sending:", message);

			await axios.post(
				`http://localhost:3000/comment/${id}`,
				{ message },
				{ withCredentials: true },
			);

			setMessage("");
		} catch (err) {
			console.log(err);
		}
	};

	const handleLike = async (id) => {
		const res = await axios.post(
			`http://localhost:3000/like/${id}`,
			{},

			{ withCredentials: true },
		);

		setLike(!like)
	
		console.log(res.data.Updatepost);
	};

	useEffect(()=>{
			socket.emit("get-posts-id",{postID:data._id});

		socket.on("recived-data-id", (data) => {
			console.log("Post received:", data);
			setData(data.post);
		});

	} , [like])
	

	return (
		<div style={styles.card}>
			{/* Text */}
			{data.text && <div style={styles.text}>{data.text}</div>}

			{/* Image */}
			{data.file && (
				<div style={styles.imageContainer}>
					<img src={data.file} alt='post' style={styles.image} />
				</div>
			)}

			{/* Actions */}
			<div style={styles.actions}>
				<button onClick={() => handleLike(data._id)}>
					{data.isLike ? "❤️ " : "🤍"}
				</button>
				<button onClick={handleCommentBox}>💬 Comment</button>
			</div>
			{open && (
				<div>
					<input
						type='text'
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder='comment here'
						id=''
					/>
					<button onClick={() => handleComment(data._id)}>
						submit
					</button>
				</div>
			)}
		</div>
	);
};

const styles = {
	card: {
		breakInside: "avoid", // 👈 VERY IMPORTANT
		marginBottom: "16px",
		backgroundColor: "#fff",
		borderRadius: "8px",
		padding: "12px",
		border: "1px solid #ddd",
	},

	text: {
		fontSize: "14px",
		marginBottom: "8px",
	},

	imageContainer: {
		width: "100%",
		maxHeight: "20rem", // 👈 image limited, card not
		overflow: "hidden",
		borderRadius: "6px",
		backgroundColor: "#f0f0f0",
	},

	image: {
		width: "100%",
		height: "100%",
		objectFit: "contain", // use "cover" if you want crop
	},

	actions: {
		display: "flex",
		justifyContent: "space-between",
		marginTop: "12px",
	},

	button: {
		padding: "8px 14px",
		borderRadius: "6px",
		border: "none",
		backgroundColor: "#4CAF50",
		color: "#fff",
		cursor: "pointer",
	},
};

export default PostCard;
