import React from "react";

const NomineeList = props => {
  const list = props.nomineeList.map((data, idx) => {
    return (
      <div className="col" key={idx}>
        {data.name}, {idx}
      </div>
    );
  });

  return <div>{list}</div>;
};

export default NomineeList;
