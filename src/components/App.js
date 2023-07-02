import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'

// Components
import Navigation from './Navigation';
import Loading from './Loading';

// ABIs: Import your contract ABIs here
 import DAO_ABI from '../abis/DAO.json'

// Config: Import your network config here
 import config from '../config.json';

function App() {
  const [account, setAccount] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dao, setDao] = useState(null)
  const [treasuryBalance, setTreasuryBalance] = useState(0)

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)

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

      <h1 className='my-4 text-center'>Welcom to our DAO</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <hr/>
          <p className='text-center'><strong>Treasury Balance:</strong> {treasuryBalance} ETH</p>
          <hr/>
        </>
      )}
    </Container>
  )
}

export default App;
