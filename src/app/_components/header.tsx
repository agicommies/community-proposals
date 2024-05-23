"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import { EllipsisVerticalIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { PolkadotButton } from "./polkadot-button";
import { CreateProposal } from "./create-proposal";
import { links, socials } from "~/utils/links";
import { CreateDao } from "./create-dao";
import { BalanceSection } from "./balance-section";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      <div
        className={`fixed left-0 top-0 z-50 h-full w-full backdrop-blur-sm backdrop-brightness-75 ${mobileMenuOpen ? "visible" : "hidden"} animate-menu-fade lg:hidden text-white`}
      >
        <nav className="fixed z-40 w-full h-full">
          <div className={`min-w-1/4 sticky right-3 top-3 z-[50] ml-auto h-auto w-[70%] lg:w-[30%] bg-[url('/bg-pattern.svg')] border border-gray-500`}>
            <div className="flow-root">
              <div className="flex items-center justify-between w-full p-4 border-b border-gray-500">
                <h3 className="text-lg">Wallet Info</h3>
                <button
                  type='button'
                  className={`h-8 w-8 flex items-center justify-end`}
                  onClick={toggleMobileMenu}
                >
                  <span className='sr-only'>Close menu</span>
                  <XMarkIcon
                    className='w-6 h-6'
                    aria-hidden='true'
                  />
                </button>
              </div>
              <div className="flex flex-col w-full gap-3 p-4 text-green-500 border-b border-gray-500">
                <Link
                  className="w-full px-4 py-2.5 text-center text-gray-400 border border-gray-500 hover:border-green-600 hover:text-green-600 hover:bg-green-600/5 min-w-auto lg:w-auto"
                  href={links.home}>
                  Homepage
                </Link>
              </div>

              <BalanceSection />

              <div className="flex flex-col w-full gap-3 p-4 text-green-500 border-b border-gray-500">
                <CreateDao />
                <CreateProposal />
              </div>

              <div className="flex justify-between w-full p-4 text-green-500 ">
                {socials.map((value) => {
                  return (
                    <Link key={value.name} href={value.link} target="_blank">
                      <Image src={value.icon} alt={`${value.name} Icon`} width={40} height={40} className="w-8 h-8" />
                    </Link>
                  )
                })}
              </div>

            </div>
          </div>
        </nav>
      </div>

      <header className="sticky top-0 z-40 w-full py-4 text-white border-b border-gray-500 backdrop-blur bg-black/50">
        <nav className="flex flex-wrap items-center justify-between w-full max-w-6xl px-4 mx-auto">
          <Link href="/" className="flex items-center flex-shrink-0 gap-3 mr-3">
            <Image
              src="/logo.svg"
              alt="Community Validator"
              width={35}
              height={35}
            />
            <div className="items-center flex-grow hidden w-full md:w-auto lg:block">
              <div className="flex gap-3 xl:gap-6">
                <h1 className="text-2xl font-normal text-white">
                  Community Proposals
                </h1>
              </div>
            </div>
          </Link>

          <>
            <div className="hidden lg:flex items-center lg:flex-row lg:gap-3">

              <Link
                className="w-full px-4 py-2.5 text-gray-400 border border-gray-500 hover:border-green-600 hover:text-green-600 hover:bg-green-600/5 min-w-auto lg:w-auto"
                href={links.home}>
                Homepage
              </Link>
              <PolkadotButton />
            </div>
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="flex items-center justify-center w-12 h-12 lg:hidden"
            >
              <span className="sr-only">Open main menu</span>
              <EllipsisVerticalIcon
                className="w-6 h-6"
                aria-hidden="true"
              />
            </button>
          </>
        </nav>
      </header>
    </>
  );
}
