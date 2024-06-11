import React, { useState } from 'react';
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
    Compte_Id_compte: "",
  });
  const history = useHistory();
  const [contratType, setContratType] = useState("");
    const handleKeyPress = (e) => {
      const regex = /^[0-9\b]+$/; // Regex pour autoriser uniquement les chiffres
      if (!regex.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
        e.preventDefault(); // Empêche l'entrée si ce n'est pas un chiffre ou une touche de suppression
      }
    };
    const nextStep = () => {
      if (step === 1) {
        // Vérifiez si tous les champs obligatoires de la première étape sont remplis
        const requiredFields = ["Mat_employe", "Nom_employe", "Prenom_employe", "Telephone", "Date_naissance", "Nationnalite", "Sexe", "Compte_Id_compte"];
        const missingFields = requiredFields.filter(field => !formData[field]);
    
        // Si des champs obligatoires sont manquants, affichez une alerte
        if (missingFields.length > 0) {
          alert("Veuillez remplir tous les champs obligatoires.");
        } else {
          setStep(step + 1); // Passer à l'étape suivante
        }
      } else if (step === 2) {
        const requiredFields = ["N_contrat", "Date_debut_c", "Date_debut", "Type_contrat_Id_type_contrat", "Id_agence"];
        const missingFields = requiredFields.filter(field => !formData[field]);
    
        // Si des champs obligatoires sont manquants, affichez une alerte
        if (missingFields.length > 0) {
          alert("Veuillez remplir tous les champs obligatoires.");
        }else{
        setStep(step + 1); // Passer à l'étape suivante
      }
    }
};
  const prevStep = () => setStep(step - 1);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Mise à jour de l'état normal pour les autres champs
    setFormData({ ...formData, [name]: value });
    if (name === "Type_contrat_Id_type_contrat") {
      setContratType(value);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/app/register', formData);
      alert('Données sauvegarder:', response.data);
      history.push('/app');
    } catch (err) {
      if (err.response && err.response.status === 500) { // 409 est le code d'erreur pour le conflit de clé primaire
        const entry = formData.Mat_employe || formData.N_contrat; // Choisir un champ unique pour identifier l'entrée
        alert(`Erreur: La valeur "${entry}" que vous essayez d'ajouter existe déjà.`);
      } else {
        console.error('Une erreur est survenue lors de la soumission du formulaire:', err);
      }
    }
  };

  return (
    <>
    <div className='registerperso'>
      {step === 1 && (
      <form onSubmit={handleSubmit} className='formulaireregister'>
        <h1>INFORMATION PERSONNEL</h1>
        <div className="form-group">
          <label htmlFor="matricule">*Matricule :</label>
          <input className='REGISTRE'
            type="text" 
            name="Mat_employe"
            onChange={handleChange}
            value={formData.Mat_employe}
            required
          />
        </div>
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
          <input
className='REGISTRE'            type="text"
            id="prenom"
            name="Prenom_employe"
            onChange={handleChange}
            value={formData.Prenom_employe} 
            required
          />
        </div>
        <div className="form-group">
  <label htmlFor="email">Email :</label>
  <input
    className='REGISTRE'          
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
    maxLength={10} // Limite à 10 caractères
    pattern="[0-9]{10}" // Autorise uniquement les chiffres et exige 10 chiffres
    title="Le numéro de téléphone doit contenir uniquement des chiffres et être composé de 10 chiffres."
    onKeyDown={handleKeyPress} 
    required // Rend le champ obligatoire
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
        <div className="form-group">
          <label htmlFor="nationalite">*Nationalité :</label>
          <select
            id="Nationnalite"
            name="Nationnalite"
            onChange={handleChange}
            value={formData.Nationnalite}
          >
            <option>--------</option>
            <option value="IVOIRIEN">Ivoirien(ne)</option>
            <option value="MALIEN">Malien(ne)</option>
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
            <option>--------</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
        </div>
        <label htmlFor="compte_id">*Compte ID :</label>
          <input className='REGISTRE'
            type="text"
            id="compte_id"
            name="Compte_Id_compte"
            onChange={handleChange}
            value={formData.Compte_Id_compte}
            required
          />
        <button type="button" onClick={nextStep}>
              Suivant
            </button>
          </form>
        )}
        {step === 2 && (
          <div>
           <form onSubmit={handleSubmit} className='formulaireregister'>
   <h1>INFORMATION CONTRAT</h1> 
   <div class="form-group">
      <label for="contrat">*NUMERO CONTRAT :</label>
      <input className='REGISTRE'
      type="text" 
      id="N_contrat"
       name="N_contrat"
       onChange={handleChange}
       value={formData.N_contrat}
        required/>
    </div>
    <div class="form-group">
      <label for="datedebut">*DATE DEBUT CONTRAT :</label>
      <input className='REGISTRE'
      type="date" 
      id="Date_debut_c" 
      name="Date_debut_c"
      onChange={handleChange}
      value={formData.Date_debut_c}/>
    </div> 
    <div className="form-group">
        <label htmlFor="datefin">*DATE FIN CONTRAT:</label>
        {/* Affichez ce champ uniquement si le contrat est CDD ou STAGE-ECOLE */}
        {contratType === "CDD" || contratType === "STG-ECOLE" ? (
          <input className='REGISTRE'
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
      <label for="datedebut">*DATE DEBUT AGENCE :</label>
      <input className='REGISTRE'
      type="date" 
      id="Date_debut" 
      name="Date_debut"
      onChange={handleChange}
      value={formData.Date_debut}/>
    </div> 
    <div class="form-group">
      <label for="nationalite">*TYPE CONTRAT :</label>
      <select
       id="Type_contrat_Id_type_contrat"
        name="Type_contrat_Id_type_contrat"
        onChange={handleChange}
        value={formData.Type_contrat_Id_type_contrat}>
          <option>--------</option>
        <option value="CDD">CDD</option>
        <option value="CDI">CDI</option>
        <option value="STG-ECOLE">STAGE-ECOLE</option>
      </select>
    </div> 
    <div class="form-group">
    <label for="">*Agence :</label>
   <select
       id="Id_agence"
        name="Id_agence"
        onChange={handleChange}
        value={formData.Id_agence } required>
          <option> ------- </option>
        <option value="BOUAKE">BOUKE</option>
        <option value="ABIDJAN">ABIDJAN</option>
        <option value="YAMOUSSOKRO">YAMOUSSOKRO</option>
      </select>
    </div>
    <div class="form-group">
    <label for="">*Direction:</label>
    <select
       id="Direction_code"
        name="Direction_code"
        onChange={handleChange}
        value={formData.Direction_code } required>
          <option> ------- </option>
        <option value="DSI">Direction systeme d'information</option>
        <option value="DFC">Direction finance comptabilité</option>
        <option value="DRH">Direction ressource humaine</option>
      </select>
    </div> 
  <button type="button" onClick={prevStep}>
              Précédent
            </button>
    <div class="form-group">
      <input
className='REGISTRE'       type="submit" 
       value="Suivant"
       onClick={nextStep}/>
    </div>
  </form>
  </div>
        )}
          {step === 3 && (
        <div className='recap-item'>
          <h1>RÉCAPITULATIF</h1>
          <p><strong>Matricule:</strong> {formData.Mat_employe}</p>
          <p><strong>Nom:</strong> {formData.Nom_employe}</p>
          <p><strong>Prénom:</strong> {formData.Prenom_employe}</p>
          <p><strong>Email:</strong> {formData.Email}</p>
          <p><strong>Téléphone:</strong> {formData.Telephone}</p>
          <p><strong>Date de naissance:</strong> {formData.Date_naissance}</p>
          <p><strong>Nationalité:</strong> {formData.Nationnalite}</p>
          <p><strong>Sexe:</strong> {formData.Sexe}</p>
          <p><strong>Compte ID:</strong> {formData.Compte_Id_compte}</p>
          <p><strong>Numéro de contrat:</strong> {formData.N_contrat}</p>
          <p><strong>Date de début contrat:</strong> {formData.Date_debut_c}</p>
          <p><strong>Date de fin contrat:</strong> {formData.Date_fin_c}</p>
          <p><strong>Date de début agence:</strong> {formData.Date_debut}</p>
          <p><strong>Type de contrat:</strong> {formData.Type_contrat_Id_type_contrat}</p>
          <p><strong>Agence:</strong> {formData.Id_agence}</p>
          <p><strong>Direction:</strong> {formData.Direction_code}</p>
          <button type="button" onClick={prevStep}>
            Précédent
          </button>
          <button type="submit" onClick={handleSubmit}>
            Soumettre
          </button>
        </div>
      )}
    </div>
      </>
  );
}

export default Registerperso;
