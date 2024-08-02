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
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
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

  // Condition pour l'utilisateur administrateur général
  if (Id_user === 'Gesnsiaa' && Mot_de_passe === 'Administrateurkey@gesnsiaa2024') {
    const token = jwt.sign({ Id_user, Prenom: 'Administrateur', Nom: 'Gesnsiaa' }, process.env.JWT_SECRET, { expiresIn: '2h' });
    return res.status(200).json({ message: 'Connexion réussie en tant qu\'administrateur', token, Id_user: 'Gesnsiaa', Prenom: 'Admin', Nom: 'Bibliothequensia', role_id_role: 'admin' });
  }

  // Condition pour l'utilisateur DSIadmin
  if (Id_user === 'DSIadmin' && Mot_de_passe === 'Admin@keyDsi') {
    const token = jwt.sign({ Id_user, Prenom: 'Admin', Nom: 'DSI', role: 'AdminDsi' }, process.env.JWT_SECRET, { expiresIn: '2h' });
    return res.status(200).json({ message: 'Connexion réussie en tant qu\'admin DSI', token, Id_user: 'DSIadmin', Prenom: 'Admin', Nom: 'DSI', role_id_role: 'AdminDsi' });
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
                return res.status(200).json({ message: 'Connexion réussie', token, Id_user: newUserId, username, Prenom: prenom, Nom: nom, role_id_role: null, direction: null });
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

            const token = jwt.sign({ Id_user: existingUserId, username, Prenom: prenom, Nom: nom, Role: role_id_role, direction: Direction }, process.env.JWT_SECRET, { expiresIn: '2h' });
            return res.status(200).json({ message: 'Connexion réussie', token, Id_user: existingUserId, username, Prenom: prenom, Nom: nom, role_id_role, direction: Direction });
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
      e.Date_naissance, e.Nationnalite, e.Sexe, 
      d.Chef_direction, d.Nom_direction,
      t.Date_debut, t.Date_fin,
      a.Nom_agence, a.Lieu_agence,
      c.N_contrat, c.Date_debut_c, c.Date_fin_c, 
      tc.Id_type_contrat
    FROM Employe e
    LEFT JOIN Travail t ON e.Mat_employe = t.Employe_Mat_employe
    LEFT JOIN Agence a ON t.Agence_Id_agence = a.Id_agence
    LEFT JOIN Direction d ON e.Direction_code = d.Code_direction
    LEFT JOIN Contrat c ON e.Mat_employe = c.Employe_Mat_employe
    LEFT JOIN Type_contrat tc ON tc.Id_type_contrat = c.Type_contrat_Id_type_contrat
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
  const { matricule, nom, direction, agence, contrat } = req.query;
  let sql = `
    SELECT e.*, t.*, c.*,a.*
    FROM Employe e
    LEFT JOIN Contrat c ON c.Employe_Mat_employe = e.Mat_employe
    LEFT JOIN Travail t ON t.Employe_Mat_employe = e.Mat_employe
    LEFT JOIN Agence a ON a.Id_agence = t.Agence_Id_agence
  `;
  let params = [];
  let conditions = [];

  if (matricule) {
    conditions.push('e.Mat_employe LIKE ?');
    params.push(`%${matricule}%`);
  }
  if (nom) {
    conditions.push('e.Nom_employe LIKE ?');
    params.push(`%${nom}%`);
  }
  if (direction) {
    conditions.push('e.Direction_code LIKE ?');
    params.push(`%${direction}%`);
  }
  if (agence) {
    conditions.push('t.Agence_Id_agence LIKE ?');
    params.push(`%${agence}%`);
  }
  if (contrat) {
    conditions.push('c.Type_contrat_Id_type_contrat LIKE ?');
    params.push(`%${contrat}%`);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY e.Nom_employe';

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Erreur de la base de données:', err);
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

  // Check if the direction exists in the direction table
  db.query('SELECT * FROM direction WHERE Code_direction = ?', [direction], (err, directionResults) => {
    if (err) {
      console.error('Error fetching direction:', err);
      return res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération de la direction.' });
    }

    if (directionResults.length === 0) {
      return res.status(400).json({ error: 'La direction spécifiée n\'existe pas.' });
    }

    // Check if the employe_Mat_employe is already set for the user
    db.query('SELECT employe_Mat_employe FROM utilisateur WHERE Email = ?', [Email], (err, userResults) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération de l\'utilisateur.' });
      }

      const existingEmploye = userResults[0].employe_Mat_employe;

      if (existingEmploye) {
        // If employe_Mat_employe is already set, don't update it
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
        // If employe_Mat_employe is not set and employe is provided, update all fields
        const query = employe
          ? 'UPDATE utilisateur SET role_id_role = ?, direction = ?, employe_Mat_employe = ? WHERE Email = ?'
          : 'UPDATE utilisateur SET role_id_role = ?, direction = ? WHERE Email = ?';
        const params = employe
          ? [role_id_role, direction, employe, Email]
          : [role_id_role, direction, Email];

        db.query(query, params, (err, result) => {
          if (err) {
            console.error('Error updating user role:', err);
            return res.status(500).json({ error: 'Une erreur s\'est produite lors de la mise à jour du rôle de l\'utilisateur.' });
          }
          res.status(200).json({ message: 'Le rôle de l\'utilisateur a été mis à jour avec succès.' });
        });
      }
    });
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


const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // true pour le port 465, false pour le port 587
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Optionnel pour éviter les erreurs de certificat
  }
});

// Fonction pour envoyer un email
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: to,
    subject: subject,
    text: text
  };

  console.log(`Tentative d'envoi d'un email à ${to}`);
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Erreur lors de l\'envoi de l\'email:', error);
    } else {
      console.log('Email envoyé: ' + info.response);
    }
  });
};

// Fonction pour notifier le chef de la direction
const notifyChef = (direction) => {
  // Requête pour récupérer l'email du chef de direction en fonction de la direction
  const query = 'SELECT Email FROM utilisateur WHERE role_id_role = ? AND direction = ?';

  db.query(query, ['Chef', direction], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'email du chef de direction:', err);
      return;
    }

    if (results.length === 0) {
      console.log('Aucun chef de direction trouvé pour la direction:', direction);
      return;
    }

    const chefEmail = results[0].Email;
    const subject = 'Nouvel employé enregistré';
    const text = `Bonjour,\n\nUn nouvel employé a été ajouté dans la direction ${direction}\n
    Veuillez vous connecter à l'application pour le voir.
      .\n\nCordialement,\nLa RH`;

    // Envoi de l'email
    sendEmail(chefEmail, subject, text);
  });
};

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
              notifyChef(Direction_code);
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

// Route pour l'importation de données
app.post('/app/import', (req, res) => {
  const data = req.body;

  data.forEach((row) => {
    const {
      Matricule,
      Nom,
      Prénom,
      Date,
      Sexe,
      Direction,
      Telephone,
      Email,
      Nationnalite,
      N_contrat,
      Date_debut_c,
      Date_fin_c,
      Type_contrat_Id_type_contrat,
      Agence_Id_agence,
      Date_debut,
      Date_fin
    } = row;

    // Début de la transaction pour insérer dans les différentes tables
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
        Matricule,
        Nom,
        Prénom,
        Email,
        Telephone,
        Date,
        Nationnalite,
        Sexe,
        Direction
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
          Matricule
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
            Matricule,
            Agence_Id_agence,
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
              Matricule,
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
                Matricule,
                N_contrat,
                Type_contrat_Id_type_contrat,
                Direction
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
                  // Confirmation pour chaque ligne importée
                  console.log(`Employé ${Matricule} importé avec succès`);

                  // Notification au chef de direction
                  notifyChef(Direction);
                });
              });
            });
          });
        });
      });
    });
  });

  res.send('Données importées avec succès');
});



app.get('/app/get-latest-stage-matricule', async (req, res) => {
  try {
    const query = 'SELECT MAX(CAST(SUBSTRING(Mat_employe, 4) AS UNSIGNED)) as latestMatricule FROM employe WHERE Mat_employe LIKE "STG%%"';
    db.query(query, (err, result) => {
      if (err) {
        console.error('Error fetching latest STG matricule:', err);
        res.status(500).json({ error: 'An error occurred while fetching the latest STG matricule.' });
        return;
      }
      
      const latestMatricule = result[0]?.latestMatricule || 0;
      res.json({ latestMatricule });
    });
  } catch (err) {
    console.error('Error fetching latest STAG matricule:', err);
    res.status(500).json({ error: 'An error occurred while fetching the latest STAG matricule.' });
  }
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
    SELECT *
    FROM newemploye np
    LEFT JOIN employe e ON np.Employe_Mat_employe = e.Mat_employe
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error(' err');
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
  const { matricule, comptes, direction } = req.body;

  if (!matricule || !comptes || !Array.isArray(comptes)) {
    return res.status(400).json({ message: 'Entrée invalide' });
  }

  try {
    // Démarrer la transaction
    await db.query('START TRANSACTION');

    // Insérer dans employe_compte
    const insertQueries = comptes.map((compteId) => {
      return db.query('INSERT INTO employe_compte (Employe_Mat_employe, Compte_Id_compte) VALUES (?, ?)', [matricule, compteId]);
    });
    await Promise.all(insertQueries);

    // Supprimer de newemploye
    await db.query('DELETE FROM newemploye WHERE Employe_Mat_employe = ?', [matricule]);

    // Récupérer les informations de l'employé et des comptes
    const selectQuery = `
      SELECT *
      FROM employe_compte ec
      LEFT JOIN employe e ON ec.Employe_Mat_employe = e.Mat_employe
      LEFT JOIN compte c ON ec.Compte_Id_compte = c.Id_compte
      WHERE ec.Employe_Mat_employe = ?
    `;

    db.query(selectQuery, [matricule], async (error, results, fields) => {
      if (error) {
        console.error('Erreur lors de la récupération des informations :', error);
        // Annuler la transaction en cas d'erreur
        await db.query('ROLLBACK');
        return res.status(500).json({ message: 'Erreur lors de la récupération des informations' });
      }

      if (results.length === 0) {
        console.log('Aucun résultat trouvé pour le matricule:', matricule);
        // Valider la transaction même si aucun résultat n'est trouvé
        await db.query('COMMIT');
        return res.status(404).json({ message: 'Aucun résultat trouvé pour le matricule' });
      }

      console.log('Informations de l\'employé et comptes associés :', results);

      // Valider la transaction
      await db.query('COMMIT');

      // Construire le corps de l'email
      const subject = 'Création de compte pour le nouvel employé';
      const employeeName = `${results[0].Prenom_employe} ${results[0].Nom_employe}`;
      const accountDetails = results.map(info => `Application: ${info.Application}`).join('\n');

      const text = `
        Bonjour,

        Veuillez créer un compte pour le nouvel employé avec le matricule ${matricule}.
        Nom de l'employé : ${employeeName}
        Détails des comptes :
        ${accountDetails}

        Merci.

        Cordialement,
        ${direction}
      `;

      // Envoyer l'e-mail de notification
      const emails = ['tresor.yao@nsiaassurances.com'];
      // const emails = ['assistancedsivie@nsiaassurances.com', 'Support_VIECI@nsiaassurances.com'];

      for (const email of emails) {
        await sendEmail(email, subject, text);
      }

      res.status(200).json({ message: 'Comptes autorisés avec succès et employé supprimé de la table newemploye' });
    });
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    await db.query('ROLLBACK');
    console.error('Erreur lors de l\'autorisation des comptes et de la suppression de l\'employé :', error);
    res.status(500).json({ message: 'Erreur lors de l\'autorisation des comptes et de la suppression de l\'employé' });
  }
});



// Endpoint to get the number of employees in a specific direction
app.get('/app/dashboarddirection', (req, res) => {
  const direction = req.query.direction;

  if (!direction) {
    return res.status(400).json({ message: 'Direction is required' });
  }

  const query = 'SELECT COUNT(*) AS count FROM employe WHERE Direction_code = ?';
  db.query(query, [direction], (err, result) => {
    if (err) {
      console.error('Error fetching employee count:', err);
      return res.status(500).json({ message: 'Error fetching employee count' });
    }
    res.status(200).json({ count: result[0].count });
  });
});

app.get('/app/demandecreation', async (req, res) => {
  try {
    const comptes = await new Promise((resolve, reject) => {
      db.query(`
        SELECT ec.Employe_Mat_employe AS matricule, GROUP_CONCAT(c.Application SEPARATOR ', ') AS applications
        FROM employe_compte ec
        LEFT JOIN compte c ON ec.Compte_Id_compte = c.Id_compte
        GROUP BY ec.Employe_Mat_employe
      `, (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });

    res.status(200).json(comptes);
  } catch (error) {
    console.error('Erreur lors de la récupération des comptes des employés :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des comptes des employés' });
  }
});

app.post('/app/validatecreation', (req, res) => {
  const { matricule } = req.body;
  const sql = 'DELETE FROM employe_compte WHERE Employe_Mat_employe = ?'; // Adapté à votre structure de base de données
  db.query(sql, [matricule], (err, result) => {
    if (err) {
      console.error('Error validating creation:', err);
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la validation de la création.' });
      return;
    }
    console.log(`Compte pour matricule ${matricule} validé avec succès.`);
    res.json({ message: `Compte pour matricule ${matricule} validé avec succès.` });
  });
});
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
