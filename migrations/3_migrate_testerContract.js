const tester = artifacts.require("testerContract");

module.exports = function(_deployer){
    _deployer.deploy(
        tester
    )
}