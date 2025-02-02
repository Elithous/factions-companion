"use client"

import "./navbar.scss";
import React, { useState } from 'react';

export default function Navbar() {
  const [isOpen, setOpen] = useState(false);

  const toggleOpen = () => setOpen(!isOpen);
  return(
    <div className={`nav-container ${isOpen ? "is-active" : ""}`} tabIndex={0}>
      <div className="nav-bar">
        <div className="nav-toggle" onClick={toggleOpen}></div>
        <div className="nav-title">
          <a href='https://www.factions-online.com/' target="_blank">Factions</a> Companion
        </div>
      </div>

      <nav className="nav-items">
        <a className="nav-item" href='/'>Home</a>
        <a className="nav-item" href='/stats'>Stats</a>
      </nav>
    </div>
  )
};