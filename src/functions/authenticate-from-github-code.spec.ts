import { describe, it, expect, vi } from "vitest";
import { beforeEach } from "node:test";
import { authenticateFromGithubCode } from "./authenticate-from-github-code";
import { users } from "../db/schema";
import { and, eq, ne } from "drizzle-orm";
import * as github from "../modules/github-oauth";
import { db } from "../db";
import { makeUser } from "../../tests/factories/make-user";

describe("authenticate from github code", () => {
  beforeEach(() => {
    vi.mock("../modules/github-oauth");

    vi.clearAllMocks();
  });

  it("should be able to authenticate from github code", async () => {
    vi.spyOn(github, "getUserFromAccessToken").mockResolvedValueOnce({
      id: 123456789,
      name: "John Doe",
      email: null,
      avatar_url:
        "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses-green-hair_23-2149436201.jpg?t=st=1731862828~exp=1731866428~hmac=f426e568405b3042b8c9d0e2d434969f03e8138865ae7c9f0658d7e7d904f1de&w=826",
    });

    const sut = await authenticateFromGithubCode({
      code: "sample-github-code",
    });

    expect(sut.token).toEqual(expect.any(String));

    const [userOnDb] = await db
      .select()
      .from(users)
      .where(eq(users.externalAccountId, 123456789));

    expect(userOnDb.name).toEqual("John Doe");
  });

  it("should be able to authenticate with existing github user", async () => {
    const existing = await makeUser({
      name: "Jane Doe",
    });

    await db
      .delete(users)
      .where(
        and(
          eq(users.externalAccountId, existing.externalAccountId),
          ne(users.id, existing.id)
        )
      );

    vi.spyOn(github, "getUserFromAccessToken").mockResolvedValueOnce({
      id: existing.externalAccountId,
      name: "John Doe",
      email: null,
      avatar_url:
        "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses-green-hair_23-2149436201.jpg?t=st=1731862828~exp=1731866428~hmac=f426e568405b3042b8c9d0e2d434969f03e8138865ae7c9f0658d7e7d904f1de&w=826",
    });

    const sut = await authenticateFromGithubCode({
      code: "sample-github-code",
    });

    expect(sut.token).toEqual(expect.any(String));

    const [userOnDb] = await db
      .select()
      .from(users)
      .where(eq(users.externalAccountId, existing.externalAccountId));

    expect(userOnDb.name).toEqual("Jane Doe");
  });
});
