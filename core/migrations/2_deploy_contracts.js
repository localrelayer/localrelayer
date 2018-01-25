const EIP20 = artifacts.require("./EIP20.sol");
const EIP20Factory = artifacts.require("./EIP20Factory.sol");

module.exports = (deployer) => {
  deployer.deploy(EIP20);
  deployer.link(EIP20, EIP20Factory);
  deployer.deploy(EIP20Factory);
};
