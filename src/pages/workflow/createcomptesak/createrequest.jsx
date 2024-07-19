import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './create.css';
import { useHistory } from 'react-router-dom';

const CompteCheckboxes = ({ location }) => {
  const [comptes, setComptes] = useState([]);
  const [selectedComptes, setSelectedComptes] = useState([]);
  const matricule = new URLSearchParams(location.search).get('matricule');
  const history = useHistory();

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
  const handlereturn = (matricule) => {
    history.push(`/app/newemploye`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/app/authorizeComptes', {
        matricule,
        comptes: selectedComptes,
      });
      alert('Comptes autorisés avec succès');
      setSelectedComptes([]);
    } catch (error) {
      console.error('Error authorizing comptes:', error);
    }
  };

  return (
    <div className='back-auth'>
      <div className='apk'>
        <div className='results'>
          <h1>Autoriser les Applications pour le Matricule: {matricule}</h1>
          <form onSubmit={handleSubmit}>
            {comptes.map((compte) => (
              <div key={compte.Id_compte} className='checkbox-container'>
                <label>
                    {compte.Application}
                  <input
                    type="checkbox"
                    value={compte.Id_compte}
                    onChange={() => handleCheckboxChange(compte.Id_compte)}
                  />
                  
                </label>
              </div>
            ))}
            <button type='submit' className='submit-button' onClick={handlereturn}>Retour</button>
            <button type="submit" className='submit-button'>Autoriser</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompteCheckboxes;
