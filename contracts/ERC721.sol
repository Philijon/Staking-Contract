//SPDX-License-Identifier: MIT

pragma solidity^0.8.13;

import {IERC721} from "../interfaces/IERC721.sol";

import {IERC721Receiver} from "../interfaces/IERC721Receiver.sol";

import {IERC721Metadata} from "../interfaces/IERC721Metadata.sol";

import {IERC721Enumerable} from "../interfaces/IERC721Enumerable.sol";

import {Context} from "./Context.sol";

import {ERC165} from "./ERC165.sol";

import {IERC165} from "../interfaces/IERC165.sol";

import {Strings} from "../libraries/Strings.sol";

import {Ownable} from "./Ownable.sol";

contract ERC721 is Context, Ownable, ERC165, IERC721, IERC721Enumerable, IERC721Metadata{

    using Strings for uint256;

    string private _name;

    string private _symbol;

    string private _baseURI = "";

    mapping(uint256 =>address) private _owners;

    mapping(address =>uint256) private _balances;

    mapping(uint256 =>address) private _tokenApprovals;

    mapping(address => mapping(address =>bool)) private _operatorApprovals;
    
    constructor(string memory name_, string memory symbol_){
        _name = name_;
        _symbol = symbol_;
        _owner = _msgSender();
        _registerInterface(type(IERC165).interfaceId);
        _registerInterface(type(IERC721).interfaceId);
        _registerInterface(type(IERC721Enumerable).interfaceId);
        _registerInterface(type(IERC721Metadata).interfaceId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165,IERC165) returns(bool){
        return  _supportedInterfaces[interfaceId];
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
        require(bytes(baseURI_).length>0,"invalid URI");
        _baseURI = baseURI_;
    }

    function _getBaseURI() internal view virtual returns(string memory){
        return _baseURI;
    }

    function approve(address to, uint256 tokenId) public virtual {
        _approve(to,tokenId,_msgSender());
    }

    function getApproved(uint256 tokenId) public view virtual returns(address){
        _requireOwned(tokenId);

        return _getApproved(tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public virtual{
        _setApprovalForAll(_msgSender(),operator,approved);
    }

    function isApprovedForAll(address owner, address operator) public view virtual returns(bool){
        return _operatorApprovals[owner][operator];
    }

    function transferFrom(address from, address to,uint256 tokenId) public virtual{
        if(to==address(0)){
            revert("Invalid receiver");
        }

        address previousOwner = _update(to,tokenId,_msgSender());

        if(previousOwner !=from){
            revert("Incorrect Owner");
        }
    }

    function safeTransferFrom(address from, address to, uint256 tokenId)public{
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(address from, address to,uint256 tokenId,bytes memory data)public virtual {
        transferFrom(from, to, tokenId);
        _checkOnERC721Received(from,to,tokenId,data);
    }

    function _ownerOf(uint256 tokenId) internal view virtual returns(address){
        return _owners[tokenId];
    }

    function _getApproved(uint256 tokenId) internal view virtual returns(address){
        return _tokenApprovals[tokenId];
    }

    function _isAuthorized(address owner,address spender, uint256 tokenId) internal view virtual returns(bool){
        return spender != address(0) &&
        (owner == spender|| 
        isApprovedForAll(owner, spender) ||
        _getApproved(tokenId)== spender);
    }

    function _checkAuthorized(address owner, address spender,uint256 tokenId) internal view virtual{
        if(!_isAuthorized(owner, spender, tokenId)){
            if(owner == address(0)){
                revert("Token does not exist");
            }else{
                revert("spender is not approved");
            }
        }
    }

    function _update(address to,uint256 tokenId,address authent) internal virtual returns(address){
        address from = _ownerOf(tokenId);

        if(authent != address(0)){
            _checkAuthorized(from, authent, tokenId);
        }

        if(from != address(0)){
            _approve(address(0),tokenId,address(0),false);
            
            unchecked{
                _balances[from] -=1;
            }
        }

        if(to != address(0)){
            unchecked {
                _balances[to] +=1;
            }
        }

        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);

        return from;
    }

    function mint(address to,uint256 tokenId,bytes memory data) public onlyOwner(){
        _safeMint(to,tokenId,data);
    }

    function burn(uint256 tokenId) public virtual{
        _update(address(0), tokenId, _msgSender());
    }

    function _mint(address to, uint256 tokenId) internal{
        if(to == address(0)){
            revert("Invalid receiver");
        }

        address previousOwner = _update(to,tokenId,address(0));
        if(previousOwner != address(0)){
            revert("Invalid Sender");
        }
    }

    function _safeMint(address to, uint256 tokenId) internal {
        _safeMint(to,tokenId,"");
    }

    function _safeMint(address to, uint256 tokenId, bytes memory data)  internal virtual{
        _mint(to,tokenId);
        _checkOnERC721Received(address(0),to,tokenId,data);
    }

    function _burn(uint256 tokenId) internal{
        address previousOwner = _update(address(0), tokenId, _msgSender());
        if(previousOwner == address(0)){
            revert("Token does not exist");
        }
    }

    function _transfer(address from, address to, uint256 tokenId) internal{
        if(to == address(0)){
            revert("Invalid receiver");
        }

        address previousOwner = _update(to, tokenId, address(0));
        if(previousOwner == address(0)){
            revert("Token does not exist");
        } else if(previousOwner != from){
            revert("Invalid Token owner");
        }
    }

    function _safeTransferFrom(address from, address to, uint256 tokenId)internal {
        _safeTransferFrom(from,to,tokenId,"");
    }

    function _safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) internal virtual{
        _transfer(from,to,tokenId);
        _checkOnERC721Received(from,to,tokenId,data);
    }

    function _approve(address to, uint256 tokenId,address authent) internal{
        _approve(to,tokenId,authent,true);
    }

    function _approve(address to, uint256 tokenId,address authent, bool emitEvent) internal virtual{
        if(emitEvent || authent != address(0)){
            address owner = _requireOwned(tokenId);

            if(authent != address(0) && owner != authent && !isApprovedForAll(owner, authent)){
                revert("Invalid Approver");
            }

            if(emitEvent){
                emit Approval(owner, to, tokenId);
            }
        }
        _tokenApprovals[tokenId] = to;
    }

    function _setApprovalForAll(address owner, address operator, bool approved) internal virtual {
        if(operator == address(0)){
            revert("Invalid Operator");
        }
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner,operator,approved);
    }

    function _requireOwned(uint256 tokenId) internal view returns(address){
        address owner = _ownerOf(tokenId);
        if(owner == address(0)){
            revert("Token does not exist");
        }

        return owner;
    }

    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory data) private{
        if(to.code.length > 0){ // ==> contract
            try IERC721Receiver(to).onERC721Received(_msgSender() , from, tokenId, data) returns(bytes4 returnvalue){
                if(returnvalue != IERC721Receiver.onERC721Received.selector){
                    revert("Invalid Receiver");
                }
            }catch (bytes memory reason){
                if(reason.length == 0){
                    revert("Invalid Receiver");
                } else {
                    assembly{
                        revert(add(32,reason),mload(reason))
                    }
                }
            }
        } 
    }


}


