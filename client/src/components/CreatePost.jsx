import "../css/CreatePost.css";
import { useState } from "react";
import { Image } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
	const navigate = useNavigate();
	const [data, setData] = useState({
		text: "",
		file: null,
	});

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!data.text && !data.file) return;

		const formData = new FormData();
		if (data.text) formData.append("text", data.text);
		if (data.file) formData.append("file", data.file);

		try {
			const res = await axios.post(
				"https://social-64gp.onrender.com/createpost",
				formData,
				{ withCredentials: true },

			);
				setData({ text: "", file: null })
				alert("Post created successfully");
		} catch (error) {
			alert(error.response?.data?.message || "Something went wrong");
			console.error("Error creating post:", error);
		}
	};

	const showImage = () => {
		if (data.file) return URL.createObjectURL(data.file);
	};

	return (
		<div>
			<h1 onClick={() => navigate("/login")}>login</h1>
			<form className='create-post-container' onSubmit={handleSubmit}>
				<h1>Create new post</h1>

				<textarea
					placeholder='write text here'
					value={data.text}
					onChange={(e) => setData({ ...data, text: e.target.value })}
				/>

				<div className='below'>
					<label className='custom-file-btn'>
						<Image />
						<input
							type='file'
							hidden
							onChange={(e) =>
								setData({ ...data, file: e.target.files[0] })
							}
						/>
					</label>

					<button
						className='button'
						type='submit'
						disabled={!data.text && !data.file}
					>
						Post
					</button>
				</div>
			</form>

			{data.file && (
				<div className='image-container'>
					<img src={showImage()} alt='preview' />
				</div>
			)}
		</div>
	);
};

export default CreatePost;
