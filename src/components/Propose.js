import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

import { ethers } from 'ethers'

import {
  createProposal
} from '../store/interactions'

const Propose = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [recipient, setRecipient] = useState('')
  const [error, setError] = useState('')

  const provider = useSelector(state => state.provider.connection)

  const account = useSelector(state => state.provider.account)
  const delegatedDAO = useSelector(state => state.delegatedDAO.contract)
  const isProposing = useSelector(state => state.delegatedDAO.proposing.isProposing)

  const dispatch = useDispatch()

  const balance = useSelector(state => state.token.balance)
  const delegatorBalance = useSelector(state => state.delegatedDAO.delegatorBalance)

  const proposeHandler = async (e) => {
    e.preventDefault()

    if (!ethers.utils.isAddress(recipient)) {
      setError('Invalid Ethereum address')
      return
    }

    setError('') // reset error message when the address is valid

    createProposal(provider, delegatedDAO, title, description, amount, recipient, dispatch)
    // setIsWaiting(true)
  }

  useEffect(() => {
  }, [])

  return (
    <>
      <h1 className='text-center'>Create Proposal</h1>

      <p className='text-center'>
        Create a new proposal to be voted on by the DAO.
      </p>

      <hr />

      <Card style={{ maxWidth: '450px' }} className='mx-auto px-4'>
        {account && (balance > 0 || delegatorBalance > 0) ? (
          <Form onSubmit={proposeHandler}>
            <Form.Group style={{ maxWidth: '450px', margin: '50px auto' }}>
              <Form.Control
                type='text'
                placeholder='Enter title'
                className='my-2'
                onChange={(e) => {
                  setTitle(e.target.value)
                  // console.log(`Set Title handler: ${title}`)
                }}
              />
              <Form.Control
                type='text'
                placeholder='Enter description'
                className='my-2'
                onChange={(e) => {
                  setDescription(e.target.value)
                  // console.log(`Set Description handler: ${description}`)
                }}
              />
              <Form.Control
                type='number'
                placeholder='Enter amount'
                className='my-2'
                min={0}
                onChange={(e) => {
                  let value = parseInt(e.target.value, 10);
                  if (isNaN(value) || value < 0) {
                      value = 0;
                  }
                  setAmount(value);
                  // console.log(`Set Number handler: ${amount}`);
                }}
              />
              <Form.Control
                type='text'
                placeholder='Enter recipient address'
                className='my-2'
                isInvalid={!!error}
                onChange={(e) => {
                  setRecipient(e.target.value)
                  // console.log(`Set Address handler: ${recipient}`)
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
          <p
            className='d-flex justify-content-center align-items-center'
            style={{ height: '300px' }}
          >
            Not a DAO member.
          </p>
        ) : (
          <p
            className='d-flex justify-content-center align-items-center'
            style={{ height: '300px' }}
          >
            Please connect wallet.
          </p>
        )}
      </Card>
    </>
  )
}

export default Propose
