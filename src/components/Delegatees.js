import { useSelector } from 'react-redux'
import Table from 'react-bootstrap/Table'
import Blockies from 'react-blockies'

const Delegatees = () => {
  const delegatees = useSelector(state => state.delegatedDAO.delegatees)

  // Table headings
  const headers = [
    'Delegate Address',
    'Votes Received'
  ]

  return (
    <>
      <h1 className='my-4 text-center'>Current Delegates</h1>

      <p className='text-center'>
        Below are all DAO members who have received delegation from other members.

        <br />

        Delegates and the number of votes they have received are listed in descending order.
      </p>

      <hr />

      <Table striped bordered hover responsive>
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index} className='text-center'>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...delegatees].sort((a, b) => parseFloat(b.votes) - parseFloat(a.votes)).map((delegatee, index) => (
          <tr key={index}>
            <td className='d-flex align-items-center justify-content-center'>
              <Blockies
                  seed={delegatee.delegatee}
                  size={10}
                  scale={3}
                  color='#e6e6e6'
                  bgColor='#000000'
                  spotColor='#ffffff'
                  className="identicon mx-2"
                />
              {delegatee.delegatee}
            </td>
            <td className='text-center'>{delegatee.votes.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </Table>

    </>
  )
}

export default Delegatees
