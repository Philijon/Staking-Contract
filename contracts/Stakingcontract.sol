//SPDX-License-Identifier: MIT

pragma solidity^0.8.13;

import {ERC20} from "./ERC20.sol";

import {IERC20} from "../interfaces/IERC20.sol";

import {IERC721} from "../interfaces/IERC721.sol";

import {IERC721Receiver} from "../interfaces/IERC721Receiver.sol";

import {Context} from "./Context.sol";

import{Ownable} from "./Ownable.sol";

// This staking contract extends an ERC20 Contract.
// Its purpose is offer staking functionality for an ERC721 contract,
// and reward by minting new ERC20 Tokens

contract stakingContract is Context,Ownable,ERC20,IERC721Receiver{


    // private instance of the nft
    IERC721 public immutable nftContract;

    // tokens per second per NFT staked, adjustable by the Owner
    uint256 private _rewardRate;

    // keeps track of the amount of tokens staked
    mapping (address=>uint256) private _stakedAmount;

    // keeps track of the stakeraddress of each staked NFT
    mapping (uint256 => address) private _tokenStakedBy;

    // keeps track of the timestamp since last rewardclaim, necessary to calculate the unclaimed reward of an Address
    // will be updated to block.timestamp every time an address stakes or unstakes an NFT, or claims its rewards
    mapping (address=>uint256) private _stakedFromTimeStamp;


    constructor(address NFTcontract_, string memory tokenName,string memory tokenSymbol,uint256 rewardRate_) ERC20(tokenName,tokenSymbol){

        _rewardRate = rewardRate_;
        nftContract = IERC721(NFTcontract_);
    }

    // implementation of the onERC721Received function, which will be called by the ERC721 contract when sending an NFT to this contract address
    // Intended to prevent NFTs being stuck, see ERC721 standard
    // Returns bytes4 value 0x150b7a02
    function onERC721Received(address operator,address from, uint tokenId, bytes memory data) public pure returns(bytes4){
        
        return this.onERC721Received.selector;
    }

    // getter function for the _stakedAmount mapping, returns the amount of NFTs staked by an address
    function stakedAmount(address staker) public view returns(uint256){
        return _stakedAmount[staker];
    }

    // getter function for the _tokenStakedBy mapping, returns the address which has currently staked a specific NFT
    function tokenStakedBy(uint256 tokenId) public view returns(address){
        return _tokenStakedBy[tokenId];
    }

    // getter function for the _stakedFromTimeStamp mapping, which returns the difference between
    // the block.timestamp of the last time an address has staked,unstaked or claimed, and the current block.timestamp
    function stakedtime(address staker) public view returns(uint256){
        return block.timestamp - _stakedFromTimeStamp[staker];
    }

    // function to calculate the unclaimed amount of rewards for an address, returns a uint256 representing that amount
    function unclaimedRewards(address staker) public view returns(uint256){
        require(_stakedAmount[staker]>0,"Address has no tokens staked");
        uint256 timeStaked = stakedtime(staker);
        uint256 reward = timeStaked * _rewardRate *_stakedAmount[staker];
        return reward;
    }

    // getter function for the current rewardrate per second per NFT staked
    function getRewardRate()public view returns(uint256){
        return _rewardRate;
    }

    // function to set a new rewardRate, which must be greater than zero
    // only callable by the Owner of the contract
    function setRewardRate(uint256 newRate) public onlyOwner(){
        require(newRate >0,"Rewardrate to low");
        _rewardRate=newRate;
    }

    // function to stake an NFT to this contract
    // only callable by the owner of the NFT, not an approved third person
    // will claim outstanding rewards to the owner,
    // then use the transferFrom function of the ERC721 contract to become the new Owner of NFT tokenId
    // finally updates the _stakedAmount mapping for the Owneraddress and the _tokenStakedBy mapping for NFT tokenId 
    // 
    // REQUIRES this contract to be approved for the NFT tokenId by the owner 
    function stake(uint256 tokenId) public {

        address owner = nftContract.ownerOf(tokenId);

        require(owner == _msgSender(),"Only owner of NFT can Stake");

        if(_stakedAmount[owner]>0){
            claim(owner);
        }

        nftContract.safeTransferFrom(owner, address(this), tokenId,"");

        _stakedAmount[owner] +=1;
        _tokenStakedBy[tokenId] = owner;
        
        assert(nftContract.ownerOf(tokenId)== address(this));
    }

    // function to unstake an NFT from this contract and return it to its Owner.
    // Only callable by the address which has staked the NFT before.
    // claims the outstanding rewards of the Owner,
    // updates its _stakedAmount balance -=1 and the _tokenStakedBy mapping to address(0),
    // then calls the NftContract.safeTransferFrom to return the NFT to its Owner
    function unstake(uint256 tokenId) public {
        require(_tokenStakedBy[tokenId] == _msgSender(),"only Staker can unstake NFT");
        require(_stakedAmount[_msgSender()] > 0,"MSG Sender does not have any NFT's staked");
        
        claim(_msgSender());

        _stakedAmount[_msgSender()] -=1;

        _tokenStakedBy[tokenId] = address(0);

        nftContract.safeTransferFrom(address(this), _msgSender() , tokenId, "");

        assert(nftContract.ownerOf(tokenId)==_msgSender());
    }

    // function to claim the outstanding rewards of an Address
    // calculates the amount, then uses the mint function of the ERC20 to mint that amount to the address
    // finally updates the _stakedFromTimeStamp mapping to the current block.timestamp

    // REQUIRES a stakedAmount > 0 and that the receiver of the reward is also the _msgSender() or the Owner of the Stakingcontract
    function claim(address receiver) public {
        require(_stakedAmount[receiver] > 0,"Claimer address has no NFT staked");
        require(_msgSender()==receiver || _msgSender() == _owner,"only owner of NFT can claim his rewards");

        uint256 timeStaked = block.timestamp - _stakedFromTimeStamp[receiver];
        uint256 reward = timeStaked * _rewardRate * _stakedAmount[receiver];

        mint(receiver,reward);

        _stakedFromTimeStamp[receiver] = block.timestamp;
    }
}

