"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaGithub, FaYoutube } from "react-icons/fa";
import Image from "next/image";

interface HeaderProps {
  githubUrl?: string;
  appName?: string;
  logoUrl?: string;
  videoUrl?: string;
}

export default function Header({
  githubUrl = "https://github.com/obakas/Fund-Idris",
  appName = "FUND-IDRIS",
  logoUrl,
  videoUrl = "https://youtu.be/cOxl-miweWI",
}: HeaderProps) {
  return (
    <header className="w-full border-b border-gray-200 bg-white/50 backdrop-blur-sm px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Left side - Logo/Title and GitHub */}
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${appName} logo`}
              width={32}
              height={32}
              className="h-8 w-auto"
            />
          ) : (
            <h1 className="text-xl font-bold text-gray-900">{appName}</h1>
          )}

          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="GitHub Repository"
          >
            <FaGithub size={24} />
          </a>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube video"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Introductory YouTube Video"
          >
            <FaYoutube size={28} />
          </a>
        </div>

        {/* Right side - Connect Button */}
        <ConnectButton
          showBalance={true}
          accountStatus="address"
          chainStatus="icon"
        />
      </div>
    </header>
  );
}