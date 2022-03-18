const ErrorStatus = () => {
    return ( 
         <div className="status errorContainer">
                <img src="redcircle.png" alt="" className="statusCircle"/>
                <span className="statusText error">Error</span>
            </div>
     );
}
 
export default ErrorStatus;