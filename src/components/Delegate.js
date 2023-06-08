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

  const delegates = []

  // Table headings
  const headers = [
    'Delegate Address',
    'Votes Received'
  ]

  return (
    <>
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

      <h2 className='my-4 text-center'>Current Delegates</h2>

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
        {delegates.map((proposal, index) => (
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

export default Delegate
