import API from "./api";

export async function getProfile() {

    const token = localStorage.getItem("token");

    const response = await fetch(`${API}/profile`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.json();
}