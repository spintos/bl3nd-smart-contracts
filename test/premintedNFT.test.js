const assert = require('assert')
const PremintedNFT = artifacts.require('PremintedNFT')

contract('PremintedNFT', (accounts) => {
  it('mints NFTs on creation', async () => {
    const ids = [3650, 4671, 3368]
    const premintedNFT = await PremintedNFT.new('BoredApeYachtClub', 'BAYC', ids)

    for (let id of ids) {
      assert.equal(await premintedNFT.ownerOf(id), accounts[0])
    }
  })
})
