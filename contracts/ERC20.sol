// SPDX-License-Identifier: MIT

pragma solidity^0.8.13;

import {IERC165} from "../Interfaces/IERC165.sol";

import {ERC165} from "./ERC165.sol";

import {IERC20} from "../Interfaces/IERC20.sol";

import {IERC20Metadata} from "../Interfaces/IERC20Metadata.sol";

import {IERC20Errors} from "../Interfaces/IERC20Errors.sol";

import {Context} from "./Context.sol";

import {Ownable} from "./Ownable.sol";

// import {_address} from "../Libraries/Addresses.sol";


contract ERC20 is Context,Ownable,ERC165,IERC20,IERC20Metadata,IERC20Errors{

    // using _address for address;

    mapping(address=> uint256) private _balances;

    mapping(address=> mapping(address =>uint256)) private _allowances;

    uint256 private _totalSupply;
    string private _name;
    string private _symbol;

    

    constructor(string memory name_, string memory symbol_){
        _owner = _msgSender();
        _name = name_;
        _symbol= symbol_;
        _registerInterface(type(IERC165).interfaceId);
        _registerInterface(type(IERC20).interfaceId);
        _registerInterface(type(IERC20Metadata).interfaceId);
        _registerInterface(type(IERC20Errors).interfaceId);
    }

    function name() public view virtual returns(string memory){
        return _name;
    }

    function symbol() public view virtual returns(string memory){
        return _symbol;
    }

    function decimals() public view virtual returns(uint8){
        //@todo Hardcoded oder Constructorargument ?
        return 18;
    }

    function totalSupply() public view virtual returns(uint256){
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual returns(uint256){
        return _balances[account];
    }

    function transfer(address to, uint256 value) public virtual returns(bool){
        address owner = _msgSender();
        _transfer(owner,to,value);
        return true;
    }

    function allowance(address owner,address spender)public view virtual returns(uint256){
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 value) public virtual returns(bool){
        address owner = _msgSender();
        _approve(owner,spender,value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public virtual returns(bool){
        address spender = _msgSender();
        _spendAllowance(from,spender,value);
        _transfer(from,to,value);
        return true;
    }

    function mint(address account, uint256 value) public virtual onlyOwner() returns(bool){
        _mint(account, value);
        return true;
    }

    function burn(uint256 value) public virtual returns(bool){
        _burn(_msgSender(),value );
        return true;
    }

    function _transfer(address from,address to, uint256 value) internal{
        if(from == address(0)){
            revert ERC20InvalidSender(address(0));
        }
        if(to == address(0)){
            revert ERC20InvalidReceiver(address(0));
        }
        _update(from,to,value);
    }

    function _update(address from, address to,uint256 value) internal virtual{
        // if(to.isContract()){

        // }
        if (from == address(0)){ 
            uint256 _before = _totalSupply;
            _totalSupply += value;
            require(_before <= _totalSupply,"Overflow!");
        }else{
            uint256 _frombalance = _balances[from];
            if(_frombalance < value){
                revert ERC20InsufficientBalance(from,_frombalance,value);
            }
            unchecked {
                _balances[from] = _frombalance-value;
            }
        }

        if(to == address(0)){
            unchecked {
                _totalSupply -= value;
            }
        } else{
            unchecked {
                _balances[to] += value;
            }
        }

        emit Transfer(from, to, value);
    }

    function _mint(address account,uint256 value) internal {
        if(account == address(0)){
            revert ERC20InvalidReceiver(address(0));
        }
        _update(address(0),account,value);
    }

    function _burn(address account, uint256 value) internal {
        if(account == address(0)){
            revert ERC20InvalidSender(address(0));
        }
        _update(account,address(0), value);
    }

    function _approve(address owner, address spender, uint256 value) internal {
        if(owner == address(0)){
            revert ERC20InvalidApprover(address(0));
        }
        if(spender == address(0)){
            revert ERC20InvalidSpender(address(0));
        }

        _allowances[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function _spendAllowance(address owner, address spender, uint256 value) internal virtual{
        uint256 currentAllowance = allowance(owner, spender);
        if(currentAllowance != type(uint256).max){
            if(currentAllowance < value){
                revert ERC20InsufficientAllowance(spender,currentAllowance,value);
            }
            unchecked {
                _approve(owner, spender,currentAllowance - value);
            }
        }
    }



}
