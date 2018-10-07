import React from "react";

const ListDisplay = props => {
  let businessArr = [];

  for (let business in props.yelpBusinessList.MappedBusinessStruct) {
    const businessData = props.yelpBusinessList.MappedBusinessStruct[business];
    businessArr.push(businessData);
  }

  let categoryList = new Map();

  businessArr.map((business, idx) => {
    let temp = [];

    if (!business.categories.length) {
      temp = "";
    } else {
      temp = business.categories[0].title;
      for (let i = 1; i < business.categories.length; i++) {
        temp += `, ${business.categories[i].title}`;
      }
    }
    categoryList.set(idx, temp);
  });

  let list = businessArr.map((business, idx) => {
    return (
      <div className="list-item row" key={idx}>
        <div className="col">
          <img className="business-icon" src={business.image_url} />
        </div>
        <div className="col">
          <div className="row">
            <div className="col text-left business-name ">
              <div>
                <b>{idx + 1}.</b> {business.name}
              </div>
              <div>
                {business.rating} <b>{business.review_count}</b>
              </div>
              <div>{business.price}</div>
            </div>
            <div className="col">
              <div>{business.location.display_address[0]}</div>
              <div>{business.location.display_address[1]}</div>
            </div>
          </div>
          <div className="row">
            <div>{categoryList.get(idx)}</div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                props.handleNominateClick(business);
              }}
            >
              Nominate
            </button>
          </div>
        </div>
      </div>
    );
  });

  return <div className="col-5 list-display">{list}</div>;
};

export default ListDisplay;
