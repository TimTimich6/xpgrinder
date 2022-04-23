const InviteOption = (props) => {
  return (
    <div className="inviterOption">
      <h2 className="optionLabel">{props.label}</h2>
      {props.children}
    </div>
  );
};

export default InviteOption;
