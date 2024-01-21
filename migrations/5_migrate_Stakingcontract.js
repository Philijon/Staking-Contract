const stakingContract = artifacts.require("stakingContract");

const nftAddress = "0x55Adbb7f41DfAFA81cb87361b38fCB43294220cb";

module.exports = function(_deployer){
    _deployer.deploy(
        stakingContract,
        nftAddress,
        "RewardToken",
        "RWT",
        5000
    )
}