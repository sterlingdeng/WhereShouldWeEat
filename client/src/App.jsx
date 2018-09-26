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
      wsconn: null
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
    if (this.state.sid === null) {
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
    }
  }

  async initializeWebsocket() {
    let conn;

    const wsURL = `ws://${document.location.hostname}:8080/ws`;

    if (window["WebSocket"]) {
      conn = new WebSocket(wsURL);

      this.setState({
        wsconn: conn
      });

      console.log("Initializing Websocket Handshake");
      console.log(wsURL);
      conn.onclose = evt => {
        // need to find a way to append text to the caht room
        console.log(evt);
      };
      conn.onmessage = evt => {
        let msg = JSON.parse(evt.data);
        console.log(msg);
        if (msg.bizdata.length !== 0) {
          this.setState(state => {
            return { bizdata: state.bizdata.push(msg.bizdata) };
          });
        } else if (msg.Message !== 0) {
        }
      };
    }
  }

  handleCreateSessionButtonClick() {
    this.createSession()
      .then(() => this.joinSession())
      .then(() => this.initializeWebsocket())
      .catch(err => console.log(err));
  }

  handleJoinSessionButtonClick() {
    this.joinSession()
      .then(() => this.initializeWebsocket())
      .catch(err => console.log(err));
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Where Should We Eat</h1>
        </header>
        <p>Hello</p>
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
        <ChatService
          wsconn={this.state.wsconn}
          username={this.state.username}
        />
      </div>
    );
  }
}

export default App;
