import { db } from "./../db/index";
import { eq, sql } from "drizzle-orm";
import { and } from "drizzle-orm";
import { gte, lte } from "drizzle-orm";
import { desc } from "drizzle-orm";
import dayjs from "dayjs";
import { goalCompetions, goals } from "../db/schema";

interface GetWeekSummaryRequest {
  userId: string
}

export async function GetWeekSummary({ userId }: GetWeekSummaryRequest) {
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
      .where(and(
        lte(goals.createdAt, lastDayOfWeek),
        eq(goals.userId, userId)
      ))
  );

  const goalsCompletedInWeek = db.$with("goals_completed_in_week").as(
    db
      .select({
        id: goalCompetions.id,
        title: goals.title,
        completedAt: goalCompetions.createdAt,
        completedAtDate: sql`
            DATE(${goalCompetions.createdAt})
        `.as("completedAtDate"),
      })
      .from(goalCompetions)
      .innerJoin(goals, eq(goals.id, goalCompetions.goalId))
      .where(
        and(
          gte(goalCompetions.createdAt, firstDayOfWeek),
          lte(goalCompetions.createdAt, lastDayOfWeek),
          eq(goals.userId, userId)
        )
      )
      .orderBy(desc(goalCompetions.createdAt))
  );

  const goalsCompletedByWeekDay = db.$with("goals_completed_by_week_day").as(
    db
      .select({
        completedAtDate: goalsCompletedInWeek.completedAtDate,
        completions: sql`
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', ${goalsCompletedInWeek.id},
                        'title', ${goalsCompletedInWeek.title},
                        'completedAt', ${goalsCompletedInWeek.completedAt}
                    )
                )
            `.as("completions"),
      })
      .from(goalsCompletedInWeek)
      .groupBy(goalsCompletedInWeek.completedAtDate)
      .orderBy(desc(goalsCompletedInWeek.completedAtDate))
  );

  type GoalsPerDay = Record<
    string,
    {
      id: string;
      title: string;
      completedAt: string;
    }[]
  >;

  const result = await db
    .with(goalsCreatedUpToWeek, goalsCompletedInWeek, goalsCompletedByWeekDay)
    .select({
      completed: sql`(SELECT COUNT(*) FROM ${goalsCompletedInWeek})`.mapWith(
        Number
      ),
      total:
        sql`(SELECT SUM(${goalsCreatedUpToWeek.desiredWeekFrequency}) FROM ${goalsCreatedUpToWeek})`.mapWith(
          Number
        ),
      goalsPerDay: sql<GoalsPerDay>`
            JSON_OBJECT_AGG(
                ${goalsCompletedByWeekDay.completedAtDate},
                ${goalsCompletedByWeekDay.completions}
            )
        `,
    })
    .from(goalsCompletedByWeekDay);

  return {
    summary: result[0],
  };
}
