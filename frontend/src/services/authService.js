import api from "./api";

export const login = (data) => {

    const formData = new URLSearchParams();

    formData.append("username", data.email);
    formData.append("password", data.password);

    return api.post("/auth/login", formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
};

export const register = (data) => {
    return api.post("/auth/register", data);
};