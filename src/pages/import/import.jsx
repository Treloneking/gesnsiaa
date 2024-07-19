import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const ImportExcel = () => {
  const [data, setData] = useState([]);
  const [message, setMessage] = useState('');
  const history = useHistory();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet, { raw: false });

      const mappedData = parsedData.map(row => ({
        Matricule: row.Matricule,
        Nom: row.Nom,
        Prénom: row.Prénom,
        Email: row.Email,
        Telephone: row.Telephone,
        Date: row.Date ? new Date(row.Date).toISOString() : null, // Format ISO 8601
        Nationnalite: row.Nationnalite,
        Sexe: row.Sexe,
        Direction: row.Direction,
        N_contrat: row.N_contrat,
        Date_debut_c: row.Date_debut_c ? new Date(row.Date_debut_c).toISOString() : null, // Format ISO 8601
        Date_fin_c: row.Date_fin_c ? new Date(row.Date_fin_c).toISOString() : null, // Format ISO 8601
        Type_contrat_Id_type_contrat: row.Type_contrat_Id_type_contrat,
        Agence_Id_agence: row.Agence_Id_agence,
        Date_debut: row.Date_debut ? new Date(row.Date_debut).toISOString() : null, // Format ISO 8601
        Date_fin: row.Date_fin ? new Date(row.Date_fin).toISOString() : null // Format ISO 8601
      }));

      setData(mappedData);
    };

    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    try {
      // Fetch the latest STG matricule
      const response = await axios.get('http://localhost:5000/app/get-latest-stage-matricule');
      const latestMatricule = response.data.latestMatricule;
      
      // Map data and assign new matricules if the contract type is STG-ECOLE
      const updatedData = data.map((row, index) => {
        if (row.Type_contrat_Id_type_contrat === 'STG-ECOLE') {
          const newMatricule = `STG${(latestMatricule + index + 1).toString().padStart(2, '0')}`;
          row.Matricule = newMatricule;
        } else if (row.Type_contrat_Id_type_contrat === 'CDI') {
          row.Date_fin_c = '3090-12-31';
        }
        return row;
      });

      const importResponse = await axios.post('http://localhost:5000/app/import', updatedData);
      if (importResponse.status === 200) {
        setMessage('Données importées avec succès');
        alert('Importation réussie');
        history.push('/app/recherche');
      } else {
        setMessage('Erreur lors de l\'importation des données');
      }
    } catch (error) {
      console.error(error);
      setMessage('Erreur lors de l\'importation des données');
    }
  };

  return (
  <div className='fondleg'>
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Importer des données Excel</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <button onClick={handleImport}>Importer</button>
      {message && <p>{message}</p>}
      {data.length > 0 && (
        <div>
          <h3>Prévisualisation des données</h3>
          <table border="1">
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div></div>
  );
};

export default ImportExcel;
