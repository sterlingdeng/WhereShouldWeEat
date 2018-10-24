import React from "react";

export default function Winner(props) {
  const winnerArr = props.winner;
  let winnerJSX = [];

  winnerJSX = winnerArr.map((business, idx) => {
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
          </div>
        </div>
        <hr />
      </div>
    );
  });

  return <div>{winnerJSX} </div>;
}
