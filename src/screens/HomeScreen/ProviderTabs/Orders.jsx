import React, { useEffect } from "react";
import { Button, Typography, Box } from "@mui/material"; // Using MUI for Button and Typography
import { useFetchUserDetailsQuery } from "../../../Auth/authApiSlice";
import withAuthCheck from "../../../hocs/withAuthCheck";

const Orders = () => {
	const {
		data: userDetails,
		isError: isUserDetailsError,
		error: userDetailsError,
		refetch,
	} = useFetchUserDetailsQuery();

	useEffect(() => {
		if (isUserDetailsError) {
			console.log("Use Effect Error: ", userDetailsError);
		}
	}, [isUserDetailsError, userDetailsError]);

	const handleGetUserInfo = async () => {
		const result = await refetch();
		if (result.error) {
			console.log("Error refetching user details:", result.error);
		} else {
			console.log("User details refetched:", result.data);
		}
	};

	return (
		<Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh">
			<Typography variant="h6" gutterBottom>
				Orders
			</Typography>
			<Button variant="contained" onClick={handleGetUserInfo}>
				Get
			</Button>
			{userDetails && <Typography>{userDetails.firstName}</Typography>}
		</Box>
	);
};

export default withAuthCheck(Orders);
