import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './registerperso.css';

function Registerperso() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    Mat_employe: "",
    Nom_employe: "",
    Prenom_employe: "",
    Email: "",
    Telephone: "",
    Date_naissance: "",
    Nationnalite: "",
    Sexe: "",
    N_contrat: "",
    Date_debut_c: "",
    Date_fin_c: "",
    Date_debut: "",
    Type_contrat_Id_type_contrat: "",
    Id_agence: "",
    Direction_code: ""
  });
  const history = useHistory();
  const [contratType, setContratType] = useState("");

  useEffect(() => {
    if (formData.Type_contrat_Id_type_contrat === "STG-ECOLE") {
      generateStageMatricule();
    }
  }, [formData.Type_contrat_Id_type_contrat]);

  const handleKeyPress = (e) => {
    const regex = /^[0-9\b]+$/;
    if (!regex.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
      e.preventDefault();
    }
  };

  const generateStageMatricule = async () => {
    try {
      const response = await axios.get('http://localhost:5000/app/get-latest-stage-matricule');
      const latestMatricule = response.data.latestMatricule;
      const newMatricule = `STG${latestMatricule + 1}`;
      setFormData({ ...formData, Mat_employe: newMatricule });
    } catch (err) {
      console.error('Une erreur est survenue lors de la génération du matricule de stage:', err);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      const requiredFields = ["Nom_employe", "Prenom_employe", "Telephone", "Date_naissance", "Nationnalite", "Sexe"];
      const missingFields = requiredFields.filter(field => !formData[field]);

      if (missingFields.length > 0) {
        alert("Veuillez remplir tous les champs obligatoires.");
      } else if (formData.Type_contrat_Id_type_contrat !== "STG-ECOLE" && !formData.Mat_employe) {
        alert("Veuillez saisir un matricule.");
      } else {
        setStep(step + 1);
      }
    } else if (step === 2) {
      const requiredFields = ["N_contrat", "Date_debut_c", "Date_debut", "Type_contrat_Id_type_contrat", "Id_agence"];
      const missingFields = requiredFields.filter(field => !formData[field]);

      if (missingFields.length > 0) {
        alert("Veuillez remplir tous les champs obligatoires(*) .");
      } else {
        setStep(step + 1);
      }
    } else if (step === 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    // Mettre à jour l'état avec la nouvelle valeur
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  
    // Gérer spécifiquement la logique pour CDI
    if (name === "Type_contrat_Id_type_contrat" && value === "CDI") {
      // Si CDI est sélectionné, mettre à jour Date_fin_c avec une valeur par défaut
      setFormData((prevFormData) => ({
        ...prevFormData,
        Date_fin_c: "3090-12-31", // Valeur par défaut pour CDI
      }));
    }
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/app/register', formData);
      alert('Données sauvegardées:', response.data);
      history.push('/app');
    } catch (err) {
      if (err.response && err.response.status === 409) {
        const entry = formData.Mat_employe || formData.N_contrat;
        alert(`Erreur: La valeur "${entry}" que vous essayez d'ajouter existe déjà.`);
      } else {
        console.error('Une erreur est survenue lors de la soumission du formulaire:', err);
      }
    }
  };

  return (
    <>
      <div className='modifbackin'>
        {step === 1 && (
          <form onSubmit={handleSubmit} className='formulaireregister'>
            <h1>INFORMATION PERSONNEL</h1>
            <div className="form-group">
              <label htmlFor="nom">*Nom :</label>
              <input className='REGISTRE'
                type="text"
                id="nom"
                name="Nom_employe"
                onChange={handleChange}
                value={formData.Nom_employe}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="prenom">*Prénom :</label>
              <input className='REGISTRE'
                type="text"
                id="prenom"
                name="Prenom_employe"
                onChange={handleChange}
                value={formData.Prenom_employe}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email :</label>
              <input className='REGISTRE'
                type="email"
                id="email"
                name="Email"
                onChange={handleChange}
                value={formData.Email}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="telephone">*Téléphone :</label>
              <input className='REGISTRE'
                type="tel"
                id="telephone"
                name="Telephone"
                onChange={handleChange}
                value={formData.Telephone}
                maxLength={10}
                pattern="[0-9]{10}"
                title="Le numéro de téléphone doit contenir uniquement des chiffres et être composé de 10 chiffres."
                onKeyDown={handleKeyPress}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="date_naissance">*Date de naissance :</label>
              <input className='REGISTRE'
                type="date"
                id="date_naissance"
                name="Date_naissance"
                onChange={handleChange}
                value={formData.Date_naissance}
              />
            </div>
            {formData.Type_contrat_Id_type_contrat !== "STG-ECOLE" && (
              <div className="form-group">
                <label htmlFor="matricule">*Matricule :</label>
                <input className='REGISTRE'
                  type="text"
                  name="Mat_employe"
                  onChange={handleChange}
                  maxLength={5}
                  value={formData.Mat_employe}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="nationalite">*Nationalité :</label>
              <select
                id="Nationnalite"
                name="Nationnalite"
                onChange={handleChange}
                value={formData.Nationnalite}
              >
               <option value="" disabled selected>--------</option>
                <option value="IVOIRIEN">Ivoirien(ne)</option>
                <option value="MALIEN">Malien(ne)</option>
                <option value="BENINOIS">BENINOIS(E)</option>
                <option value="TOGOLAIS">TOGOLAIS(E)</option>
                <option value="FRANCAIS">FRANCAIS(E)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="sexe">*Sexe :</label>
              <select
                id="sexe"
                name="Sexe"
                onChange={handleChange}
                value={formData.Sexe}
              >
                <option value="" disabled selected>--------</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
            <button type="button" className="submit-button" onClick={nextStep}>
              Suivant
            </button>
          </form>
        )}
        {step === 2 && (
          <div>
            <form onSubmit={handleSubmit} className='formulaireregister'>
              <h1>INFORMATION DE L'EMPLOI</h1>
              <div className="form-group">
                <label htmlFor="ncontrat">*Numéro du contrat :</label>
                <input className='REGISTRE'
                  type="text"
                  id="ncontrat"
                  name="N_contrat"
                  onChange={handleChange}
                  value={formData.N_contrat}
                />
              </div>
              <div className="form-group">
                <label htmlFor="datedebutc">*Date de début du contrat :</label>
                <input className='REGISTRE'
                  type="date"
                  id="datedebutc"
                  name="Date_debut_c"
                  onChange={handleChange}
                  value={formData.Date_debut_c}
                />
              </div>
              {formData.Type_contrat_Id_type_contrat !== "CDI" && (
  <div className="form-group">
    <label htmlFor="datefinc">Date de fin du contrat :</label>
    <input
      className='REGISTRE'
      type="date"
      id="datefinc"
      name="Date_fin_c"
      onChange={handleChange}
      value={formData.Date_fin_c}
    />
  </div>
)}

              <div className="form-group">
                <label htmlFor="datedebut">*Date de début :</label>
                <input className='REGISTRE'
                  type="date"
                  id="datedebut"
                  name="Date_debut"
                  onChange={handleChange}
                  value={formData.Date_debut}
                />
              </div>
              <div className="form-group">
  <label htmlFor="type_contrat">* Type de contrat :</label>
  <select
    id="type_contrat"
    name="Type_contrat_Id_type_contrat"
    onChange={handleChange}
    value={formData.Type_contrat_Id_type_contrat}
  >
 <option value="" disabled selected>--------</option>
    <option value="STG-ECOLE">Stage école</option>
    <option value="CDD">CDD</option>
    <option value="CDI">CDI</option>
  </select>
</div>

              <div className="form-group">
                <label htmlFor="direction">*Direction :</label>
                <select
                  id="direction"
                  name="Direction_code"
                  onChange={handleChange}
                  value={formData.Direction_code}
                >
                  <option value="" disabled selected>--------</option>
                  <option value="DG">DIRECTION GENERALE</option>
                  <option value="DSI">DIRECTION SYSTEME D'INFORMATION</option>
                  <option value="DARH">DIRECTION D'ADMINISTRATION ET RESSOURCE HUMAINE</option>
                  <option value="DDC">DIRECTION DU DEVELOPPEMENT COMMERCIAL</option>
                  <option value="DJ">DEPARTEMENT JURIDIQUE</option>
                  <option value="DCIQ">DEPARTEMENT CONTROLE INTERNE ET QUALITE</option>
                  <option value="DFC">DIRECTION FINANCE COMPTABILITE</option>
                  <option value="DEX">DIRECTION EXPERIENCE CLIENT</option>
                  <option value="DOP">DIRECTION DES OPERATIONS</option>
                  <option value="DM">DEPARTEMENT MARKETING</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="agence">*Agence :</label>
                <select
                  id="agence"
                  name="Id_agence"
                  onChange={handleChange}
                  value={formData.Id_agence}
                >
                  <option value="" disabled selected>--------</option>
                  <option value="BOUAKE">AGENCE BOUAKE</option> 
                  <option value="DALOA">AGENCE DALOA</option>
                  <option value="KORHOGO">AGENCE KORHOGO</option>
                  <option value="PLATEAU">AGENCE PLATEAU</option>
                  <option value="SAN-PEDRO">AGENCE SAN-PEDRO</option>
                  <option value="VALLON">AGENCE VALLON</option>
                  <option value="YAMOUSSOKRO">AGENCE YAMOUSSOKRO</option>
                </select>
              </div>
              <button type="button" className="submit-button" onClick={prevStep}>
                Précédent
              </button>
              <button type="button" className="submit-button" onClick={nextStep}>
                Suivant
              </button>
            </form>
          </div>
        )}
        {step === 3 && (
          <div className='recap'>
            <h1>Résumé des informations</h1>
            <div className='recap-item'>
              <h2>INFORMATION PERSONNEL</h2>
              <p><strong>Nom:</strong> {formData.Nom_employe}</p>
              <p><strong>Prénom:</strong> {formData.Prenom_employe}</p>
              <p><strong>Email:</strong> {formData.Email}</p>
              <p><strong>Téléphone:</strong> {formData.Telephone}</p>
              <p><strong>Date de naissance:</strong> {formData.Date_naissance}</p>
              <p><strong>Nationalité:</strong> {formData.Nationnalite}</p>
              <p><strong>Sexe:</strong> {formData.Sexe}</p>
              <h2>INFORMATION PROFESSIONEL</h2>
              <p><strong>Matricule:</strong> {formData.Mat_employe}</p>
              <p><strong>Numéro du contrat:</strong> {formData.N_contrat}</p>
              <p><strong>Date de début du contrat:</strong> {formData.Date_debut_c}</p>
              <p><strong>Date de fin du contrat:</strong> {formData.Date_fin_c}</p>
              <p><strong>Date de début:</strong> {formData.Date_debut}</p>
              <p><strong>Type de contrat:</strong> {formData.Type_contrat_Id_type_contrat}</p>
              <p><strong>Direction:</strong> {formData.Direction_code}</p>
              <p><strong>Agence:</strong> {formData.Id_agence}</p>
            </div>
            <button type="button" className="submit-button" onClick={prevStep}>
              Précédent
            </button>
            <button type="submit" className="submit-button" onClick={handleSubmit}>
              Soumettre
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Registerperso;
