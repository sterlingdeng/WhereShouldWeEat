import React, { Component } from "react";

export default class ChatBox extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let messages;
    if (this.props.messages.length > 0) {
      messages = this.props.messages.map((msg, idx) => {
        return <div key={idx}>{msg}</div>;
      });
    } else {
      return "No Messages!";
    }
    return <div>{messages}</div>;
  }
}
