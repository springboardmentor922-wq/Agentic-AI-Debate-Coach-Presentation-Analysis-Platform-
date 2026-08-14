const TOKEN_KEY = "access_token";

const USER_KEY = "user_data";

const parseJson = (value) => {

    if (!value) {
        return null;
    }

    try {

        return JSON.parse(value);

    }
    catch {

        return null;

    }

};

export const saveToken = (token) => {

    localStorage.setItem(TOKEN_KEY, token);

};

export const getToken = () => {

    return localStorage.getItem(TOKEN_KEY);

};

export const removeToken = () => {

    localStorage.removeItem(TOKEN_KEY);

};

export const saveUser = (user) => {

    localStorage.setItem(USER_KEY, JSON.stringify(user));

};

export const getUser = () => {

    return parseJson(localStorage.getItem(USER_KEY));

};

export const removeUser = () => {

    localStorage.removeItem(USER_KEY);

};

export const logoutUser = () => {
    removeToken();
    removeUser();
    try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.clear();
    } catch {
        // ignore
    }
};

export const clearSession = () => {
    logoutUser();
};