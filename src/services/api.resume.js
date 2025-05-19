// src/services/api/resume.js
import axios from './axios.customize';

const fetchResumeListAPI = (current, pageSize) => {
    const URL_BACKEND = `/api/v1/resumes/?current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
};

const createResumeAPI = ({ items, totalPrice }) => {
    const URL_BACKEND = '/api/v1/resumes';
    const data = {
        items,
        totalPrice,
    };
    return axios.post(URL_BACKEND, data);
};

const fetchResumeAPI = (id) => {
    const URL_BACKEND = `/api/v1/resumes/${id}`;
    return axios.get(URL_BACKEND);
};

const deleteResumeAPI = (id) => {
    const URL_BACKEND = `/api/v1/resumes/${id}`;
    return axios.delete(URL_BACKEND);
};

export {
    fetchResumeListAPI,
    createResumeAPI,
    fetchResumeAPI,
    deleteResumeAPI,
};