const Migrations = artifacts.require("Migrations");
const Memorial = artifacts.require("MultisigMemorial")
const Pain = artifacts.require("MultisigPain")
const DAO = artifacts.require("DAO")

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Migrations);
  const deployedMemorial = await deployer.deploy(Memorial, "Memorial", "MEM", 30000, accounts.slice(0, 3))
  const deployedPain = await deployer.deploy(Pain, "Pain", "PAIN", 30000, accounts.slice(0, 3))
  const deployedDAO = await deployer.deploy(DAO, deployedMemorial.address, deployedPain.address)
  console.log("deployedMemorial: ", deployedMemorial.address)
  console.log("deployedPain: ", deployedPain.address)
  console.log("deployedDAO: ", deployedDAO.address)
};
