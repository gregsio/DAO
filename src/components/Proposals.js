import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import { ethers } from 'ethers'

import done from '../img/done-25.png';
import Progress from './Progress';


const Proposals = ({provider, dao, proposals, quorum, setIsLoading}) => {

    const voteHandler = async (_id, approve = true) => {
        try{
            const signer = await provider.getSigner()
            const transaction = approve?
              await dao.connect(signer).vote(_id):
              await dao.connect(signer).downvote(_id)
            
              await transaction.wait()
        } catch{
            window.alert('User rejected or transaction reverted')
        }
        setIsLoading(true)
    }

    const finalizeHandler = async (_id) => {
        try{
            const signer = await provider.getSigner()
            const transaction = await dao.connect(signer).finalizeProposal(_id)
            await transaction.wait()
        } catch{
            window.alert('User rejected or transaction reverted')
        }
        setIsLoading(true)
    } 

    return(<>
        <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>#</th>
          <th>Proposal Name</th>
          <th>Recipient Address</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Total Votes</th>
          <th>Quorum</th>
          <th>Cast Vote</th>
          <th>Finalize</th>
        </tr>
      </thead>
      <tbody>
        {proposals.map((proposal, index) => (
          <tr key={index} className='text-center ' style={{padding: '1em'}}>
            <td>{proposal.id.toString()}</td>
            <td>{proposal.name}</td>
            <td>{proposal.recipient}</td>
            <td>{ethers.utils.formatUnits(proposal.amount, "ether")} ETH</td>
            <td>{proposal.finalized ? 'Approved' : 'In Progress'}</td>
            <td>{proposal.votes.toString()}</td>
            <td><Progress votes={proposal.votes} quorum={quorum}  /></td>

            <td>
                {!proposal.finalized && (
                  <Button
                    variant="success"
                    style={{ margin: '0.1em' }}
                    onClick={ () => {voteHandler(proposal.id)}}
                  >
                    Approve
                  </Button>
                )}
              
                {!proposal.finalized && (
                  <Button
                    variant="danger"
                    style={{ margin: '0.1em'}}
                    onClick={ () => {voteHandler(proposal.id, false)}}
                  >
                    Reject
                  </Button>
                )}
           </td>
            <td>
              {!proposal.finalized && proposal.votes >= quorum && (
                <Button
                  variant="primary"
                  style={{ width: '100%' }}
                  onClick={ () => {finalizeHandler(proposal.id)}}
                >
                  Finalize
                </Button>
              )}
              {proposal.finalized && (
                  <img src={done} alt='finalized'/>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
    
    </>)
}

export default Proposals;
