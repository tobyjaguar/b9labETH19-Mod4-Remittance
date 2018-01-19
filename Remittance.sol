//Remittance contract
//takes two passwords to release the funds
pragma solidity ^0.4.13;


contract Remittance {

    address public owner;
    bytes32 private bobHashedPass;
    bytes32 private carolHashedPass;

    //Constructor
    function Remittance(bytes32 bobPass, bytes32 carolPass)
        internal {
            owner = msg.sender;
            bobHashedPass = keccak256(bobPass);
            carolHashedPass = keccak256(carolPass);

        }
        
        function varPass() 
        public
        view
        returns (bytes32 bobHashed, bytes32 carolHashed) {
            bobHashed = bobHashedPass;
            carolHashed = carolHashedPass;
            return (bobHashed, carolHashed);
        }
}

contract remitFunds is Remittance {

    bytes32 bobHashed;
    bytes32 carolHashed;
    //bytes32 pass1;
    //bytes32 pass2;
    function getVars() 
    public
    view
    returns (bytes32, bytes32) {
        return super.varPass();
    }

    //function to send contract balance
    //must verify both passwords
    function withdrawFunds(bytes32 pass1, bytes32 pass2)
        public
        returns (bool success) {
            require(this.balance > 0);
            //check-sanitize user data
            
            if (bobHashed == keccak256(pass1)
            && carolHashed == keccak256(pass2)) {
                msg.sender.transfer(this.balance);
                return true;
            }
        }

}
