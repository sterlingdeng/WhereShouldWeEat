import React, { Component } from "react";
import "./App.css";
import Landing from "./components/Landing";
import ChatService from "./components/ChatService";
import GoogleMaps from "./components/GoogleMaps";
import GetLocation from "./components/GetLocation";

const render = {
  GET_LOCATION: 1
};

const USA_LAT_LNG = { lat: 37.0902, lng: -95.7129 };

class App extends Component {
  constructor() {
    super();
    this.state = {
      render: render.GET_LOCATION,
      username: "",
      location: undefined,
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
    this.getLocationLatLng = this.getLocationLatLng.bind(this);
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
      console.log("can't join session. no session id available");
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

  // Gets the {lat,lng} of the users. If geolocation does not exists or geolocation fails to get the position, the location state will be set to USA_LAT_LNG, which is the {lat, lng} for the center of the US.
  getLocationLatLng() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const coord = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          this.setState({
            location: coord
          });
        },
        () => {
          this.setState({
            location: USA_LAT_LNG
          });
        }
      );
    } else {
      this.setState({
        location: USA_LAT_LNG
      });
    }
  }

  render() {
    /* 
  
  Conditional Rendering
  
  */

    const crGetLocation = (() => {
      if (this.state.render == render.GET_LOCATION) {
        return (
          <GetLocation
            getLocation={this.getLocationLatLng}
            location={this.state.location}
            defaultMap={USA_LAT_LNG}
          />
        );
      }
    })();

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
        {crGetLocation}
        <GoogleMaps
          location={this.state.location}
          getLocation={this.getLocation}
          defaultMap={USA_LAT_LNG}
        />
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
