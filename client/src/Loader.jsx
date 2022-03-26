import { UserSettingsContext } from "./UserSettingsContext.jsx";
import { useContext } from "react";
import "./Loader.css";
const Loader = () => {
  const { loading } = useContext(UserSettingsContext);
  return (
    <>
      {loading && (
        <div className="bcgFull">
          <div className="loadingInner">
            <div className="loader"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default Loader;
