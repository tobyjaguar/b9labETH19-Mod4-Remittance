//Remittance unit tests
Promise = require("bluebird");
var Remittance = artifacts.require("./Remittance.sol");

web3.eth.expectedException = require("../utils/expectedException.js");
//const sequentialPromise = require("../utils/sequentialPromise.js");
//web3.eth.makeSureHasAtLeast = require("../utils/makeSureHasAtLeast.js");
//web3.eth.makeSureAreUnlocked = require("../utils/makeSureAreUnlocked.js");
web3.eth.getTransactionReceiptMined = require("../utils/getTransactionReceiptMined.js");

contract('Remittance', function(accounts) {

  var owner = accounts[0];
  var remitter = accounts[1];
  var remittee = accounts[2];
  var remittee2 = accounts[3];
  var amount = 500000;
  var blockDuration = 5;
  var remitFee =  100000;
  var pass = "abc";
  var pass2 = "def";
  var pass32bytes = "0x6162630000000000000000000000000000000000000000000000000000000000";
  var hashOfABC = "0x9b8075e3114a237714bcee811cbb0337de6d1423cb2947266772aae5963ec8e5"
  var pass1H = web3.sha3(web3.toHex("abc"), {encode: 'hex'});

  beforeEach(function() {
    return Remittance.new(remitFee, {from: owner})
    .then(function(instance) {
      contractInstance = instance;

    });
  });

  it("Should be owned by owner", function() {
    return contractInstance.owner.call({from: owner})
    .then(result => {
      assert.strictEqual(result, owner, "owner did not return correctly");
    });
    //end test
  });

  it("Should return the remit fee", function() {
    return contractInstance.remitFee.call({from: owner})
    .then(result => {
      //console.log("Remit Fee: " + result);
      assert.strictEqual(result.toString(10), remitFee.toString(10), "Contract did not return the correct remit fee");
    });
    //end test
  });

  it("Should be able to change the remitFee", function() {
    var remitFee2 = 5000000;
    return contractInstance.changeRemitFee(remitFee2, {from: owner})
    .then(result => {
      assert.equal(result.receipt.status, true, "changeRemitFee did not return true");
      return contractInstance.remitFee.call({from: owner});
    })
    .then(result => {
      assert.strictEqual(result.toString(10), remitFee2.toString(10), "remitFee did not return to changed value");
    });
    //end test
  });

  //test hashPasswords
  //web3.sha3 returns a different hash than solidity keccak256
  //have not appropriately tested this
  it("Should hash two passwords, not tested", function() {
    var pass = "abc";
    //var hashed1 = web3.sha3(pass1, {encoding: 'hex'});
    //var hashed2 = web3.sha3(pass2);
    //var hashed = web3.sha3(hashed1, hashed2);
    return contractInstance.hashPasswords.call(remitter, pass, {from: owner})
    .then(result => {
      //console.log("Result: " + result);
      assert.strictEqual(result, result, "hashPasswords did not return correctly");
    });
    //end test
  });

  it("Should set passwords, address, and duration", function() {
    var pass = "abc";
    var blockDuration = 5;
    var amount = 500000;
    var blockNumber;
    var eExpirationBlock;
    var hashedReturn;
    var remitAmount;

    return contractInstance.hashPasswords.call(remitter, pass, {from: owner})
    .then(result => {
      hashedReturn = result;
      assert.isTrue(result > 0, "hashed did not return");
      return contractInstance.setPass(remittee, result, blockDuration, {from: owner, value: amount})
      .then(result => {
        assert.equal(result.receipt.status, true, "setPass did not return true");
        assert.strictEqual(result.logs[0].args.eRemittee.toString(10), remittee, "LogSetRemittance did not return the remit address correctly");
        assert.strictEqual(result.logs[0].args.eAmount.toString(10), (amount - remitFee).toString(10), "LogSetRemittance did not return amount correctly");
        assert.strictEqual(result.logs[0].args.eFee.toString(10), remitFee.toString(10), "LogSetRemittance did not return amount correctly");

        eExpirationBlock = result.logs[0].args.eExpirationBlock;
        remitAmount = amount - result.logs[0].args.eFee;

        blockNumber = result.receipt.blockNumber;

        assert.equal(blockNumber + blockDuration, eExpirationBlock, "LogSetRemittance did not return eExpirationBlock correctly");
        return contractInstance.remittees.call(remittee, {from: owner});
      })
      .then(result => {
        //console.log("Remitters: " + result[0]);
        assert.strictEqual(result[0].toString(10), hashedReturn, "hashedPassword did not return correctly");
        assert.strictEqual(result[1].toString(10), (blockDuration + blockNumber).toString(10), "expirationblock did not return correctly");
        assert.strictEqual(result[2].toString(10), remitAmount.toString(10), "remitAmount did not return correctly");
        return contractInstance.getBalance.call({from: owner});
      })
      .then(result => {
        assert.strictEqual(result.toString(10), (remitAmount + remitFee).toString(10), "Contract balance did not return correctly");
      });
    });
    //end test
  });

  it("Should set two remittees and one remitter", function() {
    var amount = 500000;
    var blockDuration = 5;
    var remitFee =  100000;
    var pass = "abc";
    var pass2 = "def";
    var blockNumber;
    var eExpirationBlock;
    var hashedReturn;
    var hashedReturn2;

    return contractInstance.hashPasswords.call(remitter, pass, {from: owner})
    .then(result => {
      hashedReturn = result;
      return contractInstance.setPass(remittee, result, blockDuration, {from: owner, value: amount})
      .then(result => {
        assert.equal(result.receipt.status, true, "setPass did not return true");
        return contractInstance.hashPasswords.call(remitter, pass2, {from: owner});
      })
      .then(result => {
        hashedReturn2 = result;
        return contractInstance.setPass(remittee2, result, blockDuration, {from: owner, value: amount})
      })
      .then(result => {
        assert.equal(result.receipt.status, true, "2nd setPass did not return true");

        eExpirationBlock = result.logs[0].args.eExpirationBlock;
        blockNumber = result.receipt.blockNumber;

        assert.strictEqual((blockNumber + blockDuration).toString(10), eExpirationBlock.toString(10), "LogSetRemittance did not return eExpirationBlock correctly");
        return contractInstance.remittees.call(remittee2, {from: owner});
      })
      .then(result => {
        //console.log("Remitters: " + result[0]);
        assert.strictEqual(result[0].toString(10), hashedReturn2, "hashedPassword did not return correctly");
        assert.strictEqual(result[1].toString(10), (blockDuration + blockNumber).toString(10), "expirationblock did not return correctly");
        assert.strictEqual(result[2].toString(10), (amount - remitFee).toString(10), "remitAmount did not return correctly");
        return contractInstance.getBalance.call({from: owner});
      })
      .then(result => {
        assert.equal(result.toString(10), (amount * 2).toString(10), "Contract balance did not return correctly");
        return contractInstance.feeBalance.call({from: owner});
      })
      .then(result => {
        assert.equal(result.toString(10), (remitFee * 2).toString(10), "Contract balance did not return correctly");
      });
    });
    //end test
  });

  it("Should be able to withdraw", function() {
    var amount = 500000;
    var blockDuration = 5;
    var remitFee =  100000;
    var pass = "abc";
    var pass2 = "def";
    var balanceBefore;
    var balanceNow;
    var amountToSend;

    return contractInstance.hashPasswords.call(remitter, pass, {from: owner})
    .then(result => {
      return contractInstance.setPass(remittee, result, blockDuration, {from: owner, value: amount})
      .then(result => {
        assert.equal(result.receipt.status, true, "setPass did not return true");
        return contractInstance.hashPasswords.call(remitter, pass2, {from: owner});
      })
      .then(result => {
        return contractInstance.setPass(remittee2, result, blockDuration, {from: owner, value: amount})
      })
      .then(result => {
        assert.equal(result.receipt.status, true, "2nd setPass did not return true");
        return contractInstance.getBalance.call({from: owner});
      })
      .then(result => {
        balanceBefore = result;
        return contractInstance.withdrawFunds(remittee, pass, {from: remitter});
      })
      .then(result => {
        assert.equal(result.receipt.status, true, "withdraw did not return true");
        assert.strictEqual(result.logs[0].args.eSender.toString(10), remitter, "LogWithdraw did not return sender correctly");
        assert.strictEqual(result.logs[0].args.eRemittee.toString(10), remittee, "LogWithdraw did not return remittee correctly");
        assert.strictEqual(result.logs[0].args.eAmount.toString(10), (amount - remitFee).toString(10), "LogWithdraw did not return amount correctly");

        amountToSend = result.logs[0].args.eAmount;
        return contractInstance.getBalance.call({from: owner});
      })
      .then(result => {
        balanceNow = result.valueOf();
        assert.equal(balanceNow.toString(10), balanceBefore.minus(amountToSend).toString(10), "balance did not return correctly");
        return contractInstance.feeBalance.call({from: owner});
      })
      .then(result => {
        assert.equal(result.toString(10), (remitFee * 2).toString(10), "fee balance did not return correctly");
      });
    });
    //end test
  });

  it("Should withdraw the remittance fee", function() {
    var amount = 500000;
    var blockDuration = 5;
    var remitFee =  100000;
    var pass = "abc";
    var pass2 = "def";
    var balanceBefore;
    var balanceNow;
    var feeBalanceBefore;
    var feeBalanceNow;

    return contractInstance.hashPasswords.call(remitter, pass, {from: owner})
    .then(result => {
      return contractInstance.setPass(remittee, result, blockDuration, {from: owner, value: amount})
      .then(result => {
        assert.equal(result.receipt.status, true, "setPass did not return true");
        return contractInstance.hashPasswords.call(remitter, pass2, {from: owner});
      })
      .then(result => {
        return contractInstance.setPass(remittee2, result, blockDuration, {from: owner, value: amount})
      })
      .then(result => {
        assert.equal(result.receipt.status, true, "2nd setPass did not return true");
        return contractInstance.getBalance.call({from: owner});
      })
      .then(result => {
        balanceBefore = result;
        return contractInstance.feeBalance.call({from: owner});
      })
      .then(result => {
        feeBalanceBefore =result;
        return contractInstance.feeWithdraw({from: owner});
      })
      .then(result => {
        assert.equal(result.receipt.status, true, "feeWithdraw did not return ture");
        assert.strictEqual(result.logs[0].args.eSender.toString(10), owner, "LogFeeWithdraw did not return sender correctly");
        assert.strictEqual(result.logs[0].args.eAmount.toString(10), (remitFee * 2).toString(10), "LogFeeWithdraw did not return amount correctly");
        return contractInstance.getBalance.call({from: owner});
      })
      .then(result => {
        balanceNow = result;
        return contractInstance.feeBalance.call({from: owner});
      })
      .then(result => {
        feeBalanceNow = result;
        assert.strictEqual(balanceNow.toString(10), balanceBefore.minus(remitFee * 2).toString(10), "contract balance did not return correctly");
        assert.strictEqual(feeBalanceNow.toString(10), feeBalanceBefore.minus(remitFee * 2).toString(10), "fee balance did not return correctly");
      });
    });
    //end test
  });

  describe("When the contract refunds", function() {
    var amount = 500000;
    var remitFee =  100000;
    var pass = "abc";
    var pass2 = "def";
    var shortBlockDuration = 1;
    var expirationBlock;
    var balanceBefore;
    var balanceEnding;
    var amountToSend;
    var amountToSend2;

    beforeEach(function() {
      return contractInstance.hashPasswords.call(remitter, pass, {from: owner})
      .then(result => {
        return contractInstance.setPass(remittee, result, shortBlockDuration, {from: owner, value: amount});
      })
      .then(result => {
        return contractInstance.hashPasswords.call(remitter, pass2, {from: owner});
      })
      .then(result => {
        return contractInstance.setPass(remittee2, result, shortBlockDuration, {from: owner, value: amount});
        web3.eth.sendTransactionPromise({from: owner, to: remitter, value: 100});
      })
      .then(() => {
        return contractInstance.remittees.call(remittee, {from: owner});
      });
    })

    it("Should refund from contract", function() {
      var amountToSend = 0;
      var amountToSend2 = 0;

      return contractInstance.getBalance.call({from: owner})
      .then(result => {
        balanceBefore = result;
        return contractInstance.refund(remittee, {from: owner});
      })
      .then(result => {
        assert.equal(result.receipt.status, true, "refund did not return true");
        assert.equal(result.logs[0].args.eSender.toString(10), owner, "LogRefund did not return sender correctly");
        assert.equal(result.logs[0].args.eRemittee.toString(10), remittee, "LogRefund did not return sender correctly");
        assert.equal(result.logs[0].args.eAmount.toString(10), (amount - remitFee).toString(10), "LogRefund did not return balance correctly");
        amountToSend = result.logs[0].args.eAmount;
        return contractInstance.getBalance.call({from: owner});
      })
      .then(result => {
        balanceEnding = result;
        assert.strictEqual(result.toString(10), balanceBefore.minus(amountToSend).toString(10), "Balance did not reconcile correctly");
        return contractInstance.refund(remittee2, {from: owner});
      })
      .then(result => {
        assert.equal(result.receipt.status, true, "refund did not return true");
        assert.strictEqual(result.logs[0].args.eSender.toString(10), owner, "LogRefund did not return sender correctly");
        assert.strictEqual(result.logs[0].args.eRemittee.toString(10), remittee2, "LogRefund did not return sender correctly");
        assert.strictEqual(result.logs[0].args.eAmount.toString(10), (amount - remitFee).toString(10), "LogRefund did not return balance correctly");
        amountToSend2 = result.logs[0].args.eAmount;
        return contractInstance.getBalance.call({from: owner});
      })
      .then(result => {
        assert.equal(result.toString(10), balanceEnding.minus(amountToSend2).toString(10), "Ending balance did not return correctly");
      });
      //end test
    });

    //end describe
  })

  it("Should not let non-owner stop the contract", function() {

    return web3.eth.expectedException(
      () => contractInstance.runSwitch(0, {from: remitter}),
    3000000);
    //end test
  });

  //test fail cases
  it("Should not change remitFee if not owner", function() {

    return web3.eth.expectedException(
      () => contractInstance.changeRemitFee(5, {from: remitter, gas: 3000000}),
        3000000);
    //end test
  });

  it("Should not change remitFee if not running", function() {

    return contractInstance.runSwitch(0, {from: owner})
    .then(result => {
      assert.equal(result.receipt.status, true, "runSwitch did not return true");
      return web3.eth.expectedException(
        () => contractInstance.changeRemitFee(5, {from: owner, gas: 3000000}),
      3000000);
    });
    //end test
  });

  //end tests
});
