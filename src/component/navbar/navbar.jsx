import React, { useState } from 'react';
import'./navbar.css';
import * as AiIcons from "react-icons/ai";
import * as FaIcons from "react-icons/fa";
import { SidebarData } from '../sidebar/SidebarData';
import { Link } from 'react-router-dom';
import { IconContext } from 'react-icons';
function Navbar() {
    const[sidebar, setSidebar]=useState(false);

    const showSidebar = () => setSidebar(!sidebar);
    return (< >
    <IconContext.Provider value={{color: '#fff'}}>
        <div className='nav-bar'>
            <nav className='nav-bar1'>
                <Link to="/app" className='menu-bars'>
           <FaIcons.FaBars onClick={showSidebar} />
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