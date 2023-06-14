import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'

const Vote = () => {
  // TODO: Create Redux slice/reducer for 'proposals' and 'account' in Redux store

  const proposals = []
  // > const proposals = useSelector(state => state.delegatedDAO.proposals)
  // ... Redux portion ...
  // Fetch proposals
  // TODO:
  //  const count = proposalCount
  //  const items = []

  //  for (var i = 0; i < count; i++) {
  //    const proposal = await dao.proposals(i + 1)
  //    items.push(proposal)
  //  }

  const account = useSelector(state => state.provider.account)

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
    'Finalize',
    'Deadline'
  ]

  return (
    <>
      <h1 className='text-center'>Live Proposals</h1>
      <p className='text-center'>
        Below are all proposals that are currently up for voting.
        <br />
        DAO members can express support or opposition for a proposal by 'Upvoting' or 'Downvoting',
        <br />
        where each vote is weighted by a member's voting power (i.e. the number of tokens you hold).
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
