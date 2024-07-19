import React from 'react';
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import * as FaIcons from "react-icons/fa";
import { HiOutlineClipboardCopy } from "react-icons/hi";
import { Link } from 'react-router-dom';

const SidebarData = () => {
  const roler=localStorage.getItem('roledb');
    const sidebarItems = [
      {
            title: "Register",
            path: "/app/register",
            icon: <AiIcons.AiOutlineUserAdd />,
            cName: "nav-text",
            hidden: roler!=='admin',
        },
        {
          title: "Dashboard",
          path: "/app/dashboarddirection",
          icon: <AiIcons.AiFillDashboard />,
          cName: "nav-text",
          hidden: roler!=='Chef'
        },
      {
        title: 'Nouvel employé',
        path: '/app/newemploye',
        icon: <AiIcons.AiOutlineRedEnvelope/>,
        cName:"nav-text",
        hidden: roler!=='Chef'
      },
        
        {
            title: "Recherche",
            path: "/app/recherche",
            icon: <IoIcons.IoIosSearch />,
            cName: "nav-text",
            hidden:  roler!=='admin',
        },
        {
            title: "Archive",
            path: "/app/archive",
            icon: <FaIcons.FaArchive />,
            cName: "nav-text",
            hidden: roler!=='admin',
        },
        {
            title: "Contrat",
            path: "/app/contrat",
            icon: <FaIcons.FaFileContract />,
            cName: "nav-text",
            hidden: roler!=='admin',
        },
        {
            title: "Importation",
            path: "/app/import",
            icon: <FaIcons.FaFileImport />,
            cName: "nav-text",
            hidden: roler!=='admin',
        },
        {
          title: "Demande Creation",
          path: "/app/demandecreation",
          icon:<HiOutlineClipboardCopy />,
          cName: "nav-text",
          hidden: roler!=="AdminDsi"
        },
        {
          title: "Role",
          path: "/app/role",
          icon: <FaIcons.FaUserTie />,
          cName: "nav-text",
          hidden: roler !=='AdminDsi'
        },
        {
          title: "Demande absence",
          path: "/app/conges",
          icon: <FaIcons.FaCalendarCheck />,
          cName: "nav-text",
          hidden: roler!=='employe'
        }
    ];

    // Filtrer les éléments visibles dans la barre latérale
    const visibleSidebarItems = sidebarItems.filter(item => !item.hidden);

    return visibleSidebarItems.map((item, index) => (
        <li key={index} className={item.cName}>
            <Link to={item.path}>
                {item.icon}
                <span>{item.title}</span>
            </Link>
        </li>
    ));
};

export default SidebarData;
