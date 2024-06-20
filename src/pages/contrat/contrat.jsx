import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory} from 'react-router-dom';
import './../recherche/recherche.css'

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function Contrat() {
  const [contrats, setContrats] = useState([]);
  const [error, setError] = useState(null);
  const history = useHistory();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Nombre d'éléments par page par défaut

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
  const totalPages = Math.ceil(contrats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, contrats.length);
  const handleMoreInfo = (matricule) => {
    history.push(`/app/plusinfo?matricule=${matricule}`);
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
  };
  return (<div className='search-pag'>
    <h1>Contrat:</h1>
    
    <div className="results">
{error && <p className="error">{error}</p>}
{contrats.length > 0 ? (
  <div>
    <table>
      <thead>
        <tr> 
          <th>Matricule</th>
          <th>Nom</th>
          <th>Prénom</th>
          <th>Sexe</th>
          <th>Direction</th>
          <th>Date fin contrat</th>
          <th>Temps restant</th>
          <th>&nbsp;&nbsp;&nbsp;...</th>
        </tr>
      </thead>
      <tbody>
        {contrats.slice(startIndex, endIndex).map((contrat, index) => (
          <tr key={index}>
            <td>{contrat.Mat_employe}</td>
            <td>{contrat.Nom_employe}</td>
            <td>{contrat.Prenom_employe}</td>
            <td>{contrat.Sexe}</td>
            <td>{contrat.Direction_code}</td>
            <td>{formatDate(contrat.Date_fin_c)}</td>
            <td className='red'>{contrat.tempsrestant}</td>
            <td>
              <button onClick={() => handleMoreInfo(contrat.Mat_employe)}>Plus</button>
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
   <p>Aucun résultat trouvé</p>
)}
</div>
</div>
);
}

export default Contrat;


