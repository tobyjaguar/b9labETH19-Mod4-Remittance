var Remittance = artifacts.require("./Remittance.sol");

contract ('Remittance', function(accounts) {

  var owner = accounts[0];
  var remitAddress = accounts[1];
  var amount = 1000;

  //var pass1 = "0x616263";
  //var pass2 = "0x646566"
  //var hashedPass1 = "0x9b8075e3114a237714bcee811cbb0337de6d1423cb2947266772aae5963ec8e5";
  //var hashedPass2 = "0xc6f91c219c527df164f349f01610e87533ec0c3b5c11fddd8052d101332c0257";
  //Hash here
  var pass1 = "acb";
  var pass2 = "def";
  var hashedPass1 = web3.sha3(pass1);
  var hashedPass2 = web3.sha3(pass2);

  beforeEach(function() {
    return Remittance.new({from: owner})
    .then(function(instance) {
      contractInstance = instance;
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
  it("Should have received funds and set passwords", function() {
    var contractBalanceFinal
    var contractBalanceNow
    var setPassBob
    var setPassCarol

    return contractInstance.getBalance.call({from: owner})
    .then(function(_balance) {
      contractBalanceNow = _balance;
    });

    return contractInstance.setPass(hashedPass1, hashedPass2, remitAddress, {from: owner, value: amount})
      .then(function(_result) {
        return contractInstance.getBalance.call()
        .then(function(_balance) {
          contractBalanceFinal = _balance;
        });
        console.log(JSON.stringify("setPass returned: " + _result, null, 4));
        assert.equal(contractBalanceNow, contractBalanceFinal, "Contract balance is not correct.");
      });
    //setPassBob = contractInstance.bobHashedPass.toString();
    return contractInstance.bobHashedPass({from: owner})
    .then(function(_result) {
      setPassBob = _result.toString();
      assert.equal(setPassBob, hashedPass1, "Bob's hashed password should have been passed.");
    });
    return contractInstance.carolHashedPass({from: owner})
    .then(function(_result) {
      setPassCarol = _result.toString();
      assert.equal(setPassCarol, hashedPass2, "Carol's hashed password should have been passed.");
    });

  });

  //test withdrawFunds function
  it("Should withdraw funds", function() {
    var remitBalanceBefore
    var remitBalanceNow

    //How to promisify this to make it asynchronous???
    //remitBalanceBefore = web3.eth.getBalance(remitAddress);
    remitBalanceBefore = remitAddress.balance;

    return contractInstance.setPass(hashedPass1, hashedPass2, remitAddress, {from: owner, value: amount})
      .then(function(_result) {
      });

    return contractInstance.withdrawFunds(pass1, pass2, {from: remitAddress})
    .then(function(_result) {
      console.log(JSON.stringify("withdrawFunds returned: " + _result, null, 4));
    });

    remitBalanceNow = remitAddress.balance;

    assert.equal(remitBalanceNow, remitBalanceBefore + amount,
      "Something went wrong with withdrawFunds()");
  });

});
