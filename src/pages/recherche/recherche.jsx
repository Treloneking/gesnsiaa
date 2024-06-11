import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './recherche.css';

function SearchPage() {
  const [matricule, setMatricule] = useState('');
  const [nom, setNom] = useState('');
  const [direction, setDirection] = useState('');
  const [agence, setAgence] = useState('');
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const history = useHistory();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEmployes([]);
  
    try {
      const response = await axios.get('http://localhost:5000/app/recherche', {
        params: { matricule, nom, direction, agence }, // Inclure le paramètre direction
      });
   
      if (response.data.length === 0) {
        setError('Aucun résultat trouvé.');
      } else {
        setEmployes(response.data);
      }
    } catch (err) {
      setError('Erreur lors de la recherche. Veuillez réessayer.');
    }
  
    setLoading(false);
  };
  
  const handleMoreInfo = (matricule) => {
    history.push(`/app/plusinfo?matricule=${matricule}`);
  };

  return (
    <div className="search-page">
      <h1>Recherche Employé par </h1>
      <form className="search-form" onSubmit={handleSearch}>
        <input className='form-group' 
          type="text"
          placeholder=" matricule"
          value={matricule}
          onChange={(e) => setMatricule(e.target.value)}
        />
        <input className='form-group'
          type="text"
          placeholder=" nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
        <input className='form-group'
          type="text"
          placeholder="direction"
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
        />
        <input className='form-group' 
          type="text"
          placeholder=" agence"
          value={agence}
          onChange={(e) => setAgence(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Recherche en cours...' : 'Rechercher'}
        </button>
      </form>
      <div className="results">
        {error && <p className="error">{error}</p>}
        {employes.length > 0 ? (
          <ul>
            {employes.map((employe) => (
              <li key={employe.Mat_employe}>
                <p><strong>Matricule:</strong> {employe.Mat_employe}</p>
                <p><strong>Nom:</strong> {employe.Nom_employe}</p>
                <p><strong>Prénom:</strong> {employe.Prenom_employe}</p>
                <button onClick={() => handleMoreInfo(employe.Mat_employe)}>Plus</button>
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p>Aucun résultat trouvé</p>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
