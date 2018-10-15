import React, { Component } from "react";

const loadjs = require("loadjs");

export default class GoogleMaps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: undefined,
      apiLoaded: false
    };
    this.currentInfoWindow = undefined;
    this.businessData = {};
    this.markers = [];
    this.initMap = this.initMap.bind(this);
    this._createMarkers = this._createMarkers.bind(this);
    this.updateBusinessList = this.updateBusinessList.bind(this);
  }

  initMap() {
    const google = window.google;
    let map = new google.maps.Map(document.getElementById("map"), {
      zoom: 12,
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
  componentWillMount() {
    loadjs(
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyDxEICqms-JYUOkuSKpakoWhIMlJ2MQJ7U&callback=initMap",
      () => {
        this.setState({ apiLoaded: true });
      }
    );
    window.initMap = this.initMap;
  }
  updateBusinessList() {
    if (this.props.yelpBusinessList === undefined) {
      return;
    }
    // If the api hasn't loaded, do not attempt to apply markers to map.
    if (!this.state.apiLoaded) {
      return;
    }

    if (Object.values(this.businessData).length !== 0) {
      this.businessData = {};
    }

    for (let business in this.props.yelpBusinessList) {
      const businessData = this.props.yelpBusinessList[business];
      this.businessData[business] = businessData;
    }
  }

  _createMarkers() {
    // First, render the marker on the map
    const google = window.google;

    Object.values(this.businessData).forEach((businessData, idx) => {
      const marker = new google.maps.Marker({
        position: {
          lat: businessData.coordinates.latitude,
          lng: businessData.coordinates.longitude
        },
        title: "hello",
        content: `
          <div id="content">
            <div class="marker-business-name">${businessData.name}</div>
            <div class="marker-stars">${businessData.rating}</div>
            <div class="marker-dollar-signs">${businessData.price}</div>
            <div class="marker-address">${
              businessData.location.display_address[0]
            }\n${businessData.location.display_address[1]}</div>
            <img class="marker-image" src=${
              businessData.image_url
            } alt="restaurant picture"/>
          </div>`,
        label: `${idx + 1}`
      });
      this.markers.push(marker);
      this._renderMarkers(marker);
    });
  }

  _renderMarkers(marker) {
    const google = window.google;
    marker.setMap(this.state.map);
    const infoWindow = new google.maps.InfoWindow({
      content: marker.content
    });
    marker.addListener("click", () => {
      // if there is another InfoWindow open, close it first before rendering the new one
      if (this.currentInfoWindow) {
        this.currentInfoWindow.close();
      }
      // Open the newly clicked infoWindow
      infoWindow.open(this.state.map, marker);
      // setState to keep track of which infoWindow is open
      this.currentInfoWindow = infoWindow;
    });
  }

  equality(obj1, obj2) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false;
    }

    const equalityTest = Object.keys(obj1).every(business => {
      return Object.prototype.hasOwnProperty.call(obj2, business);
    });

    return equalityTest;
  }

  componentDidUpdate() {
    const isEqual = this.equality(
      this.businessData,
      this.props.yelpBusinessList
    );

    if (!isEqual) {
      this.markers.forEach(marker => {
        marker.setMap(null);
      });
      this.markers = [];
      this.updateBusinessList();
      this._createMarkers();
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
