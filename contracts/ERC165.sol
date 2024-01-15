// SPDX-License-Identifier: MIT

pragma solidity^0.8.10;

import {IERC165} from "../Interfaces/IERC165.sol";

contract ERC165 is IERC165{

    mapping(bytes4 => bool) _supportedInterfaces;

    function supportsInterface(bytes4 interfaceId) external virtual view returns(bool){

        return _supportedInterfaces[interfaceId];
    }

   function _registerInterface(bytes4 interfaceId) internal virtual {
    require(interfaceId != 0xffffffff,"ERC165: invalid interface id");
    _supportedInterfaces[interfaceId] = true;
   }
}