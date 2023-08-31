import './App.css';
import CardPage from './CardPage';
import Home from './Home';
import MyCards from './MyCards';

import {Route, Routes, BrowserRouter} from "react-router-dom"

function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home className="body"/>}/>
          <Route exact path="/mycards" element={<MyCards/>}/>
          <Route exact path="/cardPage" element={<CardPage/>}/>
        </Routes> 
      </BrowserRouter>
    </>
  );
}

export default App;
