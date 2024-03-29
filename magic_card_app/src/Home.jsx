import { Box, Button, Divider, Typography } from "@mui/material"
import Header from "./Header"
import { useTheme } from "@emotion/react"
import { useNavigate } from "react-router-dom"

const Home = ({
    login, loginClicked,
    setLoginClicked, username,
    password, setPassword,
    setUsername
}) => {

    const navigate = useNavigate()

    const theme = useTheme()

    return <>
        <Header
            fromLandingPage={true}
            login={login}
            loginClicked={loginClicked}
            setLoginClicked={setLoginClicked}
            username={username}
            password={password}
            setPassword={setPassword}
            setUsername={setUsername}
        />
        <Box sx={{
            background: "radial-gradient(circle, rgba(50,100,149,0.5) 0%, rgba(37,45,63,1) 40%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
        }}>
            <Typography variant="h2">Site Name</Typography>
            <Button onClick={() => {
                navigate("/mydecks")
            }} size="large"
            >
                Build Decks
            </Button>
            <Button onClick={() => {
                navigate("/addcards")
            }}
            
            >
                Collect Cards
            </Button>
        </Box>
    </>
}

export default Home