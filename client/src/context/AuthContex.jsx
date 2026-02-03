import { useEffect, useState, createContext } from "react";
import axios from "axios";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "https://social-64gp.onrender.com/auth/me",
          { withCredentials: true }
        );
        setUser(response.data.user);
      } catch (error) {
        console.log(error)
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};


export default AuthProvider;