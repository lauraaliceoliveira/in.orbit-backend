import { describe, it, expect } from "vitest";
import { makeUser } from "../../tests/factories/make-user";
import { makeGoal } from "../../tests/factories/make-goal";
import { makeGoalCompletion } from "../../tests/factories/make-goal-completion";
import { GetWeekPendingGoals } from "./get-week-pending-goals";
import { GetWeekSummary } from "./get-week-summary";
import dayjs from "dayjs";

describe("get week summary", () => {
  it("should be able to get week summary", async () => {
    const user = await makeUser();

    const weekStartsAt = dayjs(new Date(2024, 10, 24)).startOf("week").toDate();

    const goal1 = await makeGoal({
      userId: user.id,
      title: "Meditate",
      desiredWeeklyFrequency: 2,
      createdAt: weekStartsAt,
    });
    const goal2 = await makeGoal({
      userId: user.id,
      title: "Study",
      desiredWeeklyFrequency: 1,
      createdAt: weekStartsAt,
    });
    const goal3 = await makeGoal({
      userId: user.id,
      title: "Work out",
      desiredWeeklyFrequency: 3,
      createdAt: weekStartsAt,
    });

    await makeGoalCompletion({
      goalId: goal1.id,
      createdAt: dayjs(weekStartsAt).add(2, "days").toDate(),
    });
    await makeGoalCompletion({
      goalId: goal2.id,
      createdAt: dayjs(weekStartsAt).add(2, "days").toDate(),
    });
    await makeGoalCompletion({
      goalId: goal3.id,
      createdAt: dayjs(weekStartsAt).add(3, "days").toDate(),
    });
    await makeGoalCompletion({
      goalId: goal3.id,
      createdAt: dayjs(weekStartsAt).add(4, "days").toDate(),
    });

    const result = await GetWeekSummary({
      userId: user.id,
      weekStartsAt,
    });

    expect(result).toEqual({
      summary: {
        total: 6,
        completed: 4,
        goalsPerDay: {
          "2024-11-28": expect.arrayContaining([
            expect.objectContaining({ title: "Work out" }),
          ]),
          "2024-11-27": expect.arrayContaining([
            expect.objectContaining({ title: "Work out" }),
          ]),
          "2024-11-26": expect.arrayContaining([
            expect.objectContaining({ title: "Meditate" }),
            expect.objectContaining({ title: "Study" }),
          ]),
        },
      },
    });
  });
});
