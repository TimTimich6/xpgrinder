import "./Header.css";
import { UserSettingsContext } from "./UserSettingsContext";
import { ServerListContext } from "./ServerListContext";
import { useContext } from "react";
import TextButton from "./TextButton";
import Cookie from "universal-cookie";
const Header = (props) => {
  const { logged, setUser, setLogged, setToken } = useContext(UserSettingsContext);
  const { setServers } = useContext(ServerListContext);
  const cookies = new Cookie();
  const signOut = async () => {
    setServers([]);
    setUser({});
    setToken("");
    setLogged({});
    removeCookies();
    window.location.reload();
  };

  function removeCookies() {
    const allCookies = cookies.getAll();
    console.log("all", allCookies);
    if (allCookies && allCookies.jwt) {
      cookies.remove("jwt");
    }
  }

  return (
    <header className="header">
      {logged.userid && (
        <>
          <div className="loggedUser">
            <img className="userPfp" src={`https://cdn.discordapp.com/avatars/${logged.userid}/${logged.hash}.png?size=4096`} />
            <div className="loggedRight">
              <h2 className="loggedName">{logged.username}</h2>
              <p className="holdingStatus">Holder: {logged.holder}</p>
              <p className="loggedID">{logged.userid}</p>
            </div>
          </div>
          <div className="buttonWrapper" onClick={() => signOut()}>
            <TextButton bgc="red" fz="2rem">
              Sign Out
            </TextButton>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
