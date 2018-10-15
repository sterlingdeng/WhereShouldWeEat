import React from "react";

const NomineeList = props => {
  let listJSX = [];
  if (Object.keys(props.nomineeList).length !== 0) {
    const businesses = Object.values(props.nomineeList);
    listJSX = businesses.map((data, idx) => {
      return (
        <div className="col" key={idx}>
          {data.Business.name}, {idx}
        </div>
      );
    });
  }

  return (
    <div>
      {listJSX}
      <button onClick={props.readyUp}>Ready Up</button>
    </div>
  );
};

export default NomineeList;
