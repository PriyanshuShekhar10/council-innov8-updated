import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar/Navbar";

export default function Reservations() {
  const [bookings, setBookings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({
    showTime: "",
    showDate: "",
    movieId: "",
    screenId: "",
    seats: [],
    totalPrice: "",
    paymentId: "",
    paymentType: "",
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const apiUrl = import.meta.env.VITE_API || "http://localhost:5000"; // Default API URL

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${apiUrl}/movie/getuserbookings`, {
        withCredentials: true,
      });
      if (response.data.ok) {
        setBookings(response.data.data);
      } else {
        console.error("Failed to fetch bookings:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setFormData({
      showTime: booking.showTime,
      showDate: booking.showDate,
      movieId: booking.movieId,
      screenId: booking.screenId,
      seats: booking.seats.join(", "),
      totalPrice: booking.totalPrice,
      paymentId: booking.paymentId,
      paymentType: booking.paymentType,
    });
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? "put" : "post";
    const url = isEditing
      ? `${apiUrl}/movie/bookings/${selectedBooking._id}`
      : `${apiUrl}/movie/bookticket`;

    try {
      const response = await axios[method](url, formData, {
        withCredentials: true,
      });
      if (response.data.ok) {
        alert(
          `${isEditing ? "Booking updated" : "Booking created"} successfully!`
        );
        fetchBookings();
        setIsEditing(false);
        setFormData({
          showTime: "",
          showDate: "",
          movieId: "",
          screenId: "",
          seats: [],
          totalPrice: "",
          paymentId: "",
          paymentType: "",
        });
      } else {
        console.error("Failed to save booking:", response.data.message);
      }
    } catch (error) {
      console.error("Error saving booking:", error);
    }
  };

  const handleDelete = async (bookingId) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        const response = await axios.delete(
          `${apiUrl}/movie/bookings/${bookingId}`,
          {
            withCredentials: true,
          }
        );
        if (response.data.ok) {
          alert("Booking deleted successfully!");
          fetchBookings();
        } else {
          console.error("Failed to delete booking:", response.data.message);
        }
      } catch (error) {
        console.error("Error deleting booking:", error);
      }
    }
  };

  return (
    <>
      
      <h1 style={{ color: "red", padding: "0 10rem" }}>Out of service</h1>
      <div className="container">
        <h2>{isEditing ? "Edit Booking" : "Create Booking"}</h2>
        <form onSubmit={handleSubmit}>
          {/* Form fields similar to Users form */}
        </form>

        <h2>Booking List</h2>
        {bookings.length > 0 ? (
          <ul>
            {bookings.map((booking) => (
              <li key={booking._id}>
                <p>
                  {booking.showDate} - {booking.showTime} | Movie ID:{" "}
                  {booking.movieId} | Screen ID: {booking.screenId}
                </p>
                <button onClick={() => handleEdit(booking)}>Edit</button>
                <button onClick={() => handleDelete(booking._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No bookings available.</p>
        )}
      </div>
    </>
  );
}
