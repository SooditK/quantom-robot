import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { openai } from "@/server/openai";
import { TRPCError } from "@trpc/server";

export const openaiRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  textCompletion: protectedProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ input }) => {
      const prompt = `The follwing is the name of a Medicine. Write the Generic Alternative of the Medicine and some of its side effects.
      Medicine: ${input.prompt}`;
      try {
        const response = await openai.createCompletion({
          model: "text-davinci-003",
          prompt,
          temperature: 0,
          max_tokens: 69,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        });
        if (response.status !== 200) {
          throw new TRPCError({
            code: "BAD_REQUEST",
          });
        } else if (response.data.choices.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
          });
        }
        return {
          text: response.data.choices[0]?.text,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        });
      }
    }),
});
