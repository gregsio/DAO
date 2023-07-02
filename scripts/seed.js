// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const config = require('../src/config.json')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
  }
  
  const ether = tokens

async function main() {

    let transaction, result

    // Setup accounts
    accounts = await ethers.getSigners()
    funder = accounts[0]
    investor1 = accounts[1]
    investor2 = accounts[2]
    investor3 = accounts[3]
    recipient = accounts[4]

    // Fetch token contract and distribute tokens
    const { chainId } = await ethers.provider.getNetwork()

    const token = await ethers.getContractAt('Token', config[chainId].token.address)
    console.log(`Token fetched: ${token.address}\n`)

    // Distribute tokens to investors - each get 20% of the total supply
    console.log(`Distributing tokens`)

    transaction = await token.transfer(investor1.address, tokens(200000))
    transaction.wait()

    transaction = await token.transfer(investor2.address, tokens(200000))
    transaction.wait()

    transaction = await token.transfer(investor3.address, tokens(200000))
    transaction.wait()
    
    const dao = await ethers.getContractAt('DAO',config[chainId].dao.address)
    console.log(`DAO fetched: ${token.address}\n`)
    
    // Fund the DAO
    console.log('Funding the DAO')
    transaction =  await funder.sendTransaction({to: dao.address, value: ether(1000)});
    transaction.wait()

    // Creating proposals
    console.log('Creating proposals')
    for(var i=0; i<3; i++){
        console.log(`Create proposal ${i +1}`)
        transaction = await dao.connect(investor1).createProposal(`Proposal ${i +1} `, ether(100), recipient.address)
        transaction.wait()

        console.log(`Vote proposal ${i +1}`)
        transaction = await dao.connect(investor1).vote(i+1)
        transaction.wait()
        transaction = await dao.connect(investor2).vote(i+1)
        transaction.wait()
        transaction = await dao.connect(investor3).vote(i+1)
        transaction.wait()

        console.log(`Finalize proposal ${i +1}`)
        transaction = await dao.connect(investor1).finalizeProposal(i + 1)
        transaction.wait()
    }

    console.log('Creating one more  proposal')
    transaction = await dao.connect(investor1).createProposal('Proposal 4', ether(100), recipient.address)
    transaction.wait()

    transaction = await dao.connect(investor1).vote(4)
    transaction.wait()

    transaction = await dao.connect(investor2).vote(4)
    result = transaction.wait()

    console.log(`Finished.\n`)
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
