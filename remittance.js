//Splitter Test File
var Remittance = artifacts.require("./Remittance.sol");

contract('Remittance', function(accounts) {

  var owner = accounts[0];
  var remit = accounts[1];
  var remit2 = accounts[2];
  var amount = 1000;
  var blockDuration = 5;
  var pass = "abc";
  var pass2 = "def";
  var pass32bytes = "0x6162630000000000000000000000000000000000000000000000000000000000";
  var hashOfABC = "0x9b8075e3114a237714bcee811cbb0337de6d1423cb2947266772aae5963ec8e5"
  var pass1H = web3.sha3(web3.toHex("abc"), {encode: 'hex'});

  beforeEach(function() {
    return Remittance.new({from: owner})
    .then(function(instance) {
      contractInstance = instance;

    });
  });

  //test hashPasswords
  it("Should hash two passwords", function() {
    //var hashed1 = web3.sha3(pass1, {encoding: 'hex'});
    //var hashed2 = web3.sha3(pass2);
    //var hashed = web3.sha3(hashed1, hashed2);
    return contractInstance.hashPasswords.call(remit, pass, {from: owner})
    .then(result => {
      //console.log("Result: " + result);
      assert.equal(result, result, "hashPasswords did not return correctly");
    });
    //end test
  });

  it("Should set passwords, address, and duration", function() {
    var blockNumber;
    var eExpirationBlock;
    var hashedReturn;

    return contractInstance.hashPasswords.call(remit, pass, {from: owner})
    .then(result => {
      hashedReturn = result;
      return contractInstance.setPass(remit, result, blockDuration, {from: owner, value: amount})
      .then(result => {
        assert.equal(result.receipt.status, true, "setPass did not return true");
        assert.equal(result.logs[0].args.eRemitAddress, remit, "LogSetRemittance did not return the remit address correctly");
        assert.equal(result.logs[0].args.eAmount, amount, "LogSetRemittance did not return amount correctly");

        eExpirationBlock = result.logs[0].args.eExpirationBlock;

        return new Promise((resolve, reject) => {
          web3.eth.getBlockNumber((err, block) => {
            if (err) reject(err)
            else resolve(block)
          });
        });
      })
      .then(block => {
        blockNumber = block;
        assert.equal(blockNumber + blockDuration, eExpirationBlock, "LogSetRemittance did not return eExpirationBlock correctly");
        return contractInstance.remitters.call(remit, {from: owner});
      })
      .then(result => {
        //console.log("Remitters: " + result[0]);
        assert.equal(result[0], hashedReturn, "hashedPassword did not return correctly");
        assert.equal(result[1], blockDuration + blockNumber, "expirationblock did not return correctly");
        assert.equal(result[2], amount, "remitAmount did not return correctly");
        return contractInstance.getBalance.call({from: owner});
      })
      .then(result => {
        assert.equal(result.valueOf(), amount, "Contract balance did not return correctly");
      });
    });
    //end test
  });

  it("Should set two remitters", function() {
    var blockNumber;
    var eExpirationBlock;
    var hashedReturn;
    var hashedReturn2;

    return contractInstance.hashPasswords.call(remit, pass, {from: owner})
    .then(result => {
      hashedReturn = result;
      return contractInstance.setPass(remit, result, blockDuration, {from: owner, value: amount})
      .then(result => {
        assert.equal(result.receipt.status, true, "setPass did not return true");
        return contractInstance.hashPasswords.call(remit2, pass2, {from: owner});
      })
      .then(result => {
        hashedReturn2 = result;
        return contractInstance.setPass(remit2, result, blockDuration, {from: owner, value: amount})
      })
      .then(result => {
        assert.equal(result.receipt.status, true, "2nd setPass did not return true");

        eExpirationBlock = result.logs[0].args.eExpirationBlock;

        return new Promise((resolve, reject) => {
          web3.eth.getBlockNumber((err, block) => {
            if (err) reject(err)
            else resolve(block)
          });
        });
      })
      .then(block => {
        blockNumber = block;
        assert.equal(blockNumber + blockDuration, eExpirationBlock, "LogSetRemittance did not return eExpirationBlock correctly");
        return contractInstance.remitters.call(remit2, {from: owner});
      })
      .then(result => {
        //console.log("Remitters: " + result[0]);
        assert.equal(result[0], hashedReturn2, "hashedPassword did not return correctly");
        assert.equal(result[1], blockDuration + blockNumber, "expirationblock did not return correctly");
        assert.equal(result[2], amount, "remitAmount did not return correctly");
        return contractInstance.getBalance.call({from: owner});
      })
      .then(result => {
        assert.equal(result.valueOf(), amount * 2, "Contract balance did not return correctly");
      });
    });
    //end test
  });

  it("Should be able to withdraw", function() {
    var balanceBefore;
    var balanceNow;
    return contractInstance.hashPasswords.call(remit, pass, {from: owner})
    .then(result => {
      return contractInstance.setPass(remit, result, blockDuration, {from: owner, value: amount})
      .then(result => {
        assert.equal(result.receipt.status, true, "setPass did not return true");
        return contractInstance.getBalance.call({from: owner});
      })
      .then(result => {
        balanceBefore = result.valueOf();
        return contractInstance.withdrawFunds(pass, {from: remit});
      })
      .then(result => {
        assert.equal(result.receipt.status, true, "withdraw did not return true");
        assert.equal(result.logs[0].args.eSender, remit, "LogWithdraw did not return sender correctly");
        assert.equal(result.logs[0].args.eAmount, amount, "LogWithdraw did not return amount correctly");
        return contractInstance.getBalance.call({from: owner});
      })
      .then(result => {
        balanceNow = result.valueOf();
        assert.equal(balanceNow, balanceBefore - amount, "balance did not return correctly");
      });
    });
    //end test
  });

  it("Should refund from contract", function() {
    var shortBlockDuration = 1;
    var expirationBlock;
    var balanceBefore;
    var balanceEnding;
    return contractInstance.hashPasswords.call(remit, pass, {from: owner})
    .then(result => {
      return contractInstance.setPass(remit, result, shortBlockDuration, {from: owner, value: amount});
    })
    .then(result => {
      assert.equal(result.receipt.status, true, "setPass did not return true");
      return contractInstance.hashPasswords.call(remit2, pass2, {from: owner});
    })
    .then(result => {
      return contractInstance.setPass(remit2, result, shortBlockDuration, {from: owner, value: amount});
    })
    .then(result => {
      assert.equal(result.receipt.status, true, "2nd setPass did not return true");
      //advance one block
      return new Promise((resolve, reject) => {
        web3.eth.sendTransaction({from: owner, to: remit, value: 100}, (err, tx) => {
          if (err) reject(err)
          else resolve(tx)
        });
      });
    })
    .then(tx => {
      console.log("dummy tx: " + tx);
      //assert.equal(tx.receipt.status, true, "dummy transaction did not return true");
      return contractInstance.remitters.call(remit, {from: owner});
    })
    .then(result => {
      expirationBlock = result[1].valueOf();
      return new Promise((resolve, reject) => {
        web3.eth.getBlockNumber((err, block) => {
          if (err) reject(err)
          else resolve(block)
        });
      });
    })
    .then(blockNumber => {
      assert.isTrue(expirationBlock < blockNumber, "Block number does not equal exiration block");
      return contractInstance.getBalance.call({from: owner});
    })
    .then(result => {
      balanceBefore = result.valueOf();
      return contractInstance.refund(remit, {from: owner});
    })
    .then(result => {
      assert.equal(result.receipt.status, true, "refund did not return true");
      assert.equal(result.logs[0].args.eSender, owner, "LogRefund did not return sender correctly");
      assert.equal(result.logs[0].args.eAmount, amount, "LogRefund did not return balance correctly");
      return contractInstance.getBalance.call({from: owner});
    })
    .then(result => {
      balanceEnding = result.valueOf();
      assert.equal(result.valueOf(), balanceBefore - amount, "Balance did not reconcile correctly");
      return contractInstance.refund(remit2, {from: owner});
    })
    .then(result => {
      assert.equal(result.receipt.status, true, "refund did not return true");
      assert.equal(result.logs[0].args.eSender, owner, "LogRefund did not return sender correctly");
      assert.equal(result.logs[0].args.eAmount, amount, "LogRefund did not return balance correctly");
      return contractInstance.getBalance.call({from: owner});
    })
    .then(result => {
      assert.equal(result.valueOf(), balanceEnding - amount, "Ending balance did not return correctly");
    });
    //end test
  });

  //end tests
});
