var Journal = artifacts.require('./Journal.sol');

module.exports = function(deployer){
    deployer.deploy(Journal);
};