// CompteCheckboxes.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CompteCheckboxes = ({ location }) => {
  const [comptes, setComptes] = useState([]);
  const [selectedComptes, setSelectedComptes] = useState([]);
  const matricule = new URLSearchParams(location.search).get('matricule');

  useEffect(() => {
    const fetchComptes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/app/comptes');
        setComptes(response.data);
      } catch (error) {
        console.error('Error fetching comptes:', error);
      }
    };

    fetchComptes();
  }, []);

  const handleCheckboxChange = (id) => {
    setSelectedComptes((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((compteId) => compteId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/app/authorizeComptes', {
        matricule,
        comptes: selectedComptes,
      });
      alert('Comptes autorisés avec succès');
    } catch (error) {
      console.error('Error authorizing comptes:', error);
    }
  };

  return (
    <div>
      <h1>Autoriser les Applications pour le Matricule: {matricule}</h1>
      <form onSubmit={handleSubmit}>
        {comptes.map((compte) => (
          <div key={compte.Id_compte}>
            <label>{compte.Application}
              <input
                type="checkbox"
                value={compte.Id_compte}
                onChange={() => handleCheckboxChange(compte.Id_compte)}
              />
              
            </label>
          </div>
        ))}
        <button type="submit">Autoriser</button>
      </form>
    </div>
  );
};

export default CompteCheckboxes;
