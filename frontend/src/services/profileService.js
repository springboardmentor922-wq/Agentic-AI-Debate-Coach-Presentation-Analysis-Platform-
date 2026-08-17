import api from "./api";

// Get Profile
export const getProfile = () => {
  return api.get("/profile/");
};

// Update Profile
export const updateProfile = (data) => {
  return api.put("/profile/", data);
};