//Remittance contract
//takes two passwords to release the funds
pragma solidity ^0.4.13;


contract Remittance {

    address public owner;
    bytes32 private bobHashedPass;
    bytes32 private carolHashedPass;

    //Constructor
    function Remittance(bytes32 bobPass, bytes32 carolPass)
        public {
            owner = msg.sender;
            bobHashedPass = keccak256(bobPass);
            carolHashedPass = keccak256(carolPass);

        }

    //get contract balance
    function getBalance()
    public
    constant
    returns (bool success, uint256 balance) {
        return (true, this.balance);
    }

    //receive funds
    function sendFunds()
    public
    payable
    returns (bool success) {
        require(msg.value > 0);
        return (true);
    }

    //function to send contract balance
    //must verify both passwords
    function remitFunds(bytes32 pass1, bytes32 pass2)
        public
        returns (bool success) {
            require(this.balance > 0);
            //check/sanitize user data
            if (bobHashedPass == keccak256(pass1)
            && carolHashedPass == keccak256(pass2)) {
                msg.sender.transfer(this.balance);
                return true;
            }
        }

}
