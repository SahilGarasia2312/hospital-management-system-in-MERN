import React from "react";
import { Link } from "react-scroll";
import "../CompStyles/Home.css";

const Home = () => {
  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Our Hospital</h1>
          <p>
            Your health, our priority. High-quality care at your fingertips.
          </p>
          <Link to="services" smooth={true} className="styled-button">
            Explore Our Services
          </Link>
        </div>
      </section>


      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 Our Hospital. All rights reserved.</p>
        <div>
          <a href="#about">About Us</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
