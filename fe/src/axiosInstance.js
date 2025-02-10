// axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.VITE_BASE_URL,
    withCredentials: true,
});

let isRefreshing = false; // RefreshToken 요청 중복 방지 플래그
let refreshSubscribers = []; // RefreshToken 요청 완료 후 재시도할 요청들을 담는 배열

function subscribeTokenRefresh(cb) {
    refreshSubscribers.push(cb);
}

function onRefreshed(accessToken) {
    refreshSubscribers.forEach(cb => cb(accessToken));
    refreshSubscribers = [];
}

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        if (response.data && response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) { // 401 에러이고, 재시도 요청이 아니면
            originalRequest._retry = true; // 재시도 플래그 설정

            if (!isRefreshing) { // RefreshToken 요청 중이 아니면
                isRefreshing = true;

                const refreshToken = localStorage.getItem('refreshToken'); // localStorage에서 refreshToken 가져오기 (refreshToken 저장 로직 필요)

                if (!refreshToken) { // refreshToken이 없으면 (만료 또는 로그아웃)
                    isRefreshing = false; // isRefreshing 플래그 초기화 (refreshToken 없는 경우에도)
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    return Promise.reject(error); // refreshToken 없으면 에러를 던져서 컴포넌트에서 처리하도록 함
                }

                try {
                    const refreshResponse = await axiosInstance.post('/refresh', {refreshToken}); // 백엔드 /api/refresh 요청
                    const newAccessToken = refreshResponse.data.accessToken;

                    localStorage.setItem('accessToken', newAccessToken); // 새로운 accessToken 저장
                    isRefreshing = false;
                    onRefreshed(newAccessToken); // 대기 중인 요청 재시도

                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`; // 원래 요청 헤더에 새로운 accessToken 설정
                    return axiosInstance(originalRequest); // 원래 요청 재시도

                } catch (refreshError) {
                    // RefreshToken 갱신 실패 (RefreshToken 만료 또는 유효하지 않음)
                    isRefreshing = false;
                    localStorage.removeItem('accessToken'); // accessToken, refreshToken 제거 (refreshToken 저장 로직 필요)
                    localStorage.removeItem('refreshToken');
                    return Promise.reject(refreshError); // refreshToken 갱신 실패 시 에러를 던져서 컴포넌트에서 처리하도록 함
                }
            } else {
                // RefreshToken 갱신 중이면, 재시도 요청을 배열에 담아두고, 갱신 완료 후 재시도
                return new Promise(resolve => {
                    subscribeTokenRefresh(accessToken => {
                        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                        resolve(axiosInstance(originalRequest));
                    });
                });
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;