import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import Blockies from 'react-blockies'

import { ethers } from 'ethers'

import Alert from './Alert'

import {
  upVote,
  downVote,
  finalizeProposal
} from '../store/interactions'

const Vote = () => {
  const dispatch = useDispatch()

  const [showAlert, setShowAlert] = useState(false)

  const [loadingUpVoteId, setLoadingUpVoteId] = useState(null);
  const [loadingDownVoteId, setLoadingDownVoteId] = useState(null);
  const [loadingFinalizeId, setLoadingFinalizeId] = useState(null);

  const provider = useSelector(state => state.provider.connection)
  const account = useSelector(state => state.provider.account)
  const balance = useSelector(state => state.token.balance)
  const daoBalance = useSelector(state => state.token.daoBalance)
  const delegatedDAO = useSelector(state => state.delegatedDAO.contract)
  const delegatorBalance = useSelector(state => state.delegatedDAO.delegatorBalance)
  const delegateeVotesReceived = useSelector(state => state.delegatedDAO.delegateeVotesReceived)
  const votingPeriodHours = useSelector(state => state.delegatedDAO.votingPeriodHours)
  const quorum = useSelector(state => state.delegatedDAO.quorum)
  const proposals = useSelector(state => state.delegatedDAO.proposals)
  const userVotes = useSelector(state => state.delegatedDAO.userVotes)

  const isUpVoting = useSelector(state => state.delegatedDAO.upVoting.isUpVoting)
  const isUpVotingSuccess = useSelector(state => state.delegatedDAO.upVoting.isSuccess)
  const isUpVotingTxnHash = useSelector(state => state.delegatedDAO.upVoting.transationHash)
  const isDownVoting = useSelector(state => state.delegatedDAO.downVoting.isDownVoting)
  const isDownVotingSuccess = useSelector(state => state.delegatedDAO.downVoting.isSuccess)
  const isDownVotingTxnHash = useSelector(state => state.delegatedDAO.downVoting.transactionHash)
  const isFinalizing = useSelector(state => state.delegatedDAO.finalizing.isFinalizing)
  const isFinalizingSuccess = useSelector(state => state.delegatedDAO.finalizing.isSuccess)
  const isFinalizingTxnHash = useSelector(state => state.delegatedDAO.finalizing.transactionHash)

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

  const upVoteHandler = async (e, id) => {
    e.preventDefault()
    setShowAlert(false)
    setLoadingUpVoteId(id)

    const success = await upVote(provider, delegatedDAO, id, dispatch)
    setLoadingUpVoteId(null)

    if (success) {
      window.location.reload()
    }

    setShowAlert(true)
  }

  const downVoteHandler = async (e, id) => {
    e.preventDefault()
    setShowAlert(false)
    setLoadingDownVoteId(id)

    const success = await downVote(provider, delegatedDAO, id, dispatch)
    setLoadingDownVoteId(null)

    if (success) {
      window.location.reload()
    }

    setShowAlert(true)
  }

  const finalizeHandler = async (e, id) => {
    e.preventDefault()
    setShowAlert(false)
    setLoadingFinalizeId(id)

    const success = await finalizeProposal(provider, delegatedDAO, id, dispatch)
    setLoadingFinalizeId(null)

    if (success) {
      window.location.reload()
    }

    setShowAlert(true)
  }

  // Timestamp is in seconds, so convert it to milliseconds for JS
  const isExpired = proposal =>
    Date.now() > proposal.timestamp.add(ethers.BigNumber.from(votingPeriodHours * 3600)).toNumber() * 1000

  return (
    <>
      <h1 className='text-center'>Live Proposals</h1>
      <p className='text-center'>
        DAO members can express support or opposition for proposals by 'Upvoting' or 'Downvoting',
        <br />
        where each vote is weighted by a member's voting power (i.e. the number of tokens you hold).
        <br />
        <br />
        <strong>Voting Requirements:</strong>
        <br />
        1. DAO members who have not delegated their votes are eligible to vote on proposals.
        <br />
        2. Votes must be made within the voting period (established upon proposal creation).
        <br />
        <br />
        <strong>Finalization Requirements:</strong>
        <br />
        1. All DAO member (delegated or not) can finalize proposals.
        <br />
        2. Proposals can be finalized as Passed if they reach quorum within the voting period.
        <br />
        3. Proposals can only finalize as Failed after expiration, regardless or votes received.
        <br />
        <br />
        <strong>Voting Period:</strong> {account ? `${parseInt(votingPeriodHours).toLocaleString()} hrs · ` : 'connect wallet · '}
        <strong>DAO Treasury:</strong> {account ? `${parseInt(daoBalance).toLocaleString()} CT · ` : 'connect wallet · '}
        <strong>Quorum:</strong> {account ? `${parseInt(quorum).toLocaleString()} votes` : 'connect wallet'}
        <br />
        <br />
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
          {proposals.filter(proposal => Number(proposal.status) === 0).map((proposal, index) => {
            const isFinalized = proposal.status === 0 ? 0 : 1
            const canVote = parseFloat(delegateeVotesReceived) > 0 || parseFloat(balance) > 0
            const canFinalize = parseFloat(delegateeVotesReceived) > 0 || parseFloat(balance) > 0 || parseFloat(delegatorBalance) > 0

            return (
              <tr key={index}>
              <td className='text-center align-middle'>
                {proposal.id.toString()}
              </td>
              <td className='text-center align-middle'>
                {proposal.title.toString()}
              </td>
              <td className='text-center align-middle'>
                {proposal.description.toString()}
              </td>
              <td className='text-center align-middle'>
              {parseInt(ethers.utils.formatUnits(proposal.amount, 18).split('.')[0]).toLocaleString()} CT
              </td>
              <td style={{padding: 12}} className='d-flex align-items-center justify-content-center'>
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
              <td className='text-center align-middle'>
                {parseInt(ethers.utils.formatEther(proposal.votes).split(".")[0]).toLocaleString()}
              </td>
              <td className='text-center align-middle'>
                {isExpired(proposal) && Number(proposal.status) === 0 ? 'Expired' : mapStatus(proposal.status)}
              </td>
              <td className='text-center align-middle'>
              {!isFinalized && canVote && !userVotes[proposal.id] &&
                Date.now() < proposal.timestamp.add(ethers.BigNumber.from(votingPeriodHours * 3600)).toNumber() * 1000 && (
                loadingUpVoteId === proposal.id ?
                  <Spinner animation='border' style={{ display: 'block', margin: '0 auto' }} /> :
                  <Button variant='primary' style={{ width: '100%' }} onClick={(e) => upVoteHandler(e, proposal.id)}>
                    👍
                  </Button>
              )}
              </td>
              <td className='text-center align-middle'>
                {!isFinalized && canVote && !userVotes[proposal.id] &&
                  Date.now() < proposal.timestamp.add(ethers.BigNumber.from(votingPeriodHours * 3600)).toNumber() * 1000 && (
                  loadingDownVoteId === proposal.id ?
                    <Spinner animation='border' style={{ display: 'block', margin: '0 auto' }} /> :
                    <Button variant='primary' style={{ width: '100%' }} onClick={(e) => downVoteHandler(e, proposal.id)}>
                      👎
                    </Button>
                )}
              </td>
              <td className='text-center align-middle'>
                {!isFinalized && canFinalize &&
                  parseFloat(ethers.utils.formatUnits(proposal.votes, 18).toString()) >=  quorum &&
                  parseFloat(ethers.utils.formatUnits(proposal.amount, 18).toString()) <= parseFloat(daoBalance.toString()) &&
                  Date.now() < proposal.timestamp.add(ethers.BigNumber.from(votingPeriodHours * 3600)).toNumber() * 1000 && (
                  loadingFinalizeId === proposal.id ?
                    <Spinner animation='border' style={{ display: 'block', margin: '0 auto' }} /> :
                    <Button variant='primary' style={{ width: '100%' }} onClick={(e) => finalizeHandler(e, proposal.id)}>
                      ✅
                    </Button>
                )}
                {!isFinalized && canFinalize &&
                  Date.now() >= proposal.timestamp.add(ethers.BigNumber.from(votingPeriodHours * 3600)).toNumber() * 1000 && (
                  loadingFinalizeId === proposal.id ?
                    <Spinner animation='border' style={{ display: 'block', margin: '0 auto' }} /> :
                    <Button variant='primary' style={{ width: '100%' }} onClick={(e) => finalizeHandler(e, proposal.id)}>
                      ❌
                    </Button>
                )}
              </td>
              <td className='text-center align-middle'>
                {new Date(proposal.timestamp.add(ethers.BigNumber.from(votingPeriodHours * 3600)).toNumber() * 1000).toLocaleString()}
              </td>
            </tr>
            )
          })}
        </tbody>
      </Table>

      {isUpVoting || isDownVoting || isFinalizing ? (
        <Alert
          message={'Transaction Pending...'}
          transactionHash={null}
          variant={'info'}
          setShowAlert={setShowAlert}
        />
      ) : (isUpVotingSuccess || isDownVotingSuccess || isFinalizingSuccess) && showAlert ? (
        <Alert
          message={'Transaction Successful...'}
          transactionHash={isUpVotingSuccess ? isUpVotingTxnHash : isDownVotingSuccess ? isDownVotingTxnHash : isFinalizingTxnHash}
          variant={'success'}
          setShowAlert={setShowAlert}
        />
      ) : (!isUpVotingSuccess || !isDownVotingSuccess || !isFinalizingSuccess) && showAlert ? (
        <Alert
          message={'Transaction Failed...'}
          transactionHash={null}
          variant={'danger'}
          setShowAlert={setShowAlert}
        />
      ) : (
        <></>
      )}
    </>
  )
}

export default Vote
