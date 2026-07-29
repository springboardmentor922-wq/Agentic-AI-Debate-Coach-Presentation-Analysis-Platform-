/*
=========================================================
Debate Topic Service

Handles all Debate Topic API requests.

Endpoints

GET     /debate-topics
GET     /debate-topics/{id}
POST    /debate-topics
PUT     /debate-topics/{id}
DELETE  /debate-topics/{id}

=========================================================
*/

import apiClient from "./apiClient";

const BASE_URL = "/debate-topics";

// =========================================================
// Get All Debate Topics
// =========================================================

const getAllTopics = async () => {
    try {
        const response = await apiClient.get(BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching debate topics:", error);
        throw error;
    }
};

// =========================================================
// Get Debate Topic By ID
// =========================================================

const getTopicById = async (topicId) => {
    try {
        const response = await apiClient.get(`${BASE_URL}/${topicId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching debate topic:", error);
        throw error;
    }
};

// =========================================================
// Create Debate Topic
// =========================================================

const createTopic = async (topicData) => {
    try {
        const response = await apiClient.post(BASE_URL, topicData);
        return response.data;
    } catch (error) {
        console.error("Error creating debate topic:", error);
        throw error;
    }
};

// =========================================================
// Update Debate Topic
// =========================================================

const updateTopic = async (topicId, topicData) => {
    try {
        const response = await apiClient.put(
            `${BASE_URL}/${topicId}`,
            topicData
        );

        return response.data;
    } catch (error) {
        console.error("Error updating debate topic:", error);
        throw error;
    }
};

// =========================================================
// Delete Debate Topic
// =========================================================

const deleteTopic = async (topicId) => {
    try {
        const response = await apiClient.delete(
            `${BASE_URL}/${topicId}`
        );

        return response.data;
    } catch (error) {
        console.error("Error deleting debate topic:", error);
        throw error;
    }
};

// =========================================================
// Export Service
// =========================================================

const debateTopicService = {
    getAllTopics,
    getTopicById,
    createTopic,
    updateTopic,
    deleteTopic,
};

export default debateTopicService;