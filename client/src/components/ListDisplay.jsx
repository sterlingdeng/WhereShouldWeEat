import React from "react";

const ListDisplay = props => {
  let businessArr = [];
  let listJSX = [];
  let categoryList = new Map();

  for (let business in props.yelpBusinessList) {
    const businessData = props.yelpBusinessList[business];
    businessArr.push(businessData);
  }

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

  listJSX = businessArr.map((business, idx) => {
    return (
      <div key={idx}>
        <div className="list-item row" key={idx}>
          <div className="col">
            <img
              className="business-icon"
              src={business.image_url}
              alt="thumbnail"
            />
          </div>
          <div className="col">
            <div className="row">
              <div className="col text-left business-name ">
                <div>
                  <b>{idx + 1 + props.yelpOffset}.</b> {business.name}
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
            </div>
            <div className="row btn-container">
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
        <hr />
      </div>
    );
  });

  // Conditional rendering
  const BackNextButtonsJSX = (() => {
    if (props.yelpOffset === 0) {
      return (
        <div className="row justify-content-center">
          <div className={"m-2"} style={{ float: "left" }}>
            <button type="button" className="btn btn-secondary" disabled>
              Back
            </button>
          </div>
          <div className={"m-2"} style={{ float: "right" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={props.handleNextBusinessList}
            >
              Next
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="row justify-content-center">
          <div className={"m-2"} style={{ float: "left" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={props.handleBackBusinessList}
            >
              Back
            </button>
          </div>
          <div className={"m-2"} style={{ float: "right" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={props.handleNextBusinessList}
            >
              Next
            </button>
          </div>
        </div>
      );
    }
  })();

  return (
    <div className="col-5 list-display">
      <div>{BackNextButtonsJSX}</div>
      {listJSX}
    </div>
  );
};

export default ListDisplay;
