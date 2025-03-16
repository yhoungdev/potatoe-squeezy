import axios from 'axios';

const DEFAULT_AXIOS = axios.create({
    baseURL: process.env.VITE_API_BASE_URL,
    timeout: 10000,
    timeoutErrorMessage: 'There was a timeout, try again',
})



export default DEFAULT_AXIOS;