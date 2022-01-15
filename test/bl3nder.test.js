const assert = require('assert')
const { createBayc, baycIds, createLoot, lootIds } = require('./dummyNFTs')
const Bl3nd = artifacts.require('Bl3nd')
const Bl3ndDeed = artifacts.require('Bl3ndDeed')

contract('Bl3nder', (accounts) => {
  it('blends: creates a Bl3nd Deed that owns the blended nfts + mints an NFT', async () => {
    const bayc = await createBayc()
    const loot = await createLoot()

    const blend = await Bl3nd.new()

    await bayc.approve(blend.address, baycIds[0])
    await loot.approve(blend.address, lootIds[0])

    await blend.blend(bayc.address, baycIds[0], loot.address, lootIds[0])

    const blendDeedAddress = await blend.getDeedAddress(bayc.address, baycIds[0], loot.address, lootIds[0])

    assert.equal(await bayc.ownerOf(baycIds[0]), blendDeedAddress)
    assert.equal(await loot.ownerOf(lootIds[0]), blendDeedAddress)

    const tokenId = await blend.blendTokenId(bayc.address, baycIds[0], loot.address, lootIds[0])
    assert.equal(await blend.ownerOf(tokenId), accounts[0])
  })

  it('cannot blend if not owner of nft 0', async () => {
    const bayc = await createBayc()
    const loot = await createLoot()

    await bayc.transferFrom(accounts[0], accounts[1], baycIds[0])

    const blend = await Bl3nd.new()

    await bayc.approve(blend.address, baycIds[0], { from: accounts[1] })
    await loot.approve(blend.address, lootIds[0])

    await assert.rejects(() => blend.blend(bayc.address, baycIds[0], loot.address, lootIds[0]))
  })

  it('cannot blend if not owner of nft 1', async () => {
    const bayc = await createBayc()
    const loot = await createLoot()

    await loot.transferFrom(accounts[0], accounts[1], lootIds[0])

    const blend = await Bl3nd.new()

    await bayc.approve(blend.address, baycIds[0])
    await loot.approve(blend.address, lootIds[0], { from: accounts[1] })

    await assert.rejects(() => blend.blend(bayc.address, baycIds[0], loot.address, lootIds[0]))
  })

  it('only deed can set unblent', async () => {
    const bayc = await createBayc()
    const loot = await createLoot()

    const blend = await Bl3nd.new()

    await bayc.approve(blend.address, baycIds[0])
    await loot.approve(blend.address, lootIds[0])

    await blend.blend(bayc.address, baycIds[0], loot.address, lootIds[0])

    await assert.rejects(() => blend.unblent(bayc.address, baycIds[0], loot.address, lootIds[0]))
  })
})

contract('Bl3nd Deed', (accounts) => {
  it('unblends: transferring nfts back + deleting deed + burning nft', async () => {
    const bayc = await createBayc()
    const loot = await createLoot()

    const blend = await Bl3nd.new()

    await bayc.approve(blend.address, baycIds[0])
    await loot.approve(blend.address, lootIds[0])

    await blend.blend(bayc.address, baycIds[0], loot.address, lootIds[0])

    const blendDeedAddress = await blend.getDeedAddress(bayc.address, baycIds[0], loot.address, lootIds[0])
    const deed = await Bl3ndDeed.at(blendDeedAddress)

    await deed.unblend()

    assert.equal(await bayc.ownerOf(baycIds[0]), accounts[0])
    assert.equal(await loot.ownerOf(lootIds[0]), accounts[0])
    assert.equal(await blend.getDeedAddress(bayc.address, baycIds[0], loot.address, lootIds[0]), '0x0000000000000000000000000000000000000000')
    assert.equal(await web3.eth.getCode(blendDeedAddress), '0x')

    const tokenId = await blend.blendTokenId(bayc.address, baycIds[0], loot.address, lootIds[0])
    await assert.rejects(() => blend.ownerOf(tokenId))
  })

  it('only owner can unblend', async () => {
    const bayc = await createBayc()
    const loot = await createLoot()

    const blend = await Bl3nd.new()

    await bayc.approve(blend.address, baycIds[0])
    await loot.approve(blend.address, lootIds[0])

    await blend.blend(bayc.address, baycIds[0], loot.address, lootIds[0])

    const blendDeedAddress = await blend.getDeedAddress(bayc.address, baycIds[0], loot.address, lootIds[0])
    const deed = await Bl3ndDeed.at(blendDeedAddress)

    await assert.rejects(() => deed.unblend({ from: accounts[1] }))
  })


  it('recipient can unblend after transferring nft', async () => {
    const bayc = await createBayc()
    const loot = await createLoot()

    const blend = await Bl3nd.new()

    await bayc.approve(blend.address, baycIds[0])
    await loot.approve(blend.address, lootIds[0])

    await blend.blend(bayc.address, baycIds[0], loot.address, lootIds[0])

    const blendDeedAddress = await blend.getDeedAddress(bayc.address, baycIds[0], loot.address, lootIds[0])
    const deed = await Bl3ndDeed.at(blendDeedAddress)

    const tokenId = await blend.blendTokenId(bayc.address, baycIds[0], loot.address, lootIds[0])
    await blend.transferFrom(accounts[0], accounts[1], tokenId)

    await deed.unblend({ from: accounts[1] })

    assert.equal(await bayc.ownerOf(baycIds[0]), accounts[1])
    assert.equal(await loot.ownerOf(lootIds[0]), accounts[1])
    assert.equal(await blend.getDeedAddress(bayc.address, baycIds[0], loot.address, lootIds[0]), '0x0000000000000000000000000000000000000000')
    assert.equal(await web3.eth.getCode(blendDeedAddress), '0x')

    await assert.rejects(() => blend.ownerOf(tokenId))
  })
})
