import React, { Component } from "react";

class VotingContainer extends Component {
  constructor() {
    super();
    this.votesLeft = 3;
  }

  handleAddVote() {
    if (this.votesLeft > 0) {
      //
    } else {
      return;
    }
  }

  handleRemoveVote() {}

  render() {
    let voteJSX;
    if (Object.keys(this.props.nomineeList).length !== 0) {
      const businesses = Object.values(this.props.nomineeList);
      voteJSX = businesses.map((data, idx) => {
        return (
          <div className="col" key={idx}>
            {data.Business.name}, {idx}
            <button>Add</button> <button>Remove</button>
          </div>
        );
      });
    }

    return <div className="col align-content-center">{voteJSX}</div>;
  }
}

export default VotingContainer;
