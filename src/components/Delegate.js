import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import Table from 'react-bootstrap/Table'

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

  const undelegateHandler = async (e) => {
    e.preventDefault()
    setIsWaiting(true)
  }

  return (
    <>
      <h1 className='text-center'>Delegate Votes</h1>

      <p className='text-center'>
        DAO members may delegate their voting power to another DAO member if they so choose.
        <br />
        Delegated votes can be undelegated at any time.
      </p>

      <hr />
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

      <hr />
      <hr />
      <hr />

      <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th className='text-center'>Your Delegate</th>
          <th className='text-center'>Tokens Delegated</th>
        </tr>
      </thead>
      <tbody>
          <tr key={0}>
            <td className='text-center'>Delegate Address</td>
            <td className='text-center'># of Tokens Delegated</td>
          </tr>
      </tbody>
    </Table>
    <Form onSubmit={undelegateHandler}>
        <Form.Group style={{ maxWidth: '450px', margin: '50px auto' }}>
          {isWaiting ? (
            <Spinner animation='border' style={{ display: 'block', margin: '0 auto' }} />
          ) : (
            <Button variant='primary' type='submit' style={{ width: '100%' }}>
              Undelegate Votes
            </Button>
          )}
        </Form.Group>
      </Form>
    </>
  )
}

export default Delegate
