const ERC721 = artifacts.require("ERC721");

module.exports = function(_deployer){
    _deployer.deploy(
        ERC721,
        "MyNFT",
        "MNFT"
    )
}