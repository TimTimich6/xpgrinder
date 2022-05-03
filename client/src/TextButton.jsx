import "./TextButton.css";
const TextButton = (props) => {
  const bx = props.bx ? props.bx : "1px 4px 2px rgb(10, 10, 10)";
  return (
    <button
      className="textButton"
      style={{ backgroundColor: props.bgc, fontSize: props.fz, padding: `0.5rem ${props.pd}`, boxShadow: bx, color: props.color }}
      type={props.type}
      data-tip={props.tip}
    >
      {props.children}
    </button>
  );
};

export default TextButton;
