const assert = require('assert')

const { createBayc, baycIds, createLoot, lootIds } = require('./dummyNFTs')

const PremintedNFT = artifacts.require('PremintedNFT')
const PremintedNFTFactory = artifacts.require('PremintedNFTFactory')

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

contract('PremintedNFT', (accounts) => {
  it('creates a preminted NFT', async () => {
    const premintedNFTFactory = await PremintedNFTFactory.new()
    const tx = await premintedNFTFactory.createNFT('Bayc', 'BAYC', baycIds)

    const premintedNFT = await PremintedNFT.at(tx.receipt.logs[0].args.contractAddress)

    for (let id of baycIds) {
      assert.equal(await premintedNFT.ownerOf(id), accounts[0])
    }
  })
})