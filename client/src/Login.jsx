import { useContext, useState } from "react";
import { UserSettingsContext } from "./UserSettingsContext";
import "./Login.css";
import TextButton from "./TextButton";
import axios from "axios";
const Login = () => {
  const { key, setKey, setError } = useContext(UserSettingsContext);
  const [input, setInput] = useState("");
  const handleSubmit = () => {
    console.log(input);
    axios
      .post(`/api/key`, {
        key: input,
      })
      .then((resp) => {
        console.log(resp.data);
        if (resp.status === 200) {
          setKey(input);
          console.log("authorized");
        }
      })
      .catch((error) => {
        console.log(error);
        setError({ title: "Key Failure", description: "Key Provided doesn't exist" });
        setKey(null);
      })
      .finally(() => {
        setInput("");
      });
  };
  return (
    <>
      {!key && (
        <div className="loginTotal">
          <div className="loginInner">
            <h1>
              Welcome to <span className="projectName">XP-GRINDER</span> Beta Testing
            </h1>
            <h2>Enter your testing key</h2>
            <input className="keyInput" type="password" value={input} onChange={(e) => setInput(e.target.value)} />
            <div className="buttonWrapper" onClick={handleSubmit}>
              <TextButton bgc="#00A36C" fz="1.6rem" color="white" pd="2rem">
                Submit Key
              </TextButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
