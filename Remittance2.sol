pragma solidity ^0.4.13;


contract Remittance {

    address public owner;
    bytes32 public bobHashedPass;
    bytes32 public carolHashedPass;

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

    function withdrawFunds(bytes32 pass1, bytes32 pass2)
    public
    {
        require (bobHashedPass == keccak256(pass1));
	require (carolHashedPass == keccak256(pass2));
        msg.sender.transfer(this.balance);
    }

}
