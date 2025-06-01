//SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {FundIdris} from "../../src/FundIdris.sol";
import {DeployFundIdris} from "../../script/DeployFundIdris.s.sol";
import {FundFundIdris, WithdrawFundIdris} from "../../script/Interactions.s.sol";

contract InteractionsTest is Test {
    FundIdris fundIdris;

   address USER = makeAddr("user");
   uint256 constant private SEND_VALUE = 6 ether;
   uint256 constant private STARTING_BALANCE = 10 ether;
   uint256 constant GAS_PRICE = 1;


    function setUp() external {
        DeployFundIdris deployFundIdris = new DeployFundIdris();
        fundIdris = deployFundIdris.run();
        vm.deal(USER, STARTING_BALANCE);
    }

    function testUserCanFundInteractions() public {
        FundFundIdris fundFundIdris = new FundFundIdris();
        // vm.prank(USER);
        fundFundIdris.fundFundIdris(address(fundIdris));
        WithdrawFundIdris withdrawFundIdris = new WithdrawFundIdris();
        withdrawFundIdris.withdrawFundIdris(address(fundIdris)); 
        // address funder = fundIdris.getFunder(0);
        assertEq(address(fundIdris).balance, 0);
    }

    function testFundingRevertsWithoutETH() public {
        vm.expectRevert();
        fundIdris.fund(); // <- Call directly with no ETH
    }

    // Test successful withdrawal through script
    function testOwnerCanWithdraw() public {
    // Fund contract directly
        vm.prank(USER);
        fundIdris.fund{value: SEND_VALUE}();
        uint256 ownerBalanceBefore = fundIdris.getOwner().balance;
        uint256 contractBalanceBefore = address(fundIdris).balance;

        // Execute withdrawal as owner without broadcast
        vm.prank(fundIdris.getOwner());
        fundIdris.withdraw();  // Call directly instead of through script
        
        assertEq(address(fundIdris).balance, 0);
        assertEq(
            fundIdris.getOwner().balance,
            ownerBalanceBefore + contractBalanceBefore
        );
    }

    // Test withdrawal failure by non-owner
   function testWithdrawRevertsForNonOwner() public {
        vm.prank(USER);
        fundIdris.fund{value: SEND_VALUE}();
        
        WithdrawFundIdris withdrawer = new WithdrawFundIdris();
        
        // Simulate non-owner calling the script
        vm.prank(USER);  // USER is not the owner
        vm.expectRevert();
        withdrawer.withdrawFundIdris(address(fundIdris));
    }
}