import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import './navbar.css';
import axios from 'axios';
import SidebarData from '../sidebar/SidebarData';
import * as AiIcons from "react-icons/ai";
import * as FaIcons from "react-icons/fa";
import * as IoIcons from "react-icons/io";
import { IconContext } from 'react-icons';

function Navbar() {
    const [sidebar, setSidebar] = useState(false);
    const history = useHistory();
    const [isAdmin, setIsAdmin] = useState(false);

    const showSidebar = () => setSidebar(!sidebar);

    const handleNotification = () => {
        history.push(`/app/notification`);
    };

    const handleLogOut = () => {
        // Supprime le token du stockage local
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('Prenom');
        localStorage.removeItem('Nom');
        localStorage.removeItem('Id_user');
        localStorage.removeItem('roledb');
        localStorage.removeItem('Direction')

        // Actualise la page
        window.location.reload();
    };

    useEffect(() => {
        const storedIdUser = localStorage.getItem('Id_user');
        setIsAdmin(storedIdUser === 'Gesnsiaa');
    }, []);

    return (
        <>
            <IconContext.Provider value={{ color: '#fff' }}>
                <div className='nav-bar'>
                    <Link to="/app" className='menu-bars'>
                        <FaIcons.FaBars onClick={showSidebar} />
                    </Link>
                    <div className='nav-bar-icons'>
                        <IoIcons.IoMdNotificationsOutline className='notification-icon' onClick={handleNotification} />
                    </div>
                </div>
                <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
                    <ul className='nav-menu-items' onClick={showSidebar}>
                        <li className='navbar-toggle'>
                            <Link to='#' className='menu-bars'>
                                <AiIcons.AiOutlineClose />
                            </Link>
                        </li>
                        <SidebarData isAdmin={isAdmin} />
                        <button className="boutonlogout" onClick={handleLogOut}>
                            <FaIcons.FaSignOutAlt /><a>Deconnexion</a>
                        </button>
                    </ul>
                </nav>
            </IconContext.Provider>
        </>
    );
}

export default Navbar;
