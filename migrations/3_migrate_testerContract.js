// Importing the testerContract artifact
const tester = artifacts.require("testerContract");


// Deploying function for the testercontract, no constructor arguments needed

module.exports = function(_deployer){
    _deployer.deploy(
        tester
    )
}