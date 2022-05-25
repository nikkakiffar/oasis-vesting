const Migrations = artifacts.require("Migrations");
const Memorial = artifacts.require("MultisigMemorial")

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Migrations);
  await deployer.deploy(Memorial, "Memorial", "MEM", 30000, accounts.slice(0, 3))
};
