import React, { Component } from "react";
import "./App.css";
import Landing from "./components/Landing";
import GetLocation from "./components/GetLocation";
import AppContainer from "./components/AppContainer";
import VotingContainer from "./components/VotingContainer";

const renderEnum = {
  GET_LOCATION: 1, // if location is undefined
  SESSION_LANDING: 2, // once a location (latlng) is found or inputted
  LOGGED_IN: 3, // logged in
  VOTING: 4
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      render: renderEnum.GET_LOCATION,
      username: "",
      location: undefined,
      sid: null, // session id
      bizdata: undefined,
      yelpOffset: 0,
      wsconn: null,
      messages: [],
      nomineeList: [],
      readyUp: false
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
    this._handleNominateButtonClick = this._handleNominateButtonClick.bind(
      this
    );
    this._handleBackBusinessList = this._handleBackBusinessList.bind(this);
    this._handleNextBusinessList = this._handleNextBusinessList.bind(this);
    this._handleReadyUpButtonClick = this._handleReadyUpButtonClick.bind(this);
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
      sid: Number(e.target.value)
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
    console.log(data);
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
    console.log(data);
    if (data.id) {
      this.setState({
        bizdata: data.YelpBizList,
        render: renderEnum.LOGGED_IN,
        nomineeList: data.nomineeList
      });
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
        if (msg.nominee.Business !== null) {
          // update nominee
          this.setState(state => {
            return { nomineeList: [...state.nomineeList, msg.nominee] };
          }, console.log(msg));
        } else {
          // append message to the board
          this.setState({
            messages: [...this.state.messages, `${msg.username}: ${msg.msg}`]
          });
        }
      };
    }
  }

  async reqYelpData() {
    let url = "/yelpsearch?";

    if (this.state.location.lat && this.state.location.lng) {
      url += `lat=${this.state.location.lat}&lng=${this.state.location.lng}`;
    } else {
      url += `location=${this.state.location.loc}`;
    }
    url += `&offset=${this.state.yelpOffset}`;

    try {
      const response = await fetch(url);
      const body = await response.json();
      console.log(body);
      this.setState({
        bizdata: body
      });
    } catch (err) {
      console.log(err);
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

  //
  //
  async _handleNominateButtonClick(i) {
    const payload = {
      sid: this.state.sid,
      username: this.state.username,
      nominee: i
    };

    const payloadJSON = JSON.stringify(payload);

    const response = await fetch("/nominate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: payloadJSON
    });
    console.log(response);
  }

  _handleReadyUpButtonClick() {
    const currState = this.state.readyUp;
    const newState = !this.state.readyUp;

    const fetchurl = state => {
      let url = "/ReadyUp?";
      const sid = `sid=${this.state.sid}`;
      const username = `&username=${this.state.username}`;
      const isready = `&readyup=${state}`;
      console.log(isready);

      url += sid + username + isready;
      console.log(url);
      try {
        let response = fetch(url);
        console.log(response);
      } catch (err) {
        console.log(err);
      }
    };

    this.setState(state => {
      return {
        readyUp: newState,
        render: renderEnum.LOGGED_IN
      };
    }, fetchurl(newState));
    console.log("reached");
  }

  _handleNextBusinessList() {
    this.setState(state => {
      return { yelpOffset: state.yelpOffset + 20 };
    }, this.reqYelpData);
  }

  _handleBackBusinessList() {
    // Change offset to -20
    if (this.state.yelpOffset !== 0) {
      this.setState(state => {
        return { yelpOffset: state.yelpOffset - 20 };
      }, this.reqYelpData);
    }
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
      // if (this.state.render === renderEnum.LOGGED_IN) {        // this line for testing
      if (this.state.render === renderEnum.SESSION_LANDING) {
        // this line for production
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
      // if (this.state.render === renderEnum.SESSION_LANDING) {    // this line for testing
      if (this.state.render === renderEnum.LOGGED_IN) {
        // this line for production
        return (
          <AppContainer
            // for google maps
            location={this.state.location}
            getLocation={this.getLocation}
            // for chat service
            wsconn={this.state.wsconn}
            username={this.state.username}
            messages={this.state.messages}
            // for business list
            yelpBusinessList={this.state.bizdata}
            handleNominateClick={this._handleNominateButtonClick}
            yelpOffset={this.state.yelpOffset}
            handleBackBusinessList={this._handleBackBusinessList}
            handleNextBusinessList={this._handleNextBusinessList}
            // for nominee list
            nomineeList={this.state.nomineeList}
            readyUp={this._handleReadyUpButtonClick}
          />
        );
      }
    })();

    const crVotingContainer = (() => {
      if (this.state.render === renderEnum.VOTING) {
        return <VotingContainer />;
      }
    })();

    return (
      <div className="App">
        {crGetLocation}
        {crLanding}
        {crAppContainer}
        {crVotingContainer}
      </div>
    );
  }
}

export default App;
