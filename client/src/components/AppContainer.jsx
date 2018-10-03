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
          <ListDisplay yelpBusinessList={this.props.yelpBusinessList} />

          <div className="col">
            <GoogleMaps
              location={this.props.location}
              getLocation={this.props.getLocation}
              yelpBusinessList={this.props.yelpBusinessList}
            />
            <div>Chat here</div>
          </div>
        </div>
      </div>
    );
  }
}
