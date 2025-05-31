"use client"

import {getDefaultConfig} from "@rainbow-me/rainbowkit"
import {anvil, zksync} from "wagmi/chains"

if (!process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID) {
  throw new Error("NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID is not set")
}

const config = getDefaultConfig({
    appName: "FUND-IDRIS",
    projectId: process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID!,
    chains: [anvil, zksync],
    ssr: false
})

export default config;