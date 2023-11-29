import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Switch, Link, Routes } from 'react-router-dom';
import SubmissionForm from './Components/SubmissionForm';
import OutputScreen from './Components/OutputScreen';

function App() {
  return (
    <div>
     <Router>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={< SubmissionForm/>} />
        <Route path="/OutputScreen" element={<OutputScreen/>} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
