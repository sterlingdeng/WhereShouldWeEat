import React from "react";

const ListDisplay = props => {
  let businessArr = [];

  for (let business in props.yelpBusinessList.MappedBusinessStruct) {
    const businessData = props.yelpBusinessList.MappedBusinessStruct[business];
    businessArr.push(businessData);
  }

  let list = businessArr.map((business, idx) => {
    return (
      <div className="list-item row" key={idx}>
        <div className="col">
          <img className="business-icon " src={business.image_url} />
        </div>
        <div className="col">
          <div className="row">
            <div className="col"> {business.name}</div>
            <div className="col">{business.rating}</div>
          </div>
          <div className="row">
            <div> something below</div>
          </div>
        </div>
      </div>
    );
  });

  return <div className="col-5 list-display">{list}</div>;
};

export default ListDisplay;
