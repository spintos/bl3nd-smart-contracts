const PremintedNFTFactory = artifacts.require('PremintedNFTFactory')
const Bl3ndCrypt = artifacts.require('Bl3ndCrypt')
const Bl3nd = artifacts.require('Bl3nd')

module.exports = function (deployer) {
  deployer.deploy(PremintedNFTFactory)
    .then(() => deployer.deploy(Bl3ndCrypt))
    .then(() => deployer.deploy(Bl3nd, Bl3ndCrypt.address))
}
