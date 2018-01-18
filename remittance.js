var Remittance = artifacts.require("./Remittance.sol");

contract ('Remittance', function(accounts) {

  var owner = accounts[0];
  var contractInitBalance;
  var amount = 1000;
  var pass1 = "abc";
  var pass2 = "def";

  beforeEach(function() {
    return Remittance.new(pass1, pass2, {from: owner})
    .then(function(instance) {
      contractInstance = instance;
      web3.eth.sendTransaction({from: owner, to: contractInstance.address,
        value: amount});
      contractInitBalance = web3.eth.getBalance(contractInstance.address).toNumber();
    });
  });

  //test owner
  it("Should be owner by owner", function() {
    return contractInstance.owner({from: owner})
    .then(function(_result) {
      assert.equal(_result, owner, "Contract owner is not owned by owner.");
    });
  });

  //test send transaction to contract
  it("Should have the balance sent in initialization", function() {
    var contractBalanceFinal
    var contractBalanceNow
    contractBalanceFinal = contractInitBalance + amount;
    contractBalanceNow = web3.eth.getBalance(contractInstance.address).toNumber();
    assert.equal(contractBalanceNow, contractBalanceFinal, "Contract balance is not correct.");
  });

  //test remitFunds
  it("Should send the contract's balance", function() {
    return contractInstance.remitFunds(pass1,pass2,{from: owner})
    .then(function(_result) {
      assert.equal(_result[0], true, "Something went wrong with remitFunds.");
    });
  });

});
