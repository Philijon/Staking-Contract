// Importing the ERC721Enumerable artifact 
const ERC721Enumerable = artifacts.require("ERC721Enumerable");


// Deploying function for the ERC721Enumerable NFT contract, whose constructor takes 2 arguments
// First: String - the name of the NFT collection
// Second: String - the symbol of the NFT collection

module.exports = function(_deployer){
    _deployer.deploy(
        ERC721Enumerable,


        // ___________________________________________________________
        // Adjust these parameters to your desired NFT name and symbol

        // NAME:
        "MyNFT",


        // Symbol:
        "MNFT"

        // ___________________________________________________________
    )
}