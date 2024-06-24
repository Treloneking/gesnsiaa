import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import'./navbar.css';
import * as AiIcons from "react-icons/ai";
import * as FaIcons from "react-icons/fa";
import { SidebarData } from '../sidebar/SidebarData';
import { Link } from 'react-router-dom';
import { IconContext } from 'react-icons';
function Navbar() {
    const[sidebar, setSidebar]=useState(false);
    const history = useHistory();
    const showSidebar = () => setSidebar(!sidebar);
    const handleNotification = () => {
        history.push(`/app/notification`);
      };
    
    return (< >
     
    <IconContext.Provider value={{color: '#fff'}}>
        <div className='nav-bar'>
            <nav className='nav-bar1'>
                <Link to="/app" className='menu-bars'>
           <FaIcons.FaBars onClick={showSidebar} />
           </Link>
           <Link to="/app/notification" className='notif'>
           <FaIcons.FaBell onClick={handleNotification}/>
           </Link>
            </nav>
        </div>
        <nav className={sidebar ? 'nav-menu active' : 'nav-menu '}>
            <ul className='nav-menu-items' onClick={showSidebar}>
                <li className='navbar-toggle'>
                    <Link to='#' className='menu-bars'>
                    <AiIcons.AiOutlineClose/>
                    </Link>
                </li>
                {SidebarData.map((item,index) => {
                    return (
                        <li key={index} className={item.cName}>
                            <Link to={item.path}>
                                {item.icon}
                                <span>{item.title}</span>
                            </Link>
                        </li>
                    )
                })}
                </ul>     
        </nav></IconContext.Provider>
        </>
    );
}

export default Navbar;