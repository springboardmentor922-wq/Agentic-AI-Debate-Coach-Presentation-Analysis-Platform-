/*
=========================================================
Validation Utilities
=========================================================
*/

export const validateEmail = (email) => {

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);

};

export const validatePassword = (password) => {

    return password.length >= 6;

};

export const validatePhone = (phone) => {

    const regex = /^[0-9]{10}$/;

    return regex.test(phone);

};

export const validateRequired = (value) => {

    return value !== undefined &&
           value !== null &&
           value.trim() !== "";

};