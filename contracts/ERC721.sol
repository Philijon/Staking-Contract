//SPDX-License-Identifier: MIT

pragma solidity^0.8.10;

import {IERC721} from "../interfaces/IERC721.sol";

import {IERC721Receiver} from "../interfaces/IERC721Receiver.sol";

import {IERC721Metadata} from "../interfaces/IERC721Metadata.sol";

import {Context} from "./Context.sol";

import {ERC165} from "./ERC165.sol";

import {IERC165} from "../interfaces/IERC165.sol";

import {Strings} from "../libraries/Strings.sol";

import {Ownable} from "./Ownable.sol";

contract ERC721 is Context,Ownable,ERC165,IERC721,IERC721Metadata{

    using Strings for uint256;

    string private _name;

    string private _symbol;

    string private _baseURI = "";

    mapping(uint256 tokenId=>address) private _owners;

    mapping(address owner =>uint256) private _balances;

    mapping(uint256 tokenId=>address) private _tokenApprovals;

    mapping(address owner=> mapping(address operator=>bool)) private _operatorApprovals;
    
    constructor(string memory name_, string memory symbol_){
        _name = name_;
        _symbol = symbol_;
        _owner = _msgSender();
        _registerInterface(type(IERC165).interfaceId);
        _registerInterface(type(IERC721).interfaceId);
        _registerInterface(type(IERC721Metadata).interfaceId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165,IERC165) returns(bool){
        return  supportsInterface(interfaceId);
    }

    function balanceOf(address owner) public view virtual returns(uint256){
        if(owner == address(0)){
            revert("Invalid address");
        }
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) public view virtual returns(address){
        return _requireOwned(tokenId);

    }

    function name() public view virtual returns(string memory){
        return _name;
    }

    function symbol() public view virtual returns(string memory){
        return _symbol;
    }

    function tokenURI(uint256 tokenId) public view virtual returns(string memory){
        _requireOwned(tokenId);
        string memory baseURI = _getBaseURI();
        return bytes(baseURI).length > 0 ? string.concat(baseURI,tokenId.toString()) : "";
    }

    function setBaseURI(string memory baseURI_) public virtual onlyOwner(){
        _baseURI = baseURI_;
    }

    function _getBaseURI() internal view virtual returns(string memory){
        return _baseURI;
    }







    function _ownerOf(uint256 tokenId) internal view virtual returns(address){
        return _owners[tokenId];
    }








    function _requireOwned(uint256 tokenId) internal view returns(address){
        address owner = _ownerOf(tokenId);
        if(owner == address(0)){
            revert("Token does not exist");
        }

        return owner;
    }


}


