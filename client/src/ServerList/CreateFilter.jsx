import axios from "axios";
import { useContext, useState } from "react";
import { ServerListContext } from "../ServerListContext";
import TextButton from "../TextButton";
import { UserSettingsContext } from "../UserSettingsContext";
const CreateFilter = (props) => {
  const [filterInput, setFilterInput] = useState("");
  const [responseInput, setResponseInput] = useState("");
  const { setError, setLoading } = useContext(UserSettingsContext);
  const { servers } = useContext(ServerListContext);

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
  const setDefault = () => {
    setLoading(true);
    axios
      .get("/api/filters")
      .then((resp) => {
        console.log(resp.data);
        setServers((prevState) =>
          prevState.map((server, i) => {
            if (i === currentServer) return { ...server, filters: resp.data };
            return server;
          })
        );
      })
      .catch((err) => {
        console.log("Filter default error");
        setError({ ...err.response.data });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const clearFilters = () => {
    setServers((prevState) => {
      return prevState.map((server, i) => {
        if (i === currentServer) return { ...server, filters: [] };
        return server;
      });
    });
  };

  const downloadFilters = () => {
    if (servers[currentServer] && servers[currentServer].filters && servers[currentServer].filters.length > 0) {
      console.log(servers[currentServer]);
      const filters = servers[currentServer].filters;
      const a = document.createElement("a");
      a.style.display = "none";
      a.setAttribute("href", "data:text/plain;charset=utf-8, " + encodeURIComponent(JSON.stringify(filters)));
      a.download = `filters${servers[currentServer].name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const uploadFilters = () => {
    const a = document.querySelector("#filterupload");
    a.click();
  };
  const uploaded = async (e) => {
    try {
      const text = await e.target.files[0].text();
      if (text) {
        const parsed = JSON.parse(text);
        setServers((prevState) => {
          return prevState.map((server, i) => {
            if (i === currentServer) return { ...server, filters: parsed };
            return server;
          });
        });
      } else throw new Error();
    } catch (error) {
      setError({ title: "Upload error", description: "Unexpected error occured when uploading a file" });
    }
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
      <div className="buttonsServer">
        <div className="buttonWrapper" onClick={() => addFilter({ filter: filterInput, response: responseInput })}>
          <TextButton bgc="rgb(23, 149, 118)">Create New Filter</TextButton>
        </div>
        <div className="buttonWrapper" onClick={() => setDefault()}>
          <TextButton bgc="gray">Set to Default</TextButton>
        </div>
        <div className="buttonWrapper" onClick={() => clearFilters()}>
          <TextButton bgc="#BB3C3C">Clear All</TextButton>
        </div>
        <div className="downloadbuttons">
          <img src="./downloadlogo.png" alt="" className="forcePower" data-tip="Download filters to a json file" onClick={downloadFilters} />
          <img src="./uploadlogo.png" alt="" className="forcePower" data-tip="Upload filters from json file" onClick={uploadFilters} />
          <input type="file" id="filterupload" name="avatar" style={{ display: "none" }} accept="application/JSON" onChange={(e) => uploaded(e)} />
        </div>
      </div>
    </>
  );
};

export default CreateFilter;
