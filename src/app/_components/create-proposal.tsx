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
import { toast } from "react-toastify";

export function CreateProposal() {
  const { isConnected, createNewProposal } = usePolkadot();
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
        toast.success("Copied to clipboard");
      },
      () => {
        toast.error("Failed to copy to clipboard");
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
        className="w-full px-4 py-2 text-gray-300 border border-gray-500 hover:border-white hover:text-white min-w-auto lg:w-auto "
      >
        New Proposal
      </button>
      <div
        role="dialog"
        className={`relative z-50 ${modalOpen ? "visible" : "hidden"} `}
      >
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-dark bg-opacity-60 backdrop-blur-sm" />

        {/* Modal */}
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto animate-fade-in-down">
          <div className="flex items-center justify-center min-h-full p-4 text-center">
            <div className="relative w-[100%] max-w-5xl transform overflow-hidden border border-gray-500 bg-white text-white text-left md:w-[80%] bg-[url('/bg-pattern.svg')] bg-cover">
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-3 p-6 bg-center bg-no-repeat bg-cover border-b-2 border-gray-500 md:flex-row">
                <div className="flex flex-col items-center md:flex-row">
                  <h3
                    className="pl-2 text-xl font-bold leading-6"
                    id="modal-title"
                  >
                    Send Custom Global Proposal
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={toggleModalMenu}
                  className="p-2 transition duration-200 border-gray-500 border-1"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              {/* Modal Body */}
              <main>
                <div className="flex flex-col gap-4 p-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="IPFS URI"
                      value={ipfsUri}
                      disabled={true}
                      onChange={(e) => setIpfsUri(e.target.value)}
                      className="w-full p-3 bg-gray-200 border-gray-500 border-1"
                    />
                    <button
                      disabled={true}
                      // onClick={() => {
                      //   const cid = parse_ipfs_uri(ipfsUri);
                      //   if (cid !== null) {
                      //     setIsUriValid(true);
                      //   }
                      // }}
                      className={` relative border px-4 py-2 font-semibold ${isConnected && isUriValid ? "border-green-500 text-green-500 active:top-1" : "border-gray-500 text-gray-500"}`}
                    >
                      Check
                    </button>
                  </div>
                  <button
                    className={` relative border px-4 py-2 font-semibold ${isConnected && isUriValid ? "border-green-500 text-green-500 active:top-1" : "border-gray-500 text-gray-500"}`}
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
                  <div className="my-2 bg-gray-500 p-0.5"></div>

                  <div className="flex flex-wrap items-center gap-1 text-white">
                    <div className="flex items-center gap-1">
                      <InformationCircleIcon className="w-6 h-6 fill-green-500" />
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
                  <div className="p-1 border ">
                    <button
                      className="flex items-center justify-between w-full p-3 font-semibold text-left"
                      onClick={toggleAccordion}
                    >
                      <span>Build a Proposal File</span>{" "}
                      <ChevronDownIcon
                        className={`h-6 w-6 ${accordionOpen && "rotate-180 transition duration-500"}`}
                      />
                    </button>
                    {accordionOpen && (
                      <div className="flex flex-col gap-3 animate-fade-in-down">
                        <div className="flex flex-col gap-3 p-3 ">
                          <div className="flex flex-col">
                            <div className="flex items-center justify-start gap-1">
                              <button
                                onClick={toggleEditMode}
                                className={`border-x-2 border-t-2 px-6 py-2 ${editMode && "bg-green-500"}`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={toggleEditMode}
                                className={`border-x-2 border-t-2 px-6 py-2 ${!editMode && "bg-green-500"}`}
                              >
                                Preview
                              </button>
                            </div>

                            <div className="p-3 border">
                              {editMode ? (
                                <div className="flex flex-col gap-3">
                                  <input
                                    type="text"
                                    placeholder="Your proposal title here..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full p-3 bg-gray-100 border-gray-500"
                                  />
                                  <textarea
                                    placeholder="Your proposal here... (Markdown supported)"
                                    value={body}
                                    rows={5}
                                    onChange={(e) => setBody(e.target.value)}
                                    className="w-full p-3 bg-gray-100 border-gray-500"
                                  />
                                </div>
                              ) : (
                                <div
                                  className="p-3 bg-gray-100"
                                  data-color-mode={"light"}
                                >
                                  <MarkdownPreview
                                    source={`## ${title}\n${body}`}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="relative p-6 mt-4">
                            <h4 className="mb-2 font-semibold text-white">
                              Download or copy this JSON Data to build your
                              proposal file
                            </h4>
                            <pre className="p-3 pt-12 overflow-auto text-black bg-gray-100 max-h-40 md:pt-3">
                              <div className="absolute flex gap-2 text-gray-500 right-8 top-28 md:top-16">
                                <button
                                  onClick={copyJSONToClipboard}
                                  className="p-1 font-semibold bg-gray-100 border border-gray-500"
                                >
                                  <DocumentDuplicateIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={downloadJSON}
                                  className="p-1 font-semibold bg-gray-100 border border-gray-500"
                                >
                                  <ArchiveBoxArrowDownIcon className="w-5 h-5" />
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
