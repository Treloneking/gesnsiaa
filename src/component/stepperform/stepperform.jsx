import React, { useState } from 'react';
import axios from 'axios';

const StepperForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/utilisateurs', formData);
      console.log('Données du formulaire soumises avec succès:', response.data);
    } catch (err) {
      console.error('Erreur lors de la soumission du formulaire:', err);
    }
  };

  return (
    <div>
      {step === 1 && (
        <div>
          <h2>Étape 1</h2>
          <form>
            <div>
              <label>Nom:</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Prénom:</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </div>
            <button type="button" onClick={nextStep}>
              Suivant
            </button>
          </form>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2>Étape 2</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Mot de Passe:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="button" onClick={prevStep}>
              Précédent
            </button>
            <button type="submit">
              Soumettre
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default StepperForm;