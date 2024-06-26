import { small_address } from "~/utils";

import { Card } from "./card";
import { Skeleton } from "./skeleton";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { MarkdownView } from "./markdown-view";
import { DaoStatusLabel } from "./dao-status-label";
import { type DaoState } from "~/subspace/types";
import { handle_custom_dao } from "./util.ts/proposal_fields";

export type DaoCardProps = {
  dao_state: DaoState;
};

export const DaoCard = (props: DaoCardProps) => {
  const { dao_state } = props;
  const { body, title } = handle_custom_dao(
    dao_state.id,
    dao_state.custom_data ?? null,
  );

  return (
    <>
      <Card.Root key={dao_state.id} className="animate-fade-in-down">
        <Card.Header className="z-10 flex-col">
          {title && (
            <h2 className="pb-4 text-base font-semibold text-white lg:pb-0">
              {title}
            </h2>
          )}
          {!title && <Skeleton className="w-8/12 py-3 pb-4" />}
          <div className="mb-2 flex w-full flex-row justify-center gap-2 lg:mb-0 lg:ml-auto lg:w-auto lg:flex-row lg:justify-end lg:pl-4">
            <DaoStatusLabel result={dao_state.status} />
          </div>
        </Card.Header>
        <Card.Body className="px-0 py-0">
          <div className="p-4 py-10">
            <MarkdownView className={`line-clamp-4`} source={body ?? ""} />
          </div>
          <div className="flex flex-col items-start justify-between border-t border-gray-500 p-2 lg:flex-row lg:items-center lg:p-4">
            <div className="flex w-full flex-col-reverse lg:flex-row lg:items-center">
              <div className="mr-3 w-full py-2 lg:w-auto lg:min-w-fit lg:py-0">
                <Link
                  href={`/item/dao/${dao_state.id}`}
                  className="min-w-auto flex w-full items-center border border-green-500 px-2 py-2 text-sm text-green-500 hover:border-green-600 hover:bg-green-600/5 hover:text-green-600 lg:w-auto lg:px-4"
                >
                  Click to view S0 Application
                  <ArrowRightIcon className="ml-auto w-5 lg:ml-2" />
                </Link>
              </div>
              <span className="line-clamp-1 block w-full truncate text-base text-green-500">
                Posted by{" "}
                <span className="text-white">
                  {small_address(dao_state.userId)}
                </span>
              </span>
            </div>
          </div>
        </Card.Body>
      </Card.Root>
    </>
  );
};
