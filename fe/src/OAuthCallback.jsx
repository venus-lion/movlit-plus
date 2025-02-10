import React, {useEffect} from 'react';
import {useLocation, useNavigate, useOutletContext} from 'react-router-dom';
import axiosInstance from "./axiosInstance.js";

const OAuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {updateLoginStatus} = useOutletContext();

    useEffect(() => {
        const fetchToken = async () => {
            const queryParams = new URLSearchParams(location.search);
            const code = queryParams.get('code');

            console.log('code:', code);

            if (code) {
                try {
                    // 엔드포인트 경로를 '/api/token'으로 수정합니다.
                    const response = await axiosInstance.post('/token', {code});
                    const {accessToken, refreshToken} = response.data;

                    localStorage.setItem('accessToken', accessToken);

                    document.cookie = `refreshToken=${refreshToken}; SameSite=None; Secure; Path=/; Max-Age=1209600`;

                    console.log('OAuth2 로그인 성공, accessToken=', accessToken);
                    updateLoginStatus(true);
                    navigate('/'); // 메인 페이지로 리다이렉트
                } catch (error) {
                    console.error('토큰 교환 실패', error);
                    navigate('/member/login');
                }
            } else {
                console.error('OAuth2 로그인 실패: 인증 코드가 없습니다.');
                navigate('/member/login'); // 로그인 페이지로 리다이렉트
            }
        };

        fetchToken();
    }, [location, navigate, updateLoginStatus]);

    return <div>OAuth2 로그인 처리 중...</div>;
};

export default OAuthCallback;
