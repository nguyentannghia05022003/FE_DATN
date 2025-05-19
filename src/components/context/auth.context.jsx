import { createContext, useState } from 'react';

export const AuthContext = createContext({
    _id: "",
    fullName: "",
    email: "",
    role: "",
    phone: "",
    avatar: ""
});

export const AuthWrapper = (props) => {
    const [user, setUser] = useState({
        _id: "",
        fullName: "",
        email: "",
        role: "",
        phone: "",
        avatar: ""
    })

    const [isAppLoading, setIsAppLoading] = useState(true);

    return (
        <AuthContext.Provider value={{
            user, setUser,
            isAppLoading, setIsAppLoading
        }}>
            {props.children}
        </AuthContext.Provider>
    )
}