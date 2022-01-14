const assert = require('assert')
const { createBayc, baycIds, createLoot, lootIds } = require('./dummyNFTs')

contract('PremintedNFT', (accounts) => {
  for (let nft of [[createBayc, baycIds], [createLoot, lootIds]]) {
    it('mints NFTs on creation', async () => {
      const [create, ids] = nft
      const premintedNFT = await create()

      for (let id of ids) {
        assert.equal(await premintedNFT.ownerOf(id), accounts[0])
      }
    })
  }
})
