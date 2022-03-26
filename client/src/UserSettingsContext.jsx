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
  const [key, setKey] = useState(null);

  useEffect(async () => {
    if (!/[A-Za-z\d]{24}\.[\w-]{6}\.[\w-]{27}/g.test(token)) return;
    setLoading((prevState) => !prevState);
    axios
      .post(
        `/api/self`,
        {
          token: token,
        },
        {
          headers: {
            "testing-key": key,
          },
        }
      )
      .then((resp) => {
        console.log(resp.data);
        setUser(resp.data);
      })
      .catch((err) => {
        console.log(err.response.data);
        const errorData = err.response.data;
        setError({ ...errorData });
        setToken(null);
      })
      .finally(() => {
        setLoading((prevState) => !prevState);
      });
  }, [token]);

  return (
    <UserSettingsContext.Provider
      value={{ token, setToken, logEverything, setLogEverything, altToken, setAltToken, user, loading, error, setError, key, setKey, setLoading }}
    >
      {props.children}
    </UserSettingsContext.Provider>
  );
};
