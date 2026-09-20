import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar1.css";

export default function Navbar1() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className="pc-navbar">
      <div className="pc-navbar-inner">

        {}
        <Link to="/home" className="pc-brand">
          <div className="pc-brand-icon">🩸</div>
          <span className="pc-brand-text">PulseConnect</span>
        </Link>

        {}
        <div className="pc-nav-links">
          {pathname !== '/home' && (
            <Link className="pc-nav-link" to="/home">Home</Link>
          )}
          {(pathname === "/login" || pathname === '/' || pathname === '/about' || pathname === '/home') && (
            <Link className="pc-nav-link" to='/register'>Register</Link>
          )}
          {(pathname === "/register" || pathname === '/' || pathname === '/about' || pathname === '/home') && (
            <Link className="pc-nav-link" to='/login'>Login</Link>
          )}
          {pathname !== '/about' && (
            <Link className="pc-nav-link" to="/about">About</Link>
          )}
          {(pathname === '/user-DashBoard' || pathname === '/Complete-profile' || pathname === '/chat' || pathname === '/nearby-donors' || pathname === '/my-profile') && (
            <Link className="pc-nav-link pc-nav-link--donors" to="/nearby-donors"> Nearby Donors</Link>
          )}
          {(pathname === '/user-DashBoard' || pathname === '/Complete-profile' || pathname === '/chat' || pathname === '/nearby-donors' || pathname === '/my-profile') && (
            <Link className="pc-nav-link pc-nav-link--chat" to="/chat">Chat</Link>
          )}
          {(pathname === '/user-DashBoard' || pathname === '/Complete-profile' || pathname === '/chat' || pathname === '/nearby-donors' || pathname === '/my-profile') && (
            <Link className="pc-nav-link pc-nav-link--profile" to="/my-profile"> My Profile</Link>
          )}
        </div>

      </div>
    </nav>
  );
}