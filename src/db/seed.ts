//arquivo que vai popular o banco com dados fictícios

import { client, db } from ".";
import { goalCompetions, goals, users } from "./schema";
import dayjs from "dayjs";

async function seed() {
  await db.delete(goalCompetions);
  await db.delete(goals);

  const [user] = await db
    .insert(users)
    .values({
      name: "John Doe",
      externalAccountId: 123,
      avatarUrl:
        "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses-green-hair_23-2149436201.jpg?t=st=1731862828~exp=1731866428~hmac=f426e568405b3042b8c9d0e2d434969f03e8138865ae7c9f0658d7e7d904f1de&w=826",
    })
    .returning();

  const result = await db
    .insert(goals)
    .values([
      { userId: user.id, title: "Sleep early", desiredWeeklyFrequency: 5 },
      { userId: user.id, title: "Study", desiredWeeklyFrequency: 2 },
      { userId: user.id, title: "Eat health foods", desiredWeeklyFrequency: 3 },
    ])
    .returning();

  const startOfWeek = dayjs().startOf("week");

  await db.insert(goalCompetions).values([
    { goalId: result[0].id, createdAt: startOfWeek.toDate() },
    { goalId: result[1].id, createdAt: startOfWeek.add(1, "day").toDate() },
  ]);
}

seed().finally(() => {
  client.end();
});
