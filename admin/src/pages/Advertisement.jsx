import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar/Navbar";
import styles from "./Advertisement.module.css";

export default function Advertisement() {
  const [ads, setAds] = useState([]);
  const [formData, setFormData] = useState({ adUrl: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API}/admin/ads`,
        {
          withCredentials: true,
        }
      );
      if (response.data.ok) {
        setAds(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching advertisements:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing
        ? `${import.meta.env.VITE_API}/admin/ads/${selectedAd._id}`
        : `${import.meta.env.VITE_API}/admin/ads`;
      const method = isEditing ? "put" : "post";
      const response = await axios[method](url, formData, {
        withCredentials: true,
      });

      if (response.data.ok) {
        alert(
          isEditing
            ? "Advertisement updated successfully!"
            : "Advertisement created successfully!"
        );
        fetchAds();
        setFormData({ adUrl: "" });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving advertisement:", error);
    }
  };

  const handleEdit = (ad) => {
    setSelectedAd(ad);
    setFormData({ adUrl: ad.adUrl });
    setIsEditing(true);
  };

  const handleDelete = async (adId) => {
    if (window.confirm("Are you sure you want to delete this advertisement?")) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_API}/admin/ads/${adId}`,
          {
            withCredentials: true,
          }
        );
        if (response.data.ok) {
          alert("Advertisement deleted successfully!");
          fetchAds();
        }
      } catch (error) {
        console.error("Error deleting advertisement:", error);
      }
    }
  };

  return (
    <>
      <div className={styles.container}>
        <h2>{isEditing ? "Edit Advertisement" : "Add New Advertisement"}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className={styles.label}>Advertisement URL (Image):</label>
            <input
              type="text"
              name="adUrl"
              value={formData.adUrl}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.button}>
            {isEditing ? "Update Advertisement" : "Create Advertisement"}
          </button>
        </form>

        <h2>Advertisements List</h2>
        {ads.length > 0 ? (
          <ul className={styles.ul}>
            {ads.map((ad) => (
              <li key={ad._id} className={styles.li}>
                <img
                  src={ad.adUrl}
                  alt="Advertisement Preview"
                  className={styles.imagePreview}
                />
                <button
                  onClick={() => handleEdit(ad)}
                  className={styles.editButton}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(ad._id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.p}>No advertisements available.</p>
        )}
      </div>
    </>
  );
}
