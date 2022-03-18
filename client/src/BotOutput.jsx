import { useState, useEffect } from "react";
import "./BoxOutput.css";
const BotOutput = (props) => {
  const [underscore, setUndescore] = useState(false);
  // useEffect(() => {
  //   const tmp = setInterval(() => {
  //     setUndescore(!underscore);
  //   }, 1000);
  //   return () => {
  //     clearInterval(tmp);
  //   };
  // });

  return (
    <div className="boxOutput">
      <h2 className="opTitle">Output Window</h2>
      <code className="opText">
        Test {underscore && <h1 className="underscore">_</h1>}
        <br />
      </code>
    </div>
  );
};

export default BotOutput;
