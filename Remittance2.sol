//Note for this to set correctly
//hashed passes need to be Solidity hashes of bytes32, not strings
//keccak256(bytes32) != keccak256(string)
pragma solidity ^0.4.13;

import "./Stoppable.sol";


contract Remittance is Stoppable {

    uint256 public balance;

    struct Remitter {
        bytes32 hashedPassword;
        uint256 expirationBlock;
        uint256 remitAmount;
    }

    mapping(address => Remitter) public remitters;

    event LogSetRemittance(address eRemitAddress, uint256 eExpirationBlock, uint256 eAmount);
    event LogWithdraw(address eSender, uint256 eAmount);
    event LogRefund(address eSender, uint256 eAmount);

    function Remittance()
    public
    {

    }

    function getBalance()
    public
    constant
    returns (uint256 _balance)
    {
        return balance;
    }

    function hashPasswords(address _remit, bytes32 _unhashedPassword)
    public
    constant
    returns (bytes32 hashedOutput)
    {
        return keccak256(_remit, _unhashedPassword);
    }

    function setPass(address _remitAddress, bytes32 _hashedPassword, uint256 _duration)
    public
    payable
    onlyOwner
    onlyIfRunning
    returns (bool success)
    {
        require(msg.value > 0);
        require(_remitAddress != 0);
        require(_hashedPassword != 0);
        require(block.number < block.number + _duration);
        remitters[_remitAddress].hashedPassword = _hashedPassword;
        remitters[_remitAddress].expirationBlock = _duration + block.number;
        remitters[_remitAddress].remitAmount += msg.value;
        balance += msg.value;

        LogSetRemittance(_remitAddress, remitters[_remitAddress].expirationBlock, msg.value);
        return true;
    }

    function withdrawFunds(bytes32 _unhashedPassword)
    public
    onlyIfRunning
    returns(bool success)
    {
        require(msg.sender != 0);
        require(remitters[msg.sender].remitAmount > 0);
        require(block.number < remitters[msg.sender].expirationBlock);
        require(remitters[msg.sender].hashedPassword == hashPasswords(msg.sender, _unhashedPassword));
        uint256 amountToSend;
        amountToSend = remitters[msg.sender].remitAmount;
        remitters[msg.sender].remitAmount = 0;
        msg.sender.transfer(amountToSend);
        balance -= amountToSend;

        LogWithdraw(msg.sender, amountToSend);
        return true;
    }

    function refund(address _remitAddress)
    public
    onlyOwner
    onlyIfRunning
    returns(bool success)
    {
        require(remitters[_remitAddress].remitAmount > 0);
        require(remitters[_remitAddress].expirationBlock <= block.number);
        uint256 amountToSend;
        amountToSend = remitters[_remitAddress].remitAmount;
        remitters[_remitAddress].remitAmount = 0;
        balance -= amountToSend;
        owner.transfer(amountToSend);

        LogRefund(msg.sender, amountToSend);
        return true;
    }

}
