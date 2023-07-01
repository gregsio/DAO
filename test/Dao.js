const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('Token', () => {
  let token, dao, accounts, deployer, funder,
  investor1, investor2, investor3, investor4, investor5, user

  beforeEach(async () => {

    //Setup Accounts
    accounts = await ethers.getSigners()

    deployer = accounts[0]
    funder = accounts[1]
    recipient = accounts[2]
    investor1 = accounts[3]
    investor2 = accounts[4]
    investor3 = accounts[5]
    investor4 = accounts[6]
    investor5 = accounts[7]
    user = accounts[8]

    //Deploy Token
    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('SyZyGy', 'CZG', '1000000')

    //Send tokens to investors - each one get 20% of the total supply
    await token.connect(deployer).transfer(investor1.address, tokens(200000))
    await token.connect(deployer).transfer(investor2.address, tokens(200000))
    await token.connect(deployer).transfer(investor3.address, tokens(200000))
    await token.connect(deployer).transfer(investor4.address, tokens(200000))
    await token.connect(deployer).transfer(investor5.address, tokens(200000))


    //Deploy DAO
    //set Quorum to > 50%  of token supply
    //500k tokens + 1 wei, i.e. 500000000000000000000001
    const DAO = await ethers.getContractFactory('DAO')
    dao = await DAO.deploy(token.address, '500000000000000000000001')

    //Funders send 100 Ether to DAO treasury
    await funder.sendTransaction({to: dao.address, value: ether(100)})

  })

  describe('Deployment', () => {
    const quorum = '500000000000000000000001'

    // it('returns the correct owner address', async () => {
    //   expect(await dao.owner()).to.equal(deployer.address)
    // })

    it('sends Ether to the DAO Treasury', async () =>{
       expect( await ethers.provider.getBalance(dao.address)).to.equal(ether(100))
    })

    it('returns the token address', async () => {
      expect(await dao.token()).to.equal(token.address)
    })

    it('returns a quorun', async () => {
      expect(await dao.quorum()).to.equal(quorum)
    })





  })

  describe('Proposal creation', () => {
    let transaction

    describe('Success', () => {
        beforeEach(async () => {
            transaction = await dao.connect(investor1).createProposal('Proposal 1', ether(100), recipient.address)
            result = transaction.wait()
        })
        it('updates the proposal count', async () =>{
            expect(await dao.proposalCount()).to.equal(1)
        })
        it('updates the proposal mapping', async () =>{
            const proposal = await dao.proposals(1);

            expect(proposal.id).to.equal(1)
            expect(proposal.amount).to.equal(ether(100))
            expect(proposal.recipient).to.equal(recipient.address)
        })
        it('emits a propose event', async () =>{
            await expect(transaction).to.emit(dao, 'Propose').withArgs(1, ether(100), recipient.address, investor1.address)
        })
    })
  
    describe('Failures', () => {
        it('rejects invalid amounts', async () =>{
            await expect(dao.connect(investor1).createProposal('Proposal 1', ether(1000), recipient.address)).to.be.reverted
        })
        it('rejects proposal for non-token-holders', async () =>{
            await expect(dao.connect(user).createProposal('Proposal 2', ether(100), recipient.address)).to.be.revertedWith('Must be a token holder to make a proposal')
        })
    })

  })

})
