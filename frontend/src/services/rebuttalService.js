import axios from "axios";

const API = "http://127.0.0.1:8000";

export const generateRebuttal = async (opponent_argument) => {

    const token = localStorage.getItem("token");

    return axios.post(
        `${API}/ai/rebuttal`,
        {
            opponent_argument,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

};