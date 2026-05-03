import axios from 'axios';

// Khởi tạo một instance của axios với cấu hình mặc định
const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api/v1', // Nhớ sửa port cho khớp Backend
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Timeout sau 10 giây nếu Server không phản hồi
});

// INTERCEPTOR REQUEST: Chạy TRƯỚC khi gọi bất cứ API nào
axiosClient.interceptors.request.use(
    (config) => {
        // Tự động vào localStorage lôi token ra
        const token = localStorage.getItem('token'); // Hoặc 'accessToken' tùy em đặt

        // Nếu có token, tự động gắn vào Header Authorization
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// INTERCEPTOR RESPONSE: Chạy SAU khi Server trả kết quả về
axiosClient.interceptors.response.use(
    (response) => {
        // Trả về trực tiếp cục data bên trong để các page đỡ phải .data.data
        if (response && response.data) {
            return response.data;
        }
        return response;
    },
    (error) => {
        // Xử lý lỗi toàn cục (Global Error Handling)
        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                console.error("Token hết hạn hoặc chưa đăng nhập!");
                // Có thể bắn window.location.href = '/login' ở đây
                localStorage.removeItem('token');
            } else if (status === 403) {
                console.error("Bạn không có quyền (ADMIN) để thực hiện thao tác này!");
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;

