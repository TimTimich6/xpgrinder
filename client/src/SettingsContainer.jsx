import { useEffect, useRef, useState } from "react";
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
  return (
    <div className="settingsContainer">
      <span className="containerTitle">{props.label}</span>
      <span className="containerOutput">
        {!editing ? props.output : null}
        {props.modify ? <img className="editPencil" src="editpencil.png" onClick={() => handleEdit()} /> : null}
        {editing && props.modify ? <input className="headerInput" onChange={(e) => setInput(e.target.value)} /> : null}
      </span>
    </div>
  );
};

export default SettingsContainer;
