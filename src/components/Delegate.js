import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import Table from 'react-bootstrap/Table'
import Blockies from 'react-blockies'

import { ethers } from 'ethers'

import Alert from './Alert'

import {
  delegateVotes,
  undelegateVotes
} from '../store/interactions'

const Delegate = () => {
  const [delegate, setDelegate] = useState('')
  const [error, setError] = useState('')

  const [formKey, setFormKey] = useState(Math.random());

  const [showAlert, setShowAlert] = useState(false)

  const dispatch = useDispatch()

  const provider = useSelector(state => state.provider.connection)
  const account = useSelector(state => state.provider.account)
  const balance = useSelector(state => state.token.balance)
  const token = useSelector(state => state.token.contract)
  const delegatedDAO = useSelector(state => state.delegatedDAO.contract)
  const delegatorDelegatee = useSelector(state => state.delegatedDAO.delegatorDelegatee)
  const delegatorBalance = useSelector(state => state.delegatedDAO.delegatorBalance)
  const delegateeVotesReceived = useSelector(state => state.delegatedDAO.delegateeVotesReceived)

  const isDelegating = useSelector(state => state.delegatedDAO.delegating.isDelegating)
  const isDelegatingSuccess = useSelector(state => state.delegatedDAO.delegating.isSuccess)
  const isDelegatingTxnHash = useSelector(state => state.delegatedDAO.delegating.transationHash)
  const isUndelegating = useSelector(state => state.delegatedDAO.undelegating.isUndelegating)
  const isUndelegatingSuccess = useSelector(state => state.delegatedDAO.undelegating.isSuccess)
  const isUndelegatingTxnHash = useSelector(state => state.delegatedDAO.undelegating.transactionHash)

  const delegateHandler = async (e) => {
    e.preventDefault()
    setShowAlert(false)

    if (!ethers.utils.isAddress(delegate)) {
      setError('Invalid Ethereum address')
      return
    }

    setError('')

    const success = await delegateVotes(provider, token, balance, delegatedDAO, delegate, dispatch)

    if (success) {
      window.location.reload()
    }

    setShowAlert(true)
  }

  const undelegateHandler = async (e) => {
    e.preventDefault()

    setShowAlert(false)

    const success = await undelegateVotes(provider, delegatedDAO, dispatch)

    if (success) {
      window.location.reload()
    }

    setShowAlert(true)
  }

  useEffect(() => {
    if (!isDelegating && !error) {
      setDelegate('')
      setFormKey(Math.random());
    }
  }, [isDelegating, error])

  return (
    <>
      <h1 className='text-center'>Delegate Votes</h1>

      <p className='text-center'>
        DAO members may delegate their voting power to another DAO member to vote on their behalf.
        <br />
        Delegated votes can be undelegated at any time.
        <br />
        <br />
        <strong>Delegation Requirements:</strong>
        <br />
        1. Delegators (DAO members who have delegated their votes) are unable to receive delegation.
        <br />
        2. Delegatees (DAO members who have received delegation) are unable to delegate accumulated votes.
        <br />
        <br />
        <strong>Your Votes:</strong> {
          parseFloat(balance) > 0 ? parseFloat(balance).toLocaleString() :
          parseFloat(delegatorBalance) > 0 ? `${parseFloat(delegatorBalance).toLocaleString()} Delegated` :
          account ? '0' :
          'connect wallet'
        }
      </p>

      <hr />

      {
        (Number(balance) > 0 && Number(delegateeVotesReceived) === 0 && Number(delegatorBalance) === 0) ?
      (
        <>
          {/* User is investor, has not received delegation, and has not delegated their votes - allow Delegation */}

          <Card style={{ maxWidth: '450px' }} className='mx-auto px-4'>
            <Form key={formKey} onSubmit={delegateHandler}>
              <Form.Group style={{ maxWidth: '450px', margin: '50px auto' }}>
                <Form.Control
                  type='text'
                  placeholder='Enter delegate address'
                  className='my-2'
                  isInvalid={!!error}
                  onChange={(e) => {
                    setDelegate(e.target.value)
                  }}
                />
                <Form.Control.Feedback type='invalid'>{error}</Form.Control.Feedback>
                {isDelegating ? (
                <Spinner animation='border' style={{ display: 'block', margin: '0 auto' }} />
                ) : (
                  <Button variant='primary' type='submit' style={{ width: '100%' }}>
                    Delegate Votes
                  </Button>
                )}
              </Form.Group>
            </Form>
          </Card>
        </>
      ) : Number(delegatorBalance) > 0 ? (
        <>
          {/* User has delegated - allow Undelegation*/}

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th className='text-center'>Your Delegate</th>
                <th className='text-center'>Tokens Delegated</th>
              </tr>
            </thead>
            <tbody>
                <tr key={0}>
                <td className='d-flex align-items-center justify-content-center'>
                    <Blockies
                      seed={delegatorDelegatee}
                      size={10}
                      scale={3}
                      color='#e6e6e6'
                      bgColor='#000000'
                      spotColor='#ffffff'
                      className="identicon mx-2"
                    />
                    {delegatorDelegatee}
                  </td>
                  <td className='text-center'>
                    {parseInt(delegatorBalance).toLocaleString()} CT
                  </td>
                </tr>
            </tbody>
          </Table>
          <Form onSubmit={undelegateHandler}>
            <Form.Group style={{ maxWidth: '450px', margin: '25px auto' }}>
              {isUndelegating ? (
                <Spinner animation='border' style={{ display: 'block', margin: '0 auto' }} />
              ) : (
                <Button variant='primary' type='submit' style={{ width: '100%' }}>
                  Undelegate Votes
                </Button>
              )}
            </Form.Group>
          </Form>
        </>

      ) : Number(delegateeVotesReceived) > 0 ? (
        <>
          {/* User is delegatee - no delegation allowed */}

          <Card style={{ maxWidth: '450px' }} className='mx-auto px-4'>
            <p
              className='d-flex flex-column justify-content-center align-items-center text-center'
              style={{ height: '300px' }}
            >
              You have received delegated voting power.
              <br/>
              You are unable to delegate your votes.
              <br/>
              <br/>
              (i.e. no chained delegation)
              <br />
              <br />
              -
              <br />
              <br />
              <strong>Votes Received:</strong>
              {parseInt(delegateeVotesReceived).toLocaleString()} CT
            </p>
          </Card>
        </>

      ) : account ? (
        <>
          {/* User is not DAO member - no delegation/undelegation functionality */}

          <Card style={{ maxWidth: '450px' }} className='mx-auto px-4'>
            <p
              className='d-flex justify-content-center align-items-center text-center'
              style={{ height: '300px' }}
            >
              Not a DAO member.
            </p>
          </Card>
        </>
      ) : (
        <>
          {/* No user connected to site */}

          <Card style={{ maxWidth: '450px' }} className='mx-auto px-4'>
            <p
              className='d-flex justify-content-center align-items-center text-center'
              style={{ height: '300px' }}
            >
              Please connect wallet.
            </p>
          </Card>
        </>
      )}

      {isDelegating || isUndelegating ? (
        <Alert
          message={'Transaction Pending...'}
          transactionHash={null}
          variant={'info'}
          setShowAlert={setShowAlert}
        />
      ) : (isDelegatingSuccess || isUndelegatingSuccess) && showAlert ? (
        <Alert
          message={'Transaction Successful...'}
          transactionHash={isDelegatingSuccess ? isDelegatingTxnHash : isUndelegatingTxnHash}
          variant={'success'}
          setShowAlert={setShowAlert}
        />
      ) : (!isDelegatingSuccess || !isUndelegatingSuccess) && showAlert ? (
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

export default Delegate
