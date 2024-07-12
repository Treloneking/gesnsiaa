// Importez dotenv et chargez les variables d'environnement
require('dotenv').config({ path: '../../.env' });

// Récupérez la clé secrète JWT depuis les variables d'environnement
const jwtSecret = process.env.JWT_SECRET;

// Vérifiez si la clé secrète JWT est définie
if (!jwtSecret) {
  console.error('La clé secrète JWT n\'est pas définie dans les variables d\'environnement.');
  process.exit(1); // Arrête le processus Node en cas d'erreur critique
}

const multer = require('multer');

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
const jwt = require('jsonwebtoken');
const { authenticate } = require('ldap-authentication');
const cors = require('cors');
var ActiveDirectory = require('activedirectory');

// Configuration de la connexion à la base de données
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gesnsiaa'
});


// Middleware pour parser le corps des requêtes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Route de connexion
// Endpoint pour la connexion
app.post('/login', async (req, res) => {
  const { Id_user, Mot_de_passe } = req.body;

  const domain = '@nsiaassurances.com';
  const username = Id_user.includes(domain) ? Id_user : `${Id_user}${domain}`;

  if (Id_user === 'Gesnsiaa' && Mot_de_passe === 'Administrateurkey@gesnsiaa2024') {
    const token = jwt.sign({ Id_user, Prenom: 'Administrateur', Nom: 'Gesnsiaa' }, process.env.JWT_SECRET, { expiresIn: '2h' });
    return res.status(200).json({ message: 'Connexion réussie en tant qu\'administrateur', token, Id_user: 'Gesnsiaa', Prenom: 'Admin', Nom: 'Bibliothequensia', role_id_role: 'admin' });
  }

  try {
    const config = {
      url: 'ldap://10.10.4.4',
      baseDN: 'dc=nsia,dc=com'
    };

    const ad = new ActiveDirectory(config);
    const password = Mot_de_passe;

    const regex = /^([a-zA-Z]+)\.([a-zA-Z]+)@/;
    const matches = username.match(regex);

    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: 'Adresse e-mail non valide' });
    }

    const prenom = matches[1];
    const nom = matches[2];

    ad.authenticate(username, password, function(err, auth) {
      if (err) {
        console.log('ERROR: ' + JSON.stringify(err));
        return res.status(500).json({ message: 'Erreur d\'authentification LDAP' });
      }
      if (auth) {
        db.query('SELECT * FROM utilisateur WHERE Email = ?', [username], async function(error, results, fields) {
          if (error) {
            console.error('Erreur lors de la vérification de l\'utilisateur dans la base de données :', error);
            return res.status(500).json({ message: 'Erreur interne du serveur' });
          }

          if (results.length === 0) {
            try {
              db.query('INSERT INTO utilisateur (Nom, Prenom, Email) VALUES (?, ?, ?)', [nom, prenom, username], function(err, results, fields) {
                if (err) {
                  console.error('Erreur lors de la création de l\'utilisateur dans la base de données :', err);
                  return res.status(500).json({ message: 'Erreur interne du serveur' });
                }
                console.log('Utilisateur créé dans la base de données');

                const newUserId = results.insertId;
                const token = jwt.sign({ Id_user: newUserId, username, Prenom: prenom, Nom: nom, Role: null }, process.env.JWT_SECRET, { expiresIn: '2h' });
                return res.status(200).json({ message: 'Connexion réussie', token, Id_user: newUserId, username, Prenom: prenom, Nom: nom, role_id_role: null, direction:Direction });
              });
            } catch (error) {
              console.error('Erreur lors de la création de l\'utilisateur dans la base de données :', error);
              return res.status(500).json({ message: 'Erreur interne du serveur' });
            }
          } else {
            const existingUser = results[0];
            const existingUserId = existingUser.id_user;
            const role_id_role = existingUser.role_id_role;
            const Direction = existingUser.direction;

            const token = jwt.sign({ Id_user: existingUserId, username, Prenom: prenom, Nom: nom, Role: role_id_role, direction:Direction }, process.env.JWT_SECRET, { expiresIn: '2h' });
            return res.status(200).json({ message: 'Connexion réussie', token, Id_user: existingUserId, username, Prenom: prenom, Nom: nom, role_id_role, direction:Direction });
          }
        });
      } else {
        console.log('Authentication failed!');
        return res.status(401).json({ message: 'Authentification échouée' });
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'authentification LDAP :', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});


// Middleware pour vérifier les tokens JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


app.get('/app/plusinfo', (req, res) => {
  const { matricule } = req.query;
  const sql = `
    SELECT 
      e.Mat_employe, e.Nom_employe, e.Prenom_employe, e.Email, e.Telephone, 
      e.Date_naissance, e.Nationnalite, e.Sexe, e. 
      d.Chef_direction, d.Nom_direction,
      t.Date_debut,t.Date_fin,
      a.Nom_agence,a.Lieu_agence,
      c.N_contrat,c.Date_debut_c,c.Date_fin_c,
      c.Type_contrat_Id_type_contrat
    FROM Employe e
    LEFT JOIN Travail t ON e.Mat_employe = t.Employe_Mat_employe
    LEFT JOIN Agence a ON t.Agence_Id_agence = a.Id_agence
    LEFT JOIN direction d ON e.Direction_code = d.Code_direction
    LEFT JOIN Contrat c ON e.Mat_employe = c.Employe_Mat_employe
    LEFT JOIN  Type_contrat tc ON tc.Id_type_contrat = c.Type_contrat_Id_type_contrat
    WHERE e.Mat_employe LIKE ?;
  `;
  const query = `%${matricule}%`; // Pour permettre la recherche partielle

  db.query(sql, [query], (err, results) => {
    if (err) {
      console.error('Erreur lors de la recherche:', err);
      res.status(500).json({ error: 'Erreur de serveur' });
    } else {
      res.status(200).json(results);
    }
  });
});


app.get('/app/recherche', (req, res) => {
  const { matricule, nom, direction, agence,contrat } = req.query;
  let sql = `
  SELECT e.* ,t.*,c.*
  FROM Employe e
  LEFT JOIN Contrat c ON c.Employe_Mat_employe = e.Mat_employe
  LEFT JOIN Travail t ON t.Employe_Mat_employe = e.Mat_employe
  ORDER BY Nom_employe
`;
  let params = [];

  if (matricule || nom || direction || agence || contrat) {
    sql += 'WHERE ';
    if (matricule) {
      sql += 'e.Mat_employe LIKE ?';
      params.push(`%${matricule}%`);
    }
    if (nom) {
      if (matricule) {
        sql += ' AND ';
      }
      sql += 'e.Nom_employe LIKE ?';
      params.push(`%${nom}%`);
    }
    if (direction) {
      if (matricule || nom) {
        sql += ' AND ';
      }
      sql += 'e.Direction_code LIKE ?';
      params.push(`%${direction}%`);
    }
    if (agence) {
      if (matricule || nom || direction) {
        sql += ' AND ';
      }
      sql += 't.Agence_Id_agence LIKE ?';
      params.push(`%${agence}%`);
    }
    if (contrat) {
      if (matricule||nom||direction||agence){
        sql += ' AND ';
      }
      sql += 'c.Type_contrat_Id_type_contrat LIKE ?';
      params.push(`%${contrat}%`);
    }

    
  }

  db.query(sql, params, (err, results) => {

    if (err) {
      return res.status(500).json({ error: 'Erreur de la base de données' });
    }
    res.json(results);
  });
});

app.put('/app/modification', (req, res) => {
  const { Date_debut_c, Date_fin_c, Type_contrat_Id_type_contrat, Mat_employe,N_contrat } = req.body;
  const sql = `
    UPDATE employe
    JOIN contrat ON contrat.Employe_Mat_employe = employe.Mat_employe
    SET Date_debut_c = ?, Date_fin_c = ?, Type_contrat_Id_type_contrat = ?
    WHERE Mat_employe = ?
  `;
  const values = [Mat_employe,N_contrat,Date_debut_c, Date_fin_c, Type_contrat_Id_type_contrat, ];
  const valuess = [Date_debut_c, Date_fin_c, Type_contrat_Id_type_contrat, Mat_employe];
  const archiveQuery = `
  INSERT INTO archive (
   Employe_Mat_employe,
   Contrat_N_contrat,
   Date_debut_c,
   Date_fin_c,
   Type_contrat_Id_type_contrat
  ) VALUES (?,?,?,?,?)
`;
db.query(archiveQuery, [
  Mat_employe,
  N_contrat,
  Date_debut_c,
  Date_fin_c,
  Type_contrat_Id_type_contrat
  
], (err, results) => {
  if (err) {
    return db.rollback(() => {
      res.status(500).json({ error: err.message });
    });
  }

});


    db.query(sql, valuess, (err, results) => {
      if (err) {
        console.error('Erreur lors de la mise à jour des données :', err);
        res.status(500).json({ error: 'Erreur de serveur' });
      } else {
        res.status(200).json({ message: 'Données mises à jour avec succès' });
      }
    });

  });
/*});*/
app.get('/app/archiveplus', (req, res) => {
  const matricule = req.query.matricule; // Récupérer le matricule de la requête
  const query = `
    SELECT a.*,e.*,c.N_contrat,c.Date_debut_c,c.Date_fin_c
FROM archive a
LEFT JOIN employe e ON e.Mat_employe = a.Employe_Mat_employe
LEFT JOIN contrat c ON c.N_contrat = a.Contrat_N_contrat
WHERE Mat_employe=?
  `;
  console.log(matricule)
  db.query(query, [matricule], (error, results, fields) => {
    if (error) {
      console.error('Error fetching contracts:', error);
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des archives.' });
    } else {
      res.json(results);
    }
  });
});

// Backend code
app.put('/app/role', (req, res) => {
  const { Email, role_id_role, direction, employe } = req.body;

  // Check if the employe_Mat_employe is already set for the user
  db.query('SELECT employe_Mat_employe FROM utilisateur WHERE Email = ?', [Email], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération de l\'utilisateur.' });
    }

    const existingEmploye = results[0].employe_Mat_employe;

    // If employe_Mat_employe is already set, don't update it
    if (existingEmploye) {
      db.query(
        'UPDATE utilisateur SET role_id_role = ?, direction = ? WHERE Email = ?',
        [role_id_role, direction, Email],
        (err, result) => {
          if (err) {
            console.error('Error updating user role:', err);
            return res.status(500).json({ error: 'Une erreur s\'est produite lors de la mise à jour du rôle de l\'utilisateur.' });
          }
          res.status(200).json({ message: 'Le rôle de l\'utilisateur a été mis à jour avec succès.' });
        }
      );
    } else {
      // If employe_Mat_employe is not set, update all fields
      db.query(
        'UPDATE utilisateur SET role_id_role = ?, direction = ?, employe_Mat_employe = ? WHERE Email = ?',
        [role_id_role, direction, employe, Email],
        (err, result) => {
          if (err) {
            console.error('Error updating user role:', err);
            return res.status(500).json({ error: 'Une erreur s\'est produite lors de la mise à jour du rôle de l\'utilisateur.' });
          }
          res.status(200).json({ message: 'Le rôle de l\'utilisateur a été mis à jour avec succès.' });
        }
      );
    }
  });
});


app.get('/app/archive', (req, res) => {
  const query = `
  SELECT e.*,c.*,t.*
FROM employe e
LEFT JOIN travail t ON t.Employe_Mat_employe = e.Mat_employe
LEFT JOIN contrat c ON c.Employe_Mat_employe = e.Mat_employe
ORDER BY Nom_employe
  `;
  
  db.query(query, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contracts:', error);
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des archives.' });
    } else {
      res.json(results);
    }
  });
});

app.get('/app/contrat', (req, res) => {
  const query = `
    SELECT c.*,e.*,
    DATEDIFF(date_fin_c, NOW()) AS tempsrestant
    FROM contrat c
    LEFT JOIN Employe e ON c.Employe_Mat_employe = e.Mat_employe
    WHERE DATEDIFF(date_fin_c, NOW()) < 10
    ORDER BY Nom_employe
  `;
  
  db.query(query, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contracts:', error);
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des contrats.' });
    } else {
      res.json(results);
    }
  });
});


// Route pour l'inscription
app.post('/app/register', (req, res) => {
  const {
    Mat_employe,
    Nom_employe,
    Prenom_employe,
    Email,
    Telephone,
    Date_naissance,
    Nationnalite,
    Sexe,
    N_contrat,
    Date_debut_c,
    Date_fin_c,
    Date_debut,
    Date_fin,
    Type_contrat_Id_type_contrat,
    Direction_code,
    Id_agence
  } = req.body;

  // Début de la transaction pour insérer dans les deux tables
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Insertion dans la table Employe
    const employeQuery = `
      INSERT INTO Employe (
        Mat_employe, 
        Nom_employe, 
        Prenom_employe, 
        Email, 
        Telephone, 
        Date_naissance, 
        Nationnalite, 
        Sexe,
        Direction_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(employeQuery, [
      Mat_employe,
      Nom_employe,
      Prenom_employe,
      Email,
      Telephone,
      Date_naissance,
      Nationnalite,
      Sexe,
      Direction_code
    ], (err, results) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: err.message });
        });
      }

      // Insertion dans la table Contrat
      const contratQuery = `
        INSERT INTO Contrat (
          N_contrat,
          Date_debut_c,
          Date_fin_c,
          Type_contrat_Id_type_contrat,
          Employe_Mat_employe
        ) VALUES (?, ?, ?, ?, ?)
      `;
      db.query(contratQuery, [
        N_contrat,
        Date_debut_c,
        Date_fin_c,
        Type_contrat_Id_type_contrat,
        Mat_employe
      ], (err, results) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: err.message });
          });
        }

        // Insertion dans la table Travail
        const travailQuery = `
          INSERT INTO Travail (
            Employe_Mat_employe,
            Agence_Id_agence,
            Date_debut,
            Date_fin
          ) VALUES (?, ?, ?, ?)
        `;
        db.query(travailQuery, [
          Mat_employe,
          Id_agence,
          Date_debut,
          Date_fin
        ], (err, results) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: err.message });
            });
          }

          // Insertion dans la table archive
          const archiveQuery = `
            INSERT INTO archive (
              Employe_Mat_employe,
              Contrat_N_contrat,
              Date_debut_c,
              Date_fin_c,
              Type_contrat_Id_type_contrat
            ) VALUES (?, ?, ?, ?, ?)
          `;
          db.query(archiveQuery, [
            Mat_employe,
            N_contrat,
            Date_debut_c,
            Date_fin_c,
            Type_contrat_Id_type_contrat
          ], (err, results) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ error: err.message });
              });
            }

            // Insertion dans la table newemploye
            const NewEmployeQuery = `
              INSERT INTO newemploye (
                Employe_Mat_employe,
                Contrat_N_contrat,
                Type_contrat_Id_type_contrat,
                direction
              ) VALUES (?, ?, ?, ?)
            `;
            db.query(NewEmployeQuery, [
              Mat_employe,
              N_contrat,
              Type_contrat_Id_type_contrat,
              Direction_code
            ], (err, results) => {
              if (err) {
                console.error(err);
                return db.rollback(() => {
                  res.status(500).json({ error: err.message });
                });
              }

              // Valider la transaction
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({ error: err.message });
                  });
                }
                res.status(200).json({ msg: 'Utilisateur et contrat ajoutés avec succès' });
              });
            });
          });
        });
      });
    });
  });
});




app.post('/app/import', (req, res) => {
  const data = req.body;

  // Mapping des champs du fichier Excel vers les champs de la base de données
  data.forEach((row) => {
    const mappedRow = {
      Mat_employe: row.Matricule,
      Nom_employe: row.Nom,
      Prenom_employe: row.Prénom,
       Date_naissance:row.Date,
       Sexe:row.Sexe,
      Direction_code:row.Direction,
     Telephone:row.Telephone, 
         Email:row.Email,
      Nationnalite:row.Nationnalite,
   
      


      // Ajoutez tous les champs nécessaires ici
    };

    const sql = 'INSERT INTO Employe SET ?';
    db.query(sql, mappedRow, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erreur lors de l\'importation des données');
      }
    });
  });
  

  res.send('Données importées avec succès');
});

app.post('/api/import', (req, res) => {
  const data = req.body;

  data.forEach((row) => {
    const mappedRow = {
      Matricule: row.Matricule,
      Nom: row.Nom,
      Prenom: row.Prénom,
      Date: row.Date,
      Sexe: row.Sexe,
      Direction: row.Direction,
      Contrat: row.Contrat,
      Telephone: row.Téléphone,
      Email: row.Email,
      Nationalite: row.Nationalité,
      Agence: row.Agence,
      Statut: row.Statut,
    };

    const sql = 'INSERT INTO employes SET ?';
    db.query(sql, mappedRow, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erreur lors de l\'importation des données');
      }
    });
  });

  res.status(200).json({ msg: 'importé avec succès' });
});

app.post('/app/conges', (req, res) => {
  const { id_utilisateur, date_debut_con, date_fin_con, motif } = req.body;

  if (!id_utilisateur || !date_debut_con || !date_fin_con || !motif) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = 'INSERT INTO Congés (id_utilisateur, date_debut_con, date_fin_con, motif) VALUES (?, ?, ?, ?)';
  db.query(query, [id_utilisateur, date_debut_con, date_fin_con, motif], (err, result) => {
    if (err) {
      console.error('Error submitting leave request:', err);
      return res.status(500).json({ message: 'Error submitting leave request' });
    }
    res.status(200).json({ message: 'Leave request submitted successfully', result });
  });
});


app.get('/app/newemploye', (req, res) => {
  const query = `
    SELECT id_new_employe, Employe_Mat_employe, Contrat_N_contrat, Type_contrat_Id_type_contrat, direction
    FROM newemploye
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching new employees: ' + err);
      return res.status(500).json({ error: 'Failed to fetch new employees' });
    }
    res.json(results);
  });
});

app.get('/app/comptes', (req, res) => {
  const query = `
    SELECT *
    FROM compte
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching new employees: ' + err);
      return res.status(500).json({ error: 'Failed to fetch new employees' });
    }
    res.json(results);
  });
});


// Endpoint pour autoriser les comptes sélectionnés pour un employé spécifique
app.post('/app/authorizeComptes', async (req, res) => {
  const { matricule, comptes } = req.body;

  if (!matricule || !comptes || !Array.isArray(comptes)) {
    return res.status(400).json({ message: 'Entrée invalide' });
  }

  try {
    const queries = comptes.map((compteId) => {
      return db.query('INSERT INTO employe_compte (Employe_Mat_employe, Compte_Id_compte) VALUES (?, ?)', [matricule, compteId]);
    });

    await Promise.all(queries);

    res.status(200).json({ message: 'Comptes autorisés avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'autorisation des comptes :', error);
    res.status(500).json({ message: 'Erreur lors de l\'autorisation des comptes' });
  }
});



app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
