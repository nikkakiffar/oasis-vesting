const Migrations = artifacts.require("Migrations");
const IMP = artifacts.require("MultisigIMP")

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Migrations);
  await deployer.deploy(IMP, "IMP Token", "IMP", 30000, accounts.slice(0, 3))
};
