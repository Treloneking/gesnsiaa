import React, { useState } from 'react';
import axios from 'axios';

const UpdateUserRole = () => {
  const [Email, setEmail] = useState('');
  const [role_id_role, setRole] = useState('');
  const [direction, setDirection] = useState('');
  const [employe, setEmploye] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'Email':
        setEmail(value);
        break;
      case 'role_id_role':
        setRole(value);
        break;
      case 'direction':
        setDirection(value);
        break;
      case 'employe':
        setEmploye(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('http://localhost:5000/app/role', { Email, role_id_role, direction, employe });
      alert('Requête exécutée avec succès');
      setEmail(''); // Reset state
      setRole('');
      setDirection('');
      setEmploye('');
    } catch (error) {
      console.error('There was an error updating the user role!', error);
    }
  };

  return (
    <div className='registerperso'>
      <form className="formulairerole" onSubmit={handleSubmit}>
        <h1>Role</h1>
        <div>
          <label>Email:</label>
          <input
            className="form-group"
            type="email"
            name="Email"
            value={Email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="role_id_role">Role :</label>
          <select
            className="form-group"
            type="text"
            name="role_id_role"
            value={role_id_role}
            onChange={handleChange}
          >
            <option value="" disabled>--------</option>
            <option value="Chef">Chef Direction</option>
            <option value="admin">Administrateur RH</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="direction">Direction :</label>
          <select
            id="direction"
            name="direction"
            onChange={handleChange}
            value={direction}
          >
            <option value="" disabled>--------</option>
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
        
        <div>
          <label>Matricule associé:</label>
          <input
            className="form-group"
            type="text"
            name="employe"
            value={employe}
            onChange={handleChange}
          />
        </div>
        
        <button className="bouton" type="submit">Valider</button>
      </form>
    </div>
  );
};

export default UpdateUserRole;

