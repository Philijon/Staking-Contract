// SPDX-License-Identifier: MIT

pragma solidity^0.8.10;

import {IERC165} from "../Interfaces/IERC165.sol";

contract ERC165 is IERC165{

    

    function supportsInterface(bytes4 interfaceId) public virtual view returns(bool){

        return interfaceId == type(IERC165).interfaceId;
    }

  
}