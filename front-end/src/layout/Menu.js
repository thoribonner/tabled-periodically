import React from "react";

import { Link } from "react-router-dom";

/**
 * Defines the menu for this application.
 *
 * @returns {JSX.Element}
 */

function Menu() {
  return (
    <nav>
      <hr />
      <ul className="top-nav">
        <li className="top-nav-item">
          <Link className="" to="/dashboard">
            <i className="fas fa-tachometer-alt light"></i>
            <span className="menu-text"> Dashboard</span>
          </Link>
        </li>
        <li className="top-nav-item">
          <Link className="" to="/search">
            <i className="fas fa-search light"></i>
            <span className="menu-text"> Search</span>
          </Link>
        </li>
        <li className="top-nav-item">
          <Link className="" to="/reservations/new">
            <i className="fas fa-user-plus accent1"></i>
            <span className="menu-text"> New Reservation</span>
          </Link>
        </li>
        <li className="top-nav-item">
          <Link className="" to="/tables/new">
            <i className="fas fa-utensils accent2"></i>
            <span className="menu-text"> New Table</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Menu;
