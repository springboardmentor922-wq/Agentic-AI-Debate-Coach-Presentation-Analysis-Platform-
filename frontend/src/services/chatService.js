import axios from "axios";

const API = "http://127.0.0.1:8000";

export const sendMessage = async (
  message,
  page = "",
  topic = ""
) => {
  const token = localStorage.getItem("token");

  return axios.post(
    `${API}/chat`,
    {
      message,
      page,
      topic,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};