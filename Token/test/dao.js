const Memorial = artifacts.require("./MultisigMemorial")
const Pain = artifacts.require("./MultisigPain")
const DAO = artifacts.require("./DAO")

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

const TokenTypes = {
    Memorial: 0,
    Pain: 1,
};

const AllocationGroupMemorial = {
  Team: 0,
  Preseed: 1,
  Seed: 2,
  Private: 3,
  Public: 4,
  Advisor: 5,
  Treasury: 6,
  Partnership: 7,
  Marketing: 8,
  Staking: 9,
  Ecosystem: 10,
  Farming: 11,
  Liquidity: 12
};

const AllocationGroupPain = {
  Preseed: 0,
  Seed: 1,
  Private: 2,
  Public: 3,
  Advisor: 4,
  Treasury: 5,
  Partnership: 6,
  Marketing: 7,
  Staking: 8,
  Ecosystem: 9,
  Farming: 10,
  Liquidity: 11
};

contract('DAO', (accounts) => {
  let memorial;
  let pain;
  let dao;

  before(async () => {
      memorial = await Memorial.new('test', 'test', 30000, accounts.slice(0, 3), { from: accounts[0] });
      pain = await Pain.new('test', 'test', 30000, accounts.slice(0, 3), { from: accounts[0] });
      dao = await DAO.new(memorial.address, pain.address, { from: accounts[0] });
      const memtx = await memorial.proposeSetDAOAddress(dao.address);
      await advanceTimeAndBlock(2 * DAY);
      await memorial.confirmProposal(getProposalId(memtx), { from: accounts[2] })
      const paitx = await pain.proposeSetDAOAddress(dao.address);
      await advanceTimeAndBlock(2 * DAY);
      await pain.confirmProposal(getProposalId(paitx), { from: accounts[2] })
  })

  it('Admin can set memorial address', async () => {
    await dao.setMemorialAddress(accounts[1], {from: accounts[0]})
    const currentMemorialContract = await dao.memorialContract()
    expect(currentMemorialContract.toString()).to.be.equal(accounts[1].toString());
    await dao.setMemorialAddress(memorial.address, {from: accounts[0]})
  });

  it('Admin can set pain address', async () => {
    await dao.setPainAddress(accounts[1], {from: accounts[0]})
    const currentPainContract = await dao.painContract()
    expect(currentPainContract.toString()).to.be.equal(accounts[1].toString());
    await dao.setPainAddress(pain.address, {from: accounts[0]})
  });

  describe("Propose", () => {

    it('Non-voter can`t create new propose', async () => {
      await expectRevert(
        dao.propose(TokenTypes.Pain, accounts[1], {from: accounts[0]}),
        "Propose: msg.sender is not a voter"
    )
    });

    it('Admin can create new propose for memorial', async () => {
      const participants = [accounts[0], accounts[1]];
      const balances = [Math.floor(Math.random() * 100000), Math.floor(Math.random() * 100000)];
      const addTx = await memorial.proposeAddParticipant(AllocationGroupMemorial.Liquidity, participants, balances);
      await advanceTimeAndBlock(2 * DAY);
      await memorial.confirmProposal(getProposalId(addTx), { from: accounts[2] })

      const tgeTx = await memorial.proposeSetTGEPassed();
      await advanceTimeAndBlock(2 * DAY);
      await memorial.confirmProposal(getProposalId(tgeTx), { from: accounts[2] })

      await memorial.claim(AllocationGroupMemorial.Liquidity, { from: accounts[0], gas: 5000000, gasPrice: 500000000 });
      await memorial.claim(AllocationGroupMemorial.Liquidity, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

      await dao.propose(TokenTypes.Memorial, accounts[1], {from: accounts[0]}) // id = 0
      const getVoting = await dao.getVoting(0)
      const addresstovote = getVoting._to
      expect(addresstovote.toString()).to.equal(accounts[1].toString());
    });

    it('Admin can create new propose for pain', async () => {
      const participants = [accounts[0], accounts[1]];
      const balances = [Math.floor(Math.random() * 100000), Math.floor(Math.random() * 100000)];
      const addTx = await pain.proposeAddParticipant(AllocationGroupPain.Liquidity, participants, balances);
      await advanceTimeAndBlock(2 * DAY);
      await pain.confirmProposal(getProposalId(addTx), { from: accounts[2] })

      const tgeTx = await pain.proposeSetTGEPassed();
      await advanceTimeAndBlock(2 * DAY);
      await pain.confirmProposal(getProposalId(tgeTx), { from: accounts[2] })

      await pain.claim(AllocationGroupPain.Liquidity, { from: accounts[0], gas: 5000000, gasPrice: 500000000 });
      await pain.claim(AllocationGroupPain.Liquidity, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

      await dao.propose(TokenTypes.Pain, accounts[4], {from: accounts[0]}) //id = 1
      const getVoting = await dao.getVoting(1)
      const addresstovote = getVoting._to
      expect(addresstovote.toString()).to.equal(accounts[4].toString());
    });

  })

  describe("Vote", () => {
    it('Non-voter can`t vote', async () => {
      await expectRevert(
        dao.vote(0, true, {from: accounts[5]}),
        "Vote: you are not a voter"
    )
    });

    it('Voter can vote for memorial', async () => {
      await dao.vote(0, true, {from: accounts[0]})
      const getVoting = await dao.getVoting(0)
      const yestovoteafter = getVoting._yes
      const getbalance = await dao.getExternalBalance(accounts[0], 0)
      expect(yestovoteafter.toString()).to.equal(getbalance.toString());
    });

    it('Voter can vote for pain', async () => {
      await dao.vote(1, true, {from: accounts[0]})
      const getVoting = await dao.getVoting(1)
      const yestovoteafter = getVoting._yes
      const getbalance = await dao.getExternalBalance(accounts[0], 1)
      expect(yestovoteafter.toString()).to.equal(getbalance.toString());
    });

    it('You can`t vote twice', async () => {
      await expectRevert(
        dao.vote(0, true, {from: accounts[0]}),
        "Vote: you are already voted"
    )
    });
    
    it('You can`t vote if voting already closed', async () => {
      await advanceTimeAndBlock(2 * DAY);
      await dao.execute(0, {from: accounts[3]})
      await expectRevert(
        dao.vote(0, true, {from: accounts[1]}),
        "Vote: voting is not active"
    )
    });

  })

  describe("Get Voting", () => {

    it('Everybody can get voting', async () => {
      const currentVoting = await dao.getVoting(0, {from: accounts[5]})
      const balance = await dao.getExternalBalance(accounts[0], 0)
      const yes = currentVoting._yes
      const no = currentVoting._no
      const active = currentVoting._isActive
      const type = currentVoting._type
      const to = currentVoting._to
      expect(yes.toString()).to.equal(balance.toString());
      expect(no.toString()).to.equal('0');
      expect(active.toString()).to.equal('false');
      expect(type.toString()).to.equal('0');
      expect(to.toString()).to.equal(accounts[1].toString());
    });

  })

  describe("Execute", () => {
    it('Can`t execute early than 2 days', async () => {
      await dao.propose(TokenTypes.Memorial, accounts[4], {from: accounts[0]}) // id = 2
      
      await expectRevert(
        dao.execute(2, {from: accounts[3]}),
        "Execute: can execute only after 2 days of voting"
    )
    });

    it('Can`t execute twice', async () => {
      await expectRevert(
        dao.execute(0, {from: accounts[3]}),
        "Execute: voting is not active"
    )
    });

    it('Everybody can execute', async () => {
      await dao.execute(1, {from: accounts[3]})
      const getbalanceAfter = await dao.getExternalBalance(accounts[4], 1)
      expect(getbalanceAfter.toString()).to.equal('15000000');
    });

  })

})