import CreateFilter from "./CreateFilter";
import FilterElement from "./FilterElement";
import { useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ServerListContext } from "../ServerListContext";
const FilterList = () => {
  const { servers, currentServer, setServers } = useContext(ServerListContext);
  const [showFilters, setShowFilters] = useState(true);
  const spamOn = servers[currentServer] ? servers[currentServer].settings.spamChannel.length == 18 : false;

  return (
    <div className="filterListContainer">
      <h1
        style={{ color: showFilters ? (spamOn ? "#DF6464  " : "white") : "gray", marginBottom: "1rem", cursor: "pointer" }}
        onClick={() => setShowFilters((prevState) => !prevState)}
      >
        Filter List {!showFilters && "(Hidden)"} {spamOn && "(Off)"}
      </h1>

      {showFilters && servers.length > 0 && currentServer >= 0 && !spamOn ? (
        <>
          {servers[currentServer].filters.map((filter) => {
            return <FilterElement key={uuidv4()} filter={filter.filter} response={filter.response} />;
          })}

          <CreateFilter setServers={setServers} currentServer={currentServer} />
        </>
      ) : null}
    </div>
  );
};

export default FilterList;
