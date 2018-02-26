//Note for this to set correctly
//hashed passes need to be Solidity hashes of bytes32, not strings
//keccak256(bytes32) != keccak256(string)
pragma solidity ^0.4.13;

import "./Stoppable.sol";


contract Remittance is Stoppable {

    address public remit;
    bytes32 public hashedPass;
    uint256 public expirationBlock;
    uint256 public balance;

    bool public isSet;

    event LogSetRemittance(address carolAddress, uint256 eExpirationBlock, uint256 amount);
    event LogWithdraw(address sender, uint256 amount);
    event LogRefund(address sender, uint256 eBalance);

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

    function hashPasswords(address _remit, bytes32 unhashedPassword)
    public
    constant
    onlyIfRunning
    returns (bytes32 hashedOutput)
    {
        return keccak256(_remit, unhashedPassword);
    }

    function setPass(address remitAddress, bytes32 hashedPassword, uint256 duration)
    public
    payable
    onlyOwner
    onlyIfRunning
    returns (bool success)
    {
        require(msg.value > 0);
        require(!isSet);
        require(remitAddress != 0);
        require(hashedPassword != 0);
        require(block.number < block.number + duration);
        hashedPass = hashedPassword;
        remit = remitAddress;
        expirationBlock = duration + block.number;
        isSet = true;
        balance += msg.value;

        LogSetRemittance(remit, expirationBlock, msg.value);
        return true;
    }

    function withdrawFunds(bytes32 unhashedPassword)
    public
    onlyIfRunning
    returns(bool success)
    {
        require(balance > 0);
        require(msg.sender == remit);
        require(isSet);
        require(block.number < expirationBlock);
        require(hashedPass == hashPasswords(msg.sender, unhashedPassword));
        uint256 amountToSend;
        amountToSend = balance;
        balance = 0;
        isSet = false;
        remit.transfer(amountToSend);

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
