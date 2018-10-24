import React from "react";
import Sidebar from "./Sidebar";
import GoogleMaps from "./GoogleMaps";
import ListDisplay from "./ListDisplay";
import NomineeList from "./NomineeList";
import Navbar from "./Navbar";

const AppContainer = props => {
  return (
    <div className="container-fluid">
      <Navbar username={props.username} sid={props.sid} />
      <div className="row">
        <Sidebar
          wsconn={props.wsconn}
          username={props.username}
          messages={props.messages}
          className="sidebar"
        />
        <ListDisplay
          yelpBusinessList={props.yelpBusinessList}
          handleNominateClick={props.handleNominateClick}
          yelpOffset={props.yelpOffset}
          handleBackBusinessList={props.handleBackBusinessList}
          handleNextBusinessList={props.handleNextBusinessList}
        />

        <div className="col">
          <GoogleMaps
            location={props.location}
            getLocation={props.getLocation}
            yelpBusinessList={props.yelpBusinessList}
          />
          <div className="row">
            <NomineeList
              nomineeList={props.nomineeList}
              readyUp={props.readyUp}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default AppContainer;
