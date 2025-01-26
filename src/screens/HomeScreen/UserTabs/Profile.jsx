
import { useNavigate } from "react-router-dom"; // Using react-router for navigation
import { Button, Typography, Box } from "@mui/material"; // Example using Material-UI
import { useDispatch } from "react-redux";
import { useAppTheme } from "../../../utils/theme";
import { logOut } from "../../../Auth/AuthSlice";
import { useLogoutMutation } from "../../../Auth/authApiSlice";
import { getRefreshToken } from "../../../secureStore/secureStoreUtility";

const Profile = () => {
	const navigate = useNavigate(); // Using useNavigate for navigation
	const theme = useAppTheme();
	const dispatch = useDispatch();
	const [logout, { error }] = useLogoutMutation();

	const handleLogout = async () => {
		try {
			const refreshToken = await getRefreshToken();
			await logout({ refreshToken: refreshToken }).unwrap();
			dispatch(logOut());
			navigate("/login"); // Navigate to Login page
		} catch (err) {
			console.error("Logout failed", err || error);
		}
	};

	return (
		<Box sx={{ padding: 2 }}>
			<Typography variant="h6" sx={{ marginBottom: 2 }}>
				Profile
			</Typography>
			<Button onClick={handleLogout} variant="text" sx={{ textDecoration: "underline", color: theme.colors.primary }}>
				Logout
			</Button>
		</Box>
	);
};

export default Profile;
