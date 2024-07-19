// Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './dashboard.css';

const Dashboard = () => {
  const [employeeCount, setEmployeeCount] = useState(0);
  const direction = localStorage.getItem('Direction');

  useEffect(() => {
    const fetchEmployeeCount = async () => {
      try {
        const response = await axios.get('http://localhost:5000/app/dashboarddirection', {
          params: { direction }
        });
        setEmployeeCount(response.data.count);
      } catch (error) {
        console.error('Error fetching employee count:', error);
      }
    };

    fetchEmployeeCount();
  }, [direction]);

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <h1>Tableau de Bord</h1>
        <div className="dashboard-card">
          <h2>Direction: {direction}</h2>
          <p>Nombre d'employés: {employeeCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
