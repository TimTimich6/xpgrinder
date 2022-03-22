import axios from "axios";
import { useContext, useState } from "react";
import TextButton from "../TextButton";
import { UserSettingsContext } from "../UserSettingsContext";
const CreateFilter = (props) => {
  const [filterInput, setFilterInput] = useState("");
  const [responseInput, setResponseInput] = useState("");
  const { setError, key } = useContext(UserSettingsContext);
  const { setServers, currentServer } = props;
  const addFilter = async (filter) => {
    if (!filter.filter || !filter.response) {
      setError({ title: "Filter Error", description: "Either filter or response are not valid values" });
      return;
    }

    await setServers((prevState) => {
      return prevState.map((server, i) => {
        if (i === currentServer) return { ...server, filters: [...server.filters, filter] };
        return server;
      });
    });
    setFilterInput("");
    setResponseInput("");
  };
  const setDefault = async () => {
    const resp = await axios.get("/api/filters", { headers: { "testing-key": key } }).catch((err) => {
      setError({ title: "Filter Error", description: "Couldn't fetch default filters" });
    });
    if (resp.data) {
      await setServers((prevState) => {
        return prevState.map((server, i) => {
          if (i === currentServer) return { ...server, filters: resp.data };
          return server;
        });
      });
    }
  };
  const clearFilters = () => {
    setServers((prevState) => {
      return prevState.map((server, i) => {
        if (i === currentServer) return { ...server, filters: [] };
        return server;
      });
    });
  };
  return (
    <>
      <div className="filterTotal">
        <div className="filterElement">
          <label className="flWord">Filter</label>
          <input onChange={(e) => setFilterInput(e.target.value)} type="text" required className="flText" value={filterInput} />
          <span className="flWord">Response</span>
          <input onChange={(e) => setResponseInput(e.target.value)} type="text" required className="flText" value={responseInput} />
        </div>
      </div>
      <div className="filtersButtons">
        <div className="buttonWrapper" onClick={() => addFilter({ filter: filterInput, response: responseInput })}>
          <TextButton bgc="rgb(23, 149, 118)">Create New Filter</TextButton>
        </div>
        <div className="buttonWrapper" onClick={() => setDefault()}>
          <TextButton bgc="gray">Set to Default</TextButton>
        </div>
        <div className="buttonWrapper" onClick={() => clearFilters()}>
          <TextButton bgc="#BB3C3C">Clear All</TextButton>
        </div>
      </div>
    </>
  );
};

export default CreateFilter;
