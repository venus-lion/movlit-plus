import React, {useEffect, useState, Suspense, lazy, useCallback} from 'react';
import './Home.css';
import {useOutletContext} from 'react-router-dom';
import '../assets/css/loading.css';

// Lazy-load the components
const PopularMoviesComponent = lazy(() => import('./PopularMoviesComponent.jsx'));
const LatestMoviesComponent = lazy(() => import('./LatestMoviesComponent.jsx'));
const GenreMoviesComponent = lazy(() => import('./GenreMoviesComponent.jsx'));
const InterestGenreMoviesComponent = lazy(() => import('./InterestGenreMoviesComponent.jsx'));
const RecentHeartSimilarCrewMoviesComponent = lazy(() => import('./RecentHeartSimilarCrewMoviesComponent.jsx'));


function MovieHome() {
    const [randomGenreIds, setRandomGenreIds] = useState([]);
    const {isLoggedIn} = useOutletContext();
    const [componentsLoaded, setComponentsLoaded] = useState({
        popular: false,
        latest: false,
        recentHeart: false,
        interestGenre: false,
        genre: new Array(4).fill(false), // Assuming max 4 genres
    });

    useEffect(() => {
        const getRandomGenreIds = () => {
            const genreIds = [];
            while (genreIds.length < 4) {
                const randomId = Math.floor(Math.random() * 16) + 1;
                if (!genreIds.includes(randomId)) {
                    genreIds.push(randomId);
                }
            }
            return genreIds;
        };
        setRandomGenreIds(getRandomGenreIds());
    }, []);

    // Helper function to check if a component's movies are loaded
    const areMoviesLoaded = (movies) => {
        return movies && movies.length > 0 && movies.every(movie => movie.posterPath);
    };


    const updateComponentLoaded = useCallback((componentName, isLoaded, index = null) => {
        setComponentsLoaded(prev => {
            if (index !== null) {  //For GenreMoviesComponent
                // index가 null이 아닐때만 newGenreStatus를 만듭니다.
                const newGenreStatus = [...prev.genre];
                newGenreStatus[index] = isLoaded;

                // 이전 genre 상태와 새로운 genre 상태가 같은지 비교. 같다면 prev를 반환.
                if (JSON.stringify(prev.genre) === JSON.stringify(newGenreStatus)) { // 간단한 비교
                    return prev;
                }
                return {...prev, genre: newGenreStatus};
            }

            // index가 null이면, 이전 값과 비교하여 변경된 경우에만 업데이트.
            if (prev[componentName] === isLoaded) {
                return prev;
            }
            return {...prev, [componentName]: isLoaded};
        });
    }, []);

    return (
        <div className="movie-home">
            <Suspense fallback={<div className="loading-container">
                <div className="spinner"></div>
                <p>로딩 중입니다.</p></div>}>
                {/* Popular Movies */}
                <PopularMoviesComponent
                    onMoviesLoaded={(movies) => updateComponentLoaded('popular', areMoviesLoaded(movies))}
                    hidden={!componentsLoaded.popular}
                />

                {/* Latest Movies */}
                {componentsLoaded.popular && (
                    <LatestMoviesComponent
                        onMoviesLoaded={(movies) => updateComponentLoaded('latest', areMoviesLoaded(movies))}
                        hidden={!componentsLoaded.latest}
                    />
                )}

                {/* Genre Movies (Mapped) */}
                {componentsLoaded.latest && randomGenreIds.map((genreId, index) => (
                    <GenreMoviesComponent
                        key={genreId}
                        genreId={genreId}
                        onMoviesLoaded={(movies) => updateComponentLoaded('genre', areMoviesLoaded(movies), index)}
                        hidden={!componentsLoaded.genre[index]}
                    />
                ))}

                {/* Recent Heart (Conditional) */}
                {componentsLoaded.popular && isLoggedIn && (
                    <RecentHeartSimilarCrewMoviesComponent
                        onMoviesLoaded={(movies) => updateComponentLoaded('recentHeart', areMoviesLoaded(movies))}
                        hidden={!componentsLoaded.recentHeart}
                    />
                )}

                {/* Interest Genre (Conditional) */}
                {componentsLoaded.recentHeart && isLoggedIn && (
                    <InterestGenreMoviesComponent
                        onMoviesLoaded={(movies) => updateComponentLoaded('interestGenre', areMoviesLoaded(movies))}
                        hidden={!componentsLoaded.interestGenre}
                    />
                )}
            </Suspense>
        </div>
    );
}

export default MovieHome;