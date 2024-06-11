import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './login.css';
import logo from './../../assets/images/logo (1).png';

const Login = () => {
  const [id_user, setIdUser] = useState('');
  const [mot_de_passe, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { id_user, mot_de_passe });
      if (response.status === 200) {
        // Rediriger vers app.jsx en cas de succès
        history.push('/app');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Identifiants invalides');
      } else {
        setError('Erreur de connexion au serveur');
      }
    }
  };

  return (
    
    <div className='loginBackground'>
      <form onSubmit={handleSubmit} className='formulaireconnect'>
        <div className='logo1'>
        <br/><br/>
      <img src={logo} width={100} height={100} />
        </div>
        <div>
          <label htmlFor="id_user">ID Utilisateur:</label>
          <input
            type="text"
            id="id_user"
            value={id_user}
            onChange={(e) => setIdUser(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="mot_de_passe">Mot de Passe:</label>
          <input
            type="password"
            id="mot_de_passe"
            value={mot_de_passe}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" className='bouton
        '>Se Connecter</button>
      </form>
    </div>
  
  );
};

export default Login;
