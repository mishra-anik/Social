import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import Card from "./Card";
import "../css/Post.css";
import { io } from "socket.io-client";

const socket = io("https://social-64gp.onrender.com", {
	withCredentials: true,
});
const PostView = () => {
	const [post, setPost] = useState([]);

	useEffect(() => {
		socket.emit("get-posts");

		socket.on("recived-data", (data) => {
			console.log("Posts received:", data);
			setPost(data.posts);
		});
	}, []);

	return (
		<div className='post-container'>
			{post?.map((p) => (
				<Card key={p._id} post={p} />
			))}
		</div>
	);
};

export default PostView;
