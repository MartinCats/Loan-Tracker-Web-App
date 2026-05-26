const assert = require("node:assert/strict");
const test = require("node:test");
const {
  canDeleteProfile,
  resolveActiveProfile,
  shouldResetActiveProfileAfterDelete,
} = require("../src/lib/lender-profiles/safety.ts");

function makeProfile(overrides = {}) {
  return {
    id: "profile-a",
    userId: "user-test",
    name: "โปรไฟล์หลัก",
    avatarEmoji: "🧑",
    themeColor: "green",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

test("invalid active profile cookie falls back to earliest profile", () => {
  const earliestProfile = makeProfile({
    id: "profile-earliest",
    createdAt: "2026-01-01T00:00:00.000Z",
  });
  const laterProfile = makeProfile({
    id: "profile-later",
    createdAt: "2026-02-01T00:00:00.000Z",
  });

  const profile = resolveActiveProfile(
    [laterProfile, earliestProfile],
    "missing-profile",
  );

  assert.equal(profile.id, "profile-earliest");
});

test("cannot delete the last lender profile", () => {
  assert.equal(canDeleteProfile(0), false);
  assert.equal(canDeleteProfile(1), false);
  assert.equal(canDeleteProfile(2), true);
});

test("deleting active profile resets selection safely", () => {
  assert.equal(
    shouldResetActiveProfileAfterDelete("profile-active", "profile-active"),
    true,
  );
  assert.equal(
    shouldResetActiveProfileAfterDelete("profile-other", "profile-active"),
    false,
  );
  assert.equal(
    shouldResetActiveProfileAfterDelete("profile-other", undefined),
    false,
  );
});
