//SPDX-License-Identifier: MIT

pragma solidity^0.8.13;


import {ERC20} from "./ERC20.sol";

import {ERC721} from "./ERC721.sol";

import {IERC20} from "../Interfaces/IERC20.sol";

import {IERC165} from "../Interfaces/IERC165.sol";

import {IERC721} from "../Interfaces/IERC721.sol";

import {IERC20Errors} from "../Interfaces/IERC20Errors.sol";

import {IERC20Metadata} from "../Interfaces/IERC20Metadata.sol";


contract testerContract{

    function testIERC165 (address xyz,bytes4 InterfaceId) public view returns(bool){
    	ERC721 theContract = ERC721(xyz);
        bool result = theContract.supportsInterface(InterfaceId);
        return result;
    }

    function getInterface721() public pure returns(bytes4){
        return type(IERC721).interfaceId;
    }
}