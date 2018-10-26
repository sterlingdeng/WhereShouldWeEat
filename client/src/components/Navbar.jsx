import React from "react";

export default function Navbar(props) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <ul className="navbar-nav mr-auto">
        <li className="nav-link">
          Username: {props.username} <span class="sr-only">(current)</span>
        </li>
        <li className="nav-link">Session ID: {props.sid}</li>
      </ul>
    </nav>
  );
}
