import CreateFilter from "./CreateFilter";
import FilterElement from "./FilterElement";
import { useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { ServerListContext } from "../ServerListContext";
const FilterList = () => {
  const { servers, currentServer, setServers } = useContext(ServerListContext);
  return (
    <div className="filterListContainer">
      <h1 style={{ color: "white", marginBottom: "1rem" }}>Filter List</h1>
      {servers.length > 0 && currentServer >= 0
        ? servers[currentServer].filters.map((filter) => {
            return <FilterElement key={uuidv4()} filter={filter.filter} response={filter.response} />;
          })
        : null}
      <CreateFilter setServers={setServers} currentServer={currentServer} />
    </div>
  );
};

export default FilterList;
