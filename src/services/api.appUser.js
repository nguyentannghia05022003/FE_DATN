import axios from './axios.customize';

const fetchAppUsersAPI = (current, pageSize) => {
    const URL_BACKEND = `/api/v1/app-users?current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
};

const createAppUserAPI = (data) => {
    const URL_BACKEND = '/api/v1/app-users';
    return axios.post(URL_BACKEND, data);
};

const updateAppUserAPI = (id, data) => {
    const URL_BACKEND = `/api/v1/app-users/${id}`;
    return axios.patch(URL_BACKEND, data);
};

const deleteAppUserAPI = (id) => {
    const URL_BACKEND = `/api/v1/app-users/${id}`;
    return axios.delete(URL_BACKEND);
};

const fetchAppUserAPI = (id) => {
    const URL_BACKEND = `/api/v1/app-users/${id}`;
    return axios.get(URL_BACKEND);
};

const fetchUserResumesAPI = (phone) => {
    const URL_BACKEND = `/api/v1/app-users/phone/${phone}/resumes`;
    return axios.get(URL_BACKEND);
};

export {
    fetchAppUsersAPI,
    createAppUserAPI,
    updateAppUserAPI,
    deleteAppUserAPI,
    fetchAppUserAPI,
    fetchUserResumesAPI,
};