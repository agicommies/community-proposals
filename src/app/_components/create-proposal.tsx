"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";
import {
  ArchiveBoxArrowDownIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
// import { parse_ipfs_uri } from "~/utils/ipfs";
import { usePolkadot } from "~/hooks/polkadot";
import { getCurrentTheme } from "~/styles/theming";
import { toast } from "react-toastify";

export function CreateProposal() {
  const { isConnected, createNewProposal } = usePolkadot();
  const theme = getCurrentTheme();
  const router = useRouter();

  const [ipfsUri, setIpfsUri] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const toggleModalMenu = () => setModalOpen(!modalOpen);

  const [accordionOpen, setAccordionOpen] = useState(false);
  const toggleAccordion = () => setAccordionOpen(!accordionOpen);

  const [editMode, setEditMode] = useState(true);
  const toggleEditMode = () => setEditMode(!editMode);

  const generateJSON = () => {
    const proposalJSON = {
      title: title,
      body: body,
    };
    return JSON.stringify(proposalJSON, null, 2);
  };

  const copyJSONToClipboard = () => {
    navigator.clipboard.writeText(generateJSON()).then(
      () => {
        toast.success("Copied to clipboard", {
          theme: theme === "dark" ? "dark" : "light",
        });
      },
      () => {
        toast.error("Failed to copy to clipboard", {
          theme: theme === "dark" ? "dark" : "light",
        });
      },
    );
  };

  const downloadJSON = () => {
    const jsonBlob = new Blob([generateJSON()], { type: "application/json" });
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "proposal.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [isUriValid] = useState(false);

  const HandleSubmit = () => {
    createNewProposal(ipfsUri);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleModalMenu}
        className="min-w-auto w-full rounded-xl border-2 border-blue-500 px-4 py-2 text-blue-500 shadow-custom-blue lg:w-auto dark:bg-light-dark"
      >
        New Proposal
      </button>
      <div
        role="dialog"
        className={`relative z-50 ${modalOpen ? "visible" : "hidden"}`}
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-dark bg-opacity-60 backdrop-blur-sm transition-opacity" />

        {/* Modal */}
        <div className="fixed inset-0 z-10 w-screen animate-fade-in-down overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="relative w-[100%] max-w-5xl transform overflow-hidden rounded-3xl border-2 border-zinc-800 bg-white text-left shadow-custom md:w-[80%] dark:border-white dark:bg-light-dark dark:shadow-custom-dark">
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-3 border-b-2 border-zinc-800 bg-[url(/grids.svg)] bg-cover bg-center bg-no-repeat p-6 md:flex-row dark:border-white">
                <div className="flex flex-col items-center md:flex-row">
                  <h3
                    className="pl-2 text-xl font-bold leading-6 dark:text-white"
                    id="modal-title"
                  >
                    Send Custom Global Proposal
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={toggleModalMenu}
                  className="rounded-2xl border-2 border-black p-2 transition duration-200 dark:border-white dark:bg-light-dark hover:dark:bg-dark"
                >
                  <XMarkIcon className="h-6 w-6 dark:fill-white" />
                </button>
              </div>
              {/* Modal Body */}
              <main className="dark:bg-light-dark">
                <div className="flex flex-col gap-4 p-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="IPFS URI"
                      value={ipfsUri}
                      disabled={true}
                      onChange={(e) => setIpfsUri(e.target.value)}
                      className="w-full rounded-xl border-2 border-gray-500 bg-gray-100 p-3 shadow-custom-gray dark:bg-dark dark:text-white"
                    />
                    <button
                      disabled={true}
                      // onClick={() => {
                      //   const cid = parse_ipfs_uri(ipfsUri);
                      //   if (cid !== null) {
                      //     setIsUriValid(true);
                      //   }
                      // }}
                      className={` relative rounded-xl border-2 px-4 py-2 font-semibold dark:bg-dark ${isConnected && isUriValid ? "border-blue-500 text-blue-500 shadow-custom-blue active:top-1 active:shadow-custom-blue-clicked" : "border-gray-500 text-gray-500 shadow-custom-gray"}`}
                      // className="relative w-1/3 rounded-xl border-2 border-black bg-gray-100 p-3 font-semibold shadow-custom active:top-1 active:shadow-custom-clicked dark:border-white dark:bg-dark dark:text-white dark:shadow-custom-dark dark:active:shadow-custom-dark-clicked"
                    >
                      Check
                    </button>
                  </div>
                  <button
                    className={` relative rounded-xl border-2 px-4 py-2 font-semibold dark:bg-dark ${isConnected && isUriValid ? "border-blue-500 text-blue-500 shadow-custom-blue active:top-1 active:shadow-custom-blue-clicked" : "border-gray-500 text-gray-500 shadow-custom-gray"}`}
                    // disabled={!isConnected || !isUriValid}
                    onClick={HandleSubmit}
                    disabled={true}
                  >
                    {/* {isUriValid
                      ? "Send Proposal"
                      : !isConnected
                        ? "Connect Wallet"
                        : "Invalid IPFS URI"} */}
                    Comming Soon
                  </button>
                  <div className="my-2 rounded-xl bg-gray-500 p-0.5 dark:bg-dark"></div>

                  <div className="flex flex-wrap items-center gap-1 text-white">
                    <div className="flex items-center gap-1">
                      <InformationCircleIcon className="h-6 w-6 fill-blue-500" />
                      <span>in construction...</span>
                    </div>
                    <span>
                      <Link
                        href="https://mirror.xyz/0xD80E194aBe2d8084fAecCFfd72877e63F5822Fc5/FUvj1g9rPyVm8Ii_qLNu-IbRQPiCHkfZDLAmlP00M1Q"
                        className="text-blue-500 hover:underline"
                        target="_blank"
                      >
                        check how to create a proposal with the CLI tool
                      </Link>
                    </span>
                  </div>
                  {/* Accordion */}
                  <div className="rounded-xl border-2 p-1 ">
                    <button
                      className="flex w-full items-center justify-between rounded-xl p-3 text-left font-semibold  dark:text-white"
                      onClick={toggleAccordion}
                    >
                      <span>Build a Proposal File</span>{" "}
                      <ChevronDownIcon
                        className={`h-6 w-6 ${accordionOpen && "rotate-180 transition duration-500"}`}
                      />
                    </button>
                    {accordionOpen && (
                      <div className="flex animate-fade-in-down flex-col gap-3">
                        <div className="flex flex-col gap-3 rounded-xl p-3 ">
                          <div className="flex flex-col">
                            <div className="flex items-center justify-start gap-1">
                              <button
                                onClick={toggleEditMode}
                                className={`rounded-t-xl border-x-2 border-t-2 px-6 py-2 dark:text-white ${editMode && "bg-blue-500"}`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={toggleEditMode}
                                className={`rounded-t-xl border-x-2 border-t-2 px-6 py-2 dark:text-white ${!editMode && "bg-blue-500"}`}
                              >
                                Preview
                              </button>
                            </div>

                            <div className="rounded-b-xl border-2 p-3">
                              {editMode ? (
                                <div className="flex flex-col gap-3">
                                  <input
                                    type="text"
                                    placeholder="Your proposal title here..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full rounded-xl border-black bg-gray-100 p-3  dark:border-white dark:bg-dark dark:text-white"
                                  />
                                  <textarea
                                    placeholder="Your proposal here... (Markdown supported)"
                                    value={body}
                                    rows={5}
                                    onChange={(e) => setBody(e.target.value)}
                                    className="w-full rounded-xl border-black bg-gray-100 p-3  dark:border-white dark:bg-dark dark:text-white"
                                  />
                                </div>
                              ) : (
                                <div
                                  className="rounded-xl bg-gray-100 p-3 dark:bg-dark"
                                  data-color-mode={
                                    theme === "dark" ? "dark" : "light"
                                  }
                                >
                                  <MarkdownPreview
                                    source={`## ${title}\n${body}`}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="relative mt-4 rounded-xl border-2 p-6">
                            <h4 className="mb-2 font-semibold dark:text-white">
                              Download or copy this JSON Data to build your
                              proposal file
                            </h4>
                            <pre className="max-h-40 overflow-auto rounded-xl bg-gray-100 p-3 pt-12 md:pt-3 dark:bg-dark dark:text-white">
                              <div className="absolute right-8 top-28 flex gap-2 md:top-16">
                                <button
                                  onClick={copyJSONToClipboard}
                                  className="rounded-xl border-2 border-black bg-gray-100 p-1 font-semibold  dark:border-white dark:bg-dark dark:text-white"
                                >
                                  <DocumentDuplicateIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={downloadJSON}
                                  className="rounded-xl border-2 border-black bg-gray-100 p-1 font-semibold  dark:border-white dark:bg-dark dark:text-white"
                                >
                                  <ArchiveBoxArrowDownIcon className="h-5 w-5" />
                                </button>
                              </div>
                              {generateJSON()}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
