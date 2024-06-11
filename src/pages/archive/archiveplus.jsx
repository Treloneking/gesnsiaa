import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Utilisation de useParams pour récupérer le matricule
// Assurez-vous d'importer le fichier CSS correspondant

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function Archiveplus() {
  const [archives, setArchives] = useState([]);
  const [error, setError] = useState(null);
  const { matricule } = useParams(); // Récupérer le matricule de l'URL
  const urlSearchString = window.location.search;
 const params = new URLSearchParams(urlSearchString);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/app/archiveplus?matricule=${params.get('matricule')}`);
        console.log(matricule)
        console.log(params.get('matricule'))
        if (response.data.length === 0) {
          setError('Aucun résultat trouvé.');
        } else {
          setArchives(response.data);
        }
      } catch (error) {
        console.error('Error fetching archives:', error);
        setError('Une erreur s\'est produite lors de la récupération des archives.');
      }
    };
  
    fetchData();
  }, [matricule]); // Matricule est maintenant une dépendance de useEffect

  return (
    <div className='archiveplus'>
      <div className='results'>
        {error && <p>{error}</p>}
        <h1>Archive:</h1>
        <ul>
          {archives.map(archive => (
            <li key={archive.id}>
              <p><strong>Matricule:</strong>{archive.Mat_employe}</p>
              <p><strong>Nom employé:</strong>{archive.Nom_employe}</p>
              <p><strong>Prenom employé:</strong>{archive.Prenom_employe}</p>
              <p><strong>Date debut:</strong>{formatDate(archive.Date_debut_c)}</p>
              <p><strong>Date fin:</strong>{formatDate(archive.Date_fin_c)}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Archiveplus;
