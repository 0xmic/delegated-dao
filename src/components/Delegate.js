import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

import { ethers } from 'ethers'

const Delegate = () => {
  const [delegate, setDelegate] = useState('')
  const [isWaiting, setIsWaiting] = useState(false)
  const [error, setError] = useState('')

  const delegateHandler = async (e) => {
    e.preventDefault()

    if (!ethers.utils.isAddress(delegate)) {
      setError('Invalid Ethereum address')
      return
    }

    setIsWaiting(true)
    setError('') // reset error message when the address is valid
  }

  return (
    <Form onSubmit={delegateHandler}>
      <Form.Group style={{ maxWidth: '450px', margin: '50px auto' }}>
        <Form.Control
          type='text'
          placeholder='Enter delegate address'
          className='my-2'
          isInvalid={!!error}
          onChange={(e) => {
            setDelegate(e.target.value)
            console.log(`Set Delegate handler: ${delegate}`)
          }}
        />
        <Form.Control.Feedback type='invalid'>{error}</Form.Control.Feedback>
        {isWaiting ? (
          <Spinner animation='border' style={{ display: 'block', margin: '0 auto' }} />
        ) : (
          <Button variant='primary' type='submit' style={{ width: '100%' }}>
            Delegate Votes
          </Button>
        )}
      </Form.Group>
    </Form>
  )
}

export default Delegate
