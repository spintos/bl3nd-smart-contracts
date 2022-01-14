const assert = require('assert')
const { createBayc, baycIds, createLoot, lootIds } = require('./dummyNFTs')
const Bl3nder = artifacts.require('Bl3nder')

contract('Bl3nder', () => {
  it('craetes a Bl3nd Deed that owns the blended nfts', async () => {
    const bayc = await createBayc()
    const loot = await createLoot()

    const bl3nder = await Bl3nder.new()

    await bayc.approve(bl3nder.address, baycIds[0])
    await loot.approve(bl3nder.address, lootIds[0])

    await bl3nder.blend(bayc.address, baycIds[0], loot.address, lootIds[0])

    const bl3ndDeedAddress = await bl3nder.getDeedAddress(bayc.address, baycIds[0], loot.address, lootIds[0])

    assert.equal(await bayc.ownerOf(baycIds[0]), bl3ndDeedAddress)
    assert.equal(await loot.ownerOf(lootIds[0]), bl3ndDeedAddress)
  })
})
