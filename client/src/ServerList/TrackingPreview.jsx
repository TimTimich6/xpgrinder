import "./TrackingPreview.css";
import { useContext } from "react";
import ErrorStatus from "./ErrorStatus";
import SuccessStatus from "./SuccessStatus";
import WarningStatus from "./WarningStatus";
import { ServerListContext } from "../ServerListContext";
import TextButton from "../TextButton";
const TrackingPreview = (props) => {
  const { setOpenPopup } = useContext(ServerListContext);

  const handleTracking = props.handleTracking;
  const handlerOpenSettings = () => {
    setOpenPopup(true);
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
        <div className="buttonWrapper" onClick={() => handleTracking()}>
          <TextButton fz="1.2rem" pd="1rem" bgc="#a6bbff" bx="none">
            {props.tracking == true ? "Active" : "Track"}
          </TextButton>
        </div>
      </div>
    </div>
  );
};

export default TrackingPreview;
