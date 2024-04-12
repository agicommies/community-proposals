"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";
import {
  ArchiveBoxArrowDownIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";

import { useState } from "react";
import { usePolkadot } from "~/polkadot";
import { parse_ipfs_uri } from "~/utils/ipfs";
import { useRouter } from "next/navigation";

export function CreateProposal() {
  const { isConnected, createNewProposal } = usePolkadot();
  const router = useRouter();

  const [ipfsUri, setIpfsUri] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [modalOpen, setModalOpen] = useState(true);
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
        alert("JSON copied to clipboard!");
      },
      () => {
        alert("Failed to copy JSON to clipboard.");
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

  const [isUriValid, setIsUriValid] = useState(false);

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
                <form
                  className="flex flex-col gap-4 p-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    createNewProposal(ipfsUri);
                    router.refresh();
                  }}
                >
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="IPFS Uri"
                      value={ipfsUri}
                      onChange={(e) => setIpfsUri(e.target.value)}
                      className="w-full rounded-xl border-2 border-black bg-gray-100 p-3 shadow-custom dark:border-white dark:bg-dark dark:text-white dark:shadow-custom-dark"
                    />
                    <button
                      onClick={() => {
                        const cid = parse_ipfs_uri(ipfsUri);
                        if (cid !== null) {
                          setIsUriValid(true);
                        }
                      }}
                      className="dark:active:shadow-custom-dark-clicked active:shadow-custom-clicked relative w-1/3 rounded-xl border-2 border-black bg-gray-100 p-3 font-semibold shadow-custom active:top-1 dark:border-white dark:bg-dark dark:text-white dark:shadow-custom-dark"
                    >
                      Check
                    </button>
                  </div>
                  <button
                    className={` relative rounded-xl border-2 px-4 py-2 font-semibold dark:bg-dark ${isConnected && isUriValid ? "active:shadow-custom-blue-clicked border-blue-500 text-blue-500 shadow-custom-blue active:top-1" : "shadow-custom-gray border-gray-500 text-gray-500"}`}
                    disabled={!isConnected || !isUriValid}
                  >
                    {isUriValid
                      ? "Send Proposal"
                      : !isConnected
                        ? "Connect Wallet"
                        : "Invalid IPFS URI"}
                  </button>
                  <div className="my-2 rounded-xl bg-gray-500 p-0.5 dark:bg-dark"></div>
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
                        <div className="flex flex-col gap-1 rounded-xl p-3">
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
                                    placeholder="Your proposal here..."
                                    value={body}
                                    rows={5}
                                    onChange={(e) => setBody(e.target.value)}
                                    className="w-full rounded-xl border-black bg-gray-100 p-3  dark:border-white dark:bg-dark dark:text-white"
                                  />
                                </div>
                              ) : (
                                <div className="rounded-xl bg-gray-100 p-3 dark:bg-dark">
                                  <MarkdownPreview source={body} />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="relative mt-4 rounded-xl border-2 p-6">
                            <h4 className="mb-2 font-semibold dark:text-white">
                              Pin this JSON Data in IPFS to upload a custom
                              proposal.
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
                </form>
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}