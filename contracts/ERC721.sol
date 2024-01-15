//SPDX-License-Identifer: MIT

pragma solidity^0.8.10;

import{IERC721} from "../interfaces/IERC721.sol";

import{IERC721Receiver} from "../interfaces/IERC721Receiver.sol";

import{IERC721Metadata} from "../interfaces/IERC721Metadata.sol";

import{Context} from "./Context.sol";

import{ERC165} from "./ERC165.sol";

// import {Strings} from "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.1/contracts/utils/Strings.sol";

contract ERC721 is Context,ERC165,IERC721,IERC721Metadata{

    using Strings for uint256;

    string private _name;

    string private _symbol;

    mapping(uint256 tokenId)
}


