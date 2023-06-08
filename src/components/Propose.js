import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

import { ethers } from 'ethers'

const Propose = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [recipient, setRecipient] = useState('')
  const [error, setError] = useState('')

  const [isWaiting, setIsWaiting] = useState(false)

  const createHandler = async (e) => {
    e.preventDefault()

    if (!ethers.utils.isAddress(recipient)) {
      setError('Invalid Ethereum address')
      return
    }

    setIsWaiting(true)
    setError('') // reset error message when the address is valid
  }

  return (
    <Form onSubmit={createHandler}>
      <Form.Group style={{ maxWidth: '450px', margin: '50px auto' }}>
        <Form.Control
          type='text'
          placeholder='Enter title'
          className='my-2'
          onChange={(e) => {
            setTitle(e.target.value)
            console.log(`Set Title handler: ${title}`)
          }}
        />
        <Form.Control
          type='text'
          placeholder='Enter description'
          className='my-2'
          onChange={(e) => {
            setDescription(e.target.value)
            console.log(`Set Description handler: ${description}`)
          }}
        />
        <Form.Control
          type='number'
          placeholder='Enter amount'
          className='my-2'
          min={0}
          onChange={(e) => {
            const value = e.target.value;
            if (value < 0) {
                e.target.value = 0;
            }
            setAmount(e.target.value)
            console.log(`Set Number handler: ${amount}`);
          }}
        />
        <Form.Control
          type='text'
          placeholder='Enter recipient address'
          className='my-2'
          isInvalid={!!error}
          onChange={(e) => {
            setRecipient(e.target.value)
            console.log(`Set Address handler: ${recipient}`)
          }}
        />
        <Form.Control.Feedback type='invalid'>{error}</Form.Control.Feedback>
        {isWaiting ? (
          <Spinner animation='border' style={{ display: 'block', margin: '0 auto' }} />
        ) : (
          <Button variant='primary' type='submit' style={{ width: '100%' }}>
            Create Proposal
          </Button>
        )}
      </Form.Group>
    </Form>
  )
}

export default Propose
