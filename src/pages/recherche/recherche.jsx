import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './recherche.css';
import * as FaIcons from "react-icons/fa";
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function SearchPage() {
  const [matricule, setMatricule] = useState('');
  const [nom, setNom] = useState('');
  const [direction, setDirection] = useState('');
  const [agence, setAgence] = useState('');
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Nombre d'éléments par page par défaut
  const history = useHistory();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEmployes([]);
  
    try {
      const response = await axios.get('http://localhost:5000/app/recherche', {
        params: { matricule, nom, direction, agence },
      });
   
      if (response.data.length === 0) {
        setError('Aucun résultat trouvé.');
      } else {
        setEmployes(response.data);
        setCurrentPage(1); // Réinitialiser à la première page après chaque recherche
      }
    } catch (err) {
      setError('Erreur lors de la recherche. Veuillez réessayer.');
    }
  
    setLoading(false);
  };
  
  const handleMoreInfo = (matricule) => {
    history.push(`/app/plusinfo?matricule=${matricule}`);
  };

  const totalPages = Math.ceil(employes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, employes.length);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
  };

  return (
    <div className="search-pag">
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
        <button className='boutonch' type="submit" disabled={loading}>
          {loading ? 'Recherche en cours...' : <FaIcons.FaSearch />}
        </button>
      </form>
      <div className="results">
        {error && <p className="error">{error}</p>}
        {employes.length > 0 ? (
          <div className='tableau'>
            <table>
              <thead>
                <tr> 
                  <th>Matricule</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Date de naissance</th>
                  <th>Sexe</th>
                  <th>Direction</th>
                  <th>Contrat</th>
                  <th>Telephone</th>
                  <th>Email</th>
                  <th>Nationnalité</th>
                  <th>Numero contrat</th>
                  <th>Agence</th>
                  <th></th>
                  <th>&nbsp;&nbsp;&nbsp;...</th>
                </tr>
              </thead>
              <tbody>
                {employes.slice(startIndex, endIndex).map((employe, index) => (
                  <tr key={index}>
                    <td>{employe.Mat_employe}</td>
                    <td>{employe.Nom_employe}</td>
                    <td>{employe.Prenom_employe}</td>
                    <td>{formatDate(employe.Date_naissance)}</td>
                    <td>{employe.Sexe}</td>
                    <td>{employe.Direction_code}</td>
                    <td>{employe.Type_contrat_Id_type_contrat}</td>
                    <td>{employe.Telephone}</td>
                    <td>{employe.Email}</td>
                    <td>{employe.Nationnalite}</td>
                    <td>{employe.N_contrat}</td>
                    <td>{employe.Agence_Id_agence}</td>
                    <td>{}</td>
                    <td>
                      <button onClick={() => handleMoreInfo(employe.Mat_employe)}>Plus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
  {currentPage > 1 && (
    <button onClick={() => handlePageChange(currentPage - 1)}>Précédent</button>
  )}
  <span>{currentPage}</span>
  {currentPage < totalPages && (
    <button onClick={() => handlePageChange(currentPage + 1)}>Suivant</button>
  )}
</div>

            <div>
              <label htmlFor="itemsPerPage">Items par page:</label>
              <select id="itemsPerPage" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        ) : (
          !loading && <p>Aucun résultat trouvé</p>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
