import './FilterElement.css';
import TextButton from '../TextButton.jsx';
import { useContext } from 'react';
import { ServerListContext } from '../ServerListContext';

const FilterElement = (props) => {
	const userCtx = useContext(ServerListContext);
	const { currentServer, setServers } = userCtx;
	const removeFilter = () => {
		setServers((prevState) => {
			return prevState.map((server, index) => {
				console.log('index', index, 'curr', currentServer);
				if (index === currentServer) {
					const newFilters = server.filters.filter((filter) => {
						console.log('filters:', filter.filter, props.filter);
						console.log('response:', filter.response, props.response);

						if (filter.filter === props.filter && filter.response === props.response) return false;
						return true;
					});
					return { ...server, filters: newFilters };
				}
				return server;
			});
		});
	};

	return (
		<div className="filterTotal">
			<div className="filterElement">
				<span className="flWord">Filter</span>
				<span className="flText">{props.filter}</span>
				<span className="flWord">Response</span>
				<span className="flText">{props.response}</span>
			</div>
			<div className="buttonWrapper" onClick={() => removeFilter()}>
				<TextButton bgc="#BB3C3C">Remove Filter</TextButton>
			</div>
		</div>
	);
};

export default FilterElement;
