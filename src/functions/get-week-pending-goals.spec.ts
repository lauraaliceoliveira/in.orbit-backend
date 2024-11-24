import { describe, it, expect } from "vitest";
import { makeUser } from "../../tests/factories/make-user";
import { makeGoal } from "../../tests/factories/make-goal";
import { makeGoalCompletion } from "../../tests/factories/make-goal-completion";
import { GetWeekPendingGoals } from "./get-week-pending-goals";

describe("get week pending goals", () => {
  it("should be able to get week pending goals", async () => {
    const user = await makeUser();

    const goal1 = await makeGoal({
      userId: user.id,
      title: "Meditate",
      desiredWeeklyFrequency: 2,
    });
    const goal2 = await makeGoal({
      userId: user.id,
      title: "Study",
      desiredWeeklyFrequency: 1,
    });
    const goal3 = await makeGoal({
      userId: user.id,
      title: "Work out",
      desiredWeeklyFrequency: 3,
    });

    await makeGoalCompletion({ goalId: goal1.id });
    await makeGoalCompletion({ goalId: goal2.id });
    await makeGoalCompletion({ goalId: goal3.id });
    await makeGoalCompletion({ goalId: goal3.id });

    const result = await GetWeekPendingGoals({
      userId: user.id,
    });

    //    pendingGoals: {
    //     id: string;
    //     title: string;
    //     desiredWeekFrequency: number;
    //     completionCount: number;
    // }[];

    expect(result).toEqual({
      pendingGoals: expect.arrayContaining([
        expect.objectContaining({
          title: "Meditate",
          desiredWeekFrequency: 2,
          completionCount: 1,
        }),

        expect.objectContaining({
          title: "Study",
          desiredWeekFrequency: 1,
          completionCount: 1,
        }),

        expect.objectContaining({
          title: "Work out",
          desiredWeekFrequency: 3,
          completionCount: 2,
        }),
      ]),
    });
  });
});
