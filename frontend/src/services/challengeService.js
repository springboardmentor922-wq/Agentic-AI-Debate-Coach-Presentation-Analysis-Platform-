import axios from "axios";

const API = "http://127.0.0.1:8000";

export const getTodayChallenge = async () => {

    const token = localStorage.getItem("token");

    return axios.get(

        `${API}/challenge/today`,

        {

            headers: {

                Authorization: `Bearer ${token}`

            }

        }

    );

};