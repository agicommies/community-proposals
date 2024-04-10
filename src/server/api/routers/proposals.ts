import { z } from "zod";
import { proposal } from "~/server/db/schema";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
});
