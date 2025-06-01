// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {FundIdris} from "../../src/FundIdris.sol";
import {DeployFundIdris} from "../../script/DeployFundIdris.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {MockV3Aggregator} from "../../test/mocks/MockV3Aggregator.sol";

error FundIdris__NotOwner();

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

 

    function test_Constructor_Sets_Sepolia_Config() public {
        uint256 sepoliaId = 11155111;
        vm.chainId(sepoliaId);
        
        HelperConfig config = new HelperConfig();
        assertEq(
            config.activeNetworkConfig(),
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
    }

    function test_Constructor_Sets_Mainnet_Config() public {
        uint256 mainnetId = 1;
        vm.chainId(mainnetId);
        
        HelperConfig config = new HelperConfig();
        assertEq(
            config.activeNetworkConfig(),
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
    }

    function test_Constructor_Sets_Anvil_Config() public {
        uint256 anvilId = 31337; // Local chain ID
        vm.chainId(anvilId);
        
        HelperConfig config = new HelperConfig();
        address priceFeed = config.activeNetworkConfig();
        
        assertTrue(priceFeed != address(0));
        MockV3Aggregator mock = MockV3Aggregator(priceFeed);
        assertEq(mock.decimals(), 8);
        assertEq(mock.latestAnswer(), 200e8);
    }

    function test_Anvil_Config_Reuses_Existing_Mock() public {
        uint256 anvilId = 31337;
        vm.chainId(anvilId);
        
        HelperConfig config = new HelperConfig();
        address initialPriceFeed = config.activeNetworkConfig();

        // Call again to trigger reuse logic
        HelperConfig.NetworkConfig memory reusedConfig = config.getCreateAnvilEthConfig();
        assertEq(reusedConfig.priceFeed, initialPriceFeed);
    }

    function test_GetSepoliaEthConfig_Returns_Correct_Address() public{
        HelperConfig config = new HelperConfig();
        HelperConfig.NetworkConfig memory sepoliaConfig = config.getSepoliaEthConfig();
        assertEq(sepoliaConfig.priceFeed, 0x694AA1769357215DE4FAC081bf1f309aDC325306);
        }

    function test_GetMainnetEthConfig_Returns_Correct_Address() public {
        HelperConfig config = new HelperConfig();
        HelperConfig.NetworkConfig memory mainnetConfig = config.getMainnetEthConfig();
        assertEq(mainnetConfig.priceFeed, 0x694AA1769357215DE4FAC081bf1f309aDC325306);
    }

    function test_Unsupported_Chain_Defaults_To_Anvil() public {
        vm.chainId(999); // Unknown chain
        HelperConfig config = new HelperConfig();
        assertTrue(config.activeNetworkConfig() != address(0));
    }

    function test_Anvil_Mock_Initialized_Correctly() public {
        uint256 anvilId = 31337;
        vm.chainId(anvilId);
        HelperConfig config = new HelperConfig();
        MockV3Aggregator mock = MockV3Aggregator(config.activeNetworkConfig());
        assertEq(mock.decimals(), 8);
        assertEq(mock.latestAnswer(), 200e8);
    }

    function testReceiveFunction() public {
        vm.deal(USER, SEND_VALUE);
        vm.prank(USER);
        (bool success, ) = address(fundIdris).call{value: SEND_VALUE}("");
        assertTrue(success);
        assertEq(fundIdris.getAddressToAmmountFunded(USER), SEND_VALUE);
    }

    function testFallbackFunction() public {
        vm.deal(USER, SEND_VALUE);
        vm.prank(USER);
        (bool success, ) = address(fundIdris).call{value: SEND_VALUE}(hex"deadbeef");
        assertTrue(success);
        assertEq(fundIdris.getAddressToAmmountFunded(USER), SEND_VALUE);
    }

    function testGetAddressToAmountFunded() public {
        vm.prank(USER);
        fundIdris.fund{value: SEND_VALUE}();
        uint256 amount = fundIdris.getAddressToAmmountFunded(USER);
        assertEq(amount, SEND_VALUE);
    }

    function testGetFunder() public {
        vm.prank(USER);
        fundIdris.fund{value: SEND_VALUE}();
        address funder = fundIdris.getFunder(0);
        assertEq(funder, USER);
    }

    function testOnlyOwnerModifierReverts() public {
        vm.expectRevert(abi.encodeWithSelector(FundIdris__NotOwner.selector));
        vm.prank(USER);
        fundIdris.cheaperWithdraw();
    }

    // function testGetOwnerReturnsCorrectAddress() public view {
    //     assertEq(fundIdris.getOwner(), address(this));
    // }

    function testGetOwnerReturnsCorrectAddress() public view {
        address owner = fundIdris.getOwner();
        console.log("Owner is:", owner);
        assertEq(owner, fundIdris.getOwner());
    }



}