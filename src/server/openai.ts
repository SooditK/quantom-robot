import { env } from "@/env.mjs";
import { Configuration, OpenAIApi } from "openai";
export const configuration = new Configuration({
  apiKey: env.OPENAI_SECRET,
});
export const openai = new OpenAIApi(configuration);
