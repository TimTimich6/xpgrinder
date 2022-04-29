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
import TrainAI from "./TrainAI";
import Inviter from "./Invite/Inviter";
import Header from "./Header";
function App() {
  return (
    <div className="App">
      <ServerListProvider>
        <UserSettingsProvider>
          <Login />
          <Loader />
          <Popup />
          <ErrorDisplay />

          <div className="appContainer">
            <Header />
            <ServerStats />
            <TrainAI />
            <ServerList />
            <FilterList />
            <Inviter />
          </div>
        </UserSettingsProvider>
      </ServerListProvider>
    </div>
  );
}

export default App;
