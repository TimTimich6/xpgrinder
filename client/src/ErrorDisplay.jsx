import { useContext } from "react";
import TextButton from "./TextButton";
import { UserSettingsContext } from "./UserSettingsContext";
import "./ErrorDisplay.css";
const ErrorDisplay = (props) => {
  const { error, setError } = useContext(UserSettingsContext);
  const closeError = () => {
    setError(null);
  };
  return (
    <>
      {error && (
        <div className="errorTotal">
          <div className="errorInner">
            <h1 className="errorTitle">{error.title}</h1>
            <p className="errorDescription">{error.description}</p>
            <div className="popupBottom">
              <div className="buttonWrapper" onClick={() => closeError()}>
                <TextButton bgc="#D66767" fz="1.7rem">
                  Close Error
                </TextButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ErrorDisplay;
