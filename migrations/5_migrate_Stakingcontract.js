const stakingContract = artifacts.require("stakingContract");

const nftAddress = "0x38645275ab1eFeB399E78A2706012398d886485d";

module.exports = function(_deployer){
    _deployer.deploy(
        stakingContract,
        nftAddress,
        "RewardToken",
        "RWT",
        5000
    )
}