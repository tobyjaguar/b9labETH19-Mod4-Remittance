pragma solidity ^0.4.13;

contract Remittance {
    
    address owner;
    bytes32 bobHashedPass;
    bytes32 carolHashedPass;
    
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
        if(pass1 == bobHashedPass || pass1 == carolHashedPass) {
            if(pass2 == bobHashedPass || pass2 == carolHashedPass) {
                msg.sender.transfer(this.balance);
            }
        }
    }
    
}
