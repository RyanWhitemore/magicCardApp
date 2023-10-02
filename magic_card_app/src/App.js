import { useState } from 'react';
import CardPage from './CardPage';
import Home from './Home';
import MyCards from './MyCards';
import DeckBuiler from "./DeckBuilder"

import {Route, Routes, BrowserRouter} from "react-router-dom"
import { Register } from './Register';
import { QueryClient, QueryClientProvider } from 'react-query';

function App() {

  const [ search, setSearch ] = useState()

  sessionStorage.setItem("deck", JSON.stringify([]))

  const queryClient = new QueryClient()

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route exact path="/" element={<Home 
            className="body"
            search={search}
            setSearch={setSearch}/>}/>
            <Route exact path="/" element={<Home/>}/>
            <Route exact path="/mycards" element={<MyCards/>}/>
            <Route exact path="/cardPage" element={<CardPage/>}/>
            <Route exact path="/register" element={<Register/>}/>
            <Route exact path="/deckBuilder" element={<DeckBuiler/>}/>
          </Routes> 
        </BrowserRouter>
      </QueryClientProvider>
    </>
  );
}

export default App;
