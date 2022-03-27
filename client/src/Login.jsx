import { useContext, useState, useEffect } from "react";
import { UserSettingsContext } from "./UserSettingsContext";
import "./Login.css";
import TextButton from "./TextButton";
import axios from "axios";
import { ServerListContext } from "./ServerListContext";
const Login = () => {
  const { key, setKey, setError, setLoading, setToken } = useContext(UserSettingsContext);
  const { setServers } = useContext(ServerListContext);
  const [input, setInput] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(input);
    if (input.length > 5) {
      setLoading(true);
      await axios
        .get(`/api/key`, {
          headers: {
            "testing-key": input,
          },
        })
        .then((resp) => {
          console.log(resp.data);
          console.log(resp.data.userdata.servers);

          if (resp.data.userdata) {
            setKey(input);
            setServers(resp.data.userdata.servers);
            setToken(resp.data.userdata.token);
            // setCurrentServer(-1);
          } else setKey(input);
          console.log("authorized");
          document.body.classList.remove("noscroll");
        })
        .catch((error) => {
          console.log(error);
          console.log(error.response.data);
          const errorData = error.response.data;
          setError({ ...errorData });
          setKey(null);
        })
        .finally(() => {
          setInput("");
        });
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.classList.add("noscroll");
  }, []);

  return (
    <>
      {!key && (
        <div className="bcgFull">
          <form action="">
            <div className="loginInner">
              <h1>
                Welcome to <span className="projectName">XP-GRINDER</span> Beta Testing
              </h1>
              <h2>Enter your testing key</h2>

              <input className="keyInput" autoFocus type="password" value={input} onChange={(e) => setInput(e.target.value)} />
              <div className="buttonWrapper" onClick={(e) => handleSubmit(e)}>
                <TextButton bgc="#00A36C" fz="1.6rem" color="white" pd="2rem" type="submit">
                  Submit Key
                </TextButton>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Login;
