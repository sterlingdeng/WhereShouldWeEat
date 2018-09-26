import React, { Component } from "react";

class Landing extends Component {
  render() {
    return (
      <div className="LandingPage">
        <input
          type="text"
          placeholder="Username"
          id="username"
          value={this.props.username}
          onChange={e => {
            this.props.handleUsernameChange(e);
          }}
        />
        <input
          type="text"
          placeholder="Location"
          id="location"
          value={this.props.location}
          onChange={e => {
            this.props.handleLocationChange(e);
          }}
        />
        <input
          type="text"
          placeholder="SessionID"
          id="sid"
          value={this.props.sid}
          onChange={e => {
            this.props.handleSidChange(e);
          }}
        />

        <input
          id="JoinSession"
          type="button"
          value="Join Session"
          onClick={this.props.handleJoinSessionClick}
        />
        <input
          id="CreateSession"
          type="button"
          value="Create Session"
          onClick={this.props.handleCreateSessionClick}
        />
      </div>
    );
  }
}

export default Landing;
