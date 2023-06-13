import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import Table from 'react-bootstrap/Table'
import Blockies from 'react-blockies'

import { ethers } from 'ethers'

import {
  delegateVotes,
  undelegateVotes
} from '../store/interactions'

const Delegate = () => {
  const [delegate, setDelegate] = useState('')
  const [error, setError] = useState('')

  const [formKey, setFormKey] = useState(Math.random());

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
  const isUndelegating = useSelector(state => state.delegatedDAO.undelegating.isUndelegating)

  //-----------------------------------------------------------------------
  const delegateHandler = async (e) => {
    e.preventDefault()

    if (!ethers.utils.isAddress(delegate)) {
      setError('Invalid Ethereum address')
      return
    }

    // reset error message when the address is valid
    setError('')

    delegateVotes(provider, token, balance, delegatedDAO, delegate, dispatch)
      .then(() => {
        window.location.reload();
      })
      .catch(err => console.error(err));
  }

  const undelegateHandler = async (e) => {
    e.preventDefault()

    undelegateVotes(provider, delegatedDAO, dispatch)
      .then(() => {
        window.location.reload();
      })
      .catch(err => console.error(err));
  }

  //--------------------------------------------------------------------------

  useEffect(() => {
    if (!isDelegating && !error) {
      setDelegate('')
      setFormKey(Math.random());
    }
  }, [isDelegating, isUndelegating, error])

  return (
    <>
      <h1 className='text-center'>Delegate Votes</h1>

      <p className='text-center'>
        DAO members may delegate their voting power to another DAO member if they so choose. Delegated votes can be undelegated at any time.
        <br />
        <br />
        <strong>Delegation Requirements:</strong>
        <br />
        DAO members who have received delegation (delegatees) are unable to delegate the voting power they have accumulated.
        <br />
        Additionally, if you have delegated your voting power to another DAO member, you are unable to receive delegation from other members.
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
              className='d-flex justify-content-center align-items-center text-center'
              style={{ height: '300px' }}
            >
              You have received delegated voting power.
              <br/>
              You are unable to delegate your votes.
              <br/>
              <br/>
              (i.e. no chained delegation)
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
              Only DAO members may vote on proposals.
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
    </>
  )
}

export default Delegate
