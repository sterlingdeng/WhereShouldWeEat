import React, { Component } from "react";
import { AsyncTypeahead } from "react-bootstrap-typeahead";

const USA_LAT_LNG = { lat: 37.0902, lng: -95.7129 };

export default class GetLocation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      options: [],
      isLoading: true
    };
    this.unpackLocationData = this.unpackLocationData.bind(this);
    this._handleSearch = this._handleSearch.bind(this);
    this._renderOptions = this._renderOptions.bind(this);
  }

  // Function to determine the current coordinates (lat lng) of the user. If the browser does not
  // support navigator.geolocation
  getLocationLatLng() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const coord = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };

          this.props._updateAppState({
            location: coord,
            render: this.props.renderEnum.SESSION_LANDING
          });
        },
        () => {
          this.props._updateAppState({
            location: USA_LAT_LNG
          });
        }
      );
    } else {
      this.props._updateAppState({
        location: USA_LAT_LNG
      });
    }
  }

  // unpack JSON data to {place_name, state, zip_code}
  unpackLocationData(data) {
    if (!data) {
      return;
    }
    this.setState(
      {
        rawData: data,
        isLoading: false
      },
      console.log(this.state.rawData)
    );
  }

  // _handleSearch will be executed when an input is recieved to the typeahead component.
  // This function will send a GET request to the backend. The query string is the string
  // input in the typeahead component. We expect a json response of the top 10 likely locations,
  // which will be then rendered as options for the typeahead component.
  _handleSearch = query => {
    const searchURI = "http://localhost:8000/search?search=";
    fetch(searchURI + query)
      .then(res => res.json())
      .then(json => {
        if (!json) {
          return;
        }
        this.setState({
          options: json,
          isLoading: false
        });
      }, console.log(this.state.options))
      .catch(err => console.log(err));
  };

  _renderOptions = () => {
    this.state.options.map(item => {
      `${item.place_name}, ${item.state}, ${item.zip_code}`;
    });
  };

  render() {
    this.getLocationLatLng(); // executes function to find what is the lat/lng of the user
    if (this.props.location === undefined) {
      return (
        <div className="container-fluid">
          <b>Getting Location</b>
        </div>
      );
    } else if (
      this.props.location !== undefined &&
      this.props.location !== USA_LAT_LNG
    ) {
      return (
        <div className="container-fluid">
          <b>
            Found Location
            {Object.values(this.props.location)}
          </b>
        </div>
      );
    } else {
      return (
        <div className="container-fluid">
          <b> Location Not Found</b>
          <AsyncTypeahead
            {...this.state}
            options={this._renderOptions()}
            labelKey="login"
            onSearch={this._handleSearch}
            placeholder="City or Zipcode"
          />
        </div>
      );
    }
  }
}
