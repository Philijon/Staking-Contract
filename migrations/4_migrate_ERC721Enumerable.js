const ERC721Enumerable = artifacts.require("ERC721Enumerable");

module.exports = function(_deployer){
    _deployer.deploy(
        ERC721Enumerable,
        "MyNFT",
        "MNFT"
    )
}