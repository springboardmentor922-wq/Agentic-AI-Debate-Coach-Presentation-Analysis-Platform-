export const getApiErrorMessage = (error, fallback = "Something went wrong.") => {
    const detail = error?.response?.data?.detail;

    if (typeof detail === "string") {
        return detail;
    }

    if (Array.isArray(detail)) {
        return detail.map((item) => item?.msg || item?.message).filter(Boolean).join(" ") || fallback;
    }

    return error?.response?.data?.message || error?.message || fallback;
};

export const unwrapApiData = (response) => {
    if (response && typeof response === "object" && "data" in response) {
        return response.data;
    }

    return response;
};

export const ensureArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (value === null || value === undefined) {
        return [];
    }

    return [value];
};