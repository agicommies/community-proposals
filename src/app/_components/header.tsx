"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import { EllipsisVerticalIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { PolkadotButton } from "./polkadot-button";
import { Globe, Landmark, WalletMinimalIcon } from "lucide-react";
import { CreateProposal } from "./create-proposal";
import { socials } from "~/utils/links";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      <div
        className={`fixed left-0 top-0 z-50 h-full w-full backdrop-blur-sm backdrop-brightness-75 ${mobileMenuOpen ? "visible" : "hidden"} animate-menu-fade lg:hidden text-white`}
      >
        <nav className="fixed z-40 w-full h-full">
          <div className={`min-w-1/4 sticky right-3 top-3 z-[50] ml-auto h-auto w-[70%] lg:w-[30%] bg-[url('/bg-pattern.svg')] border border-gray-500 bg-cover`}>
            <div className="flow-root">
              <div className="flex items-center justify-between w-full p-4 border border-white">
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

              <div className="w-full p-4 py-6 text-green-500 border border-white">
                <div className="flex flex-row items-center justify-between w-full text-lg">
                  <div >
                    <p>164,342 <span className="text-base text-white">COMAI</span></p>
                    <span className="text-base font-thin text-gray-400">DAO treasury funds</span>
                  </div>
                  <Landmark size={40} />
                </div>
              </div>

              <div className="w-full p-4 py-6 text-green-500 border border-white">
                <div className="flex flex-row items-center justify-between w-full text-lg">
                  <div >
                    <p>164,342 <span className="text-base text-white">COMAI</span></p>
                    <span className="text-base font-thin text-gray-400">DAO treasury funds</span>
                  </div>
                  <Landmark size={40} />
                </div>
              </div>

              <div className="w-full p-4 py-6 text-green-500 border border-white">
                <div className="flex flex-row items-center justify-between w-full text-lg">
                  <div >
                    <p>164,342 <span className="text-base text-white">COMAI</span></p>
                    <span className="text-base font-thin text-gray-400">DAO treasury funds</span>
                  </div>
                  <Landmark size={40} />
                </div>
              </div>

              <div className="w-full p-4 text-green-500 border border-white">
                <CreateProposal />
              </div>

              <div className="flex justify-between w-full p-4 text-green-500 border border-white">
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
            <div className="hidden lg:flex lg:flex-row lg:gap-3">
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
