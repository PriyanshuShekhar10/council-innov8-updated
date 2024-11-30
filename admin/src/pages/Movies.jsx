import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar/Navbar";
import styles from "./Movies.module.css"; // Import the CSS module

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    portraitImgUrl: "",
    landscapeImgUrl: "",
    rating: "",
    genre: "",
    duration: "",
    trailer: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API}/movie/movies`,
        {
          withCredentials: true,
        }
      );
      if (response.data.ok) {
        setMovies(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing
        ? `${import.meta.env.VITE_API}/movie/movies/${selectedMovie._id}`
        : `${import.meta.env.VITE_API}/movie/createmovie`;
      const method = isEditing ? "put" : "post";
      const response = await axios[method](url, formData, {
        withCredentials: true,
      });

      if (response.data.ok) {
        alert(
          isEditing
            ? "Movie updated successfully!"
            : "Movie created successfully!"
        );
        fetchMovies();
        setFormData({
          title: "",
          description: "",
          portraitImgUrl: "",
          landscapeImgUrl: "",
          rating: "",
          genre: "",
          duration: "",
          trailer: "",
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving movie:", error);
    }
  };

  const handleEdit = (movie) => {
    setSelectedMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      portraitImgUrl: movie.portraitImgUrl,
      landscapeImgUrl: movie.landscapeImgUrl,
      rating: movie.rating,
      genre: movie.genre,
      duration: movie.duration,
      trailer: movie.trailer,
    });
    setIsEditing(true);
  };

  const handleDelete = async (movieId) => {
    if (window.confirm("Are you sure you want to delete this movie?")) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_API}/movie/movies/${movieId}`,
          { withCredentials: true }
        );
        if (response.data.ok) {
          alert("Movie deleted successfully!");
          fetchMovies();
        }
      } catch (error) {
        console.error("Error deleting movie:", error);
      }
    }
  };

  return (
    <>
     
      <div className={styles.container}>
        <h2>{isEditing ? "Edit Movie" : "Add New Movie"}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className={styles.input}
            ></textarea>
          </div>
          <div className={styles.inputGroup}>
            <label>Portrait Image URL:</label>
            <input
              type="text"
              name="portraitImgUrl"
              value={formData.portraitImgUrl}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Landscape Image URL:</label>
            <input
              type="text"
              name="landscapeImgUrl"
              value={formData.landscapeImgUrl}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Rating:</label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Genre:</label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Duration (in minutes):</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Trailer URL:</label>
            <input
              type="text"
              name="trailer"
              value={formData.trailer}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.button}>
            {isEditing ? "Update Movie" : "Create Movie"}
          </button>
        </form>

        <h2>Movies List</h2>
        {movies.length > 0 ? (
          <ul className={styles.movieList}>
            {movies.map((movie) => (
              <li key={movie._id} className={styles.movieItem}>
                <h3>{movie.title}</h3>
                <button
                  onClick={() => handleEdit(movie)}
                  className={styles.button}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(movie._id)}
                  className={styles.button}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No movies available.</p>
        )}
      </div>
    </>
  );
}
