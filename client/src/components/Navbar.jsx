import React from "react";

export default function Navbar(props) {
  const votesLeft = props.votesLeft || undefined;
  const voteTimeLeft = props.voteTime || undefined;
  let votesLeftJSX;
  let voteTimeLeftJSX;

  if (votesLeft || votesLeft === 0) {
    votesLeftJSX = <li className="nav-link">Votes Left: {votesLeft}</li>;
  }

  if (voteTimeLeft) {
    voteTimeLeftJSX = <li className="nav-link">Time Left: {voteTimeLeft}</li>;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <ul className="navbar-nav mr-auto">
        <li className="nav-link">
          Username: {props.username} <span className="sr-only">(current)</span>
        </li>
        <li className="nav-link">Session ID: {props.sid}</li>
        {votesLeftJSX}
        {voteTimeLeftJSX}
      </ul>
    </nav>
  );
}
