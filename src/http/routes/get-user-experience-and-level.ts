import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { getUser } from "../../functions/get-user";
import { atuhenticateUserHook } from "../hooks/authenticate-user";
import { getUserLevelAndExperience } from "../../functions/get-user-level-and-experience";

export const getUserExperienceAndLevelRoute: FastifyPluginAsyncZod = async (
  app
) => {
  app.get(
    "/profile/gamification",
    {
      onRequest: [atuhenticateUserHook],
      schema: {
        tags: ["users", "gamification"],
        description: "Get user experience and level",
        response: {
          200: z.object({
            experience: z.number(),
            level: z.number(),
            experienceToNextLevel: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.sub;

      const { experience, level, experienceToNextLevel } =
        await getUserLevelAndExperience({
          userId,
        });

      return reply
        .status(200)
        .send({ experience, level, experienceToNextLevel });
    }
  );
};
