pragma solidity ^0.4.13;

contract Hashed {

    function Hashed()
    public
    {

    }

    function hashMe(bytes32 value1, bytes32 value2)
    public
    pure
    returns(bytes32 hashedVals)
    {
        return keccak256(keccak256(value1), keccak256(value2));
    }

    function hashEash(bytes32 value)
    public
    pure
    returns(bytes32 hash)
    {
      return keccak256(value);
    }

}
