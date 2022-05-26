const Memorial = artifacts.require("./MultisigMemorial")
const Pain = artifacts.require("./MultisigPain")
const MockDAO = artifacts.require("./MockDAO")

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const { advanceTimeAndBlock, DAY, getProposalId } = require('./utils');

const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

advanceTime = (time) => {
  return new Promise((resolve, reject) => {
      web3.currentProvider.send({
          jsonrpc: '2.0',
          method: 'evm_increaseTime',
          params: [time],
          id: new Date().getTime()
      }, (err, result) => {
          if (err) { return reject(err) }
          return resolve(result)
      });
  });
};


contract('MockDAO', (accounts) => {
  let memorial;
  let pain;
  let mock;

  before(async () => {
      memorial = await Memorial.new('test', 'test', 30000, accounts.slice(0, 3), { from: accounts[0] });
      pain = await Pain.new('test', 'test', 30000, accounts.slice(0, 3), { from: accounts[0] });
      mock = await MockDAO.new(memorial.address, pain.address);
  })

  it('Mint memorial tokens from DAO', async () => { 
      const proposals = []

      let tx = await memorial.proposeSetDAOAddress(mock.address);
      proposals.push(getProposalId(tx))
      tx = await pain.proposeSetDAOAddress(mock.address);
      proposals.push(getProposalId(tx))

      await advanceTimeAndBlock(2 * DAY)

      await memorial.confirmProposal(proposals[0], { from: accounts[1]})
      await pain.confirmProposal(proposals[1], { from: accounts[1]})

      const balanceBeforeMintMemo = await memorial.balanceOf(accounts[4]);
      const capMemo =  await memorial.cap();

      await mock.mintMemorial(accounts[4])
      const balanceAfterMintMemo =  await memorial.balanceOf(accounts[4]);
      expect((balanceBeforeMintMemo.toNumber() + capMemo/10**18/1000).toString()).to.be.equal((balanceAfterMintMemo).toString())

      const balanceBeforeMintPain = await pain.balanceOf(accounts[5]);
      const capPain =  await pain.cap();

      await mock.mintPain(accounts[5])
      const balanceAfterMintPain =  await pain.balanceOf(accounts[5]);
      expect((balanceBeforeMintPain.toNumber() + capPain/10**18/1000).toString()).to.be.equal((balanceAfterMintPain).toString())
  });

})