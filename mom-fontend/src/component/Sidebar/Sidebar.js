
import React from "react";
import "./Sidebar.css";
import logo1 from "../../assets/logo1.png";
import meetingicon from "../../assets/meetingicon.png"
import action from '../../assets/double-tap.png'
import manage from "../../assets/management.png"

const Sidebar = () => {
  return (
   <>
    <div className="sidebar">
                <div className="logo">
                    <img src={logo1} alt="Logo" />
                </div>
                <ul className="navbar-nav me-auto mt-5">
                    <li className="nav-item">
                        <a className="nav-link text-white d-flex gap-2 align-items-center">
                            <img src={meetingicon} alt="Meetings" />
                            <span className="nav-link-label">Meetings</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link text-white d-flex gap-2 align-items-center">
                            <img src={action} alt="Action" />
                            <span className="nav-link-label">Action</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link text-white d-flex gap-2 align-items-center">
                            <img src={manage} alt="Manage" />
                            <span className="nav-link-label">Manage</span>
                        </a>
                    </li>
                </ul>
            </div>
   </>
  )
}

export default Sidebar;