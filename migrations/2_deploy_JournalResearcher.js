var JournalResearcher = artifacts.require('./JournalResearcher.sol');

module.exports = function(deployer){
    deployer.deploy(JournalResearcher);
};