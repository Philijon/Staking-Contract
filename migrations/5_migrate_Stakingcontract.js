// importing the stakingContract artifact
const stakingContract = artifacts.require("stakingContract");


// The contract address of the deployed ERC721Enumerable contract, see "migrations\4_migrate_ERC721Enumerable.js"
// Migrate the ERC721Enumerable contract, then replace this string with the deployed contract address



// _______________________________________________________________________________________________________________
// ADJUST THIS:
const nftAddress = "0x9991Df34a1Ce93E6986eD653eC7Ed2ED114dfd12";
// _______________________________________________________________________________________________________________


// Deploying function for the stakingcontract, whose constructor takes 4 arguments
// First: Address - the address of the NFT contract, whose NFTs are supposed to be staked

// CAUTION: provide only a contract address that has the ERC721 standard implemented

// Second: String - The Name of the ERC20 Token that will be paid as a reward for staking NFTs
// Third: String - The symbol of the ERC20 Token that will be paid as a reward for staking NFTs
// Fourth: Number - The Amount of Tokens per second per NFT paid as a reward for staking
// Reminder: the ERC20 token has 18 decimals by default


module.exports = function(_deployer){
    _deployer.deploy(
        stakingContract,
        nftAddress,

        // ______________________________________________________________________
        // ADJUST THESE:


        // Name ot the ERC20 token paid as reward by the staking contract
        "EXAMPLE_NAME",


        // Symbol ot the ERC20 token paid as reward by the staking contract
        "EXAMPLE_SYMBOL",


        // amount of tokens paid per second per NFT staked
        1234

        // ______________________________________________________________________
    )
}