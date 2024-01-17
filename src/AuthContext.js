// AuthContext.js
import { createContext, useContext, useState } from 'react';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [patientId, setPatientId] = useState(0);
  const [deviceToken, setDeviceToken] = useState('');
   
  const login = (id) => {
    setPatientId(id);
  };

  const logout = () => {
    setPatientId(0);
    setDeviceToken('');
  };

  const setUserDeviceToken = (token) => {
     setDeviceToken(token);
  }

  return (
    <AuthContext.Provider value={{ patientId, login, logout, deviceToken, setUserDeviceToken}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
