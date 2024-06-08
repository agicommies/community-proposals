export const runtime = "edge";

/*

/...slug   ->  [kind, id] = slug

/proposals/[id]      -> kind = "proposals",  id = Number(id)
/daos/[id]            -> kind = "daos",        id = Number(id)

*/

import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { ExpandedView } from "./_components/expanded-view";

export default function CardView({ params }: { params: { slug: string[] } }) {
  console.log("==========> SLUG:", params.slug);

  if (!params.slug[0] || !params.slug[1]) {
    return <div>Not Found</div>;
  }

  const contentType = params.slug[0];
  const id = Number(params.slug[1]);

  console.log(`contentType: ${contentType}, id: ${id}`);

  return (
    <div className="mx-auto flex max-w-6xl flex-col px-4 ">
      <Link
        href={"/"}
        className="my-6 flex w-fit items-center justify-center gap-2 border border-gray-500 px-5 py-3 text-gray-400 hover:border-green-500 hover:text-green-500 "
      >
        <ArrowLeftIcon className="h-6 text-green-500" />
        Go Back to Proposals List
      </Link>
      <div className="border-x-none mb-6 flex w-full flex-col justify-between divide-gray-500 border border-gray-500 text-white lg:flex-row lg:divide-x xl:border-x ">
        <ExpandedView contentType={contentType} paramId={id} />
      </div>
    </div>
  );
}
