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
    {
        require(owner == msg.sender);
        bobHashedPass = hashedPass1;
        carolHashedPass = hashedPass2;
    }

    function receiveFunds()
    public
    payable
    returns (bool success)
    {
        require(msg.sender == owner);
        return true;

    }

    function withdrawFunds(bytes32 pass1, bytes32 pass2)
    public
    {
        if (bobHashedPass == keccak256(pass1) || carolHashedPass == keccak256(pass1)) {
            if (bobHashedPass == keccak256(pass2) || carolHashedPass == keccak256(pass2)) {
                msg.sender.transfer(this.balance);
            }
        }
    }

}
