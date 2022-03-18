import "./App.css";
import BotOutput from "./BotOutput";
import FilterList from "./ServerList/FilterList";
import Header from "./Header";
import ServerList from "./ServerList/ServerList";
import ServerStats from "./UserStats";
import { ServerListProvider } from "./ServerListContext.jsx";
import { UserSettingsProvider } from "./UserSettingsContext.jsx";
import Popup from "./Popup";
import ErrorDisplay from "./ErrorDisplay";
function App() {
  return (
    <UserSettingsProvider>
      {/* <Header /> */}
      <div className="App">
        <ServerListProvider>
          <Popup />
          <ErrorDisplay />
          <div className="appLeft">
            <ServerStats />

            <ServerList />
          </div>
          <div className="appRight">
            <BotOutput />
            <FilterList />
          </div>
        </ServerListProvider>
      </div>
    </UserSettingsProvider>
  );
}

export default App;
