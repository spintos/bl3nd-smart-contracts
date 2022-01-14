// contracts/ExampleToken.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Bl3nder {
  address fakeDeedAddress = address(1000);

  function blend(ERC721 contract0, uint256 id0, ERC721 contract1, uint256 id1) public {
    contract0.transferFrom(msg.sender, fakeDeedAddress, id0);
    contract1.transferFrom(msg.sender, fakeDeedAddress, id1);
  }

  function getDeedAddress(address contractAddress0, uint256 id0, address contractAddress1, uint256 id1) public view returns (address) {
    return fakeDeedAddress;
  }
}