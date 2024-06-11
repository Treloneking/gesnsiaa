import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory, useLocation } from 'react-router-dom';
import moment from 'moment';

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function PlusInfo() {
  const [formData, setFormData] = useState({});
  const history = useHistory();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const matricule = queryParams.get('matricule');
  const [differenceJours, setDifferenceJours] = useState(0);
  
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/app/plusinfo?matricule=${matricule}`);
        if (response.data.length > 0) {
          setFormData(response.data[0]);
        } else {
          alert('Aucun employé trouvé avec ce matricule.');
          history.push('/app/recherche');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };
    
    if (matricule) {
      fetchEmployee();
    }
  }, [matricule, history]);

  useEffect(() => {
    if (formData.Date_debut_c && formData.Date_fin_c) {
      const dateDebut = moment(new Date(), 'YYYY-MM-DD');
      const dateFin = moment(formData.Date_fin_c, 'YYYY-MM-DD');
      const difference = dateFin.diff(dateDebut, 'days');
      setDifferenceJours(difference);
    }
  }, [formData]);

  const handleModify = (matricule) => {
    history.push(`/app/modification?matricule=${matricule}`);
  };

  return (
    <div className='search-page'>
      <h1>Plus d'Informations sur l'Employé</h1>
      <div className='results'>
       <ul>
         <li>
        <p><strong>Matricule:</strong> {formData.Mat_employe}</p>
        <p><strong>Nom:</strong> {formData.Nom_employe}</p>
        <p><strong>Prénom:</strong> {formData.Prenom_employe}</p>
        <p><strong>Email:</strong> {formData.Email}</p>
        <p><strong>Téléphone:</strong> {formData.Telephone}</p>
        <p><strong>Date de naissance:</strong> {formatDate(formData.Date_naissance)}</p>
        <p><strong>Nationalité:</strong> {formData.Nationnalite}</p>
        <p><strong>Sexe:</strong> {formData.Sexe}</p>
        <p><strong>Numero contrat:</strong> {formData.N_contrat}</p>
        <p><strong>Type de contrat:</strong> {formData.Type_contrat_Id_type_contrat}</p>
        <p><strong>Date debut contrat:</strong> {formatDate(formData.Date_debut_c)}</p>
        <p><strong>Date fin contrat:</strong> {formatDate(formData.Date_fin_c)}</p>
        <p><strong>Temps restant contrat:</strong>{differenceJours}</p>
        <p><strong>Compte ID:</strong> {formData.Compte_Id_compte}</p>
        <p><strong>Nom direction:</strong> {formData.Nom_direction}</p>
        <p><strong>Responsable direction:</strong> {formData.Chef_direction}</p>
        <p><strong>Date debut a l'agence:</strong> {formatDate(formData.Date_debut)}</p>
        <p><strong>Date fin a l'agence :</strong> {formatDate(formData.Date_fin)}</p>
        <p><strong>Nom agence:</strong> {formData.Nom_agence}</p>
        <p><strong>Lieu agence:</strong> {formData.Lieu_agence}</p>
        <button onClick={() => handleModify(formData.Mat_employe)}>Modifier</button>
        </li>
      </ul>
       </div>
    </div>
  );
}

export default PlusInfo;
