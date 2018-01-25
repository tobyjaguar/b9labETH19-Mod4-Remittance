pragma solidity ^0.4.13;


contract Remittance {

    address public owner;
    bytes32 public bobHashedPass;
    bytes32 public carolHashedPass;

    bool public unlocked;
    bytes32 public testPass1;
    bytes32 public testPass2;

    function Remittance()
    public
    {
        owner = msg.sender;
    }

    function getBalance()
    public
    constant
    returns (uint256 _balance)
    {
        return this.balance;
    }

    function setPass(bytes32 hashedPass1, bytes32 hashedPass2)
    public
    payable
    returns (bool success)
    {
        require(owner == msg.sender);
        require(hashedPass1 != 0);
        require(hashedPass2 != 0);
        bobHashedPass = hashedPass1;
        carolHashedPass = hashedPass2;
        return true;
    }

    function withdrawFunds(bytes32 pass1, bytes32 pass2)
    public
    returns(bool success)
    {
        require(this.balance > 0);
        require(msg.sender != 0);
        testPass1 = keccak256(pass1);
        testPass2 = keccak256(pass2);
        checkKey();
        require(unlocked);
	unlocked = false;
        msg.sender.transfer(this.balance);
        return true;
    }

    function checkKey()
    internal
    returns (bool success)
    {
        require(bobHashedPass == testPass1);
        require(carolHashedPass == testPass2);
        unlocked = true;
        return true;
    }
}
