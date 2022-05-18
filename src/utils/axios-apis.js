import axios from "axios"

/**
 * Restful Requests
 */
let baseUrl = '/api';
export const getRequest = (url, params) => {
    return axios({
        method: 'get',
        url: `${baseUrl}${url}`,
        params
    })
}
export const postRequest = (url, params) => {
    return axios({
        method: 'post',
        url: `${baseUrl}${url}`,
        data: params
    })
};

export const putRequest = (url, params) => {
    return axios({
        method: 'put',
        url: `${baseUrl}${url}`,
        data: params
    })
}

export const deleteRequest = (url, params) => {
    return axios({
        method: 'delete',
        url: `${baseUrl}${url}`,
        data: params
    })
}
