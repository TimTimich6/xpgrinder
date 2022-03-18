import './Header.css';
import { UserSettingsContext } from './UserSettingsContext';
import { useContext } from 'react';
const Header = (props) => {
	const userCtx = useContext(UserSettingsContext);
	const { setToken } = userCtx;
	return (
		<header className="header">
			<label className="headerLabel">Token </label>
			<input type="password" className="headerInput" onChange={(e) => setToken(e.target.value)} />
		</header>
	);
};

export default Header;
