var PapersCoin = artifacts.require('./PapersCoin.sol');

module.exports = function(deployer){
    deployer.deploy(PapersCoin);
}