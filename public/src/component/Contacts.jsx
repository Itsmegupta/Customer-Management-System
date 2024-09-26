import React from "react";
import chatlogo from "../assets/chatlogo.jpg";
function Contacts() {
  return (
    <div className="iFNuCj">
      <div className="brand">
        <img
          src="chatlogo.jpg"
          alt="logo"
        ></img>
        <h3>snappy</h3>
      </div>
      <div className="contacts">
        <div className="contact selected">
          <div className="avatar">
            <img src="" alt=""></img>
          </div>
          <div className="username">
            <h3>pankaj</h3>
          </div>
        </div>
      </div>
      <div className="current-user">
        <div className="avatar">
          <img src="" alt="avatar"></img>
        </div>
        <div className="username">
          <h2>sujeet@gmail.com</h2>
        </div>
      </div>
    </div>
  );
}

export default Contacts;
