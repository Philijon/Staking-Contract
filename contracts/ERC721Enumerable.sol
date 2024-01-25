//SPDX-License-Identifier: MIT

pragma solidity^0.8.13;

import {IERC721Enumerable} from "../interfaces/IERC721Enumerable.sol";

import {ERC721} from "./ERC721.sol";

import {IERC165} from "../interfaces/IERC165.sol";

contract ERC721Enumerable is ERC721,IERC721Enumerable{

    mapping(address=>mapping(uint256=>uint256)) private _ownedTokens;

    mapping(uint256=>uint256) private _ownedTokensIndex;

    uint256[] private _allTokens;

    mapping(uint256=>uint256) _allTokensIndex;


    constructor(string memory name_,string memory symbol_)ERC721(name_, symbol_){}


    function supportsInterface(bytes4 interfaceId) public view virtual override(IERC165,ERC721) returns(bool){
        return interfaceId == type(IERC721Enumerable).interfaceId || super.supportsInterface(interfaceId);
    }

    function tokenOfOwnerByIndex(address owner,uint256 index) public view virtual returns(uint256){
        if(index >= balanceOf(owner)){
            revert("index out of bound");
        }
        return _ownedTokens[owner][index];
    }

    function totalSupply() public view virtual returns(uint256){
        return _allTokens.length;
    }

    function tokenByIndex(uint256 index) public view virtual returns(uint256){
        if(index >= totalSupply()){
            revert("index out of bound");
        }

        return _allTokens[index];
    }

    //overriding ERC721 _update function

    function _update(address to, uint256 tokenId,address authent) internal virtual override returns(address){
        address previousOwner = super._update(to,tokenId,authent);

        if(previousOwner == address(0)){
            _addTokenToAllTokensEnumeration(tokenId);
        }else if(previousOwner != to){
            _removeTokenFromOwnerEnumeration(previousOwner,tokenId);
        }

        if(to == address(0)){
            _removeTokenFromAllTokensEnumeration(tokenId);
        } else if(previousOwner != to){
            _addTokenToOwnerEnumeration(to,tokenId);
        }

        return previousOwner;
    }

    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) private{
        uint256 length = balanceOf(to) -1;
        _ownedTokens[to][length] = tokenId;
        _ownedTokensIndex[tokenId] = length;
    }

    function _addTokenToAllTokensEnumeration(uint256 tokenId) private{
        _allTokensIndex[tokenId] = _allTokens.length;
        _allTokens.push(tokenId);
    }

    function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) private{
        uint256 lastTokenIndex = balanceOf(from);
        uint256 tokenIndex = _ownedTokensIndex[tokenId];

        if(tokenIndex != lastTokenIndex){
            uint256 lastTokenId = _ownedTokens[from][lastTokenIndex];

            _ownedTokens[from][tokenIndex] = lastTokenId;
            _ownedTokensIndex[lastTokenId] = tokenIndex;
        }

        delete _ownedTokensIndex[tokenId];
        delete _ownedTokens[from][lastTokenIndex];
    }

    function _removeTokenFromAllTokensEnumeration(uint256 tokenId) private{

        uint256 lastTokenIndex = _allTokens.length -1;
        uint256 tokenIndex = _allTokensIndex[tokenId];

        uint256 lastTokenId = _allTokens[lastTokenIndex];

        _allTokens[tokenIndex] = lastTokenId;
        _allTokensIndex[lastTokenId] = tokenIndex;

        delete _allTokensIndex[tokenId];
        _allTokens.pop();
    }


}