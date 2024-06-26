//acceuil.jsx
import React from 'react';
import './acceuil.css';
import Registerperso from '../enregistrement/registerperso';
import { BrowserRouter as Router,Switch,Route} from 'react-router-dom';
import Navbar from '../../component/navbar/navbar';
import Recherche from '../recherche/recherche';
import UpdateEmployee from '../modifier/modifier';
import PlusInfo from '../recherche/plusinfo';
import Contrat from '../contrat/contrat';
import Archive from '../archive/archive';
import Archiveplus from '../archive/archiveplus';
import Notif from '../../component/notif/notif';
function Acceuil() {
    return (
        
    <div className='fondacceuil'>
      

    <Router>
   <Navbar />
   <Switch>
    <Route path="/app/register"  component={Registerperso} />
    <Route path="/app/recherche" component={Recherche}/>
    <Route path="/app/modification" component={UpdateEmployee}/>
    <Route path="/app/plusinfo" component={PlusInfo}/>
    <Route path="/app/contrat" component={Contrat}/>
    <Route path="/app/archive" component={Archive}/>
    <Route path="/app/archiveplus" component={Archiveplus} />
    <Route path="/app/notification" component={Notif}/>
   </Switch>
   </Router>
    </div>
  );
}

export default Acceuil;