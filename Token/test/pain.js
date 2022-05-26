const Pain = artifacts.require("./MultisigPain")

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

const AllocationGroup = {
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

contract('Pain', (accounts) => {
    let token;

    before(async () => {
        token = await Pain.deployed();
    })

    it('Add participants to every group', async () => {
        const participants = [accounts[3]];
        const balances = [Math.floor(Math.random() * 100000)];

        const proposals = []

        let tx = await token.proposeAddParticipant(AllocationGroup.Preseed, participants, balances);
        proposals.push(getProposalId(tx))
        tx = await token.proposeAddParticipant(AllocationGroup.Seed, participants, balances);
        proposals.push(getProposalId(tx))
        tx = await token.proposeAddParticipant(AllocationGroup.Private, participants, balances);
        proposals.push(getProposalId(tx))
        tx = await token.proposeAddParticipant(AllocationGroup.Public, participants, balances);
        proposals.push(getProposalId(tx))
        tx = await token.proposeAddParticipant(AllocationGroup.Advisor, participants, balances);
        proposals.push(getProposalId(tx))
        tx = await token.proposeAddParticipant(AllocationGroup.Treasury, participants, balances);
        proposals.push(getProposalId(tx))
        tx = await token.proposeAddParticipant(AllocationGroup.Partnership, participants, balances);
        proposals.push(getProposalId(tx))
        tx = await token.proposeAddParticipant(AllocationGroup.Marketing, participants, balances);
        proposals.push(getProposalId(tx))
        tx = await token.proposeAddParticipant(AllocationGroup.Staking, participants, balances);
        proposals.push(getProposalId(tx))
        tx = await token.proposeAddParticipant(AllocationGroup.Ecosystem, participants, balances);
        proposals.push(getProposalId(tx))
        tx = await token.proposeAddParticipant(AllocationGroup.Farming, participants, balances);
        proposals.push(getProposalId(tx))
        tx = await token.proposeAddParticipant(AllocationGroup.Liquidity, participants, balances);
        proposals.push(getProposalId(tx))

        await advanceTimeAndBlock(2 * DAY)

        for (let i=0; i<proposals.length; i++) {
            await token.confirmProposal(proposals[i], { from: accounts[1]})
        }
    });

    it('Non-owner can`t propose mint tokens for public sale', async () => {
        await expectRevert(
            token.proposeMintForPublicSale(accounts[0], { from: accounts[5] }),
            "msg.sender is not admin"
        )
    });

    it('Author cannot confirm his proposal', async () => {
        const tx = await token.proposeMintForPublicSale(accounts[0])
        await expectRevert(
            token.confirmProposal(getProposalId(tx)),
            "Author cannot confirm his proposal"
        )
    })

    it('Cannot confirm proposal before 2 days timelock', async () => {
        const tx = await token.proposeMintForPublicSale(accounts[0])
        await expectRevert(
            token.confirmProposal(getProposalId(tx), {from: accounts[1]}),
            "Timelock is not passed"
        )
    })

    describe("TGE", () => {
        let token;

        before(async () => {
            token = await Pain.new('test', 'test', 30000, accounts.slice(0, 3), { from: accounts[0] });
        })

        it('Set TGE passed', async () => {
            const tx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY)
            await token.confirmProposal(getProposalId(tx), {from: accounts[1]})

            const TGETimestamp = await token.TGETimestamp();
            expect(TGETimestamp.toNumber()).to.be.not.equal(0);
        });

        it('TGE can been set only one', async () => {
            const tx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY)
            await expectRevert.unspecified(
                token.confirmProposal(getProposalId(tx)),
            )
        });
    })

    describe("Add participants", () => {
        let token;

        before(async () => {
            token = await Pain.new('test', 'test', 30000, accounts.slice(0, 3), { from: accounts[0] });
        })

        it('Length of participants is equal of length of balances', async () => {
            const participants = [accounts[1]];
            const balances = [];

            const tx = await token.proposeAddParticipant(AllocationGroup.Seed, participants, balances);
            await advanceTimeAndBlock(2 * DAY)

            await expectRevert.unspecified(
                token.confirmProposal(getProposalId(tx), {from: accounts[1]})
            )
        });

        it('List of participant shouldn`t be null', async () => {
            const participants = [];
            const balances = [];

            const tx = await token.proposeAddParticipant(AllocationGroup.Seed, participants, balances);
            await advanceTimeAndBlock(2 * DAY)

            await expectRevert.unspecified(
                token.confirmProposal(getProposalId(tx), {from: accounts[1]})
            )
        });

        it("Can't add participant with 0 balance", async () => {
            const participants = [accounts[4]];
            const balances = [0];

            const tx = await token.proposeAddParticipant(AllocationGroup.Seed, participants, balances);
            await advanceTimeAndBlock(2 * DAY)

            await expectRevert.unspecified(
                token.confirmProposal(getProposalId(tx), {from: accounts[1]})
            )
        });

        it("Can't add participant with 0 address", async () => {
            const participants = ["0x0000000000000000000000000000000000000000"];
            const balances = [1110];

            const tx = await token.proposeAddParticipant(AllocationGroup.Seed, participants, balances);
            await advanceTimeAndBlock(2 * DAY)

            await expectRevert.unspecified(
                token.confirmProposal(getProposalId(tx), {from: accounts[1]})
            )
        });

        it('TGETimestamp should to be 0', async () => {
            const participants = [accounts[3]];
            const balances = [Math.floor(Math.random() * 100000)];

            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY)
            await token.confirmProposal(getProposalId(tgeTx), {from: accounts[1]})

            const tx = await token.proposeAddParticipant(AllocationGroup.Seed, participants, balances);
            await advanceTimeAndBlock(2 * DAY)

            await expectRevert.unspecified(
                token.confirmProposal(getProposalId(tx), {from: accounts[1]})
            )
        });

    })

    describe("Claiming", () => {
        let token;

        beforeEach(async () => {
            token = await Pain.new('test', 'test', 30000, accounts.slice(0, 3), { from: accounts[0] });
        })

        it('Require: Can claim', async () => {
            const participants = [accounts[3]];
            const balances = [10];

            const addTx = await token.proposeAddParticipant(AllocationGroup.Private, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), { from: accounts[1] })


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), { from: accounts[1] })

            await expectRevert(
                token.claim(AllocationGroup.Private, { from: accounts[3] }),
                "You cannot claim"
            )
        });

        //preseed: 5% after 0 days, other for 12 months
        it("Preeed group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Preseed, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), { from: accounts[1] })


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), { from: accounts[1] })

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Preseed);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock(0 * DAY);
            await token.claim(AllocationGroup.Preseed, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 12; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.claim(AllocationGroup.Preseed, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Preseed);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })

        // seed: 5% after 0 days, other for 12 months
        it("Seed group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Seed, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), { from: accounts[1] })


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), { from: accounts[1] })

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Seed);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock(0 * DAY);
            await token.claim(AllocationGroup.Seed, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 12; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.claim(AllocationGroup.Seed, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Seed);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })

        //private: 10% after 30 days, other for 9 months
        it("Private group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Private, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), { from: accounts[1] })


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), { from: accounts[1] })

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Private);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock(30 * DAY);
            await token.claim(AllocationGroup.Private, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 9; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.claim(AllocationGroup.Private, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Private);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })

        //public: 20% after 0 days, other for 3 months
        it("Public group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Public, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), { from: accounts[1] })


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), { from: accounts[1] })

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Public);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock(0 * DAY);
            await token.claim(AllocationGroup.Public, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 3; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.claim(AllocationGroup.Public, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Public);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })

        // advisor: 0% after 3 months, other for 12 months
        it("Advisor group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Advisor, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), { from: accounts[1] })


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), { from: accounts[1] })

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Advisor);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock(3 * 30 * DAY);
            await token.claim(AllocationGroup.Advisor, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 12; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.claim(AllocationGroup.Advisor, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Advisor);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })

        // treasury: 0% after 3 months, other for 12 months
        it("Treasury group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Treasury, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), { from: accounts[1] })


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), { from: accounts[1] })


            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Treasury);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock(3 * 30 * DAY);
            await token.claim(AllocationGroup.Treasury, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 12; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.claim(AllocationGroup.Treasury, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Treasury);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })

        // partnership: 0% after 1 months, other for 12 months
        it("Partnership group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Partnership, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), { from: accounts[1] })


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), { from: accounts[1] })

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Partnership);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock(30 * DAY);
            await token.claim(AllocationGroup.Partnership, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 12; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.claim(AllocationGroup.Partnership, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Partnership);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })

        // Marketing: 5% after 0 weeks, other for 3 months
        it("Marketing group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Marketing, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), { from: accounts[1] })


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), { from: accounts[1] })

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Marketing);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock(0 * DAY);
            await token.claim(AllocationGroup.Marketing, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 3; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.claim(AllocationGroup.Marketing, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Marketing);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })

        // Staking: 5% after 0 weeks, other for 3 months
        it("Staking group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Staking, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), { from: accounts[1] })


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), { from: accounts[1] })

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Staking);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock(0 * DAY);
            await token.claim(AllocationGroup.Staking, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 3; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.claim(AllocationGroup.Staking, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Staking);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })

        // Ecosystem: 5% after 0 months, other for 9 months
        it("Ecosystem group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Ecosystem, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), { from: accounts[1] })

            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), { from: accounts[1] })

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Ecosystem);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock(0 * DAY);
            await token.claim(AllocationGroup.Ecosystem, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 9; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.claim(AllocationGroup.Ecosystem, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Ecosystem);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })

        //Farming: 5% after 0 months, other for 9 months
        it("Farming group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Farming, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), { from: accounts[1] })


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), { from: accounts[1] })

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Farming);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock(0 * DAY);
            await token.claim(AllocationGroup.Farming, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 9; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.claim(AllocationGroup.Farming, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Farming);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })

        //Liquidity: 100% after TGE
        it("Liquidity group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Liquidity, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), { from: accounts[1] })


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), { from: accounts[1] })

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Liquidity);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await token.claim(AllocationGroup.Liquidity, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Liquidity);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })
    })

    describe("Distribute", () => {
        let token;

        beforeEach(async () => {
            token = await Pain.new('test', 'test', 30000, accounts.slice(0, 3), { from: accounts[0] });
        })

        it("Can't destribute in not available period", async () => {
            let participants = []
            let balances = []
            const countUsers = 10

            for (let i = 1; i < countUsers; i++) {
                participants.push(accounts[i]);
                balances.push(Math.floor(Math.random() * 100000));
            }

            const addTx = await token.proposeAddParticipant(AllocationGroup.Private, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), { from: accounts[1] })

            await expectRevert(
                token.distribute(AllocationGroup.Private, { gas: 5000000, gasPrice: 500000000 }),
                "Distribution is not started yet"
            )
        })

        it("Can't destribute before launch TGE", async () => {
            let participants = []
            let balances = []
            const countUsers = 10

            for (let i = 1; i < countUsers; i++) {
                participants.push(accounts[i]);
                balances.push(Math.floor(Math.random() * 100000));
            }

            const addTx = await token.proposeAddParticipant(AllocationGroup.Private, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), { from: accounts[1] })

            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), { from: accounts[1] })

            await advanceTimeAndBlock(30 * DAY);
            await token.distribute(AllocationGroup.Private, { gas: 5000000, gasPrice: 500000000 });

            await expectRevert(
                token.distribute(AllocationGroup.Private, { gas: 5000000, gasPrice: 500000000 }),
                "It's too early for distribution"
            )
        })

        it("Can't distribute after last destribution", async () => {
            let participants = []
            let balances = []
            const countUsers = 10


            for (let i = 1; i < countUsers; i++) {
                participants.push(accounts[i]);
                balances.push(Math.floor(Math.random() * 100000));
            }

            const addTx = await token.proposeAddParticipant(AllocationGroup.Private, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), { from: accounts[1] })

            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), { from: accounts[1] })

            await advanceTimeAndBlock(30 * DAY);
            await token.distribute(AllocationGroup.Private, { gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 9; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.distribute(AllocationGroup.Private, { gas: 5000000, gasPrice: 500000000 });
            }

            await expectRevert(
                token.distribute(AllocationGroup.Private, { gas: 5000000, gasPrice: 500000000 }),
                "Distribution is already passed"
            )
        })

        // Private: 10% after 30 days, other for 9 months
        it("Private group", async () => {
            let participants = []
            let balances = []
            const countUsers = 10

            let lockedBalanceBeforeArray = []
            let currentBalanceBeforeArray = []
            let lockedBalanceAfterArray = []
            let currentBalanceAfterArray = []

            for (let i = 1; i < countUsers; i++) {
                participants.push(accounts[i]);
                balances.push(Math.floor(Math.random() * 100000));
            }

            const addTx = await token.proposeAddParticipant(AllocationGroup.Private, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), { from: accounts[1] })

            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), { from: accounts[1] })

            for (let i = 1; i < countUsers; i++) {
                const lockedBalanceBefore = await token.getLockedBalance(accounts[i], AllocationGroup.Private);
                const currentBalanceBefore = await token.balanceOf(accounts[i]);
                lockedBalanceBeforeArray.push(lockedBalanceBefore)
                currentBalanceBeforeArray.push(currentBalanceBefore)
            }

            await advanceTimeAndBlock(30 * DAY);
            await token.distribute(AllocationGroup.Private, { gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 9; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.distribute(AllocationGroup.Private, { gas: 5000000, gasPrice: 500000000 });
            }

            for (let i = 1; i < countUsers; i++) {
                const lockedBalanceAfter = await token.getLockedBalance(accounts[i], AllocationGroup.Private);
                const currentBalanceAfter = await token.balanceOf(accounts[i]);
                lockedBalanceAfterArray.push(lockedBalanceAfter)
                currentBalanceAfterArray.push(currentBalanceAfter)
            }

            for (let i = 0; i < countUsers - 1; i++) {
                expect(lockedBalanceBeforeArray[i].toString()).to.equal(currentBalanceAfterArray[i].toString());
                expect(currentBalanceBeforeArray[i].toString()).to.equal(lockedBalanceAfterArray[i].toString());
            }
        })

        // Liquidity: 100% after TGE passed
        it("Liquidity group", async () => {
            let participants = []
            let balances = []
            const countUsers = 10

            let lockedBalanceBeforeArray = []
            let currentBalanceBeforeArray = []
            let lockedBalanceAfterArray = []
            let currentBalanceAfterArray = []

            for (let i = 1; i < countUsers; i++) {
                participants.push(accounts[i]);
                balances.push(100);
            }

            const addTx = await token.proposeAddParticipant(AllocationGroup.Liquidity, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), { from: accounts[1] })

            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), { from: accounts[1] })

            for (let i = 1; i < countUsers; i++) {
                const lockedBalanceBefore = await token.getLockedBalance(accounts[i], AllocationGroup.Liquidity);
                const currentBalanceBefore = await token.balanceOf(accounts[i]);
                lockedBalanceBeforeArray.push(lockedBalanceBefore)
                currentBalanceBeforeArray.push(currentBalanceBefore)
            }

            await advanceTimeAndBlock(0 * DAY);
            await token.distribute(AllocationGroup.Liquidity, { gas: 5000000, gasPrice: 500000000 });

            for (let i = 1; i < countUsers; i++) {
                const lockedBalanceAfter = await token.getLockedBalance(accounts[i], AllocationGroup.Liquidity);
                const currentBalanceAfter = await token.balanceOf(accounts[i]);
                lockedBalanceAfterArray.push(lockedBalanceAfter)
                currentBalanceAfterArray.push(currentBalanceAfter)
            }

            for (let i = 0; i < countUsers - 1; i++) {
                expect(lockedBalanceBeforeArray[i].toString()).to.equal(currentBalanceAfterArray[i].toString());
                expect(currentBalanceBeforeArray[i].toString()).to.equal(lockedBalanceAfterArray[i].toString());
            }
        })
    })

})