import Navbar from 'react-bootstrap/Navbar';

import logo from '../img/logo.png';

const Navigation = ({ account }) => {
  return (
    <Navbar className='my-3'>
      <img
        alt="logo"
        src={logo}
        width="60"
        height="60"
        className="d-inline-block align-top mx-3"
      />
      <Navbar.Brand href="#">GS[Web]3i</Navbar.Brand>
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>
          {account}
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Navigation;
