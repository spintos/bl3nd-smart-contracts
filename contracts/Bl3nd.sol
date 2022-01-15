// contracts/ExampleToken.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Bl3ndDeed {
  Bl3nd blend;
  ERC721 public contract0;
  uint256 public id0;
  ERC721 public contract1;
  uint256 public id1;

  constructor(Bl3nd _blend, ERC721 _contract0, uint256 _id0, ERC721 _contract1, uint256 _id1) {
    blend = _blend;
    contract0 = _contract0;
    id0 = _id0;
    contract1 = _contract1;
    id1 = _id1;
  }

  function unblend () public {
    address owner = blend.ownerOf(blend.blendTokenId(contract0, id0, contract1, id1));
    require(msg.sender == owner, "Only owner");
    contract0.transferFrom(address(this), owner, id0);
    contract1.transferFrom(address(this), owner, id1);

    blend.unblent(contract0, id0, contract1, id1);
    selfdestruct(payable(tx.origin));
  }
}

contract Bl3nd is ERC721 {
  address blender;

  modifier onlyBlender {
    require(msg.sender == blender, "Not the blender");
    _;
  }

  mapping(uint256 => Bl3ndDeed) deeds;

  constructor() ERC721("Bl3nd", "B3D") {
  }

  function blendTokenId(ERC721 contract0, uint256 id0, ERC721 contract1, uint256 id1) public pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(address(contract0), id0, address(contract1), id1)));
  }

  function getDeedAddress(ERC721 contract0, uint256 id0, ERC721 contract1, uint256 id1) public view returns (address) {
    uint256 tokenId = blendTokenId(contract0, id0, contract1, id1);
    return address(deeds[tokenId]);
  }

  function blend(ERC721 contract0, uint256 id0, ERC721 contract1, uint256 id1) public {
    Bl3ndDeed deed = new Bl3ndDeed(this, contract0, id0, contract1, id1);

    contract0.transferFrom(msg.sender, address(deed), id0);
    contract1.transferFrom(msg.sender, address(deed), id1);

    uint256 tokenId = blendTokenId(contract0, id0, contract1, id1);
    deeds[tokenId] = deed;
    _mint(msg.sender, tokenId);
  }

  function unblent(ERC721 contract0, uint256 id0, ERC721 contract1, uint256 id1) public {
    uint256 tokenId = blendTokenId(contract0, id0, contract1, id1);
    require(msg.sender == address(deeds[tokenId]), "Invalid sender");

    deeds[tokenId] = Bl3ndDeed(address(0));
    _burn(tokenId);
  }
}
