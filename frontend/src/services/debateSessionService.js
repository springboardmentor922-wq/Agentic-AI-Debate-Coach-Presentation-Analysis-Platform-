import apiClient from "./apiClient";
import { unwrapApiData } from "../utils/apiHelpers";

const BASE_URL = "/debate-sessions";

export const getMySessions = async () => {
    const response = await apiClient.get(BASE_URL);
    return unwrapApiData(response.data);
};

export const getSessionById = async (sessionId) => {
    const response = await apiClient.get(`${BASE_URL}/${sessionId}`);
    return unwrapApiData(response.data);
};

export const createSession = async (sessionData) => {
    const response = await apiClient.post(BASE_URL, sessionData);
    return unwrapApiData(response.data);
};

export const updateSession = async (sessionId, sessionData) => {
    const response = await apiClient.put(`${BASE_URL}/${sessionId}`, sessionData);
    return unwrapApiData(response.data);
};

export const cancelSession = async (sessionId) => {
    const response = await apiClient.delete(`${BASE_URL}/${sessionId}`);
    return unwrapApiData(response.data);
};

export const addParticipant = async (participantData) => {
    const response = await apiClient.post(`${BASE_URL}/participants`, participantData);
    return unwrapApiData(response.data);
};

export const getParticipants = async (sessionId) => {
    const response = await apiClient.get(`${BASE_URL}/${sessionId}/participants`);
    return unwrapApiData(response.data);
};

export const updateParticipant = async (participantId, participantData) => {
    const response = await apiClient.put(`${BASE_URL}/participants/${participantId}`, participantData);
    return unwrapApiData(response.data);
};

export const removeParticipant = async (participantId) => {
    const response = await apiClient.delete(`${BASE_URL}/participants/${participantId}`);
    return unwrapApiData(response.data);
};

export const createRound = async (roundData) => {
    const response = await apiClient.post(`${BASE_URL}/rounds`, roundData);
    return unwrapApiData(response.data);
};

export const getRounds = async (sessionId) => {
    const response = await apiClient.get(`${BASE_URL}/${sessionId}/rounds`);
    return unwrapApiData(response.data);
};

export const updateRound = async (roundId, roundData) => {
    const response = await apiClient.put(`${BASE_URL}/rounds/${roundId}`, roundData);
    return unwrapApiData(response.data);
};

export const completeRound = async (roundId) => {
    const response = await apiClient.put(`${BASE_URL}/rounds/${roundId}/complete`);
    return unwrapApiData(response.data);
};

export const startSession = async (sessionId) => {
    const response = await apiClient.put(`${BASE_URL}/${sessionId}/start`);
    return unwrapApiData(response.data);
};

export const endSession = async (sessionId) => {
    const response = await apiClient.put(`${BASE_URL}/${sessionId}/end`);
    return unwrapApiData(response.data);
};

export default {
    getMySessions,
    getSessionById,
    createSession,
    updateSession,
    cancelSession,
    addParticipant,
    getParticipants,
    updateParticipant,
    removeParticipant,
    createRound,
    getRounds,
    updateRound,
    completeRound,
    startSession,
    endSession,
};