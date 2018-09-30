import React, { Component } from "react";
import { AsyncTypeahead, Typeahead } from "react-bootstrap-typeahead";

const searchURI = "http://localhost:8000/search?search=";

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

  _handleSearch = query => {
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
    return this.state.options.map(item => {
      `${item.place_name}, ${item.state}, ${item.zip_code}`;
    });
  };

  render() {
    this.props.getLocation();
    if (this.props.location === this.props.defaultMap) {
      return (
        <div className="get-location-cover full-size-container">
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
    } else if (this.props.location !== undefined) {
      return (
        <div className="get-location-cover full-size-container">
          <b>
            Found Location
            {Object.values(this.props.location)}
          </b>
        </div>
      );
    } else {
      return (
        <div className="get-location-cover full-size-container">
          <b>Getting Location</b>
        </div>
      );
    }
  }
}
