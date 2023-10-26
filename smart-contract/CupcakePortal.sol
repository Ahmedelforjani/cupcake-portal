// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract CupcakePortal {
    uint256 public totalCupcakes = 0;

    address payable public owner;

    event NewCupcake(
        address indexed from,
        string message,
        uint256 value,
        uint256 timestamp
    );

    mapping(uint256 => Cupcake) public cupcakes;

    struct Cupcake {
        address from; // The address of the user who buys me a cupcake.
        string message; // The message the user sent.
        uint256 value;
        uint256 timestamp; // The timestamp when the user buys me a cupcake.
    }

    constructor() {
        owner = payable(msg.sender);
    }

    function getCupcake(
        uint256 offset,
        uint256 count
    ) public view returns (Cupcake[] memory) {
        Cupcake[] memory _cupcakes = new Cupcake[](count);
        for (uint256 i = 0; i < count; i++) {
            _cupcakes[i] = cupcakes[i + offset];
        }
        return _cupcakes;
    }

    function buyCupcake(string memory _message) public payable {
        totalCupcakes++;

        cupcakes[totalCupcakes] = Cupcake(
            msg.sender,
            _message,
            msg.value,
            block.timestamp
        );

        (bool success, ) = owner.call{value: msg.value}("");
        require(success, "Failed to send money");

        emit NewCupcake(msg.sender, _message, msg.value, block.timestamp);
    }

    function emergencyWithdraw() public {
        require(msg.sender == owner, "You are not the owner");
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Failed to send money");
    }
}
