"use client"

import React, { useState } from "react";
import InputField from "./ui/InputField";
import { useChainId } from "wagmi";

export default function FundIdrisForm(){
    const [fundAmount, setFundAmount] = useState("");
    const chainId = useChainId();

    // async function get
    
    async function handleFund() {
        console.log("Funding with amount:", fundAmount);
    }


    return (
        <div>
            <InputField
                label="ETH Amount to Fund"
                type="number"
                placeholder="0.1"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
            />
            <button
                onClick={handleFund}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-md
                         hover:bg-green-700 transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
                Fund
            </button>
        </div>
    )
}

// interface FundIdrisForm {
//   handleGetBalance: () => void;
//   handleWithdraw: () => void;
//   handleFund: (amount: string) => void;
//   ethAmount: string;
// }

// const FundIdrisForm: React.FC<FundIdrisForm> = ({
//   handleGetBalance,
//   handleWithdraw,
//   handleFund,
//   ethAmount,
// }) => {
//   const [fundAmount, setFundAmount] = useState("");

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md space-y-4">
//       {/* Balance Display */}
//       <div className="text-center mb-6">
//         <h2 className="text-2xl font-bold text-gray-800">
//           {ethAmount} ETH
//         </h2>
//         <p className="text-gray-600 text-sm">Current Balance</p>
//       </div>

//       {/* Get Balance Button */}
//       <button
//         onClick={handleGetBalance}
//         className="w-full py-2 px-4 bg-blue-600 text-white rounded-md
//                  hover:bg-blue-700 transition-colors duration-200
//                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//       >
//         Refresh Balance
//       </button>

//       {/* Fund Section */}
//       <div className="space-y-2">
//         <input
//           type="number"
//           placeholder="ETH amount to fund"
//           value={fundAmount}
//           onChange={(e) => setFundAmount(e.target.value)}
//           className="w-full px-4 py-2 border border-gray-300 rounded-md
//                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
//                    transition-all duration-200 outline-none"
//           step="0.0001"
//           min="0"
//         />
//         <button
//           onClick={() => handleFund(fundAmount)}
//           className="w-full py-2 px-4 bg-green-600 text-white rounded-md
//                    hover:bg-green-700 transition-colors duration-200
//                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
//         >
//           Fund Contract
//         </button>
//       </div>

//       {/* Withdraw Button */}
//       <button
//         onClick={handleWithdraw}
//         className="w-full py-2 px-4 bg-red-600 text-white rounded-md
//                  hover:bg-red-700 transition-colors duration-200
//                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
//       >
//         Withdraw All Funds
//       </button>
//     </div>
//   );
// };

// export default FundIdrisForm;