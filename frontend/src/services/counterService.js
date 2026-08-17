import axios from "axios";

const API = "http://127.0.0.1:8000";

export const generateCounterArguments = async (
    topic,
    position
) => {

    const token = localStorage.getItem("token");

    return axios.post(
        `${API}/ai/counterarguments`,
        {
            topic,
            position,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

};