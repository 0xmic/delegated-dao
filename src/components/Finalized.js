import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Table from 'react-bootstrap/Table'

const Finalized = () => {
  // TODO: Create Redux slice/reducer for 'proposals' and 'account' in Redux store
  // const proposals = useSelector(state => state.delegatedDAO.proposals)
  // const account = useSelector(state => state.provider.account)
  const proposals = []

  const dispatch = useDispatch()

  useEffect(() => {
    // Create a function to fetch finalized proposals
    // dispatch(fetchFinalizedProposals())
  }, [dispatch])

  // Table headings
  const headers = [
    '#',
    'Title',
    'Description',
    'Amount',
    'Recipient',
    'Votes',
    'Status',
  ]

  return (
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
        {proposals.map((proposal, index) => (
          <tr key={index}>
            {/* TODO: Insert logic to render each cell */}
            <td className='text-center'>{proposal.id}</td>
            {/* TODO: Input rest of table cells */}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default Finalized
