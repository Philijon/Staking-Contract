// SPDX-License-Identifier: MIT

pragma solidity^0.8.10;

import {IERC165} from "./IERC165.sol";

interface IERC721 is IERC165{

    event Transfer(address indexed from, address indexed to, uint indexed tokenId);

    event Approval(address indexed owner, address indexed approved, uint indexed tokenId);

    event AprrovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf()external view returns(uint balance);

    function ownerOf(uint256 tokenId) external view returns(address owner);

    function safeTranferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;

    function transferFrom(address from,address to, uint256 tokenId) external;

    function approve(address to, uint256 tokenId) external;

    function setApprovalForAll(address operator, bool approved) external;

    function getApproved(uint256 tokenId) external view returns(address operator);

    function isApprovedForAll(address owner,address operator) external view returns(bool);

    


}