//arquivo que vai popular o banco com dados fictícios

import { client, db } from ".";
import { goalCompetions, goals } from "./schema";
import dayjs from "dayjs";

async function seed() {
  await db.delete(goalCompetions);
  await db.delete(goals);

  const result = await db.insert(goals).values([
    { title: "Sleep early", desiredWeeklyFrequency: 5 },
    { title: "Study", desiredWeeklyFrequency: 2 },
    { title: "Eat health foods", desiredWeeklyFrequency: 3 },
  ]).returning();

  const startOfWeek = dayjs().startOf('week');

  await db.insert(goalCompetions).values([
    { goalId: result[0].id, createdAt: startOfWeek.toDate() },
    { goalId: result[1].id, createdAt: startOfWeek.add(1, 'day').toDate() },
  ])
}

seed().finally(() => {
    client.end()
});
