//Note for this to set correctly
//hashed passes need to be Solidity hashes of bytes32, not strings
//keccak256(bytes32) != keccak256(string)
pragma solidity ^0.4.13;

import "./Stoppable.sol";


contract Remittance is Stoppable {

    address public owner;
    address public carol;
    bytes32 public hashedPass;
    uint256 public expirationBlock;
    uint256 public balance;

    bool public isSet;

    event LogSetRemittance(address carolAddress, uint256 expirationBlock, uint256 amount);
    event LogWithdraw(address sender, uint256 amount);
    event LogRefund(address sender, uint256 balance);

    function Remittance()
    public
    {

    }

    function getBalance()
    public
    constant
    onlyIfRunning
    returns (uint256 _balance)
    {
        return balance;
    }

    function setPass(bytes32 _hashedPass, address carolAddress, uint256 duration)
    public
    payable
    onlyOwner
    onlyIfRunning
    returns (bool success)
    {
        require(msg.value > 0);
        require(!isSet);
        require(carolAddress != 0);
        require(_hashedPass != 0);
        require(block.number < block.number + duration);
        hashedPass = _hashedPass;
        carol = carolAddress;
        expirationBlock = duration + block.number;
        isSet = true;
        balance += msg.value;

        LogSetRemittance(carolAddress, expirationBlock, msg.value);
        return true;
    }

    function withdrawFunds(bytes32 pass1, bytes32 pass2)
    public
    onlyIfRunning
    returns(bool success)
    {
        require(balance > 0);
        require(msg.sender == carol);
        require(isSet);
        require(block.number < expirationBlock);
        require(hashedPass == keccak256(keccak256(pass1), keccak256(pass2)));
        uint256 amountToSend;
        amountToSend = balance;
        balance = 0;
        isSet = false;
        carol.transfer(amountToSend);

        LogWithdraw(msg.sender, amountToSend);
        return true;
    }

    function refund()
    public
    onlyOwner
    onlyIfRunning
    returns(bool success)
    {
        require(isSet);
        require(expirationBlock <= block.number);
        isSet = false;
        owner.transfer(balance);

        LogRefund(msg.sender, balance);
        return true;
    }

}
