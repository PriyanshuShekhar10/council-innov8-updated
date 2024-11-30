import { useState } from "react";
import {
  FaBars,
  FaBook,
  FaExclamationTriangle,
  FaGlobe,
  FaSearchengin,
  FaTh,
  FaThinkPeaks,
  FaTv,
  FaUser,
} from "react-icons/fa";
import { MdMovieEdit } from "react-icons/md";
import { NavLink } from "react-router-dom";

export default function SidebarComponent({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const menuItem = [
    { path: "/", name: "Dashboard", icon: <FaTh /> },
    { path: "/reservations", name: "Candidates", icon: <FaUser /> },
    { path: "/movies", name: "Shortlisted", icon: < FaSearchengin/> },
    { path: "/advertisement", name: "Fraudelent", icon: <FaExclamationTriangle /> },
    { path: "/cinema", name: "Network Analysis", icon: <FaGlobe /> },
  ];

  return (
    <div className="container">
      <div className={`sidebar ${isOpen ? "expanded" : "collapsed"}`}>
        <div className="top_section">
          <h1 className="logo" style={{ display: isOpen ? "block" : "none" }}>
            Satya
          </h1>
          <div
            className="bars"
            onClick={toggle}
            style={{ marginLeft: isOpen ? "30px" : 0 }}
          >
            <FaBars />
          </div>
        </div>

        {menuItem.map((item, index) => (
          <NavLink
            to={item.path}
            key={index}
            className="link"
            activeclassname="active"
          >
            <div className="items" style={{ fontSize: "20px" }}>
              {item.icon}
            </div>
            <div
              className="link_text"
              style={{ display: isOpen ? "inline-block" : "none" }}
            >
              {item.name}
            </div>
          </NavLink>
        ))}
      </div>

      <main className={isOpen ? "main expanded" : "main"}>{children}</main>
    </div>
  );
}
