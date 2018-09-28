import React, { Component } from "react";

/* 
  Conditional Rending
*/

class Landing extends Component {
  render() {
    return (
      <div className="bg">
        <div className="justify-content-center d-flex mask rgba-black-light align-items-center">
          <div className="container">
            <div className="row">
              <div className="col-md-12 mb-4 white-text text-center">
                <h1>Where Should We Eat?</h1>
              </div>
            </div>
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
            <div className="button-container">
              <input
                id="JoinSession"
                type="button"
                value="Join Session"
                onClick={this.props.handleJoinSessionClick}
                className="btn"
              />
              <input
                id="CreateSession"
                type="button"
                value="Create Session"
                onClick={this.props.handleCreateSessionClick}
                className="btn"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Landing;
