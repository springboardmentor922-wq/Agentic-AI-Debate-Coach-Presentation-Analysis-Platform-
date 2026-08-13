import apiClient from "./apiClient";

export const startSimulation = async (simulationConfig) => {
    const res = await apiClient.post("/api/v1/debate/simulate/start", simulationConfig);
    return res.data;
};

export const executeSimulationTurn = async (turnData) => {
    const res = await apiClient.post("/api/v1/debate/simulate/turn", turnData);
    return res.data;
};

export default {
    startSimulation,
    executeSimulationTurn,
};
