import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

import { ethers } from 'ethers'

import Alert from './Alert'

import {
  createProposal
} from '../store/interactions'

const Propose = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [recipient, setRecipient] = useState('')
  const [error, setError] = useState('')

  const [formKey, setFormKey] = useState(Math.random());

  const [showAlert, setShowAlert] = useState(false)

  const provider = useSelector(state => state.provider.connection)

  const account = useSelector(state => state.provider.account)
  const delegatedDAO = useSelector(state => state.delegatedDAO.contract)
  const isProposing = useSelector(state => state.delegatedDAO.proposing.isProposing)
  const isProposingSuccess = useSelector(state => state.delegatedDAO.proposing.isSuccess)
  const isProposingTxnHash = useSelector(state => state.delegatedDAO.proposing.transactionHash)

  const dispatch = useDispatch()

  const balance = useSelector(state => state.token.balance)
  const daoBalance = useSelector(state => state.token.daoBalance)
  const delegatorBalance = useSelector(state => state.delegatedDAO.delegatorBalance)

  const proposeHandler = async (e) => {
    e.preventDefault()

    setShowAlert(false) // Reset showAlert

    // Check if the recipient address is a valid Ethereum address.
    if (!ethers.utils.isAddress(recipient)) {
      setError('Invalid Ethereum address')
      return
    }

    // Reset error message when the address is valid
    setError('')

    // Dispatch the createProposal action
    createProposal(provider, delegatedDAO, title, description, amount, recipient, dispatch)

    setShowAlert(true) // Show alert after proposing
  }

  // Use the useEffect hook to reset form fields after proposing
  useEffect(() => {
    if (!isProposing && !error) {
      setTitle('')
      setDescription('')
      setAmount(0)
      setRecipient('')
      setFormKey(Math.random());
    }
  }, [isProposing, error])

  return (
    <>
      <h1 className='text-center'>Create Proposal</h1>

      {/* Display the DAO's rules and the DAO Treasury balance */}
      <p className='text-center'>
        DAO members can create new proposals to be voted on by the DAO.
        <br />
        Proposals can be voted on to distribute (CT) tokens held in the DAO treasury to individuals who wish to provide services to the DAO.
        <br />
        <br />
        <strong>Proposal Requirements:</strong>
        <br />
        1. The DAO treasury must hold enough tokens to cover the amount proposed.
        <br />
        <br />
        <strong>DAO Treasury:</strong> {account ? `${parseInt(daoBalance).toLocaleString()} CT` : 'connect wallet'}
      </p>

      <hr />

      <Card style={{ maxWidth: '450px' }} className='mx-auto px-4'>
        {account && (balance > 0 || delegatorBalance > 0) ? (
          // If the user is a DAO member, show the proposal creation form
          <Form key={formKey} onSubmit={proposeHandler}>
            {/* Form fields: title, description, amount, recipient */}
            <Form.Group style={{ maxWidth: '450px', margin: '50px auto' }}>
              <Form.Control
                type='text'
                placeholder='Enter title'
                className='my-2'
                onChange={(e) => {
                  setTitle(e.target.value)
                }}
              />
              <Form.Control
                type='text'
                placeholder='Enter description'
                className='my-2'
                onChange={(e) => {
                  setDescription(e.target.value)
                }}
              />
              <Form.Control
                type='number'
                placeholder='Enter token amount (without decimals)'
                className='my-2'
                min={0}
                onChange={(e) => {
                  let value = parseInt(e.target.value, 10);
                  if (isNaN(value) || value < 0) {
                      value = 0;
                  }
                  setAmount(value);
                }}
              />
              <Form.Control
                type='text'
                placeholder='Enter recipient address'
                className='my-2'
                isInvalid={!!error}
                onChange={(e) => {
                  setRecipient(e.target.value)
                }}
              />
              <Form.Control.Feedback type='invalid'>{error}</Form.Control.Feedback>
              {isProposing ? (
                <Spinner animation='border' style={{ display: 'block', margin: '0 auto' }} />
              ) : (
                <Button variant='primary' type='submit' style={{ width: '100%' }}>
                  Create Proposal
                </Button>
              )}
            </Form.Group>
          </Form>
        ) : account ? (
          // If the user is not a DAO member, display a message
          <p
            className='d-flex justify-content-center align-items-center'
            style={{ height: '300px' }}
          >
            Not a DAO member.
          </p>
        ) : (
          // If no account is connected, ask the user to connect their wallet
          <p
            className='d-flex justify-content-center align-items-center'
            style={{ height: '300px' }}
          >
            Please connect wallet.
          </p>
        )}
      </Card>

      {isProposing ? (
        // If a proposal is currently being made, show a pending alert
        <Alert
          message={'Proposal Pending...'}
          transactionHash={null}
          variant={'info'}
          setShowAlert={setShowAlert}
        />
      ) : isProposingSuccess && showAlert ? (
        // If the proposal was successfully made, show a success alert
        <Alert
          message={'Proposal Successful...'}
          transactionHash={isProposingTxnHash}
          variant={'success'}
          setShowAlert={setShowAlert}
        />
      ) : !isProposingSuccess && showAlert ? (
        // If the proposal failed, show a failure alert
        <Alert
          message={'Proposal Failed...'}
          transactionHash={null}
          variant={'danger'}
          setShowAlert={setShowAlert}
        />
      ) : (
        // If there are no proposals, don't show an alert
        <></>
      )}
    </>
  )
}

export default Propose
