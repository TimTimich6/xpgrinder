import axios from "axios";
import React, { createContext, useEffect, useState, useContext } from "react";
import Cookie from "universal-cookie";
import { ServerListContext } from "./ServerListContext";
export const UserSettingsContext = createContext();

const defaultUser = { username: "", discriminator: "" };
const defaultError = { title: "error title", description: "error description" };
export const UserSettingsProvider = (props) => {
  const [user, setUser] = useState({});
  const [token, setToken] = useState("");
  const [webhook, setWebhook] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logged, setLogged] = useState({});
  const [active, setActive] = useState(null);
  const [shared, setShared] = useState([]);
  const cookies = new Cookie();
  useEffect(async () => {
    if (!/[A-Za-z\d]{24}\.[\w-]{6}\.[\w-]{27}/g.test(token)) return;
    setLoading(true);
    axios
      .post(`/api/self`, {
        token: token,
      })
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
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const { data } = await axios.get("/api/user").catch((err) => {
        const allCookies = cookies.getAll();
        console.log("all", allCookies);

        if (allCookies && allCookies.jwt) {
          cookies.remove("jwt");
        }
        window.location.href = "http:" ? "http://localhost:3080/api/auth/discord" : "https://xpgrinder.xyz/api/auth/discord";
      });
      if (data) {
        setLogged({
          ...data,
        });
      }
    }
    if (document.cookie.includes("jwt=")) {
      console.log("includes");
      fetchUser();
    }
    setLoading(false);
  }, []);

  return (
    <UserSettingsContext.Provider
      value={{
        token,
        setToken,
        webhook,
        setWebhook,
        user,
        loading,
        error,
        setError,
        setLoading,
        active,
        setActive,
        logged,
        setUser,
        setLogged,
        shared,
        setShared,
      }}
    >
      {props.children}
    </UserSettingsContext.Provider>
  );
};
