// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AggregatorV3Interface} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";



library PriceConverter{
    function getPrice(AggregatorV3Interface priceFeed) internal  view returns (uint256){
        //adress 0x694AA1769357215DE4FAC081bf1f309aDC325306
        //ABI
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        (,int256 answer, , , ) = priceFeed.latestRoundData();
        // price of eth in USD
        return uint256(answer * 10000000000);
    }

    function getConversionRate(uint256 ethAmmount, AggregatorV3Interface priceFeed) internal view returns (uint256) {
        //msg.value.getConversionRate()
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmmountInUsd = (ethPrice * ethAmmount)/1000000000000000000;
        return ethAmmountInUsd;
    }


}