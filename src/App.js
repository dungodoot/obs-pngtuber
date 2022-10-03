import './App.css';
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import Source from './components/Source/source';
import Settings from './components/Settings/settings';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path='/source' element={< Source />}></Route>
          <Route exact path='/settings' element={< Settings />}></Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App;
