import Nav from 'react-bootstrap/Nav';
import { LinkContainer } from 'react-router-bootstrap';

const Tabs = () => {
  return (
    <Nav variant='pills' defaultActiveKey='/' className='justify-content-center my-4'>
      <LinkContainer to='/'>
        <Nav.Link>Propose</Nav.Link>
      </LinkContainer>
      <LinkContainer to='/delegate'>
        <Nav.Link>Delegate Votes</Nav.Link>
      </LinkContainer>
      <LinkContainer to='/delegatees'>
        <Nav.Link>Delegatees</Nav.Link>
      </LinkContainer>
      <LinkContainer to='/vote'>
        <Nav.Link>Vote</Nav.Link>
      </LinkContainer>
      <LinkContainer to='/history'>
        <Nav.Link>History</Nav.Link>
      </LinkContainer>
    </Nav>
  );
}

export default Tabs;