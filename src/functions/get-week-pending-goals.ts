import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { db } from "../db";
import { goalCompetions, goals } from "../db/schema";
import { and, count, lte, gte, sql, eq } from "drizzle-orm";

dayjs.extend(weekOfYear);

export async function GetWeekPendingGoals() {
  const firstDayOfWeek = dayjs().startOf("week").toDate();
  const lastDayOfWeek = dayjs().endOf("week").toDate();

  const goalsCreatedUpToWeek = db.$with("goals_created_up_to_week").as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeekFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastDayOfWeek))
  );

  const goalCompletionsCounts = db.$with("goal_completions_count").as(
    db
      .select({
        goalId: goalCompetions.goalId,
        completionCount: count(goalCompetions.id).as("completionCount"),
      })
      .from(goalCompetions)
      .where(
        and(
          gte(goalCompetions.createdAt, firstDayOfWeek),
          lte(goalCompetions.createdAt, lastDayOfWeek)
        )
      )
      .groupBy(goalCompetions.goalId)
  );

  const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalCompletionsCounts)
    .select({
      id: goalsCreatedUpToWeek.id,
      title: goalsCreatedUpToWeek.title,
      desiredWeekFrequency: goalsCreatedUpToWeek.desiredWeekFrequency,
      completionCount: sql`
        COALESCE(${goalCompletionsCounts.completionCount}, 0)
      `.mapWith(Number),
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(
      goalCompletionsCounts,
      eq(goalCompletionsCounts.goalId, goalsCreatedUpToWeek.id)
    );

  return { pendingGoals };
}
