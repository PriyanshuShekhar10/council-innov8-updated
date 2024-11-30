import { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  // States for various entities
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [ads, setAds] = useState([]);
  const [users, setUsers] = useState([]);

  // States for new entities to be created
  const [newCinema, setNewCinema] = useState({
    name: "",
    address: "",
    city: "",
    contactNumber: "",
    screens: [],
  });
  const [newMovie, setNewMovie] = useState({
    title: "",
    description: "",
    genre: "",
    rating: "",
    duration: "",
    trailer: "",
    portraitImgUrl: "",
    landscapeImgUrl: "",
  });
  const [newAd, setNewAd] = useState({ AdvertUrl: "" });

  // Fetch initial data
  useEffect(() => {
    fetchCinemas();
    fetchMovies();
    fetchAds();
    fetchUsers();
  }, []);

  // Fetch functions
  const fetchCinemas = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API}/cine/cinemas`,
        {
          withCredentials: true,
        }
      );
      setCinemas(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API}/movie/movies`,
        {
          withCredentials: true,
        }
      );
      setMovies(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAds = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API}/admin/ads`,
        {
          withCredentials: true,
        }
      );
      setAds(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API}/admin/users`,
        {
          withCredentials: true,
        }
      );
      setUsers(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD functions
  const createCinema = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API}/admin/createcinema`,
        newCinema,
        {
          withCredentials: true,
        }
      );
      setCinemas([...cinemas, response.data.data]);
      setNewCinema({
        name: "",
        address: "",
        city: "",
        contactNumber: "",
        screens: [],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCinema = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API}/cine/cinemas/${id}`, {
        withCredentials: true,
      });
      setCinemas(cinemas.filter((cinema) => cinema._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const createMovie = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API}/admin/createmovie`,
        newMovie,
        {
          withCredentials: true,
        }
      );
      setMovies([...movies, response.data.data]);
      setNewMovie({
        title: "",
        description: "",
        genre: "",
        rating: "",
        duration: "",
        trailer: "",
        portraitImgUrl: "",
        landscapeImgUrl: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMovie = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API}/admin/movies/${id}`, {
        withCredentials: true,
      });
      setMovies(movies.filter((movie) => movie._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const createAd = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API}/admin/ads`,
        newAd,
        {
          withCredentials: true,
        }
      );
      setAds([...ads, response.data]);
      setNewAd({ AdvertUrl: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAd = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API}/admin/ads/${id}`, {
        withCredentials: true,
      });
      setAds(ads.filter((ad) => ad._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {/* Cinema Management */}
      <div>
        <h2>Manage Cinemas</h2>
        <input
          type="text"
          placeholder="Name"
          value={newCinema.name}
          onChange={(e) => setNewCinema({ ...newCinema, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Address"
          value={newCinema.address}
          onChange={(e) =>
            setNewCinema({ ...newCinema, address: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="City"
          value={newCinema.city}
          onChange={(e) => setNewCinema({ ...newCinema, city: e.target.value })}
        />
        <input
          type="text"
          placeholder="Contact Number"
          value={newCinema.contactNumber}
          onChange={(e) =>
            setNewCinema({ ...newCinema, contactNumber: e.target.value })
          }
        />
        <button onClick={createCinema}>Add Cinema</button>

        <ul>
          {cinemas.map((cinema) => (
            <li key={cinema._id}>
              {cinema.name} - {cinema.city}
              <button onClick={() => deleteCinema(cinema._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Movie Management */}
      <div>
        <h2>Manage Movies</h2>
        <input
          type="text"
          placeholder="Title"
          value={newMovie.title}
          onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newMovie.description}
          onChange={(e) =>
            setNewMovie({ ...newMovie, description: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Genre"
          value={newMovie.genre}
          onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
        />
        <input
          type="text"
          placeholder="Rating"
          value={newMovie.rating}
          onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })}
        />
        <input
          type="text"
          placeholder="Duration"
          value={newMovie.duration}
          onChange={(e) =>
            setNewMovie({ ...newMovie, duration: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Trailer URL"
          value={newMovie.trailer}
          onChange={(e) =>
            setNewMovie({ ...newMovie, trailer: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Portrait Image URL"
          value={newMovie.portraitImgUrl}
          onChange={(e) =>
            setNewMovie({ ...newMovie, portraitImgUrl: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Landscape Image URL"
          value={newMovie.landscapeImgUrl}
          onChange={(e) =>
            setNewMovie({ ...newMovie, landscapeImgUrl: e.target.value })
          }
        />
        <button onClick={createMovie}>Add Movie</button>

        <ul>
          {movies.map((movie) => (
            <li key={movie._id}>
              {movie.title} - {movie.genre}
              <button onClick={() => deleteMovie(movie._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Advertisement Management */}
      <div>
        <h2>Manage Ads</h2>
        <input
          type="text"
          placeholder="Ad URL"
          value={newAd.AdvertUrl}
          onChange={(e) => setNewAd({ ...newAd, AdvertUrl: e.target.value })}
        />
        <button onClick={createAd}>Add Ad</button>

        <ul>
          {ads.map((ad) => (
            <li key={ad._id}>
              {ad.AdvertUrl}
              <button onClick={() => deleteAd(ad._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      {/* User Management */}
      <div>
        <h2>Manage Users</h2>
        <ul>
          {users.map((user) => (
            <li key={user._id}>
              {user.name} - {user.email}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
