import React from "react";
import { Typeahead } from "react-bootstrap-typeahead";

const GetLocation = props => {
  let options = ["John", "Miles"];

  props.getLocation();

  if (props.location === props.defaultMap) {
    return (
      <div className="get-location-cover full-size-container">
        <b> Location Not Found</b>
        <Typeahead options={options} />
      </div>
    );
  } else if (props.location !== undefined) {
    return (
      <div className="get-location-cover full-size-container">
        <b>
          Found Location
          {Object.values(props.location)}
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
};
export default GetLocation;
