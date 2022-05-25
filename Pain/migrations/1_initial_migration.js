const Migrations = artifacts.require("Migrations");
const Pain = artifacts.require("MultisigPain")
const MockDAO = artifacts.require("MockDAO")

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Migrations);
  await deployer.deploy(Pain, "Pain", "PAIN", 30000, accounts.slice(0, 3))
  await deployer.deploy(MockDAO, accounts[4])
};
