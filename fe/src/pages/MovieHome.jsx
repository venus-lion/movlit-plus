import React, {useEffect, useState, Suspense, lazy} from 'react';
import './Home.css';
import {useOutletContext} from 'react-router-dom';

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
        return movies && movies.length > 0 && movies.every(movie => movie.posterPath); // Check if posterPath exists
    };


    // Update loading state for each component
    const updateComponentLoaded = (componentName, isLoaded, index = null) => {
        setComponentsLoaded(prev => {
            if (index !== null) {  //For GenreMoviesComponent
                const newGenreStatus = [...prev.genre];
                newGenreStatus[index] = isLoaded;
                return {...prev, genre: newGenreStatus};
            }
            return {...prev, [componentName]: isLoaded}
        });

    };

    return (
        <div className="movie-home">
            <Suspense fallback={<p>Loading...</p>}>
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

                {/* Recent Heart (Conditional) */}
                {componentsLoaded.latest && isLoggedIn && (
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

                {/* Genre Movies (Mapped) */}
                {componentsLoaded.interestGenre && randomGenreIds.map((genreId, index) => (
                    <GenreMoviesComponent
                        key={genreId}
                        genreId={genreId}
                        onMoviesLoaded={(movies) => updateComponentLoaded('genre', areMoviesLoaded(movies) ,index)}
                        hidden={!componentsLoaded.genre[index]}
                    />
                ))}
            </Suspense>
        </div>
    );
}

export default MovieHome;