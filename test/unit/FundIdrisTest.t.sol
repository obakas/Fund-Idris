// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {FundIdris} from "../../src/FundIdris.sol";
import {DeployFundIdris} from "../../script/DeployFundIdris.s.sol";

contract FundIdrisTest is Test {
   FundIdris fundIdris;

   address USER = makeAddr("user");
   uint256 constant private SEND_VALUE = 0.1 ether;
   uint256 constant private STARTING_BALANCE = 10 ether;
   uint256 constant GAS_PRICE = 1;

    function setUp() external {
         DeployFundIdris deployFundIdris = new DeployFundIdris();
         fundIdris = deployFundIdris.run();
         vm.deal(USER, STARTING_BALANCE);
    }


    function testMinimumDollarisFive() public view{
        assertEq(fundIdris.MINIMUM_USD(), 5e18);
    }

    function testOwnerIsMsgSender() public view{
        console.log("Owner is: ", fundIdris.getOwner());
        console.log("Msg sender is: ", msg.sender);
        assertEq(fundIdris.getOwner(), msg.sender);
    }

    function testPriceFeedVersionIsAccurate() public view{
        uint256 version = fundIdris.getVersion();
        assertEq(version, 4);
     }

     function testFundFailsWithoutEnoughETH() public {
        vm.expectRevert();
        fundIdris.fund();
     }


    //  function testFundUpdatesFundedDataStructure() public {
    //     vm.prank(USER);
    //     fundIdris.fund{value: SEND_VALUE}();
    //     uint256 ammountFunded = fundIdris.getAddressToAmmountFunded(msg.sender);
    //     assertEq(ammountFunded, SEND_VALUE);
    //  }

    function testAddsFunderToArrayOfFunders() public {
        vm.prank(USER);
        fundIdris.fund{value: SEND_VALUE}();
        address funder = fundIdris.getFunder(0);
        assertEq(funder, USER, "Wrong funder added");
    }

    modifier funded() {
        vm.prank(USER);
        fundIdris.fund{value: SEND_VALUE}();
        _;
    }

    function testOnlyOwnerCanWithdraw() public {
        vm.prank(USER);
        fundIdris.fund{value: SEND_VALUE}();
        vm.expectRevert();
        vm.prank(USER);
        fundIdris.withdraw();
    }

    function testWithDrawWithASingleFunder() public {
        //Arrange
        uint256 startingOwnerBalance = fundIdris.getOwner().balance;
        uint256 startingFundIdrisBalance = address(fundIdris).balance;

        //Act
        // uint256 gasStart = gasleft();
        vm.txGasPrice(GAS_PRICE);
        vm.prank(fundIdris.getOwner());
        fundIdris.withdraw();

        // uint256 gasEnd = gasleft();
        // uint256 gasUsed = (gasStart - gasEnd) * tx.gasprice;
        // console.log("Gas used: ", gasUsed);

        //Assert
        uint256 endingOwnerBalance = fundIdris.getOwner().balance;
        uint256 endingFundIdrisBalance = address(fundIdris).balance;
        assertEq(endingFundIdrisBalance, 0);  
        assertEq(startingFundIdrisBalance + startingOwnerBalance, endingOwnerBalance);     
    }

    function testCheaperWithDrawWithASingleFunder() public {
        //Arrange
        uint256 startingOwnerBalance = fundIdris.getOwner().balance;
        uint256 startingFundIdrisBalance = address(fundIdris).balance;

        //Act
        vm.txGasPrice(GAS_PRICE);
        vm.prank(fundIdris.getOwner());
        fundIdris.cheaperWithdraw();

        //Assert
        uint256 endingOwnerBalance = fundIdris.getOwner().balance;
        uint256 endingFundIdrisBalance = address(fundIdris).balance;
        assertEq(endingFundIdrisBalance, 0);  
        assertEq(startingFundIdrisBalance + startingOwnerBalance, endingOwnerBalance);     
    }

    function testWithdrawFromMultipleFunders() public  funded{
        uint160 numberOfFunders = 12;
        uint160 startingFunderIndex = 1;
        for(uint160 i = startingFunderIndex; i < numberOfFunders; i++){
            hoax(address(i), SEND_VALUE);
            fundIdris.fund{value: SEND_VALUE}();
        }

        uint256 startingOwnerBalance = fundIdris.getOwner().balance;
        uint256 startingFundIdrisBalance = address(fundIdris).balance;

        vm.startPrank(fundIdris.getOwner());
        fundIdris.withdraw();
        vm.stopPrank();

        assert(address(fundIdris).balance == 0);
        assert(fundIdris.getOwner().balance == startingOwnerBalance + startingFundIdrisBalance);
    }



}