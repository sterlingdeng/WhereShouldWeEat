import React, { Component } from "react";
import "./App.css";
import Landing from "./components/Landing";
import GetLocation from "./components/GetLocation";
import AppContainer from "./components/AppContainer";

const renderEnum = {
  GET_LOCATION: 1, // if location is undefined
  SESSION_LANDING: 2, // once a location (latlng) is found or inputted
  LOGGED_IN: 3 // logged in
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      render: renderEnum.GET_LOCATION,
      username: "",
      location: undefined,
      sid: null,
      bizdata: undefined,
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
    this._handleRenderState = this._handleRenderState.bind(this);
    this._updateAppState = this._updateAppState.bind(this);
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
      latlng: {
        lat: this.state.location.lat,
        lng: this.state.location.lng
      } // location needs to be a string
    };

    const body = JSON.stringify(requestBody);

    if (!body) return;

    const response = await fetch("/CreateSession", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: body
    });

    const data = await response.json();
    this.setState({
      sid: data.id,
      bizdata: data
    });

    return data;
  }

  async joinSession() {
    if (this.state.sid === "") {
      console.log("Can't join session. No session id available");
    }

    const uri = `/JoinSession?id=${this.state.sid}&username=${
      this.state.username
    }`;
    let response = await fetch(uri);

    let data = await response.json();
    console.log(data.YelpBizList);
    if (data.id) {
      this.setState(
        {
          bizdata: data.YelpBizList,
          render: renderEnum.LOGGED_IN
        },
        console.log(this.state.bizdata)
      );
    }

    return data;
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
      // If server can successfully create session, response will be Session ID
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
  _updateAppState(newState) {
    this.setState(newState);
  }

  _handleRenderState(newState) {
    this.setState({
      render: newState
    });
  }

  render() {
    // Conditional Rendering
    const crGetLocation = (() => {
      if (this.state.render === renderEnum.GET_LOCATION) {
        return (
          <GetLocation
            location={this.state.location}
            _handleRenderState={this._handleRenderState}
            _updateAppState={this._updateAppState}
            renderEnum={renderEnum}
          />
        );
      }
    })();

    const crLanding = (() => {
      if (this.state.render === renderEnum.SESSION_LANDING) {
        return (
          <Landing
            username={this.username}
            sid={this.sid}
            location={this.location}
            handleUsernameChange={this.usernameTextChange}
            handleSidChange={this.sidValueChange}
            handleCreateSessionClick={this.handleCreateSessionButtonClick}
            handleJoinSessionClick={this.handleJoinSessionButtonClick}
          />
        );
      }
    })();

    const crAppContainer = (() => {
      if (this.state.render === renderEnum.LOGGED_IN) {
        return (
          <AppContainer
            // for google maps
            location={this.state.location}
            getLocation={this.getLocation}
            // for chat service
            wsconn={this.state.wsconn}
            username={this.state.username}
            messages={this.state.messages}
            yelpBusinessList={this.state.bizdata}
          />
        );
      }
    })();

    return (
      <div className="App">
        {crGetLocation}

        {crLanding}

        {crAppContainer}
      </div>
    );
  }
}

export default App;
