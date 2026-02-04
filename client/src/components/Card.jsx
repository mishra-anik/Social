import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("https://social-64gp.onrender.com", {
  withCredentials: true,
});

const Card = ({ post }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(post);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.emit("join-post", data._id);

    socket.on("post-updated", (updatedPost) => {
      if (updatedPost._id === data._id) {
        setData((prev) => ({
          ...prev,
          ...updatedPost,
        }));
      }
    });

    return () => {
      socket.off("post-updated");
    };
  }, []);

  const handleLike = async (id) => {
    setData((prev) => ({
      ...prev,
      isLike: !prev.isLike,
      totalLikes: prev.isLike
        ? prev.totalLikes - 1
        : prev.totalLikes + 1,
    }));

    await axios.post(
      `http://localhost:3000/like/${id}`,
      {},
      { withCredentials: true }
    );
  };

  const handleComment = async (id) => {
    if (!message.trim()) return;

    await axios.post(
      `https://social-64gp.onrender.com/comment/${id}`,
      { message },
      { withCredentials: true }
    );

    setMessage("");
  };

  return (
    <div style={styles.card}>
		<h1></h1>
      {data.text && <div>{data.text}</div>}

      {data.file && (
        <img src={data.file} style={styles.image} />
      )}

      <div style={styles.actions}>
        <button onClick={() => handleLike(data._id)}>
          {data.isLike ? "❤️" : "🤍"} {data.totalLikes}
        </button>
        <button onClick={() => setOpen(!open)}>💬 Comment</button>
      </div>

      {open && (
        <>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="comment..."
          />
          <button onClick={() => handleComment(data._id)}>
            Send
          </button>
        </>
      )}
    </div>
  );
};
const styles = {
  card: {
    padding: 12,
    // border: "1px solid #d21818",
    borderRadius: 8,
    marginBottom: 16,
backgroundColor: "#e4e1e1f8", // 🌑 dark gray
    color: "#070202a3",           // light text for contrast

    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)", // ✨ soft shadow
    display: "flex",
    flexDirection: "column",
    // justifyContent: "center",
    // alignItems: "center",

    gap: "1.5rem", // 🔥 THIS adds spacing between elements
  },

  image: {
    width: "100%",
    height: "20rem",
    objectFit: "contain",
  },

  actions: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",

    backgroundColor: "#2d7ff9", // 🔵 soft blue
    color: "#ffffff",
    fontWeight: 500,

    transition: "background-color 0.2s ease, transform 0.1s ease",
  },
};



export default Card;
