import "./Header.css";
import { UserSettingsContext } from "./UserSettingsContext";
import { useContext } from "react";
import TextButton from "./TextButton";
const Header = (props) => {
  const userCtx = useContext(UserSettingsContext);
  const { setToken } = userCtx;
  return (
    <header className="header">
      <TextButton bgc="green">Sign in with Discord</TextButton>
    </header>
  );
};

export default Header;
