import React from "react";
import ChatService from "./ChatService";

const Sidebar = props => {
  return (
    <nav className="col-md-2 d-none d-md-block bg-light sidebar">
      <ChatService
        wsconn={props.wsconn}
        username={props.username}
        messages={props.messages}
      />
    </nav>
  );
};

export default Sidebar;
