import api from "./api";

export const analyzePresentation = async (transcript) => {

    const response = await api.post(
        "/presentation/analyze",
        {
            transcript
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

    const history = await getPresentationHistory();

    if (history.length === 0)
        return null;

    return history[history.length - 1];

};