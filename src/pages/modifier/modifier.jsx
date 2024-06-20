import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory, useLocation } from 'react-router-dom';

function UpdateEmployee() {
  const [formData, setFormData] = useState({});
  const history = useHistory();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const matricule = queryParams.get('matricule');
  const [contratType, setContratType] = useState("");
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Mise à jour de l'état normal pour les autres champs
    setFormData({ ...formData, [name]: value });
    if (name === "Type_contrat_Id_type_contrat") {
      setContratType(value);
    }
  };
  const handlereturn = (matricule) => {
    history.push(`/app/plusinfo?matricule=${matricule}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/app/modification', formData);
      alert('Données mises à jour avec succès');
      history.push('/app/recherche');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données:', error);
      alert('Erreur lors de la mise à jour des données. Veuillez vérifier les informations et réessayer.');
    }
  };
  return (
    <div>
      <h1 className='ohe'>Modifier les détails de l'employé</h1>
      <form onSubmit={handleSubmit} className='formulaireregister'>
        <div className="form-group">
          <label>Matricule:</label>
          <input 
            type="text" 
            name="Mat_employe" 
            value={formData.Mat_employe || ''} 
            onChange={handleChange} 
            readOnly 
          />
        </div >
        <div className="form-group">
          <label>Date debut contrat:</label>
          <input 
            type="date" 
            name="Date_debut_c" 
            value={formData.Date_debut_c || ''} 
            onChange={handleChange} 
          />
        </div >
        <div className="form-group">
        <label htmlFor="datefin">DATE FIN CONTRAT:</label>
        {/* Affichez ce champ uniquement si le contrat est CDD ou STAGE-ECOLE */}
        {contratType === "CDD" || contratType === "STG-ECOLE" ? (
          <input 
            type="date"
            id="Date_fin_c"
            name="Date_fin_c"
            onChange={handleChange}
            value={formData.Date_fin_c}
            required
          />
        ) : null}
      </div>
      <div class="form-group">
      <label for="">TYPE CONTRAT :</label>
      <select
       id="Type_contrat_Id_type_contrat"
        name="Type_contrat_Id_type_contrat"
        onChange={handleChange}
        value={formData.Type_contrat_Id_type_contrat}>
        <option value="CDD">CDD</option>
        <option value="CDI">CDI</option>
        <option value="STG-ECOLE">STAGE-ECOLE</option>
      </select>
    </div> 
    <div class="form-group">
    <label for="" className='textmod'>Agence :</label>
   <select
       id="Id_agence"
        name="Id_agence"
        onChange={handleChange}
        value={formData.Id_agence } required>
        <option disabled default selected>Selection de l'agence</option>
        <option value="BOUAK">BOUKE</option>
        <option value="ABIDJ">ABIDJAN</option>
        <option value="YAMOU">YAMOUSSOKRO</option>
      </select>
    </div>
    <button className="form-gro" onClick={() => handlereturn(formData.Mat_employe)}>Retour</button>
    <button className='form-mod' type="submit">Enregistrer les modifications</button>
      </form>
    </div >
  );
}

export default UpdateEmployee;
