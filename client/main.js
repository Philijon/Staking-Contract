

import {ethers} from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.8.1/ethers.min.js";





















// _________________________ Adjust these two parameters __________________
const Ethereum_network = "goerli";
const RPC_HTTP_URL = "https://goerli.infura.io/v3/fa41e27497384dc4877bc930cd66ab0f";
// ________________________________________________________________________





















let provider = new ethers.InfuraProvider(Ethereum_network,RPC_HTTP_URL);
let signer= null;
let accounts = [];
let stakerContract = null;
let stakerContractAddress = "";
let stakerAbi = [

    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function transfer(address to, uint256 value) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 value) returns (bool)",
    "function transferFrom(address from, address to, uint256 value) returns (bool)",
    "function mint(address account, uint256 value) returns (bool)",
    "function burn(uint256 value) returns (bool)",
    "function getOwner() view returns (address)",
    "function transferOwnership(address newOwner)",
    "function destroyOwnership()",
    "function supportsInterface(bytes4 interfaceId) view returns (bool)",
    "function stakedAmount(address staker) view returns(uint256)",
    "function tokenStakedBy(uint256 tokenId) view returns(address)",
    "function stakedtime(address staker) view returns(uint256)",
    "function unclaimedRewards(address staker) view returns(uint256)",
    "function getRewardRate() view returns(uint256)",
    "function setRewardRate(uint256 newRate)",
    "function stake(uint256 tokenId)",
    "function unstake(uint256 tokenId)",
    "function claim(address receiver)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"

];


let nftContract = null;
let nftContractAddress = "";
let nftAbi = [

    "function balanceOf(address owner) view returns(uint256)",
    "function ownerOf(uint256 tokenId) view returns(address)",
    "function name() view returns(string)",
    "function symbol() view returns(string)",
    "function tokenURI(uint256 tokenId) view returns(string)",
    "function setBaseURI(string newURI)",
    "function approve(addressto, uint256 tokenId)",
    "function getApproved(uint256 tokenId) view returns(address)",
    "function setApprovalForAll(address operator, bool approved)",
    "function isApprovedForAll(address owner, address operator) view returns(bool)",
    "function transferFrom(address from, address to, uint256 tokenId)",
    "function safeTransferFrom(address from, address to, uint256 tokenId)",
    "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)",
    "function mint(address to, uint256 tokenId)",
    "function burn(uint256 tokenId)",
    "function supportsInterface(bytes4 interfaceId) view returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
    "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"

];