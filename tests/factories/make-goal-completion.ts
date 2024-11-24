import { db } from "../../src/db";
import { goalCompetions } from "../../src/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export async function makeGoalCompletion(
  override: Partial<InferSelectModel<typeof goalCompetions>> &
    Pick<InferSelectModel<typeof goalCompetions>, "goalId">
) {
  const [row] = await db.insert(goalCompetions).values(override).returning();

  return row;
}
