const assert = require('assert')
const { createBayc, baycIds, createLoot, lootIds } = require('./dummyNFTs')

const Bl3nd = artifacts.require('Bl3nd')
const Bl3ndCrypt = artifacts.require('Bl3ndCrypt')
const Bl3ndDeed = artifacts.require('Bl3ndDeed')

contract('Bl3nder', (accounts) => {
  beforeEach(async () => {
    this.bayc = await createBayc()
    this.loot = await createLoot()
    const crypt = await Bl3ndCrypt.new()
    this.bl3nd = await Bl3nd.new(crypt.address)
  })

  it('blends: creates a Bl3nd Deed that owns the blended nfts + mints an NFT', async () => {
    await this.bayc.approve(this.bl3nd.address, baycIds[0])
    await this.loot.approve(this.bl3nd.address, lootIds[0])

    await this.bl3nd.blend(this.bayc.address, baycIds[0], this.loot.address, lootIds[0])

    const blendDeedAddress = await this.bl3nd.getDeedAddress(this.bayc.address, baycIds[0], this.loot.address, lootIds[0])

    assert.equal(await this.bayc.ownerOf(baycIds[0]), blendDeedAddress)
    assert.equal(await this.loot.ownerOf(lootIds[0]), blendDeedAddress)

    const tokenId = await this.bl3nd.blendTokenId(this.bayc.address, baycIds[0], this.loot.address, lootIds[0])
    assert.equal(await this.bl3nd.ownerOf(tokenId), accounts[0])
  })

  it('cannot blend if not owner of nft 0', async () => {
    await this.bayc.transferFrom(accounts[0], accounts[1], baycIds[0])

    await this.bayc.approve(this.bl3nd.address, baycIds[0], { from: accounts[1] })
    await this.loot.approve(this.bl3nd.address, lootIds[0])

    await assert.rejects(() => this.bl3nd.blend(this.bayc.address, baycIds[0], this.loot.address, lootIds[0]))
  })

  it('cannot blend if not owner of nft 1', async () => {
    await this.loot.transferFrom(accounts[0], accounts[1], lootIds[0])

    await this.bayc.approve(this.bl3nd.address, baycIds[0])
    await this.loot.approve(this.bl3nd.address, lootIds[0], { from: accounts[1] })

    await assert.rejects(() => this.bl3nd.blend(this.bayc.address, baycIds[0], this.loot.address, lootIds[0]))
  })

  it('only deed can set unblent', async () => {
    await this.bayc.approve(this.bl3nd.address, baycIds[0])
    await this.loot.approve(this.bl3nd.address, lootIds[0])

    await this.bl3nd.blend(this.bayc.address, baycIds[0], this.loot.address, lootIds[0])

    await assert.rejects(() => this.bl3nd.setUnblent(this.bayc.address, baycIds[0], this.loot.address, lootIds[0]))
  })
})

contract('Bl3nd Deed', (accounts) => {
  beforeEach(async () => {
    this.bayc = await createBayc()
    this.loot = await createLoot()

    this.crypt = await Bl3ndCrypt.new()
    this.bl3nd = await Bl3nd.new(this.crypt.address)

    await this.bayc.approve(this.bl3nd.address, baycIds[0])
    await this.loot.approve(this.bl3nd.address, lootIds[0])

    await this.bl3nd.blend(this.bayc.address, baycIds[0], this.loot.address, lootIds[0])

    const blendDeedAddress = await this.bl3nd.getDeedAddress(this.bayc.address, baycIds[0], this.loot.address, lootIds[0])
    this.deed = await Bl3ndDeed.at(blendDeedAddress)

    this.tokenId = await this.bl3nd.blendTokenId(this.bayc.address, baycIds[0], this.loot.address, lootIds[0])
  })

  it('unblends: transferring nfts back + deleting deed + burning nft', async () => {
    await this.deed.unblend()

    assert.equal(await this.bayc.ownerOf(baycIds[0]), accounts[0])
    assert.equal(await this.loot.ownerOf(lootIds[0]), accounts[0])
    assert.equal(await this.bl3nd.getDeedAddress(this.bayc.address, baycIds[0], this.loot.address, lootIds[0]), '0x0000000000000000000000000000000000000000')
    assert.equal(await web3.eth.getCode(this.deed.address), '0x')

    await assert.rejects(() => this.bl3nd.ownerOf(this.okenId))
  })

  it('only owner can unblend', async () => {
    await assert.rejects(() => this.deed.unblend({ from: accounts[1] }))
  })

  it('recipient can unblend after transferring nft', async () => {
    await this.bl3nd.transferFrom(accounts[0], accounts[1], this.tokenId)

    await this.deed.unblend({ from: accounts[1] })

    assert.equal(await this.bayc.ownerOf(baycIds[0]), accounts[1])
    assert.equal(await this.loot.ownerOf(lootIds[0]), accounts[1])
    assert.equal(await this.bl3nd.getDeedAddress(this.bayc.address, baycIds[0], this.loot.address, lootIds[0]), '0x0000000000000000000000000000000000000000')
    assert.equal(await web3.eth.getCode(this.deed.address), '0x')

    await assert.rejects(() => this.bl3nd.ownerOf(this.tokenId))
  })

  it('seal: cannot unblend anymore + tokens are sent to the crypt', async () => {
    await this.deed.seal()

    await assert.rejects(() => this.deed.unblend())

    assert.equal(await this.bayc.ownerOf(baycIds[0]), this.crypt.address)
    assert.equal(await this.loot.ownerOf(lootIds[0]), this.crypt.address)
  })

  it('only owner can seal', async () => {
    await assert.rejects(() => this.deed.seal({ from: accounts[1] }))
  })
})
