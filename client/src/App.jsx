import "./App.css";
import FilterList from "./ServerList/FilterList";
import ServerList from "./ServerList/ServerList";
import ServerStats from "./UserStats";
import { ServerListProvider } from "./ServerListContext.jsx";
import { UserSettingsProvider } from "./UserSettingsContext.jsx";
import Popup from "./Popup";
import ErrorDisplay from "./ErrorDisplay";
import Login from "./Login";
import Loader from "./Loader";
function App() {
  return (
    <div className="App">
      <UserSettingsProvider>
        <Login />
        <Loader />

        <ServerListProvider>
          <Popup />
          <ErrorDisplay />
          <div className="appContainer">
            <ServerStats />
            <ServerList />
            <FilterList />
          </div>
        </ServerListProvider>
      </UserSettingsProvider>
    </div>
  );
}

export default App;
