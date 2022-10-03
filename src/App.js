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
    <Router basename='/obs-pngtuber'>
      <div className="App">
        <Routes>
          <Route exact path='/source' element={< Source />} />
          <Route exact path='/settings' element={< Settings />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;
