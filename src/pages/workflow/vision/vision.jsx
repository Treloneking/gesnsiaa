import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './../../recherche/recherche.css';

function Vision() {
  const [newEmployes, setNewEmployes] = useState([]);
  const [error, setError] = useState(null);
  const history = useHistory();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default number of items per page

  // Retrieve the direction from local storage
  const chefDirection = localStorage.getItem('Direction');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/app/newemploye');
        if (response.data.length === 0) {
          setError('Aucun résultat trouvé.');
        } else {
          // Filter the new employees based on the direction
          const filteredEmployees = response.data.filter(
            (employe) => employe.direction === chefDirection
          );
          setNewEmployes(filteredEmployees);
        }
      } catch (error) {
        console.error('Error fetching new employees:', error);
        setError('Une erreur s\'est produite lors de la récupération des nouveaux employés.');
      }
    };

    fetchData();
  }, [chefDirection]);

  const totalPages = Math.ceil(newEmployes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, newEmployes.length);

  const handleMoreInfo = (matricule) => {
    history.push(`/app/newemployeplus?matricule=${matricule}`);
  };

  const handleNext = (matricule) => {
    history.push(`/app/authorizeComptes?matricule=${matricule}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
  };

  return (
    <div className='search-pag'>
      <h1>Nouvel Employé:</h1>
      
      <div className="results">
        {error && <p className="error">{error}</p>}
        {newEmployes.length > 0 ? (
          <div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Matricule Employé</th>
                  <th>Contrat</th>
                  <th>Type de Contrat</th>
                  <th>Direction</th>
                  <th>Application à autoriser </th>
                </tr>
              </thead>
              <tbody>
                {newEmployes.slice(startIndex, endIndex).map((newEmploye, index) => (
                  <tr key={index}>
                    <td>{newEmploye.id_new_employe}</td>
                    <td>{newEmploye.Employe_Mat_employe}</td>
                    <td>{newEmploye.Contrat_N_contrat}</td>
                    <td>{newEmploye.Type_contrat_Id_type_contrat}</td>
                    <td>{newEmploye.direction}</td>
                    <td>
                      <button className="bouton" onClick={() => handleNext(newEmploye.Employe_Mat_employe)}>suivant</button>
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
          <p></p>
        )}
      </div>
    </div>
  );
}

export default Vision;
