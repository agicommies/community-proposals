"use client";

export const runtime = "edge";

import Image from "next/image";
import { useState } from "react";

import { XMarkIcon } from "@heroicons/react/20/solid";
import MarkdownPreview from "@uiw/react-markdown-preview";

import { Card } from "~/app/_components/card";

import { getCurrentTheme } from "~/styles/theming";
import { Container } from "./container";

import { type DaoCardProps } from "./dao-card";
import { small_address } from "~/utils";
import { StatusLabel } from "./status-label";

export default function ProposalExpandedCard(props: DaoCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const toggleModalMenu = () => setModalOpen(!modalOpen);
  const theme = getCurrentTheme();

  const { dao } = props;

  return (
    <>
      <button
        type="button"
        onClick={toggleModalMenu}
        className="min-w-auto w-full rounded-xl border-2 border-blue-500 px-4 py-2 text-blue-500 shadow-custom-blue lg:w-auto dark:bg-light-dark"
      >
        Click to view S0 Application {"->"}
      </button>

      <div
        role="dialog"
        className={`relative z-50 ${modalOpen ? "visible" : "hidden"}`}
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-dark/95 backdrop-blur-sm transition-opacity" />
        {/* Modal */}

        <div
          className={`fixed inset-0 z-10 w-screen animate-fade-in-down overflow-y-auto`}
        >
          <main className="flex flex-col items-center justify-center">
            <div className="my-12 h-full w-full bg-repeat py-12 ">
              <Container>
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={toggleModalMenu}
                    className="rounded-2xl border-2 border-black bg-white p-2 transition duration-200 dark:border-white dark:bg-light-dark hover:dark:bg-dark"
                  >
                    <XMarkIcon className="h-6 w-6 dark:fill-white" />
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-4 lg:flex-row">
                  <Card.Root className="w-full lg:w-8/12">
                    <>
                      <Card.Header>
                        <div className="flex w-full justify-between">
                          <h3 className="mt-1 text-base font-semibold">
                            {dao.body?.title}
                          </h3>
                          <div className="mb-2 flex w-full flex-row-reverse justify-center gap-2 md:mb-0 md:ml-auto md:w-auto md:flex-row md:justify-end md:pl-4">
                            <StatusLabel result={dao.status} />
                          </div>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <div
                          className="rounded-xl p-3 dark:bg-black/20"
                          data-color-mode={theme === "dark" ? "dark" : "light"}
                        >
                          <MarkdownPreview source={dao.body?.body} />
                        </div>
                      </Card.Body>
                    </>
                  </Card.Root>

                  <div className="w-full space-y-6 lg:w-4/12">
                    <Card.Root>
                      <Card.Header>
                        <h3 className="text-base font-semibold">Info</h3>
                      </Card.Header>
                      <Card.Body className="flex flex-col space-y-4">
                        {/* Proposal ID */}
                        <span className="flex items-center text-sm">
                          <Image
                            src="/dev-icon.svg"
                            height={21}
                            width={21}
                            alt="author icon"
                            className="mr-2"
                          />
                          {dao.id}
                          <span className="ml-1 text-xs text-gray-600">
                            | S0 Application ID
                          </span>
                        </span>

                        <span className="flex items-center text-sm">
                          <Image
                            src="/id-icon.svg"
                            height={18}
                            width={18}
                            alt="author icon"
                            className="mr-2"
                          />
                          {small_address(dao.userId)}
                          <span className="ml-1 text-xs text-gray-600">
                            | S0 Author
                          </span>
                        </span>
                      </Card.Body>
                    </Card.Root>
                  </div>
                </div>
              </Container>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
