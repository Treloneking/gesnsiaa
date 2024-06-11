import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory} from 'react-router-dom';
import './../recherche/recherche.css'

function Contrat() {
  const [contrats, setContrats] = useState([]);
  const [error, setError] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/app/contrat');
        if (response.data.length === 0) {
          setError('Aucun résultat trouvé.');
        } else {
          setContrats(response.data);
        }
      } catch (error) {
        console.error('Error fetching contracts:', error);
        setError('Une erreur s\'est produite lors de la récupération des contrats.');
      }
    };
  
    fetchData();
  }, []); 
  const handleMoreInfo = (matricule) => {
    history.push(`/app/plusinfo?matricule=${matricule}`);
  };

  return (<div className='search-page'>
    <div className='results'>
      {error && <p>{error}</p>}
      <h1>Contrats:</h1>
      <ul>
        {contrats.map(contrat => (
          <li key={contrat.N_contrat}>
            <p><strong>Matricule:</strong>{contrat.Mat_employe}</p>
            <p><strong>Nom employé:</strong>{contrat.Nom_employe}</p>
            <p><strong>Prenom employé:</strong>{contrat.Prenom_employe}</p>
            Contrat {contrat.N_contrat} - Temps restant : {contrat.tempsrestant} jours
            <button onClick={() => handleMoreInfo(contrat.Mat_employe)}>Plus</button>
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}

export default Contrat;
