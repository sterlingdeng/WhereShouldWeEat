import React, { Component } from "react";
const loadjs = require("loadjs");

export default class GoogleMaps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: undefined,
      apiLoaded: false
    };
    this.initMap = this.initMap.bind(this);
    this._renderMarkers = this._renderMarkers.bind(this);
    this._updateMarkers = this._updateMarkers.bind(this);
  }

  componentWillMount() {
    loadjs(
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyDxEICqms-JYUOkuSKpakoWhIMlJ2MQJ7U&callback=initMap",
      () => {
        this.setState({ apiLoaded: true });
      }
    );
    window.initMap = this.initMap;
    window._updateMarkers = this._updateMarkers;
  }

  componentDidUpdate() {
    this._updateMarkers();
  }

  initMap() {
    const google = window.google;

    let map = new google.maps.Map(document.getElementById("map"), {
      zoom: 15,
      gestureHandling: "greedy"
    });

    this.setState({ map: map });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          map.setCenter(this.props.location);
        },
        () => {
          map.setCenter({ lat: 37.0902, lng: -95.7129 });
          map.setZoom(5);
        }
      );
    }
  }

  _updateMarkers() {
    for (let business in this.props.yelpBusinessList.MappedBusinessStruct) {
      const value = this.props.yelpBusinessList.MappedBusinessStruct[business];
      this._renderMarkers(value.coordinates);
    }
  }

  //latlng = {lat: lat, lng: lng}
  _renderMarkers(latlng) {
    // if the api hasn't loaded, do not attempt to apply markers to map.
    if (!this.state.apiLoaded) {
      return false;
    }
    const google = window.google;
    console.log(latlng);

    const marker = new google.maps.Marker({
      position: { lat: latlng.latitude, lng: latlng.longitude },
      title: "hello"
    });
    marker.setMap(this.state.map);
  }

  render() {
    return (
      <div className="map-container">
        <div id="map" />
      </div>
    );
  }
}
