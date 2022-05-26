const Memorial = artifacts.require("./MultisigMemorial")
const Pain = artifacts.require("./MultisigPain")
const MockDAO = artifacts.require("./MockDAO")

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

      let tx = await memorial.proposeSetDAOAddress(accounts[4]);
      proposals.push(getProposalId(tx))
      tx = await pain.proposeSetDAOAddress(accounts[5]);
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