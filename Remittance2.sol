pragma solidity ^0.4.13;


contract Remittance {

    address public owner;
    address public carol;
    bytes32 public hashedPass;
    uint256 public expirationBlock;

    bool public isSet;

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

    function setPass(bytes32 hashedPass1, bytes32 hashedPass2, address carolAddress, uint256 duration)
    public
    payable
    returns (bool success)
    {
        require(owner == msg.sender);
        require(msg.value > 0);
        require(!isSet);
        require(carolAddress != 0);
        require(hashedPass1 != 0);
        require(hashedPass2 != 0);
        require(block.number < block.number + duration);
        hashedPass = keccak256(hashedPass1, hashedPass2);
        carol = carolAddress;
        expirationBlock = duration + block.number;
        isSet = true;
        return true;
    }

    function withdrawFunds(bytes32 pass1, bytes32 pass2)
    public
    returns(bool success)
    {
        require(this.balance > 0);
        require(msg.sender == carol);
        require(isSet);
        require(block.number < expirationBlock);
        require(hashedPass == keccak256(keccak256(pass1), keccak256(pass2)));
        isSet = false;
        carol.transfer(this.balance);
        return true;
    }

    function refund()
    public
    returns(bool success)
    {
        require(msg.sender == owner);
        require(isSet);
        require(expirationBlock <= block.number);
        isSet = false;
        owner.transfer(this.balance);
        return true;
    }

}
