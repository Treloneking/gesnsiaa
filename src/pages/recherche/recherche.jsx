import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './recherche.css';
import * as FaIcons from "react-icons/fa";
import { utils as XLSXUtils, writeFile } from 'xlsx';

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
  const [contrat, setContrat] = useState('');
  const [statut, setStatut] = useState(''); // Nouvel état pour le statut
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
        params: { matricule, nom, direction, agence, statut,contrat }, // Inclure le statut dans les paramètres de requête
      });
     
      if (response.data.length === 0) {
        setError('Aucun résultat trouvé.');
      } else {
        // Filtrer les employés par statut après réception des données
        const filteredEmployes = response.data.filter(employe => {
          
          if (statut === '') {
            return true; // Retourner tous les employés si aucun statut n'est sélectionné
          } else {
            // Comparer le statut avec celui reçu de l'API
            return new Date(employe.Date_fin_c) <= new Date() ? "INACTIF" : "ACTIF" === statut;
          }
        });
  
        setEmployes(filteredEmployes);
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
  
  const handleExportXLSX = () => {
    const xlsxData = employes.map(employe => ({
      Matricule: employe.Mat_employe,
      Nom: employe.Nom_employe,
      Prénom: employe.Prenom_employe,
      'Date de naissance': formatDate(employe.Date_naissance),
      Sexe: employe.Sexe,
      Direction: employe.Direction_code,
      Contrat: employe.Type_contrat_Id_type_contrat,
      Téléphone: employe.Telephone,
      Email: employe.Email,
      Nationalité: employe.Nationnalite,
      'Numéro contrat': employe.N_contrat,
      Agence: employe.Agence_Id_agence,
      Statut: new Date(employe.Date_fin_c) <= new Date() ? "INACTIF" : "ACTIF"
    }));
  
    const worksheet = XLSXUtils.json_to_sheet(xlsxData);
    const workbook = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(workbook, worksheet, 'Employés');
    writeFile(workbook, 'export_listeemployes.xlsx');
  };

  return (
    <div className="search-pag">
      <h1>Recherche Employé par </h1>
      <form className="search-form" onSubmit={handleSearch}>
        <input className='form-group' 
          type="text"
          placeholder="Matricule"
          value={matricule}
          onChange={(e) => setMatricule(e.target.value)}
        />
        <input className='form-group'
          type="text"
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
         <select className='form-grou'onChange={(e) => setContrat(e.target.value)}>
         <option disabled default selected>Contrat</option>
          <option value="CDD">cdd</option>
          <option value="CDI">cdi</option>
          <option value="STG-ECOLE">stage ecole</option>
        </select>
        <select className='form-grou'onChange={(e) => setDirection(e.target.value)}>
        <option disabled default selected>Direction</option>
          <option value="DSI">DSI</option>
          <option value="DFC">DFC</option>
        </select>
        <select className='form-grou'onChange={(e) => setAgence(e.target.value)}>
        <option disabled default selected>Agence</option>
          <option value="ABIDJ">Abidjan</option>
          <option value="BOUAK">Bouaké</option>
        </select>
        <select className='form-grou' value={statut} onChange={(e) => setStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="ACTIF">Actif</option>
          <option value="INACTIF">Inactif</option>
        </select>
        <button className='boutonch' type="submit" disabled={loading}>
          {loading ? 'Recherche en cours...' : <FaIcons.FaSearch />}
        </button>
      </form>
      <div className="results">
        {error && <p className="error">{error}</p>}
        {employes.length > 0 ? (
          <div className='tableau'>
            <table className="table table-striped">
              <thead className="thead-dark">
                <tr> 
                  <th>Matricule</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Date de naissance</th>
                  <th>Sexe</th>
                  <th>Direction</th>
                  <th>Contrat</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Nationalité</th>
                  <th>Numéro contrat</th>
                  <th>Agence</th>
                  <th>Statut</th>
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
                    <td className={new Date(employe.Date_fin_c) <= new Date() ? 'bg-danger' : 'bg-success'}>
                      {new Date(employe.Date_fin_c) <= new Date() ? "INACTIF" : "ACTIF"}
                    </td>
                    <td>
                      <button className='bouton' onClick={() => handleMoreInfo(employe.Mat_employe)}>Plus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              {currentPage > 1 && (
                <button className='bouton' onClick={() => handlePageChange(currentPage - 1)}>Précédent</button>
              )}
              <span>{currentPage}</span>
              {currentPage < totalPages && (
                <button className='bouton' onClick={() => handlePageChange(currentPage + 1)}>Suivant</button>
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

            <button className='bouton' onClick={handleExportXLSX}>Exporter en xlsx</button>
          
          </div>
          
        ) : (
          !loading && <p>Aucun résultat trouvé</p>
        )}
      </div>
    </div>
  
  );
}

export default SearchPage;
