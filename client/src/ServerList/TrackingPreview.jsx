import "./TrackingPreview.css";
import { useContext } from "react";
import { ServerListContext } from "../ServerListContext";
import TextButton from "../TextButton";
const TrackingPreview = (props) => {
  const { setOpenPopup } = useContext(ServerListContext);
  const handlerOpenSettings = () => {
    setOpenPopup(true);
  };

  const handleCheck = (event) => {
    props.setServers((prevState) => {
      return prevState.map((server, index) => {
        if (index === props.index)
          return {
            ...server,
            tracking: !props.tracking,
          };
        return server;
      });
    });
  };
  return (
    <div className={props.selected === true ? "trackingTotal selected" : "trackingTotal"}>
      <div className="leftSide  ">
        <img src={props.img} alt="icon" className="serverIcon" />
        <div className="centerContainer">
          <span className="serverName">{props.name}</span>
          <div className="buttonWrapper" onClick={handlerOpenSettings}>
            <div className="serverSettingsButton">
              Settings
              <img src="cogwheel.png" height="25px" alt="" />
            </div>
          </div>
        </div>
      </div>
      <div className="serverRightSide">
        <div className="buttonWrapper" onClick={() => handleCheck()}>
          <TextButton fz="1.7rem" pd="1.3rem" bgc={props.tracking ? "#81B622" : "#a6bbff"} tip="Select server to be tracked" bx="none">
            {props.tracking == true ? "Ready" : "Select"}
          </TextButton>
        </div>
      </div>
    </div>
  );
};

export default TrackingPreview;
