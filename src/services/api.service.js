// import axios from "axios";
import axios from './axios.customize'

const createUserApi = (fullName, email, password, phone) => {
    const URL_BACKEND = "/api/v1/user";
    const data = {
        fullName, email, password, phone
    }
    return axios.post(URL_BACKEND, data)
}

const updateUserApi = (_id, fullName, phone) => {
    const URL_BACKEND = "/api/v1/users";
    const data = {
        _id, fullName, phone
    }
    return axios.patch(URL_BACKEND, data)
}

const deleteUserApi = (id) => {
    const URL_BACKEND = `/api/v1/users/${id}`;
    return axios.delete(URL_BACKEND)
}

const fetchAllUserAPI = (current, pageSize) => {
    const URL_BACKEND = `/api/v1/users?current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND)
}

const handleUploadFile = (file, folder) => {
    const URL_BACKEND = "/api/v1/file/upload";
    let config = {
        headers: {
            "upload-type": folder,
            "Content-Type": "multipart/form-data"
        }
    }
    const bodyFormData = new FormData();
    bodyFormData.append("file", file)

    return axios.post(URL_BACKEND, bodyFormData, config)
}

const updateUserAvatarApi = (avatar, _id, fullName, phone) => {
    const URL_BACKEND = "/api/v1/users";
    const data = {
        _id,
        avatar,
        fullName,
        phone
    }
    return axios.patch(URL_BACKEND, data)
}

const registerUserApi = (fullName, email, password, phone) => {
    const URL_BACKEND = "/api/v1/auth/register";
    const data = {
        fullName, email, password, phone
    }
    return axios.post(URL_BACKEND, data)
}

const loginUserApi = (email, password) => {
    const URL_BACKEND = "/api/v1/auth/login";
    const data = {
        username: email,
        password,
        delay: 2000
    }
    return axios.post(URL_BACKEND, data)
}

const getAccountApi = () => {
    const URL_BACKEND = "/api/v1/auth/account";
    return axios.get(URL_BACKEND);
}

const logoutApi = () => {
    const URL_BACKEND = "/api/v1/auth/logout";
    return axios.post(URL_BACKEND);
}

const forgotPasswordApi = (email) => {
    const URL_BACKEND = "/api/v1/auth/forgot-password";
    const data = { email };
    return axios.post(URL_BACKEND, data);
};

const resetPasswordApi = (otp, newPassword) => {
    const URL_BACKEND = "/api/v1/auth/reset-password";
    const data = { otp, newPassword };
    return axios.post(URL_BACKEND, data);
};

const changePasswordApi = (oldPassword, newPassword) => {
    const URL_BACKEND = "/api/v1/auth/change-password";
    const data = { oldPassword, newPassword };
    return axios.post(URL_BACKEND, data);
};

export {
    createUserApi, updateUserApi, fetchAllUserAPI,
    deleteUserApi, handleUploadFile, updateUserAvatarApi,
    registerUserApi, loginUserApi, getAccountApi, logoutApi,
    forgotPasswordApi, resetPasswordApi, changePasswordApi
}