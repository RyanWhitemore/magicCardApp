import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./Register.css"

const Register = () => {
    const navigate = useNavigate();
    const path = `http://localhost:${process.env.REACT_APP_SERVPORT}`

    const [ usernameTaken, setUsernameTaken ] = useState(false)
    const [ canSubmit, setCanSubmit ] = useState(true)
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [ error, setError ] = useState('')
    const [ registered, setRegistered ] = useState(false)
    const specialChars = /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~\s]/

    const handleUsernameChange = (e) => {
        e.preventDefault()
        setUsername(e.target.value)
    }

    const handlePasswordChange = (e) => {
        e.preventDefault()
        setPassword(e.target.value)
    }

    const checkPassword = useCallback(() => {
        if (!specialChars.test(password)) {
            setError('Password must contain special character')
            setCanSubmit(true)
            return false
        }
        if (password.length < 10) {
            setError('Password must contain at least 10 characters')
            setCanSubmit(true)
            return false
        }
        if (specialChars.test(password) && password.length >= 10) {
            setError('')
            return true
        }
    }, [password, specialChars])
    
    const checkUsername = useCallback(() => {

        if (specialChars.test(username)) {
            setError('Username may not contain special characters')
            setCanSubmit(true)
            return false
        }
        if (username.length < 8) {
            setError('Username must be longer than 8 characters')
            setCanSubmit(true)
            return false
        }
        if (!specialChars.test(username) && username.length >= 8){
            setError('')
            return true
        }
    }, [username])


    let registerUser = async (e) => {
        e.preventDefault();

        setRegistered(true)

        if (!checkPassword() || !checkUsername()) {
            return setError('Username or password does not meet requirements')
        }      

        const body = {
            username: username.toLowerCase(),
            password: password
        }

        axios.defaults.baseURL = ''
        await axios.post(path + "/register", body, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        .then((result) => {
            if (!result.data) {
                return setError('Username taken')
            }
            else {
                navigate('/')
            }
        })
        
    }
    

    useEffect(() => {
        if (username.length > 0) {
            checkUsername()
        }
        if (password.length > 0) {
            checkPassword()
        }
        if (username.length >= 8 && password.length >= 10) {
            if (checkPassword() && checkUsername()) {
                setCanSubmit(false)
            }
        }
        if (username.length > 0 && !specialChars.test(username)) {
            axios.get(path + "/user/" + username)
            .then(result => {
                if (!result.data) {
                    setUsernameTaken(false)
                } else {
                    setUsernameTaken(true)
                }
            })
        }
    }, [username, checkUsername, password, checkPassword, specialChars])


    return (
        <>
            <div id="register">
                <h1 id={"register-header"}>Register</h1>
                {registered && <p className="success">Registered</p>}
                {usernameTaken ? <h5 id={"error"}>Username taken</h5> : ''}            
                <form onSubmit={registerUser}>
                    <input 
                        value={username} id={"register-username"}
                        placeholder="username"
                        onChange={handleUsernameChange} type='text'></input><br/>
                    <input 
                        value={password} id={"register-password"}
                        placeholder="password"
                        onChange={handlePasswordChange} type='text'></input><br/>
                    <button id={"register-submit"} type="submit" disabled={canSubmit}>Register</button><br/>
                </form>
                {error ? <h5 id={"error"}>{error}</h5> : ''}
                <Link id={"register-link"} to="/">Home</Link>
            </div>
        </>
    )
}


export { Register }