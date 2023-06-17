import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import Table from 'react-bootstrap/Table'
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Blockies from 'react-blockies'

import { ethers } from 'ethers';

const History = () => {
  const proposals = useSelector(state => state.delegatedDAO.proposals)

  useEffect(() => {
  }, [])

  // Table headings
  const headers = [
    '#',
    'Title',
    'Description',
    'Amount',
    'Recipient',
    'Votes',
    'Status',
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

  return (
    <>
      <h1 className='text-center'>Proposal History</h1>

      <p className='text-center'>
        Below are all proposals that have been finalized by the DAO.
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
        {proposals.filter(proposal => Number(proposal.status) === 1 || Number(proposal.status) === 2).map((proposal, index) => {
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
              <td className='d-flex align-items-center justify-content-center'>
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
                {mapStatus(proposal.status)}
              </td>
            </tr>
          )
        })}
        </tbody>
      </Table>
    </>
  )
}

export default History
