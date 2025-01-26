
export const storeRefreshToken = (token) => {
    try {
      localStorage.setItem("refreshToken", token);
    } catch (error) {
      console.error("Error storing refresh token:", error);
    }
  };
  export const getRefreshToken = () => {
    try {
      const token = localStorage.getItem("refreshToken");
      return token;
    } catch (error) {
      console.error("Error retrieving refresh token:", error);
      return null;
    }
  };
  
  // Delete the stored refresh token
  export const deleteRefreshToken = () => {
    try {
      localStorage.removeItem("refreshToken");
    } catch (error) {
      console.error("Error deleting refresh token:", error);
    }
  };
  