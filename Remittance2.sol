pragma solidity ^0.4.13;


contract Remittance {

    address public owner;
    bytes32 public bobHashedPass;
    bytes32 public carolHashedPass;

    address remitAddy;
    bool unlocked;
    bytes32 public testPass1;
    bytes32 public testPass2;

    function Remittance()
    public
    {
        owner = msg.sender;
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

    function checkPass()
    {
        require(bobHashedPass == testPass1);
	require(carolHashedPass == testPass2);
	unlocked = true;
    }

    function checkKey(bytes32 pass1, bytes32 pass2)
    {
	testPass1 = keccak256(pass1);
	testPass2 = keccak256(pass2);
	remitAddy = msg.sender;
	checkPass();
    }

    function withdrawFunds(bytes32 pass1, bytes32 pass2)
    public
    returns(bool success)
    {
	checkKey(pass1, pass2);
	require(this.balance > 0);
	require(remitAddy != 0);
        remitAddy.transfer(this.balance);
	return true;
    }

}
