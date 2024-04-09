import { z } from "zod";
import { proposal } from "~/server/db/schema";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { ApiPromise } from "@polkadot/api";
import { WsProvider } from "@polkadot/rpc-provider";

const provider = new WsProvider("wss://commune.api.onfinality.io/public-ws");
const api = await ApiPromise.create({ provider });

const proposals = await api.query.subspaceModule?.proposals?.entries();

export const proposalRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(proposal).values({
        id: 1,
        proposer: input.name,
        data: "data",
        votes_for: 0,
        votes_against: 0,
        netuid: 0,
      });
    }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.proposal.findFirst({
      orderBy: (proposals, { desc }) => [desc(proposals.createdAt)],
    });
  }),

  getAll: publicProcedure.query(() => {
    return proposals;
  }),
});
