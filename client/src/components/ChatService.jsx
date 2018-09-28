import React, { Component } from "react";
import ChatBox from "./ChatBox";

export default class ChatService extends Component {
  constructor(props) {
    super(props);
    this.state = {
      msg: ""
    };
    this.handleMessageTextChange = this.handleMessageTextChange.bind(this);
    this.handleChatSendClick = this.handleChatSendClick.bind(this);
    this.prepChatMsg = this.prepChatMsg.bind(this);
  }

  handleMessageTextChange(e) {
    this.setState({
      msg: e.target.value
    });
  }

  handleChatSendClick() {
    const payload = this.prepChatMsg();
    this.props.wsconn.send(payload);
    this.setState({ msg: "" });
  }

  prepChatMsg() {
    const payload = {
      msg: this.state.msg,
      username: this.props.username
    };
    return JSON.stringify(payload);
  }

  render() {
    return (
      <div id="chat">
        <div className="chat-box">
          <ChatBox messages={this.props.messages} />
        </div>
        <input
          type="text"
          id="msg"
          size="64"
          value={this.state.msg}
          onChange={this.handleMessageTextChange}
          onKeyDown={e => {
            if (e.keyCode === 13) {
              this.handleChatSendClick();
            }
          }}
        />
        <button type="button" onClick={this.handleChatSendClick}>
          Send
        </button>
      </div>
    );
  }
}
