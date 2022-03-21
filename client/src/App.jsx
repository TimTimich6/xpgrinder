import "./App.css";
import FilterList from "./ServerList/FilterList";
import ServerList from "./ServerList/ServerList";
import ServerStats from "./UserStats";
import { ServerListProvider } from "./ServerListContext.jsx";
import { UserSettingsProvider } from "./UserSettingsContext.jsx";
import Popup from "./Popup";
import ErrorDisplay from "./ErrorDisplay";
import Login from "./Login";
function App() {
  return (
    <UserSettingsProvider>
      <Login />
      <div className="App">
        <ServerListProvider>
          <Popup />
          <ErrorDisplay />
          <div className="appContainer">
            <ServerStats />
            <ServerList />
            <FilterList />
          </div>
        </ServerListProvider>
      </div>
    </UserSettingsProvider>
  );
}

export default App;
