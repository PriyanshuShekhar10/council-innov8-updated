import React from "react";
import axios from "axios";
import Iframe from "../components/Iframe";
import styles from "./Cinema.module.css"; // Assuming you're using CSS modules

export default function Cinema() {
  return (
    <div className={styles.cinemaContainer}>
      <h1 className={styles.title}>
        Network Analysis of Candidates and Recommenders
      </h1>
      <div className={styles.iframeContainer}>
        <Iframe />
      </div>
    </div>
  );
}
