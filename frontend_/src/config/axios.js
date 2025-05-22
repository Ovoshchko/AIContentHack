import axios from "axios";

let AXIOS_INSTANCE = null;
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    AXIOS_INSTANCE = axios.create({
        baseURL: "http://localhost:8080",
    });
} else {
    AXIOS_INSTANCE = axios.create({});
}
export default AXIOS_INSTANCE;