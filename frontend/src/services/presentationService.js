import api from "./api";

export const analyzePresentation = async (
    transcript,
    file = null
) => {

    const formData = new FormData();

    if (transcript && transcript.trim() !== "") {

        formData.append(
            "transcript",
            transcript
        );

    }

    if (file) {

        formData.append(
            "file",
            file
        );

    }

    const response = await api.post(

        "/presentation/analyze",

        formData,

        {

            headers: {

                "Content-Type":
                    "multipart/form-data"

            }

        }

    );

    return response.data;

};

export const getPresentationHistory = async () => {

    const response = await api.get(

        "/presentation/history"

    );

    return response.data;

};

export const getLatestPresentation = async () => {

    const history =
        await getPresentationHistory();

    if (history.length === 0)

        return null;

    return history[history.length - 1];

};