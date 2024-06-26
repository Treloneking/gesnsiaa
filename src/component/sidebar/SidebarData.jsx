//SidebarData.jsx
import React from 'react';
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import * as FaIcons from "react-icons/fa";
export const SidebarData =[

{
    title: "Register",
    path: "/app/register",
    icon: <AiIcons.AiOutlineUserAdd/>,
    cName: "nav-text",
    access:"RH"
},
{
    title: "recherche",
    path: "/app/recherche",
    icon: <IoIcons.IoIosSearch/>,
    cName: "nav-text"
},
{
    title: "archive",
    path: "/app/archive",
    icon: <FaIcons.FaArchive/>,
    cName: "nav-text"
},
{
    title:"contrat",
    path: "/app/contrat",
    icon: <FaIcons.FaFileContract/>,
    cName: "nav-text"
},
]