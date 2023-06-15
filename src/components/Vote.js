import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Blockies from 'react-blockies'

import { ethers } from 'ethers';

const Vote = () => {
  const account = useSelector(state => state.provider.account)
  const balance = useSelector(state => state.token.balance)
  const delegatorBalance = useSelector(state => state.delegatedDAO.delegatorBalance)
  const delegateeVotesReceived = useSelector(state => state.delegatedDAO.delegateeVotesReceived)
  const votingPeriodHours = useSelector(state => state.delegatedDAO.votingPeriodHours)
  const quorum = useSelector(state => state.delegatedDAO.quorum)
  const proposals = useSelector(state => state.delegatedDAO.proposals)

  useEffect(() => {
  }, [])

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

  // Status mapping function
  const mapStatus = status => {
    const statusCode = Number(status);

    switch(statusCode) {
      case 0:
        return 'Active';
      case 1:
        return 'Passed';
      case 2:
        return 'Failed';
      default:
        return 'Unknown';
    }
  }

  const upVoteHandler = async (e) => {
    e.preventDefault()

    // upVote(delegatedDAO, dispatch)
    //   .then(() => {
    //     window.location.reload();
    //   })
    //   .catch(err => console.error(err));
  }

  const downVoteHandler = async (e) => {
    e.preventDefault()

    // upVote(delegatedDAO, dispatch)
    //   .then(() => {
    //     window.location.reload();
    //   })
    //   .catch(err => console.error(err));
  }

  const finalizeHandler = async (e) => {
    e.preventDefault()

    // upVote(delegatedDAO, dispatch)
    //   .then(() => {
    //     window.location.reload();
    //   })
    //   .catch(err => console.error(err));
  }

  return (
    <>
      <h1 className='text-center'>Live Proposals</h1>
      <p className='text-center'>
        DAO members can express support or opposition for proposals by 'Upvoting' or 'Downvoting',
        <br />
        where each vote is weighted by a member's voting power (i.e. the number of tokens you hold).
        <br />
        <br />
        <strong>Proposal Finalization Requirements:</strong>
        <br />
        A proposal can only pass if it is finalized with a passing quorum during the voting period.
        <br />
        The voting period begins upon proposal creation, and is hard coded upon DAO creation.
        <br />
        <br />
        <strong>Voting Period:</strong> {account ? `${parseInt(votingPeriodHours).toLocaleString()} hours` : 'connect wallet'}
        <br />
        <strong>Quorum:</strong> {account ? `${parseInt(quorum).toLocaleString()} votes` : 'connect wallet'}
        <br />
        <br />
        {/* TODO: Update to add delegated voting power for delegatees */}
        <strong>Your Voting Power:</strong> {
          parseFloat(delegateeVotesReceived) > 0 ? (parseFloat(delegateeVotesReceived) + parseFloat(balance)).toLocaleString() :
          parseFloat(balance) > 0 ? parseFloat(balance).toLocaleString() :
          parseFloat(delegatorBalance) > 0 ? `${parseFloat(delegatorBalance).toLocaleString()} Delegated` :
          account ? '0' :
          'connect wallet'
        }
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
          {proposals.map((proposal, index) => (

            <tr key={index}>
              <td className='text-center'>
                {proposal.id.toString()}
              </td>
              <td className='text-center'>
                {proposal.title.toString()}
              </td>
              <td className='text-center'>
                {proposal.description.toString()}
              </td>
              <td className='text-center'>
                {parseInt(proposal.amount.toString()).toLocaleString()} CT
              </td>
              <td className='text-center'>
                <Blockies
                  seed={proposal.recipient.toString()}
                  size={10}
                  scale={3}
                  color='#e6e6e6'
                  bgColor='#000000'
                  spotColor='#ffffff'
                  className="identicon mx-2"
                />
                <OverlayTrigger
                  overlay={
                    <Tooltip id={`tooltip-${index}`}>
                      {proposal.recipient.toString()}
                    </Tooltip>
                  }
                >
                  <span>
                    {proposal.recipient.toString().slice(0, 6) + '...' + proposal.recipient.toString().slice(-4)}
                  </span>
                </OverlayTrigger>
              </td>
              <td className='text-center'>
                {parseInt(ethers.utils.formatEther(proposal.votes).split(".")[0]).toLocaleString()}
              </td>
              <td className='text-center'>
                {mapStatus(proposal.status)}
              </td>
              <td className='text-center'>
                {/* TODO: Add button + Redux handler */}
                {/* TODO: Change output depending on user: investor, non-investor */}
                <Button variant='primary' style={{ width: '100%' }} onClick={() => upVoteHandler(proposal.id)}>
                  👍
                </Button>
              </td>
              <td className='text-center'>
                {/* TODO: Add button + Redux handler */}
                {/* TODO: Change output depending on user: investor, non-investor */}
                <Button variant='primary' style={{ width: '100%' }} onClick={() => downVoteHandler(proposal.id)}>
                👎
                </Button>
              </td>
              <td className='text-center'>
                {/* TODO: Add button + Redux handler */}
                {/* TODO: Change output depending on user: investor, non-investor */}
                <Button variant='primary' style={{ width: '100%' }} onClick={() => finalizeHandler(proposal.id)}>
                    ⚖️
                  </Button>
              </td>
              <td className='text-center'>
                {new Date(proposal.timestamp.add(ethers.BigNumber.from(votingPeriodHours * 3600)).toNumber() * 1000).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

export default Vote
