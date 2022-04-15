import React from "react";
import Menu from "./Menu";
import Routes from "./Routes";
import { Link } from "react-router-dom";


import "./Layout.css";

/**
 * Defines the main layout of the application.
 *
 * @returns {JSX.Element}
 */
function Layout() {
  return (
    <div className="body">
      <header className="dark-bg ">
        <Link to="/">
        <h1 className="light logo">Periodic Tables</h1>
        </Link>
        <Menu />
      </header>
      <main className="light-bg content">
        <Routes />
      </main>
    </div>
  );
}

export default Layout;
