import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
export const UserSettingsContext = createContext();

const defaultUser = { username: "", discriminator: "" };
const defaultError = { title: "error title", description: "error description" };
export const UserSettingsProvider = (props) => {
  const [user, setUser] = useState({});
  const [token, setToken] = useState(null);
  const [altToken, setAltToken] = useState(null);
  const [logEverything, setLogEverything] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(async () => {
    if (!/[A-Za-z\d]{24}\.[\w-]{6}\.[\w-]{27}/g.test(token)) return;
    setLoading((prevState) => !prevState);
    await axios
      .get(`/api/self/${token}`)
      .then((resp) => {
        console.log(resp.data);
        if (resp.data.error) {
          setError({ title: "Token Error", description: "Can't get data on the token" });
          setToken(null);
        } else setUser(resp.data);
      })
      .finally(() => {
        setLoading((prevState) => !prevState);
      });
  }, [token]);

  return (
    <UserSettingsContext.Provider value={{ token, setToken, logEverything, setLogEverything, altToken, setAltToken, user, loading, error, setError }}>
      {props.children}
    </UserSettingsContext.Provider>
  );
};
