import './App.css';
import Home from './Home';
import MyCards from './MyCards';

import {Route, Routes, BrowserRouter} from "react-router-dom"

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home/>}/>
          <Route exact path="/mycards" element={<MyCards/>}></Route>
        </Routes> 
      </BrowserRouter>
    </>
  );
}

export default App;
