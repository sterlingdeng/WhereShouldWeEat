import React from "react";

const ChatBox = props => {
  let messages;
  if (props.messages.length > 0) {
    messages = props.messages.map((msg, idx) => {
      return <div key={idx}>{msg}</div>;
    });
  } else {
    return "No Messages!";
  }
  return <div>{messages}</div>;
};

export default ChatBox;
