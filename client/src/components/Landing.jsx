import React, { Component } from "react";

/* 
  Conditional Rending
*/

class Landing extends Component {
  render() {
    return (
      <div className="bg container-fluid">
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
              // value={this.props.username}
              value={"sterling"}
              onChange={e => {
                this.props.handleUsernameChange(e);
              }}
            />
            <input
              type="text"
              placeholder="SessionID"
              id="sid"
              // value={this.props.sid}
              value={7943}
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
