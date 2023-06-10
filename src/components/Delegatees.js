import Table from 'react-bootstrap/Table'

import { ethers } from 'ethers'

const Delegatees = () => {
  const delegates = []

  // Table headings
  const headers = [
    'Delegate Address',
    'Votes Received'
  ]

  return (
    <>
      <h2 className='my-4 text-center'>Current Delegates</h2>

      <p className='text-center'>
        Below is a list of all current DAO members who have received delegation from other members.

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
        {/* TODO: Replace with actual proposal data once Redux is set up */}
        {delegates.map((proposal, index) => (
          <tr key={index}>
            {/* TODO: Insert logic to render each cell */}
            <td className='text-center'>{proposal.id}</td>
            {/* TODO: Input rest of table cells */}
          </tr>
        ))}
      </tbody>
    </Table>

    </>
  )
}

export default Delegatees
