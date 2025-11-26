import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  name: string;
  age: number;
  userType: 'patient' | 'doctor';
  language: 'en' | 'hi';
}

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    name: 'Meera',
    age: 62,
    userType: 'patient',
    language: 'en',
  });

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
