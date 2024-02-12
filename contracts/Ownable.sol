// SPDX-License-Identifier: MIT

pragma solidity^0.8.10;

import {Context} from "./Context.sol";

// Contract to provide transferable Ownership aswell as restricted access to certain functions only for the Owner address


contract Ownable is Context{

    // modifier to restrict access to the current Owner address
    modifier onlyOwner{
        require(_msgSender() == _owner,"Only owner can execute this function");
        _;
    }

    // variable to keep track of the current Owner address
    address internal _owner;

    // getter function for the current Owner, returns that address
    function getOwner()public view virtual returns(address){
        return _owner;
    }

    // transfers the ownership to a new address, thus granting him access to onlyOwner() accessable functions
    // only callable by the current owner

    // REQUIRES the new owner not to be the address(0)
    function transferOwnership(address newOwner) public virtual onlyOwner(){
        require(newOwner != address(0));
        _owner = newOwner;
    }

    // Destroys the ownership of the contract, thus permanently denying access to all onlyOwner() restricted functions
    // only callable by the current owner

    // CAUTION : this change is permanent and irreversible
    function destroyOwnership() public virtual onlyOwner(){
        _owner = address(0);
    }

}