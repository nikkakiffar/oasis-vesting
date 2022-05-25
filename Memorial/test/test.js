const IMP = artifacts.require("./MultisigMemorial")

const {
    BN,           // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const { advanceTimeAndBlock, DAY, getProposalId } = require('./utils');

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
    Team: 0, 
    Preseed: 1, 
    Seed: 2, 
    Private: 3, 
    Public: 4, 
    Advisor: 5, 
    Treasury: 6, 
    Partnership: 7, 
    Marketing: 8, 
    Stacking: 9, 
    Ecosystem: 10, 
    Farming: 11, 
    Liquidity: 12
};

contract('IMP', (accounts) => {
    let token;

    before(async () => {
        token = await IMP.deployed();
    })

    it('Add participants to every group', async () => {
        const participants = [accounts[3]];
        const balances = [Math.floor(Math.random() * 100000)];

        const proposals = []

        let tx = await token.proposeAddParticipant(AllocationGroup.Team, participants, balances);
        proposals.push(getProposalId(tx))
        tx = await token.proposeAddParticipant(AllocationGroup.Preseed, participants, balances);
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
        tx = await token.proposeAddParticipant(AllocationGroup.Stacking, participants, balances);
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
            token = await IMP.new('test', 'test', 30000, accounts.slice(0, 3), { from: accounts[0] });
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
            token = await IMP.new('test', 'test', 30000, accounts.slice(0, 3), { from: accounts[0] });
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
            token = await IMP.new('test', 'test', 30000, accounts.slice(0, 3), { from: accounts[0] });
        })

        it('Require: Can claim', async () => {
            const participants = [accounts[3]];
            const balances = [10];

            const addTx = await token.proposeAddParticipant(AllocationGroup.Seed, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), {from: accounts[1]})


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), {from: accounts[1]})

            const mainnetTx = await token.proposeMainnetLaunched();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(mainnetTx), {from: accounts[1]})

            await expectRevert(
                token.claim(AllocationGroup.Seed, { from: accounts[3] }),
                "You cannot claim"
            )
        });

        // seed: 8% after 3 * 30 days + 9 days, other for 92 weeks
        it("Seed group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Seed, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), {from: accounts[1]})


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), {from: accounts[1]})

            const mainnetTx = await token.proposeMainnetLaunched();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(mainnetTx), {from: accounts[1]})

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Seed);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock((3 * 30 + 9) * DAY);
            await token.claim(AllocationGroup.Seed, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 92; i++) {
                await advanceTimeAndBlock(7 * DAY);
                await token.claim(AllocationGroup.Seed, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Seed);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })

        it("Private group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Private, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), {from: accounts[1]})


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), {from: accounts[1]})

            const mainnetTx = await token.proposeMainnetLaunched();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(mainnetTx), {from: accounts[1]})

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Private);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock((45 + 6) * DAY);
            await token.claim(AllocationGroup.Private, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 80; i++) {
                await advanceTimeAndBlock(7 * DAY);
                await token.claim(AllocationGroup.Private, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Private);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })

        // seed: 0% after 7 months, other for 25 months
        it("Team group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Team, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), {from: accounts[1]})


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), {from: accounts[1]})

            const mainnetTx = await token.proposeMainnetLaunched();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(mainnetTx), {from: accounts[1]})

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Team);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock(30 * 7 * DAY);
            await token.claim(AllocationGroup.Team, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 25; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.claim(AllocationGroup.Team, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Team);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })

        // seed: 0% after 3 months, other for 12 months
        it("Advisor group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Advisor, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), {from: accounts[1]})


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), {from: accounts[1]})

            const mainnetTx = await token.proposeMainnetLaunched();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(mainnetTx), {from: accounts[1]})

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Advisor);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock(30 * 31 * DAY);
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

        // seed: 0% after 0 months, other for 40 months
        it("P2E group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.P2E, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), {from: accounts[1]})


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), {from: accounts[1]})

            const mainnetTx = await token.proposeMainnetLaunched();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(mainnetTx), {from: accounts[1]})

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.P2E);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock(0 * DAY);
            await token.claim(AllocationGroup.P2E, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 40; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.claim(AllocationGroup.P2E, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.P2E);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })

        // seed: 50% after TGE, other 50% after 4 days
        it("Liquidity group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Liquidity, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), {from: accounts[1]})


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), {from: accounts[1]})

            const mainnetTx = await token.proposeMainnetLaunched();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(mainnetTx), {from: accounts[1]})

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Liquidity);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await token.claim(AllocationGroup.Liquidity, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 1; i++) {
                await advanceTimeAndBlock(4 * DAY);
                await token.claim(AllocationGroup.Liquidity, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Liquidity);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })

        // seed: 15% after 3 weeks, other for 27 months
        it("Marketing group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Marketing, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), {from: accounts[1]})


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), {from: accounts[1]})

            const mainnetTx = await token.proposeMainnetLaunched();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(mainnetTx), {from: accounts[1]})

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Marketing);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock(21 * DAY);
            await token.claim(AllocationGroup.Marketing, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 27; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.claim(AllocationGroup.Marketing, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Marketing);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })

        // seed: 0% after 4 months, other for 40 months
        it("Ecosystem group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Ecosystem, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), {from: accounts[1]})


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), {from: accounts[1]})

            const mainnetTx = await token.proposeMainnetLaunched();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(mainnetTx), {from: accounts[1]})

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Ecosystem);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock(30 * 4 * DAY);
            await token.claim(AllocationGroup.Ecosystem, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 40; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.claim(AllocationGroup.Ecosystem, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Ecosystem);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })

    //     // seed: 0% after 3 months, other for 40 months
        it("Farming group", async () => {
            const participants = [accounts[1]];
            const balances = [Math.floor(Math.random() * 100000)];
            const addTx = await token.proposeAddParticipant(AllocationGroup.Farming, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), {from: accounts[1]})


            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), {from: accounts[1]})

            const mainnetTx = await token.proposeMainnetLaunched();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(mainnetTx), {from: accounts[1]})

            const lockedBalanceBefore = await token.getLockedBalance(accounts[1], AllocationGroup.Farming);
            const currentBalanceBefore = await token.balanceOf(accounts[1]);

            await advanceTimeAndBlock(30 * 3 * DAY);
            await token.claim(AllocationGroup.Farming, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 40; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.claim(AllocationGroup.Farming, { from: accounts[1], gas: 5000000, gasPrice: 500000000 });
            }

            const lockedBalanceAfter = await token.getLockedBalance(accounts[1], AllocationGroup.Farming);
            const currentBalanceAfter = await token.balanceOf(accounts[1]);

            expect(lockedBalanceBefore.toString()).to.equal(currentBalanceAfter.toString());
            expect(currentBalanceBefore.toString()).to.equal(lockedBalanceAfter.toString());
        })
    })

    describe("Distribute", () => {
        let token;

        beforeEach(async () => {
            token = await IMP.new('test', 'test', 30000, accounts.slice(0, 3), { from: accounts[0] });
        })

        it("Can't destribute in not available period", async () => {
            let participants = []
            let balances = []
            const countUsers = 10

            for (let i = 1; i < countUsers; i++) {
                participants.push(accounts[i]);
                balances.push(Math.floor(Math.random() * 100000));
            }

            const addTx = await token.proposeAddParticipant(AllocationGroup.Seed, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), {from: accounts[1]})

            await expectRevert(
                token.distribute(AllocationGroup.Seed, { gas: 5000000, gasPrice: 500000000 }),
                "Distribution is not started yet"
            )
        })

        it("Can't destribute before launch TGE or Mainnet", async () => {
            let participants = []
            let balances = []
            const countUsers = 10

            for (let i = 1; i < countUsers; i++) {
                participants.push(accounts[i]);
                balances.push(Math.floor(Math.random() * 100000));
            }

            const addTx = await token.proposeAddParticipant(AllocationGroup.Seed, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), {from: accounts[1]})

            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), {from: accounts[1]})

            const mainnetTx = await token.proposeMainnetLaunched();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(mainnetTx), {from: accounts[1]})

            await advanceTimeAndBlock((30 * 3 + 9) * DAY);
            await token.distribute(AllocationGroup.Seed, { gas: 5000000, gasPrice: 500000000 });

            await expectRevert(
                token.distribute(AllocationGroup.Seed, { gas: 5000000, gasPrice: 500000000 }),
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

            const addTx = await token.proposeAddParticipant(AllocationGroup.Seed, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), {from: accounts[1]})

            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), {from: accounts[1]})

            const mainnetTx = await token.proposeMainnetLaunched();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(mainnetTx), {from: accounts[1]})

            await advanceTimeAndBlock((30 * 3 + 9) * DAY);
            await token.distribute(AllocationGroup.Seed, { gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 92; i++) {
                await advanceTimeAndBlock(7 * DAY);
                await token.distribute(AllocationGroup.Seed, { gas: 5000000, gasPrice: 500000000 });
            }

            await expectRevert(
                token.distribute(AllocationGroup.Seed, { gas: 5000000, gasPrice: 500000000 }),
                "Distribution is already passed"
            )
        })

        // seed: 8% after 3 * 30 days + 9 days, other for 93 weeks
        it("Seed group", async () => {
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

            const addTx = await token.proposeAddParticipant(AllocationGroup.Seed, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), {from: accounts[1]})

            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), {from: accounts[1]})

            const mainnetTx = await token.proposeMainnetLaunched();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(mainnetTx), {from: accounts[1]})

            for (let i = 1; i < countUsers; i++) {
                const lockedBalanceBefore = await token.getLockedBalance(accounts[i], AllocationGroup.Seed);
                const currentBalanceBefore = await token.balanceOf(accounts[i]);
                lockedBalanceBeforeArray.push(lockedBalanceBefore)
                currentBalanceBeforeArray.push(currentBalanceBefore)
            }

            await advanceTimeAndBlock((3 * 30 + 9)* DAY);
            await token.distribute(AllocationGroup.Seed, { gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 92; i++) {
                await advanceTimeAndBlock(7 * DAY);
                await token.distribute(AllocationGroup.Seed, { gas: 5000000, gasPrice: 500000000 });
            }

            for (let i = 1; i < countUsers; i++) {
                const lockedBalanceAfter = await token.getLockedBalance(accounts[i], AllocationGroup.Seed);
                const currentBalanceAfter = await token.balanceOf(accounts[i]);
                lockedBalanceAfterArray.push(lockedBalanceAfter)
                currentBalanceAfterArray.push(currentBalanceAfter)
            }

            for (let i = 0; i < countUsers - 1; i++) {
                expect(lockedBalanceBeforeArray[i].toString()).to.equal(currentBalanceAfterArray[i].toString());
                expect(currentBalanceBeforeArray[i].toString()).to.equal(lockedBalanceAfterArray[i].toString());
            }
        })

        // seed: 0% after 0 months, other for 12 months
        it("P2E group", async () => {
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

            const addTx = await token.proposeAddParticipant(AllocationGroup.P2E, participants, balances);
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(addTx), {from: accounts[1]})

            const tgeTx = await token.proposeSetTGEPassed();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(tgeTx), {from: accounts[1]})

            const mainnetTx = await token.proposeMainnetLaunched();
            await advanceTimeAndBlock(2 * DAY);
            await token.confirmProposal(getProposalId(mainnetTx), {from: accounts[1]})

            for (let i = 1; i < countUsers; i++) {
                const lockedBalanceBefore = await token.getLockedBalance(accounts[i], AllocationGroup.P2E);
                const currentBalanceBefore = await token.balanceOf(accounts[i]);
                lockedBalanceBeforeArray.push(lockedBalanceBefore)
                currentBalanceBeforeArray.push(currentBalanceBefore)
            }

            await advanceTimeAndBlock(0 * DAY);
            await token.distribute(AllocationGroup.P2E, { gas: 5000000, gasPrice: 500000000 });

            for (let i = 0; i < 40; i++) {
                await advanceTimeAndBlock(30 * DAY);
                await token.distribute(AllocationGroup.P2E, { gas: 5000000, gasPrice: 500000000 });
            }

            for (let i = 1; i < countUsers; i++) {
                const lockedBalanceAfter = await token.getLockedBalance(accounts[i], AllocationGroup.P2E);
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