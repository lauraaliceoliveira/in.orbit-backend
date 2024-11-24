import { count, and, gte, lte, eq, sql, is } from "drizzle-orm";
import { db } from "../db";
import { goalCompetions, goals, users } from "../db/schema";
import dayjs from "dayjs";

interface CreateGoalCompletionRequest {
  userId: string;
  goalId: string;
}

export async function createGoalCompletion({
  userId,
  goalId,
}: CreateGoalCompletionRequest) {
  const firstDayOfWeek = dayjs().startOf("week").toDate();
  const lastDayOfWeek = dayjs().endOf("week").toDate();

  const goalCompletionsCounts = db.$with("goal_completions_count").as(
    db
      .select({
        goalId: goalCompetions.goalId,
        completionCount: count(goalCompetions.id).as("completionCount"),
      })
      .from(goalCompetions)
      .innerJoin(goals, eq(goals.id, goalCompetions.goalId))
      .where(
        and(
          gte(goalCompetions.createdAt, firstDayOfWeek),
          lte(goalCompetions.createdAt, lastDayOfWeek),
          eq(goalCompetions.goalId, goalId),
          eq(goals.userId, userId)
        )
      )
      .groupBy(goalCompetions.goalId)
  );

  const result = await db
    .with(goalCompletionsCounts)
    .select({
      desiredWeekFrequency: goals.desiredWeeklyFrequency,
      completionCount: sql`
        COALESCE(${goalCompletionsCounts.completionCount}, 0)
      `.mapWith(Number),
    })
    .from(goals)
    .leftJoin(goalCompletionsCounts, eq(goalCompletionsCounts.goalId, goals.id))
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .limit(1);

  const { completionCount, desiredWeekFrequency } = result[0];

  if (completionCount >= desiredWeekFrequency) {
    throw new Error("Goal completed this week!");
  }

  const isLastCompletionFromGoal = completionCount + 1 === desiredWeekFrequency;
  const earnedExperience = isLastCompletionFromGoal ? 7 : 5;

  const goalCompletion = await db.transaction(async (tx) => {
    const [goalCompletion] = await db
      .insert(goalCompetions)
      .values({ goalId })
      .returning();

    await db
      .update(users)
      .set({
        experience: sql`${users.experience} + ${earnedExperience}`,
      })
      .where(eq(users.id, userId));

    return goalCompletion;
  });

  return { goalCompletion };
}
