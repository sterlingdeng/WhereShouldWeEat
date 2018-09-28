import React, { Component } from "react";
const loadjs = require("loadjs");

export default class GoogleMaps extends Component {
  constructor() {
    super();
    this.initMap = this.initMap.bind(this);
  }

  componentWillMount() {
    loadjs(
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyDxEICqms-JYUOkuSKpakoWhIMlJ2MQJ7U&callback=initMap"
    );
    window.initMap = this.initMap;
  }

  componentDidMount() {}

  initMap() {
    const google = window.google;
    let map = new google.maps.Map(document.getElementById("map"), {
      zoom: 13,
      gestureHandling: "greedy"
    });
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

  render() {
    return (
      <div className="map-container">
        <div id="map" />
      </div>
    );
  }
}
