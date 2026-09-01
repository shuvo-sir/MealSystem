import test from "node:test";
import assert from "node:assert/strict";

import {
  getEffectiveRoleForGroup,
  transferOwnership,
  validateLeavePolicy,
} from "../src/utils/rolePolicy.js";

test("group creator is treated as owner and ownership transfer promotes the replacement", () => {
  const group = {
    owner: "owner-1",
    manager: "owner-1",
    members: ["owner-1", "member-2"],
  };

  assert.equal(getEffectiveRoleForGroup(group, "owner-1"), "owner");
  assert.equal(getEffectiveRoleForGroup(group, "member-2"), "member");

  const transferred = transferOwnership({
    group,
    currentOwnerId: "owner-1",
    nextOwnerId: "member-2",
  });

  assert.equal(transferred.owner, "member-2");
  assert.equal(transferred.manager, "member-2");
  assert.equal(getEffectiveRoleForGroup(transferred, "owner-1"), "member");
  assert.equal(getEffectiveRoleForGroup(transferred, "member-2"), "owner");
});

test("owner cannot leave without transferring ownership", () => {
  const group = {
    owner: "owner-1",
    manager: "owner-1",
    members: ["owner-1", "member-2"],
  };

  const result = validateLeavePolicy({ group, userId: "owner-1" });

  assert.equal(result.allowed, false);
  assert.match(result.reason, /transfer ownership/i);
});

test("manager cannot leave without a replacement and the final member may dissolve the group", () => {
  const activeGroup = {
    owner: "owner-1",
    manager: "manager-2",
    members: ["owner-1", "manager-2", "member-3"],
  };

  const managerResult = validateLeavePolicy({ group: activeGroup, userId: "manager-2" });
  assert.equal(managerResult.allowed, false);
  assert.match(managerResult.reason, /promote|replacement/i);

  const lastMemberGroup = {
    owner: "owner-1",
    manager: "owner-1",
    members: ["owner-1"],
  };

  const finalMemberResult = validateLeavePolicy({ group: lastMemberGroup, userId: "owner-1" });
  assert.equal(finalMemberResult.allowed, true);
  assert.equal(finalMemberResult.dissolveGroup, true);
});
