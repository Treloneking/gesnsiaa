import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CompteDetails() {
  const [comptes, setComptes] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Nombre d'éléments par page par défaut

  useEffect(() => {
    const fetchComptes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/app/demandecreation');
        if (response.data.length === 0) {
          setError('Aucun résultat trouvé.');
        } else {
          setComptes(response.data);
        }
      } catch (error) {
        console.error('Error fetching comptes:', error);
        setError('Une erreur s\'est produite lors de la récupération des comptes.');
      }
    };

    fetchComptes();
  }, []);

  const handlePageChange = (direction) => {
    if (direction === 'prev') {
      setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    } else if (direction === 'next') {
      setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleSubmit = async (matricule) => {
    try {
      await axios.post('http://localhost:5000/app/validatecreation', {
        matricule: matricule // Envoyer le matricule au serveur pour effacer la tâche
      });
      alert('Tâche terminée avec succès');
      // Recharger la liste des comptes après la suppression
    } catch (error) {
      console.error('Error authorizing comptes:', error);
    }
  };

  const totalPages = Math.ceil(comptes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, comptes.length);

  return (
    <div className='back-auth1'>
      <div className='apk1'>
        <div className='results1'>
          <h1>Comptes à Créer:</h1>
          {error && <p className="error">{error}</p>}
          {comptes.length > 0 ? (
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Matricule</th>
                    <th>Applications</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {comptes.slice(startIndex, endIndex).map((compte, index) => (
                    <tr key={index}>
                      <td>{compte.matricule}</td>
                      <td>{compte.applications}</td>
                      <td><button type="button" className='submit-button' onClick={() => handleSubmit(compte.matricule)}>Terminer</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                <button onClick={() => handlePageChange('prev')} disabled={currentPage === 1}>Précédent</button>
                <span>{currentPage}</span>
                <button onClick={() => handlePageChange('next')} disabled={currentPage === totalPages}>Suivant</button>
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
            <p>Aucun compte trouvé.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompteDetails;
