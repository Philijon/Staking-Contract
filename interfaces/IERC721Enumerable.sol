//SPDX-License-Identifier: MIT

pragma solidity^0.8.13;

import {IERC721} from "./IERC721.sol";

interface IERC721Enumerable is IERC721{

    function totalsupply() external view returns(uint256);

    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns(uint256);

    function tokenByIndex(uint256 index) external view returns(uint256 index);


}