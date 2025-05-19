import axios from './axios.customize';

const fetchTransactionListAPI = (current, pageSize) => {
    const URL_BACKEND = `/api/v1/banking/transactions?current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
};

const fetchTotalTransactionsAPI = () => {
    const URL_BACKEND = '/api/v1/banking/transactions/count';
    return axios.get(URL_BACKEND);
};

const fetchTransactionDetailAPI = (id) => {
    const URL_BACKEND = `/api/v1/banking/transactions/details?id=${id}`;
    return axios.get(URL_BACKEND);
};

export {
    fetchTransactionListAPI,
    fetchTotalTransactionsAPI,
    fetchTransactionDetailAPI,
};