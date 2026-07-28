import API from "./api";

// Get all sessions
export async function getSessions(
    search = "",
    status = "All",
    sort = "newest",
    page = 1,
    pageSize = 5
) {

    const token = localStorage.getItem("token");

    const response = await fetch(

        `http://127.0.0.1:8000/sessions?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&sort=${encodeURIComponent(sort)}&page=${page}&page_size=${pageSize}`,

        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

    );

    return response.json();
}

// Create a new session
export async function createSession(sessionData) {

    const token = localStorage.getItem("token");

    const response = await fetch(`${API}/sessions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sessionData),
    });

    return response.json();
}

// Update an existing session
export async function updateSession(id, sessionData) {

    const token = localStorage.getItem("token");

    const response = await fetch(`${API}/sessions/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sessionData),
    });

    return response.json();
}

// Delete a session
export async function deleteSession(id) {

    const token = localStorage.getItem("token");

    const response = await fetch(`${API}/sessions/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.json();
}

// Get a single session
export async function getSession(id) {

    const token = localStorage.getItem("token");

    const response = await fetch(`${API}/sessions/${id}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.json();
}