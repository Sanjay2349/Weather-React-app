import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
const UserContext = React.createContext();

const Userprovider = ({ children }) => {
  const [user, setUser] = React.useState(null);
 


  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, Userprovider };
