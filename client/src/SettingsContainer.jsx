import { useEffect, useRef, useState } from "react";
import ReactTooltip from "react-tooltip";

const SettingsContainer = (props) => {
  const setState = props.modify;
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(props.output);
  const handleEdit = async () => {
    setEditing((prevState) => !prevState);
    if (input && input.length > 0) {
      setState(input);
      setInput("");
    }
  };
  let tipContent;
  if (props.label.includes("Token")) tipContent = "Read #import-token channel for help";
  else if (props.label.includes("Webhook")) tipContent = "Read #create-webhook channel for help";
  else tipContent = "";
  return (
    <div className="settingsContainer">
      <ReactTooltip place="top" type="info" effect="float" multiline className="tooltip" />
      <span className="containerTitle" data-tip={tipContent}>
        {props.label}
      </span>
      <span className="containerOutput">
        {!editing ? props.output : null}
        {props.modify ? <img className="editPencil" src="editpencil.png" onClick={() => handleEdit()} /> : null}
        {editing && props.modify ? <input type="password" className="headerInput" onChange={(e) => setInput(e.target.value)} /> : null}
      </span>
    </div>
  );
};

export default SettingsContainer;
