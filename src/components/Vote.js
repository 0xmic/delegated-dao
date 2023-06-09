import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'

const Vote = () => {
  // TODO: Create Redux slice/reducer for 'proposals' and 'account' in Redux store
  // const proposals = useSelector(state => state.delegatedDAO.proposals)
  // const account = useSelector(state => state.provider.account)
  const proposals = []
  const account = ''

  const dispatch = useDispatch()

  useEffect(() => {
    // Create a function to fetch live proposals
    // dispatch(fetchLiveProposals())
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
    'Upvote',
    'Downvote',
    'Finalize'
  ]

  return (
    <>
      <h1 className='text-center'>Live Proposals</h1>
      <p className='text-center'>
        Welcome to the DAO's voting hub. On this page, you'll find all proposals that are currently up for voting.
        <br />
        As a DAO member, you can express your support or opposition to each proposal by 'Upvoting' or 'Downvoting' respectively.
        <br />
        Each vote you cast directly impacts the future direction of our DAO. Happy voting!
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
          {proposals.map((proposal, index) => (
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

export default Vote
