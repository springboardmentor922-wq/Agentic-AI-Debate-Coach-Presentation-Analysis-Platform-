const TOKEN_KEY = "access_token";

const USER_KEY = "user_data";

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

    const user = localStorage.getItem(USER_KEY);

    return user ? JSON.parse(user) : null;

};

export const removeUser = () => {

    localStorage.removeItem(USER_KEY);

};

export const logoutUser = () => {

    removeToken();

    removeUser();
};