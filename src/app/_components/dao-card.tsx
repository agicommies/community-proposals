"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";

import { type Dao } from "~/hooks/polkadot/functions/types";
import { getCurrentTheme } from "~/styles/theming";
import { small_address } from "~/utils";

import { Card } from "./card";
import DaoExpandedCard from "./dao-expanded-card";
import { StatusLabel } from "./status-label";

export type DaoCardProps = {
  dao: Dao;
};

export const DaoCard = (props: DaoCardProps) => {
  const { dao } = props;
  const theme = getCurrentTheme();

  function truncateMarkdown(markdown: string) {
    if (markdown.length <= 1000) return markdown;

    let end = markdown.lastIndexOf(" ", 1000);
    end = end === -1 ? 500 : end;
    return (
      markdown.substring(0, end) + "... [Click on the view button to read more]"
    );
  }

  return (
    <>
      {dao.body ? (
        <Card.Root key={dao.id}>
          <Card.Header className="z-10 flex-col-reverse">
            <div className="flex w-full justify-between">
              <h3 className="text-base font-semibold">{dao.body?.title}</h3>
              <div className="mb-2 flex w-full flex-row-reverse justify-center gap-2 md:mb-0 md:ml-auto md:w-auto md:flex-row md:justify-end md:pl-4">
                <StatusLabel result={dao.status} />
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="pb-2 md:pb-6">
              <div
                className="rounded-xl p-3 dark:bg-black/20"
                data-color-mode={theme === "dark" ? "dark" : "light"}
              >
                <MarkdownPreview
                  source={truncateMarkdown(dao.body?.body ?? "")}
                />
              </div>
            </div>

            <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
              <div className="w-[240px] space-x-2 pb-4 text-gray-500 md:pb-0">
                <span className="line-clamp-1 block w-full truncate">
                  posted by {small_address(dao.userId)}
                </span>
              </div>
            </div>
            <div className="flex justify-center pt-4 md:justify-start">
              <DaoExpandedCard {...props} />
            </div>
          </Card.Body>
        </Card.Root>
      ) : null}
    </>
  );
};
