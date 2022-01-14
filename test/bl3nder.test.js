const assert = require('assert')
const { createBayc, baycIds, createLoot, lootIds } = require('./dummyNFTs')
const Bl3nder = artifacts.require('Bl3nder')
const Bl3ndDeed = artifacts.require('Bl3ndDeed')

contract('Bl3nder', (accounts) => {
  it('craetes a Bl3nd Deed that owns the blended nfts', async () => {
    const bayc = await createBayc()
    const loot = await createLoot()

    const bl3nder = await Bl3nder.new()

    await bayc.approve(bl3nder.address, baycIds[0])
    await loot.approve(bl3nder.address, lootIds[0])

    await bl3nder.blend(bayc.address, baycIds[0], loot.address, lootIds[0])

    const blendDeedAddress = await bl3nder.getDeedAddress(bayc.address, baycIds[0], loot.address, lootIds[0])

    assert.equal(await bayc.ownerOf(baycIds[0]), blendDeedAddress)
    assert.equal(await loot.ownerOf(lootIds[0]), blendDeedAddress)
  })

  it('cannot blend if not owner of nft 0', async () => {
    const bayc = await createBayc()
    const loot = await createLoot()

    await bayc.transferFrom(accounts[0], accounts[1], baycIds[0])

    const bl3nder = await Bl3nder.new()

    await bayc.approve(bl3nder.address, baycIds[0], { from: accounts[1] })
    await loot.approve(bl3nder.address, lootIds[0])

    await assert.rejects(() => bl3nder.blend(bayc.address, baycIds[0], loot.address, lootIds[0]))
  })

  it('cannot blend if not owner of nft 1', async () => {
    const bayc = await createBayc()
    const loot = await createLoot()

    await loot.transferFrom(accounts[0], accounts[1], lootIds[0])

    const bl3nder = await Bl3nder.new()

    await bayc.approve(bl3nder.address, baycIds[0])
    await loot.approve(bl3nder.address, lootIds[0], { from: accounts[1] })

    await assert.rejects(() => bl3nder.blend(bayc.address, baycIds[0], loot.address, lootIds[0]))
  })

  it('unblends by transferring nfts back and deleting deed', async () => {
    const bayc = await createBayc()
    const loot = await createLoot()

    const bl3nder = await Bl3nder.new()

    await bayc.approve(bl3nder.address, baycIds[0])
    await loot.approve(bl3nder.address, lootIds[0])

    await bl3nder.blend(bayc.address, baycIds[0], loot.address, lootIds[0])

    const blendDeedAddress = await bl3nder.getDeedAddress(bayc.address, baycIds[0], loot.address, lootIds[0])
    const deed = await Bl3ndDeed.at(blendDeedAddress)

    await deed.unblend()

    assert.equal(await bayc.ownerOf(baycIds[0]), accounts[0])
    assert.equal(await loot.ownerOf(lootIds[0]), accounts[0])
    assert.equal(await bl3nder.getDeedAddress(bayc.address, baycIds[0], loot.address, lootIds[0]), '0x0000000000000000000000000000000000000000')
    assert.equal(await web3.eth.getCode(blendDeedAddress), '0x')
  })

  it('only owner can unblend', async () => {
    const bayc = await createBayc()
    const loot = await createLoot()

    const bl3nder = await Bl3nder.new()

    await bayc.approve(bl3nder.address, baycIds[0])
    await loot.approve(bl3nder.address, lootIds[0])

    await assert.rejects(() => bl3nder.blend(bayc.address, baycIds[0], loot.address, lootIds[0], { from: accounts[1] }))
  })

  it('only deed can set unblent', async () => {
    const bayc = await createBayc()
    const loot = await createLoot()

    const bl3nder = await Bl3nder.new()

    await bayc.approve(bl3nder.address, baycIds[0])
    await loot.approve(bl3nder.address, lootIds[0])

    await bl3nder.blend(bayc.address, baycIds[0], loot.address, lootIds[0])

    await assert.rejects(() => bl3nder.unblent(bayc.address, baycIds[0], loot.address, lootIds[0]))
  })
})
