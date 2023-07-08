import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'

// Components
import Navigation from './Navigation';
import Loading from './Loading';
import Create from './Create';
import Proposals from './Proposals';

// ABIs: Import your contract ABIs here
 import DAO_ABI from '../abis/DAO.json'

// Config: Import your network config here
 import config from '../config.json';



function App() {

  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dao, setDao] = useState(null)
  const [treasuryBalance, setTreasuryBalance] = useState(0)

  const [proposals, setProposals] = useState(null)
  const [quorum, setQuorum] = useState(null)
  const [votes, setVotes] = useState(null)

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    // Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    // Load DAO contract
    //const chainID = provider.getNetwork
    const { chainId } = await provider.getNetwork()
    const dao = new ethers.Contract(config[chainId].dao.address, DAO_ABI, provider)
    setDao(dao)

    //Fetch treasury balance
    let treasuryBalance = await provider.getBalance(dao.address)
    treasuryBalance = ethers.utils.formatUnits(treasuryBalance, 18)
    setTreasuryBalance(treasuryBalance)

    //Fetch proposals count
    const count = await dao.proposalCount()
    const items = []
    const votes = []
    for(var i=1; i <= count; i++){
      //Fetch proposals
      const proposal = await dao.proposals(i)

      //Fetch votes
      const vote = await dao.votes(account,i)

      votes.push(vote)
      items.push(proposal)
    }
    setProposals(items)
    setVotes(votes)

    // fetch quorum
    setQuorum(await dao.quorum())
    setIsLoading(false)
  }

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading]);

  return(
    <Container>
      <Navigation account={account} />

      <h1 className='my-4 text-center'>Welcome to our DAO</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Create provider={provider} dao={dao} setIsLoading={setIsLoading}/>
          <hr/>
          <p className='text-center'><strong>Treasury Balance:</strong> {treasuryBalance} ETH</p>
          <hr/>
          <Proposals provider={provider} dao={dao} proposals={proposals} quorum={quorum} votes={votes} setIsLoading={setIsLoading}  />
        </>
      )}
    </Container>
  )
}

export default App;
