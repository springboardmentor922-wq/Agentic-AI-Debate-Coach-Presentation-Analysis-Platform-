import API from "./api";

export async function loginUser(data) {
    try {

        const response = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || "Login failed");
        }

        return result;

    } catch (error) {
        console.error("Login Error:", error);
        return {
            error: error.message,
        };
    }
}