import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Login.css";

const Signup = () => {
	const {
		register,
		handleSubmit,
    reset,  
		formState: { errors },
	} = useForm();

	const navigate = useNavigate();

	const onSubmit = async (data) => {

    try {
		const res = await axios.post("https://social-64gp.onrender.com/auth/signup", data);
		console.log(res);
		console.log(data);
    reset();
    navigate("/");
    } catch (error) {
      alert(error.response.data.message);
    }
	};

	return (
		<div className='login-container'>
			<form onSubmit={handleSubmit(onSubmit)}>
				<input
					id='name'
					name='name'
					type='text'
					required
					{...register("name", {
						required: "Name is required",
					})}
					placeholder='Full Name'
				/>
				{errors.name && <span>{errors.name.message}</span>}
				<input
					id='email'
					name='email'
					type='email'
					required
					{...register("email", {
						required: "Email is required",
						pattern: {
							value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
							message: "Email is not valid",
						},
					})}
					placeholder='Email address'
				/>
				{errors.email && <span>{errors.email.message}</span>}

				<input
					id='password'
					name='password'
					type='password'
					required
					{...register("password", {
						required: "Password is required",
						minLength: {
							value: 6,
							message: "Password must be at least 6 characters",
						},
						maxLength: {
							value: 20,
							message: "Password cannot exceed 20 characters",
						},
					})}
					placeholder='Password'
				/>
				{errors.password && (
					<span className='error'>{errors.password.message}</span>
				)}

				<div>
					<button type='submit'>Log In</button>
				</div>
				<div className='navigate'>
					<p>Allready have an account? </p>
					<span onClick={() => navigate("/login")}>Login</span>
				</div>
			</form>
		</div>
	);
};

export default Signup;
