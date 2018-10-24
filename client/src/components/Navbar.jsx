import React from "react";

export default function Navbar(props) {
  return (
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <ul class="navbar-nav mr-auto">
        <li class="nav-link">
          Username: {props.username} <span class="sr-only">(current)</span>
        </li>
        <li class="nav-link">Session ID: {props.sid}</li>
      </ul>
    </nav>
  );
}
