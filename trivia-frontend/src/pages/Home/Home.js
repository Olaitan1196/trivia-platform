import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <nav className="home-navbar">
        <h1 className="logo">TriviaArena</h1>
        <div className="nav-links">
          <a href="/login">Login</a>
          <a href="/register">Register</a>
        </div>
      </nav>

      <section className="hero-section">
        <h2 className="hero-title">Compete. Answer. Win.</h2>
        <p className="hero-subtitle">
          Nigeria's premier skill-based trivia tournament platform.
          Sports, Academics, and Language — test your knowledge and win real cash prizes.
        </p>
        <a href="/register" className="cta-button">Get Started</a>
      </section>

      <section className="features-section">
        <div className="feature-card">
          <h3>Multiple Categories</h3>
          <p>Compete in Sports, Academics, or Language trivia tournaments.</p>
        </div>
        <div className="feature-card">
          <h3>Fair & Secure</h3>
          <p>Advanced anti-cheat technology ensures every competition is 100% skill-based.</p>
        </div>
        <div className="feature-card">
          <h3>Instant Payouts</h3>
          <p>Win and withdraw your prize money directly to your bank account.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;