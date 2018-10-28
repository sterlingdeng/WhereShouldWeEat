import React, { Component } from "react";
import Navbar from "./Navbar";

class VotingContainer extends Component {
  constructor(props) {
    super();
  }

  render() {
    let voteJSX;
    if (Object.keys(this.props.nomineeList).length !== 0) {
      const businesses = Object.values(this.props.nomineeList);
      voteJSX = businesses.map((data, idx) => {
        let votedForJSX;
        if (this.props.userVotedFor.hasOwnProperty(data.Business.id)) {
          votedForJSX = <div>Voted For!!</div>;
        }
        return (
          <div className="col" key={idx}>
            {data.Business.name}, Vote Count: {data.Votes}
            <button
              onClick={() => {
                this.props.handleVote(data.Business.id, "add");
              }}
            >
              Add
            </button>{" "}
            <button
              onClick={() => {
                this.props.handleVote(data.Business.id, "remove");
              }}
            >
              Remove
            </button>
            {votedForJSX}
          </div>
        );
      });
    }

    return (
      <div className="col align-content-center">
        <Navbar
          username={this.props.username}
          sid={this.props.sid}
          votesLeft={this.props.votesLeft}
          voteTime={this.props.voteTime}
        />

        {voteJSX}
      </div>
    );
  }
}

export default VotingContainer;
