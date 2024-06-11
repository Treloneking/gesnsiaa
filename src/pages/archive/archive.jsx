import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory} from 'react-router-dom';
import './../recherche/recherche.css'
function Archive() {
  const [employes, setEmployes] = useState([]);
  const [error, setError] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/app/archive');
        if (response.data.length === 0) {
          setError('Aucun résultat trouvé.');
        } else {
          setEmployes(response.data);
        }
      } catch (error) {
        console.error('Error fetching contracts:', error);
        setError('Une erreur s\'est produite lors de la récupération des archives.');
      }
    };
  
    fetchData();
  }, []); 

  const handlearchiveplus = (matricule) => {
    history.push(`/app/archiveplus?matricule=${matricule}`);
  };

  return (<div className='search-page'>
    <div className='results'>
      {error && <p>{error}</p>}
      <h1>Archive:</h1>
      <ul>
        {employes.map(employe => (
          <li key={employe.Mat_employe}>
            <p><strong>Matricule:</strong>{employe.Mat_employe}</p>
            <p><strong>Nom employé:</strong>{employe.Nom_employe}</p>
            <p><strong>Prenom employé:</strong>{employe.Prenom_employe}</p>
            <button onClick={() => handlearchiveplus(employe.Mat_employe)}>Plus</button>
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}

export default Archive;