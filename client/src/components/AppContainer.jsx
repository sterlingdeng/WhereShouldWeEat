import React, { Component } from "react";
import Sidebar from "./Sidebar";
import GoogleMaps from "./GoogleMaps";
import ListDisplay from "./ListDisplay";

export default class AppContainer extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    console.log(this.props);
    return (
      <div className="container-fluid">
        <div className="row">
          <Sidebar
            wsconn={this.props.wsconn}
            username={this.props.username}
            messages={this.props.messages}
            className="sidebar"
          />
          <ListDisplay className="col-md-4 ml-sm-auto" />
          <div className="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4 map-container">
            <GoogleMaps
              location={this.props.location}
              getLocation={this.props.getLocation}
              yelpBusinessList={this.props.yelpBusinessList}
            />
          </div>
        </div>
      </div>
    );
  }
}
