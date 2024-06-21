import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Acceuil from '../acceuil/acceuil';
import Login from '../login/login';
function App() {
  return (
    <>
    <div className='fondside'>
      
   
    <Router>
   <Switch>
    <Route path="/"  exact component={Login} />
    <Route path="/app"  component={Acceuil} />
   </Switch>
   </Router>
    </div>
   </>
  );
}

export default App;
