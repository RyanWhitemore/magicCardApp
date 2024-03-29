import { useState } from 'react';
import Home from './Home';
import MyCards from './MyCards';
import DeckBuiler from "./DeckBuilder"
import axios from 'axios';
import {Route, Routes, BrowserRouter} from "react-router-dom"
import { Register } from './Register';
import { QueryClient, QueryClientProvider } from 'react-query';
import MyDecks from './MyDecks';
import DeckPage from "./DeckPage.jsx"
import FishBowl from './Fishbowl.jsx';
import { createTheme, ThemeProvider } from '@mui/material';
import AddCards from './AddCards';

export const ThemeOptions = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#4a148c',
    },
    warning: {
      main: '#ed6c02',
    },
    background: {
      default: 'rgb(37, 45, 63)',
    },
  },
});



function App() {

  const [ search, setSearch ] = useState()

  sessionStorage.setItem("deck", JSON.stringify([]))

  const [ loginClicked, setLoginClicked ] = useState(false)

  const [ username, setUsername ] = useState("")

  const [ password, setPassword ] = useState("")

  const [ defaultCards, setDefaultCards ] = useState(false)

  const [isCards, setIsCards] = useState(false)

  const queryClient = new QueryClient()

  const login = async (e) => {
    e.preventDefault()
    const results = await axios.post(`http://localhost:${process.env.REACT_APP_SERVPORT}/login`, {
        username: username.toLowerCase(), password: password
    })

    if (!results.data.message) {
        setIsCards(true)
        setDefaultCards(false)
        localStorage.setItem("userID", results.data)
        setLoginClicked(!loginClicked)
    } else {
        console.log("login failed")
    }
    
}

  return (
    <ThemeProvider theme={ThemeOptions}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route exact path="/" element={<Home 
              className="body"
              search={search}
              setSearch={setSearch}
              loginClicked={loginClicked}
              setLoginClicked={setLoginClicked}
              username={username}
              password={password}
              setPassword={setPassword}
              setUsername={setUsername}
              login={login}
              defaultCards={defaultCards}
              setDefaultCards={setDefaultCards}
              setIsCards={setIsCards}
              isCards={isCards}/>}/>
            <Route exact path="/mycards" element={<MyCards
              login={login}
              defaultCards={defaultCards}
              setDefaultCards={setDefaultCards}
              setIsCards={setIsCards}
              isCards={isCards}
              loginClicked={loginClicked}
              setLoginClicked={setLoginClicked}
              username={username}
              password={password}
              setPassword={setPassword}
              setUsername={setUsername}/>}/>
            <Route exact path="/register" element={<Register/>}/>
            <Route exact path="/deckBuilder" element={<DeckBuiler
              login={login}
              defaultCards={defaultCards}
              setDefaultCards={setDefaultCards}
              setIsCards={setIsCards}
              isCards={isCards}
              loginClicked={loginClicked}
              setLoginClicked={setLoginClicked}
              username={username}
              password={password}
              setPassword={setPassword}
              setUsername={setUsername}/>}/>
            <Route exact path='/mydecks' element={<MyDecks
              login={login}
              defaultCards={defaultCards}
              setDefaultCards={setDefaultCards}
              setIsCards={setIsCards}
              isCards={isCards}
              loginClicked={loginClicked}
              setLoginClicked={setLoginClicked}
              username={username}
              password={password}
              setPassword={setPassword}
              setUsername={setUsername}/>}/>
            <Route exact path="DeckPage" element={<DeckPage/>}
              login={login}
              defaultCards={defaultCards}
              setDefaultCards={setDefaultCards}
              setIsCards={setIsCards}
              isCards={isCards}
              loginClicked={loginClicked}
              setLoginClicked={setLoginClicked}
              username={username}
              password={password}
              setPassword={setPassword}
              setUsername={setUsername}
            />
            <Route exact path="fishbowl" element={<FishBowl/>}
              login={login}
              defaultCards={defaultCards}
              setDefaultCards={setDefaultCards}
              setIsCards={setIsCards}
              isCards={isCards}
              loginClicked={loginClicked}
              setLoginClicked={setLoginClicked}
              username={username}
              password={password}
              setPassword={setPassword}
              setUsername={setUsername}
            />
            <Route exact path="addcards" element={<AddCards/>}
              login={login}
              loginClicked={loginClicked}
              setLoginClicked={setLoginClicked}
              username={username}
              password={password}
              setPassword={setPassword}
              setUsername={setUsername}
            />
          </Routes> 
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
