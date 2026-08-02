import api from "./api";

export const registerUser = (userData) => {
    return api.post("/users/", userData);
};

export const loginUser = (credentials) => {

    const formData = new URLSearchParams();

    formData.append("username", credentials.email);
    formData.append("password", credentials.password);

    return api.post(
        "/auth/login",
        formData,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );

};