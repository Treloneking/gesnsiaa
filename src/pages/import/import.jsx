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
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      setData(parsedData);
    };

    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/import', data); // Utilisez l'URL correcte
      if (response.status === 200) {
        setMessage('Données importées avec succès');
        alert('importation réussi')
        history.push('/app/recherche')
      } else {
        setMessage('Erreur lors de l\'importation des données');
      }
    } catch (error) {
      console.error(error);
      setMessage('Erreur lors de l\'importation des données');
    }
  };

  return (
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
    </div>
  );
};

export default ImportExcel;
