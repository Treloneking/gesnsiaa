import React, { useState } from 'react';
import axios from 'axios';

const DemandeConges = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const userId = localStorage.getItem('Id_user'); // Assuming the user ID is stored with the key 'Id_user'

  const handleSubmit = async (event) => {
    event.preventDefault();

    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    // Validate dates
    if (new Date(startDate) < new Date(currentDate) || new Date(endDate) < new Date(currentDate)) {
      setError('Les dates ne peuvent pas être dans le passé.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('La date de début ne peut pas être ultérieure à la date de fin.');
      return;
    }

    if (!userId) {
      alert('User ID not found in local storage');
      return;
    }

    const leaveRequestData = {
      id_utilisateur: userId,
      date_debut_con: startDate,
      date_fin_con: endDate,
      motif: reason,
    };

    try {
      const response = await axios.post('http://localhost:5000/app/conges', leaveRequestData);
      if (response.status === 200) {
        // Calculate the number of days of leave taken
        const start = new Date(startDate);
        const end = new Date(endDate);
        const numberOfDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

        alert(` Nombre de jours de congé demandé: ${numberOfDays} jours.`);
        
        // Clear the form and error
        setStartDate('');
        setEndDate('');
        setReason('');
        setError('');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('erreur');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className='formulaireconnect'>
        <h2>Demande de Congé</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <label>
          Date de début:
          <input
            className='form-group'
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]} // Prevent past dates
            required
          />
        </label>
        <label>
          Date de fin:
          <input
            className='form-group'
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split('T')[0]} // Prevent past dates and ensure end date is after start date
            required
          />
        </label>
        <label>
          Motif:
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </label>
        <button type="submit">Soumettre</button>
      </form>
    </div>
  );
};

export default DemandeConges;
