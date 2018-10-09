import React, { Component } from "react";
import Sidebar from "./Sidebar";
import GoogleMaps from "./GoogleMaps";
import ListDisplay from "./ListDisplay";
import NomineeList from "./NomineeList";

export default class AppContainer extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <Sidebar
            wsconn={this.props.wsconn}
            username={this.props.username}
            messages={this.props.messages}
            className="sidebar"
          />
          <ListDisplay
            yelpBusinessList={this.props.yelpBusinessList}
            handleNominateClick={this.props.handleNominateClick}
            yelpOffset={this.props.yelpOffset}
            handleBackBusinessList={this.props.handleBackBusinessList}
            handleNextBusinessList={this.props.handleNextBusinessList}
          />

          <div className="col">
            <GoogleMaps
              location={this.props.location}
              getLocation={this.props.getLocation}
              yelpBusinessList={this.props.yelpBusinessList}
            />
            <div className="row">
              <NomineeList nomineeList={this.props.nomineeList} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
