// SPDX-License-Identifier: MIT

pragma solidity^0.8.10;

import {Context} from "./Context.sol";

contract Ownable is Context{

    modifier onlyOwner{
        require(_msgSender() == _owner,"Only owner can execute this function");
        _;
    }

    address internal _owner;

    function getOwner()public view virtual returns(address){
        return _owner;
    }

    function transferOwnership(address newOwner) public virtual onlyOwner(){
        require(newOwner != address(0));
        _owner = newOwner;
    }

    function destroyOwnership() public virtual onlyOwner(){
        _owner = address(0);
    }

}