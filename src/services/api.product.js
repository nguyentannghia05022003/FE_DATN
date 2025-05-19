import axios from './axios.customize';

const fetchAllProductAPI = (current, pageSize) => {
    const URL_BACKEND = `/api/v1/products/?current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
};

const createProductAPI = ({ barCode, name, price, quantity, manufacturingDate, expirationDate, image }) => {
    const URL_BACKEND = '/api/v1/products';
    const data = {
        barCode,
        name,
        price,
        quantity,
        manufacturingDate,
        expirationDate,
        image,
    };
    return axios.post(URL_BACKEND, data);
};

const updateProductAPI = (_id, barCode, name, price, quantity, manufacturingDate, expirationDate, image) => {
    const URL_BACKEND = `/api/v1/products/${_id}`;
    const data = {
        barCode,
        name,
        price,
        quantity,
        manufacturingDate,
        expirationDate,
        image,
    };
    return axios.patch(URL_BACKEND, data);
};

const deleteProductApi = (id) => {
    const URL_BACKEND = `/api/v1/products/${id}`;
    return axios.delete(URL_BACKEND);
};

const excelImportProductsAPI = (file) => {
    const URL_BACKEND = "/api/v1/excel-import/products";
    const formData = new FormData();
    formData.append("file", file); // Thêm file vào FormData

    return axios.post(URL_BACKEND, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export {
    fetchAllProductAPI,
    createProductAPI,
    updateProductAPI,
    deleteProductApi,
    excelImportProductsAPI,
};