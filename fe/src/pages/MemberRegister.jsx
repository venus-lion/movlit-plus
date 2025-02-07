import React, {useEffect, useState, useContext} from 'react'; // useContext import 추가
import axiosInstance from '../axiosInstance';
import {Link, useNavigate} from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import {AppContext} from "../App.jsx"; // AppContext import

const MemberRegister = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [dob, setDob] = useState('');
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const navigate = useNavigate();
    const { updateSnackbar } = useContext(AppContext); // updateSnackbar context 함수 import

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await axiosInstance.get('/genreList');
                const genreOptions = response.data.map((genre) => ({
                    value: genre.genreId,
                    label: genre.genreName,
                }));
                setGenres(genreOptions);
            } catch (error) {
                console.error('Error fetching genres:', error);
            }
        };

        fetchGenres();
    }, []);

    const handleGenreChange = (selectedOptions) => {
        setSelectedGenres(selectedOptions);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (password !== repeatPassword) {
            updateSnackbar('패스워드가 일치하지 않습니다.', 'error'); // toast.error -> updateSnackbar
            return;
        }

        if (selectedGenres.length < 3) {
            updateSnackbar('최소 3개의 장르를 선택해야 합니다.', 'warning'); // toast.error -> updateSnackbar
            return;
        }

        try {
            const response = await axiosInstance.post('/members/register', {
                email,
                password,
                repeatPassword,
                nickname,
                dob: dob ? dob.toISOString().slice(0, 10) : null,
                genreIds: selectedGenres.map((genre) => genre.value),
            });

            console.log('Registration successful:', response.data);
            updateSnackbar('회원 가입이 완료되었습니다.', 'success'); // toast.success -> updateSnackbar

            navigate('/member/login');
        } catch (error) {
            console.error('Registration error:', error);
            if (error.response) {
                updateSnackbar(error.response.data.message, 'error'); // toast.error -> updateSnackbar
            } else {
                updateSnackbar('요청 중 오류가 발생했습니다.', 'error'); // toast.error -> updateSnackbar
            }
        }
    };

    return (
        <div className="bg-light">
            <div className="container" style={{marginTop: '30px'}}>
                <div className="row">
                    <div className="col-3"></div>
                    <div className="col-6">
                        <div className="card">
                            <div className="card-body">
                                <div className="card-title">
                                    <h3>
                                        <strong>회원 가입</strong>
                                    </h3>
                                </div>
                                <hr/>
                                <form onSubmit={handleSubmit}>
                                    <table className="table table-borderless">
                                        <tbody>
                                        <tr>
                                            <td style={{width: '45%'}}>
                                                <label className="col-form-label">이메일</label>
                                            </td>
                                            <td style={{width: '55%'}}>
                                                <input
                                                    type="text"
                                                    name="email"
                                                    className="form-control"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label className="col-form-label">패스워드</label>
                                            </td>
                                            <td>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    className="form-control"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label className="col-form-label">
                                                    패스워드 확인
                                                </label>
                                            </td>
                                            <td>
                                                <input
                                                    type="password"
                                                    name="repeatPassword"
                                                    className="form-control"
                                                    value={repeatPassword}
                                                    onChange={(e) => setRepeatPassword(e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label className="col-form-label">닉네임</label>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="nickname"
                                                    className="form-control"
                                                    value={nickname}
                                                    onChange={(e) => setNickname(e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label className="col-form-label">생년월일</label>
                                            </td>
                                            <td>
                                                <DatePicker
                                                    selected={dob}
                                                    onChange={(date) => setDob(date)}
                                                    dateFormat="yyyy-MM-dd"
                                                    className="form-control"
                                                    isClearable
                                                    showYearDropdown
                                                    scrollableYearDropdown
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label className="col-form-label">장르</label>
                                            </td>
                                            <td>
                                                <Select
                                                    isMulti
                                                    options={genres}
                                                    value={selectedGenres}
                                                    onChange={handleGenreChange}
                                                    placeholder="장르 선택 (최소 3개)"
                                                    styles={{
                                                        control: (provided) => ({
                                                            ...provided,
                                                            marginBottom: '15px',
                                                        }),
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9999,
                                                        }),
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="2" className="center-buttons">
                                                <button
                                                    className="btn btn-primary"
                                                    type="submit"
                                                    style={{marginRight: '5px'}}
                                                >
                                                    확인
                                                </button>
                                                <button className="btn btn-secondary" type="reset">
                                                    취소
                                                </button>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </form>

                                <p className="mt-3">
                                    <span className="me-3">이미 계정이 있으신가요? </span>
                                    <Link to="/member/login">로그인</Link>
                                </p>

                                <div className="mt-3 mb-3">
                                    <div className="social-login-header">
                                        <span>소셜 계정으로 가입</span>
                                    </div>
                                    <div className="social-login-buttons">
                                        <a
                                            href="/oauth2/authorization/naver"
                                            className="social-login-button"
                                        >
                                            <img
                                                src="/images/naver-logo.jpg"
                                                alt="Naver"
                                                className="social-login-icon"
                                            />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-3"></div>
                </div>
            </div>
        </div>
    );
};

export default MemberRegister;