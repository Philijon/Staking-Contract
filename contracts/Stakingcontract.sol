//SPDX-License-Identifier: MIT

pragma solidity^0.8.13;

import {ERC20} from "./ERC20.sol";

import {IERC20} from "../interfaces/IERC20.sol";

import {IERC721} from "../interfaces/IERC721.sol";

import {IERC721Receiver} from "../interfaces/IERC721Receiver.sol";

import {Context} from "./Context.sol";

contract stakingContract is Context,ERC20,IERC721Receiver{

    IERC721 public immutable nftContract;

    uint256 private _rewardRate;

    mapping (address=>uint256) private _stakedAmount;

    mapping (uint256 => address) private _tokenStakedBy;

    mapping (address=>uint) private _stakedFromTimeStamp;


    constructor(address NFTcontract_, string memory tokenName,string memory tokenSymbol,uint256 rewardRate_) ERC20(tokenName,tokenSymbol){

        _rewardRate = rewardRate_;
        nftContract = IERC721(NFTcontract_);
    }

    function onERC721Received(address operator,address from, uint tokenId, bytes memory data) public pure returns(bytes4){
        
        return this.onERC721Received.selector;
    }

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

    function unstake(uint256 tokenId) public {
        require(_tokenStakedBy[tokenId] == _msgSender(),"only Staker can unstake NFT");
        require(_stakedAmount[_msgSender()] > 0,"MSG Sender does not have any NFT's staked");
        
        claim(_msgSender());

        _stakedAmount[_msgSender()] -=1;

        _tokenStakedBy[tokenId] = address(0);

        nftContract.safeTransferFrom(address(this), _msgSender() , tokenId, "");

        assert(nftContract.ownerOf(tokenId)==_msgSender());
    }

    function claim(address receiver) public {
        require(_stakedAmount[receiver] > 0,"Claimer has no NFT staked");

        uint256 timeStaked = block.timestamp - _stakedFromTimeStamp[receiver];
        uint256 reward = timeStaked * _rewardRate;

        mint(receiver,reward);

        _stakedFromTimeStamp[receiver] = block.timestamp;
    }
}

