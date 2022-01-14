// contracts/ExampleToken.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PremintedNFT is ERC721 {
  constructor(string memory name, string memory symbol, uint256[] memory ids) ERC721(name, symbol) {
    for (uint256 i = 0; i < ids.length; i++) {
      _mint(msg.sender, ids[i]);
    }
  }
}
