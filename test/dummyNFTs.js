const PremintedNFT = artifacts.require('PremintedNFT')

/**
 * BAYC
 * https://etherscan.io/address/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d
 */
const baycIds = [
  3650, // https://opensea.io/assets/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/3650
  4671, // https://opensea.io/assets/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/4671
  3368, // https://opensea.io/assets/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/3368
]

const createBayc = () => PremintedNFT.new('BoredApeYachtClub', 'BAYC', baycIds)

/**
 * Loot
 * https://etherscan.io/address/0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7
 */
const lootIds = [
  5229, // https://opensea.io/assets/0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7/5229
  5917, // https://opensea.io/assets/0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7/4671
  1441, // https://opensea.io/assets/0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7/3368
]

const createLoot = () => PremintedNFT.new('Loot', 'LOOT', lootIds)
module.exports = {
  baycIds, createBayc,
  lootIds, createLoot
}
