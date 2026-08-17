import axios from "axios";

const API = "http://127.0.0.1:8000";

export const improveSpeech = async (speech) => {

    const token = localStorage.getItem("token");

    return axios.post(
        `${API}/ai/speech-improver`,
        {
            speech,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

};