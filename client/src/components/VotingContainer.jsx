import React, { Component } from "react";

class VotingContainer extends Component {
  constructor(props) {
    super();
    this.votesLeft = 3;
  }

  render() {
    let voteJSX;
    if (Object.keys(this.props.nomineeList).length !== 0) {
      const businesses = Object.values(this.props.nomineeList);
      voteJSX = businesses.map((data, idx) => {
        return (
          <div className="col" key={idx}>
            {data.Business.name}, {idx}
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
          </div>
        );
      });
    }

    let time;
    if (this.props.voteTime) {
      let timeleft = this.props.voteTime;
      time = setInterval(() => {
        --this.timeLeft;
        return <div>{this.timeLeft}</div>;
      }, 1000);
    }

    return (
      <div className="col align-content-center">
        {time}
        {voteJSX}
      </div>
    );
  }
}

export default VotingContainer;
