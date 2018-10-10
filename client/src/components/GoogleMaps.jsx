import React, { Component } from "react";
const loadjs = require("loadjs");

export default class GoogleMaps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: undefined,
      apiLoaded: false,
      currentInfoWindow: undefined,
      currentMarkers: []
    };
    this.initMap = this.initMap.bind(this);
    this._renderMarkers = this._renderMarkers.bind(this);
    this._createMarkers = this._createMarkers.bind(this);
    this._deleteMarkers = this._deleteMarkers.bind(this);
  }

  _createMarkers() {
    if (this.props.yelpBusinessList === undefined) {
      return;
    }

    for (let business in this.props.yelpBusinessList.MappedBusinessStruct) {
      const businessData = this.props.yelpBusinessList.MappedBusinessStruct[
        business
      ];
      this._renderMarkers(businessData);
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
    window._createMarkers = this._createMarkers;
  }

  componentDidUpdate() {
    if (this.state.currentMarkers.length <= 20) {
      this._createMarkers();
    } else {
      this._deleteMarkers();
    }
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

  _deleteMarkers() {
    this.state.currentMarkers.forEach(marker => {
      marker.setMap(null);
    });
    this.setState({
      currentMarkers: []
    });
  }

  //latlng = {lat: lat, lng: lng}
  _renderMarkers(business) {
    // If the api hasn't loaded, do not attempt to apply markers to map.
    if (!this.state.apiLoaded) {
      return false;
    }
    // First, render the marker on the map
    const google = window.google;
    const marker = new google.maps.Marker({
      position: {
        lat: business.coordinates.latitude,
        lng: business.coordinates.longitude
      },
      title: "hello"
    });
    marker.setMap(this.state.map);

    this.setState(
      {
        currentMarkers: [...this.state.currentMarkers, marker]
      },
      console.log(this.state.currentMarkers)
    );

    // Next, render the content inside the marker. This should somewhat resemble
    // how yelp renders information in their markers.
    const contentString = `
    <div id="content">
      <div class="marker-business-name">${business.name}</div>
      <div class="marker-stars">${business.rating}</div>
      <div class="marker-dollar-signs">${business.price}</div>
      <div class="marker-address">${business.location.display_address[0]}\n${
      business.location.display_address[1]
    }</div>
      <img class="marker-image" src=${
        business.image_url
      } alt="restaurant picture"/>
    </div>`;

    const infoWindow = new google.maps.InfoWindow({
      content: contentString
    });

    marker.addListener("click", () => {
      // if there is another InfoWindow open, close it first before rendering the new one
      if (this.state.currentInfoWindow) {
        this.state.currentInfoWindow.close();
      }
      // Open the newly clicked infoWindow
      infoWindow.open(this.state.map, marker);
      // setState to keep track of which infoWindow is open
      this.setState({
        currentInfoWindow: infoWindow
      });
    });
  }

  render() {
    return (
      <div className="map-container">
        <div id="map" />
      </div>
    );
  }
}
