// contracts/ExampleToken.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Bl3ndDeed {
  Bl3nder blender;
  address owner;
  ERC721 public contract0;
  uint256 public id0;
  ERC721 public contract1;
  uint256 public id1;

  constructor(Bl3nder _blender, address _owner, ERC721 _contract0, uint256 _id0, ERC721 _contract1, uint256 _id1) {
    blender = _blender;
    owner = _owner;
    contract0 = _contract0;
    id0 = _id0;
    contract1 = _contract1;
    id1 = _id1;
  }

  function unblend () public {
    contract0.transferFrom(address(this), owner, id0);
    contract1.transferFrom(address(this), owner, id1);

    blender.unblent(contract0, id0, contract1, id1);
    selfdestruct(payable(tx.origin));
  }
}

contract Bl3nder {
  mapping(bytes32 => Bl3ndDeed) deeds;

  function blendDeedId(ERC721 contract0, uint256 id0, ERC721 contract1, uint256 id1) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(address(contract0), id0, address(contract1), id1));
  }

  function getDeedAddress(ERC721 contract0, uint256 id0, ERC721 contract1, uint256 id1) public view returns (address) {
    return address(deeds[blendDeedId(contract0, id0, contract1, id1)]);
  }

  function blend(ERC721 contract0, uint256 id0, ERC721 contract1, uint256 id1) public {
    Bl3ndDeed deed = new Bl3ndDeed(this, msg.sender, contract0, id0, contract1, id1);

    contract0.transferFrom(msg.sender, address(deed), id0);
    contract1.transferFrom(msg.sender, address(deed), id1);

    deeds[blendDeedId(contract0, id0, contract1, id1)] = deed;
  }

  function unblent(ERC721 contract0, uint256 id0, ERC721 contract1, uint256 id1) public {
    require(msg.sender == address(deeds[blendDeedId(contract0, id0, contract1, id1)]), "Invalid sender");
    deeds[blendDeedId(contract0, id0, contract1, id1)] = Bl3ndDeed(address(0));
  }
}
