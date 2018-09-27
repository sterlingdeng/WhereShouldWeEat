import React, { Component } from "react";
import "./App.css";
import Landing from "./components/Landing";
import ChatService from "./components/ChatService";

class App extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      location: "",
      sid: null,
      bizdata: {},
      wsconn: null,
      messages: []
    };
    this.usernameTextChange = this.usernameTextChange.bind(this);
    this.locationTextChange = this.locationTextChange.bind(this);
    this.sidValueChange = this.sidValueChange.bind(this);
    this.createSession = this.createSession.bind(this);
    this.handleCreateSessionButtonClick = this.handleCreateSessionButtonClick.bind(
      this
    );
    this.initializeWebsocket = this.initializeWebsocket.bind(this);
    this.joinSession = this.joinSession.bind(this);
    this.handleJoinSessionButtonClick = this.handleJoinSessionButtonClick.bind(
      this
    );
  }

  usernameTextChange(e) {
    this.setState({
      username: e.target.value
    });
  }

  locationTextChange(e) {
    this.setState({
      location: e.target.value
    });
  }

  sidValueChange(e) {
    this.setState({
      sid: e.target.value
    });
  }

  /**
   * Create Session is a POST request with params in JSON format :
   *  username
   *  location
   */
  async createSession() {
    const requestBody = {
      username: this.state.username,
      location: this.state.location
    };
    let body = JSON.stringify(requestBody);

    if (!body) return;

    let response = await fetch("/CreateSession", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: body
    });

    let data = await response.json();
    this.setState({
      sid: data.id,
      bizdata: data.bizList
    });
    return data;
  }

  async joinSession() {
    if (this.state.sid === "") {
      throw "can't join session. no session id available";
    }

    const uri = `/JoinSession?id=${this.state.sid}&username=${
      this.state.username
    }`;
    let response = await fetch(uri);

    try {
      let data = await response.json();
      console.log(data);
      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async initializeWebsocket() {
    const wsURL = `ws://${document.location.hostname}:8080/ws`;
    if (window["WebSocket"]) {
      let conn = new WebSocket(wsURL);
      this.setState({
        wsconn: conn
      });

      conn.onclose = evt => {
        this.setState({
          messages: [...this.state.messages, "Connection Ended"]
        });
        console.log(evt);
      };

      conn.onmessage = evt => {
        let msg = JSON.parse(evt.data);
        console.log(msg);
        if (msg.bizdata.id !== "") {
          this.setState(state => {
            return { bizdata: state.bizdata.push(msg.bizdata) };
          });
        } else {
          // append message to the board
          this.setState({
            messages: [...this.state.messages, `${msg.username}: ${msg.msg}`]
          });
        }
      };
    }
  }

  handleCreateSessionButtonClick() {
    this.createSession()
      .then(() => this.joinSession())
      .then(proceed => {
        proceed ? this.initializeWebsocket() : false;
      })
      .catch(err => console.log(err));
  }

  handleJoinSessionButtonClick() {
    this.joinSession()
      .then(proceed => {
        proceed ? this.initializeWebsocket() : false;
      })
      .catch(err => console.log(err));
  }

  render() {
    /* 
  
  Conditional Rendering
  
  */

    const crChatService = (() => {
      if (this.state.wsconn) {
        return (
          <ChatService
            wsconn={this.state.wsconn}
            username={this.state.username}
            messages={this.state.messages}
          />
        );
      }
    })();

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Where Should We Eat</h1>
        </header>
        <Landing
          username={this.username}
          sid={this.sid}
          location={this.location}
          handleUsernameChange={this.usernameTextChange}
          handleLocationChange={this.locationTextChange}
          handleSidChange={this.sidValueChange}
          handleCreateSessionClick={this.handleCreateSessionButtonClick}
          handleJoinSessionClick={this.handleJoinSessionButtonClick}
        />
        {crChatService}
      </div>
    );
  }
}

export default App;
