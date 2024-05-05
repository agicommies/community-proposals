import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePolkadot } from "~/hooks/polkadot";
import { getCurrentTheme } from "~/styles/theming";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { toast } from "react-toastify";
import { type CallbackStatus } from "~/hooks/polkadot/functions/types";
import { Loading } from "./loading";
import { z } from "zod";

// Define Zod schemas
const proposalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
});

export function CreateProposal() {
  const router = useRouter();
  const theme = getCurrentTheme();
  const { isConnected, createNewProposal, balance, isBalanceLoading } =
    usePolkadot();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [uploading, setUploading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const toggleModalMenu = () => setModalOpen(!modalOpen);

  const [editMode, setEditMode] = useState(true);
  const toggleEditMode = () => setEditMode(!editMode);

  const [transactionStatus, setTransactionStatus] = useState<CallbackStatus>({
    status: null,
    message: null,
    finalized: false,
  });

  const handleCallback = (callbackReturn: CallbackStatus) => {
    setTransactionStatus(callbackReturn);
  };

  const uploadFile = async (fileToUpload: File) => {
    try {
      setUploading(true);
      const data = new FormData();
      data.set("file", fileToUpload);
      const res = await fetch("/api/files", {
        method: "POST",
        body: data,
      });
      const ipfs = (await res.json()) as { IpfsHash: string };
      setUploading(false);

      if (isBalanceLoading) {
        toast.error("Balance is still loading", {
          theme: theme === "dark" ? "dark" : "light",
        });
        return;
      }

      const proposalCost = 10000;

      if (balance > proposalCost) {
        createNewProposal({
          IpfsHash: `ipfs://${ipfs.IpfsHash}`,
          callback: handleCallback,
        });
      } else {
        toast.error(
          `Insufficient balance to create proposal. Required: ${proposalCost} but got ${balance}`,
          {
            theme: theme === "dark" ? "dark" : "light",
          },
        );
      }
      router.refresh();
    } catch (e) {
      console.error(e);
      setUploading(false);
      toast.error("Error uploading proposal");
    }
  };

  const HandleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTransactionStatus({
      status: "STARTING",
      finalized: false,
      message: "Starting proposal creation...",
    });

    const result = proposalSchema.safeParse({
      title,
      body,
    });

    if (!result.success) {
      toast.error(result.error.errors.map((e) => e.message).join(", "), {
        theme: theme === "dark" ? "dark" : "light",
      });
      return;
    }

    const proposalData = JSON.stringify({
      title: title,
      body: body,
    });
    const blob = new Blob([proposalData], { type: "application/json" });
    const fileToUpload = new File([blob], "proposal.json", {
      type: "application/json",
    });
    void uploadFile(fileToUpload);
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
                    Build Custom Global Proposal
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
              <form onSubmit={HandleSubmit} className="dark:bg-light-dark">
                <div className="flex flex-col gap-4 p-6">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={toggleEditMode}
                      className={`rounded-xl border-2 px-4 py-1 dark:text-white ${editMode && "bg-blue-500"}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={toggleEditMode}
                      className={`rounded-xl border-2 px-4 py-1 dark:text-white ${!editMode && "bg-blue-500"}`}
                    >
                      Preview
                    </button>
                  </div>
                  <div className="flex flex-col">
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
                        data-color-mode={theme === "dark" ? "dark" : "light"}
                      >
                        <MarkdownPreview source={`# ${title}\n${body}`} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-blue-300">
                      After clicking the button wait a few seconds for the
                      proposal to be created.
                    </p>
                    <button
                      className={` relative w-full rounded-xl border-2 px-4 py-2 font-semibold dark:bg-dark ${isConnected ? "border-blue-500 text-blue-500 shadow-custom-blue active:top-1 active:shadow-custom-blue-clicked" : "border-gray-500 text-gray-500 shadow-custom-gray"}`}
                      disabled={!isConnected}
                      type="submit"
                    >
                      {uploading ? "Uploading..." : "Submit Proposal"}
                    </button>
                  </div>
                  {transactionStatus.status && (
                    <p
                      className={` pt-6 ${transactionStatus.status === "PENDING" && "text-yellow-400"}  ${transactionStatus.status === "ERROR" && "text-red-400"} ${transactionStatus.status === "SUCCESS" && "text-green-400"} ${transactionStatus.status === "STARTING" && "text-white"} flex text-left text-base`}
                    >
                      {transactionStatus.status === "PENDING" ||
                        (transactionStatus.status === "STARTING" && (
                          <Loading />
                        ))}
                      {transactionStatus.message}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-1 pt-2 text-sm text-white">
                    <div className="flex items-center gap-1">
                      <InformationCircleIcon className="h-4 w-4 fill-blue-500" />
                      <span>Want a diferent aproach?</span>
                    </div>
                    <span>
                      <Link
                        href="https://mirror.xyz/0xD80E194aBe2d8084fAecCFfd72877e63F5822Fc5/FUvj1g9rPyVm8Ii_qLNu-IbRQPiCHkfZDLAmlP00M1Q"
                        className="text-blue-500 hover:underline"
                        target="_blank"
                      >
                        Check how to create a proposal with the CLI tool
                      </Link>
                    </span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
