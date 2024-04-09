"use client";

import Image from "next/image";
import { useState } from "react";

import { EllipsisVerticalIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { DarkModeToggle } from "./dark-mode-toggle";
import { PolkadotButton } from "./polkadot-button";
import { covered_by_your_grace } from "~/styles/fonts";
import Link from "next/link";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      <div
        className={`fixed left-0 top-0 z-50 h-full w-full backdrop-blur-sm backdrop-brightness-75 ${mobileMenuOpen ? "visible" : "hidden"} animate-menu-fade lg:hidden`}
      >
        <nav className="fixed z-50 w-full h-full shadow-xl">
          <div className="min-w-1/4 dark:bg-light-dark sticky right-3 top-3 ml-auto h-auto w-[94%] rounded-lg bg-white p-5 sm:w-[40%] dark:text-white">
            <div
              className={`dark:bg-dark absolute right-14 top-0 z-50 m-5 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 p-1.5`}
            >
              <DarkModeToggle />
            </div>
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="dark:bg-dark absolute right-0 top-0 z-50 m-5 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 p-1.5"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="w-6 h-6 dark:fill-white" />
            </button>
            <div className="flow-root">
              <div className="p-3 ml-2 space-y-2">WIP</div>
            </div>
          </div>
        </nav>
      </div>

      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between w-full p-4 bg-white shadow-md dark:bg-light-dark">
        <Link href={'/'} className="flex items-center">
          <div className="flex items-center flex-shrink-0 mr-3">
            <Image
              src="/logo.svg"
              alt="Community Validator"
              width={35}
              height={35}
            />
          </div>
          <div className="items-center flex-grow hidden w-full md:w-auto lg:block">
            <div className="flex gap-3 xl:gap-6">
              <h1 className="text-xl font-bold xl:text-2xl dark:text-white">
                <span
                  className={`${covered_by_your_grace.className} text-2xl text-blue-500 xl:text-3xl`}
                >
                  Community{" "}
                </span>
                Proposals.
              </h1>
            </div>
          </div>
        </Link>

        <div className="hidden md:flex md:flex-row md:gap-3">
          <PolkadotButton />
          <DarkModeToggle />
        </div>
        <div className="self-center col-span-3 ml-auto md:hidden">
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="flex items-center justify-center w-12 h-12 rounded-lg dark:bg-dark"
          >
            <span className="sr-only">Open main menu</span>
            <EllipsisVerticalIcon
              className="w-6 h-6 dark:fill-white"
              aria-hidden="true"
            />
          </button>
        </div>
      </header>
    </>
  );
}
