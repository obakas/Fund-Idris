// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AggregatorV3Interface} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {PriceConverter} from "./PriceConverter.sol";
// import {MockV3Aggregator} from "../test/mocks/MockV3Aggregator.sol";

error FundIdris__NotOwner();

contract FundIdris{
    
    using PriceConverter for uint256;

    

    address[] public s_funders;
    mapping (address funder => uint256 ammountFunded) public s_addressToAmountFunded;

    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 5e18;
    AggregatorV3Interface private s_priceFeed;
    // MockV3Aggregator  s_priceFeed;

    constructor(address priceFeed){
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeed);
    }

    function fund() public payable  {
        require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "you need to send a value greater than 5e18");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }
    //function withdraw() public{}

    function cheaperWithdraw() public onlyOwner{
        for(uint256 funderIndex = 0; funderIndex < s_funders.length ;funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        // reset the array
        s_funders = new address[](0);
        //actually withdraw the funds

        // //transfer
        // payable (msg.sender).transfer(address(this).balance);
        // //send
        // bool sendSucess = payable (msg.sender).send(address(this).balance);
        // require(sendSucess, "failed to send");
        //call
        (bool callSucess, ) = payable(msg.sender).call{value: address(this).balance}(" ");
        require(callSucess, "Failed to call");
    }

    function withdraw() public {
        require(msg.sender == i_owner, "only the contract owner can withdraw.");
        //for loop
        //[1,2,3,4] elements
        //[0,1,2,3] indexes
        //for(starting index, ending index, step amount)
        for(uint256 funderIndex = 0; funderIndex < s_funders.length ;funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        // reset the array
        s_funders = new address[](0);
        //actually withdraw the funds

        // //transfer
        // payable (msg.sender).transfer(address(this).balance);
        // //send
        // bool sendSucess = payable (msg.sender).send(address(this).balance);
        // require(sendSucess, "failed to send");
        //call
        (bool callSucess, ) = payable(msg.sender).call{value: address(this).balance}(" ");
        require(callSucess, "Failed to call");
    }

        // function getVersion(AggregatorV3Interface priceFeed) public view returns(uint256) {
        // return s_priceFeed.version();
        // return AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306).version();
    // }

       function getVersion() public pure returns (uint256) {
        return 4; // Replace with the actual version logic if needed
    }

    modifier onlyOwner(){
        // require(msg.sender == i_owner, "Sender is not the owner");
        if(msg.sender != i_owner){revert FundIdris__NotOwner(); }
        _;
    }

    receive() external payable {
        fund();
     }

    fallback() external payable {
        fund();
     }

     function getAddressToAmmountFunded(address fundingAddress) external view returns (uint256){
         return s_addressToAmountFunded[fundingAddress];
     }

     function getFunder(uint256 index) external view returns (address){
            return s_funders[index];
     }

     function getOwner() external view returns (address){
         return i_owner;
     }

}