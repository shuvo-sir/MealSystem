export const getEffectiveRoleForGroup = (group, userId) => {
  if (!group || !userId) {
    return "member";
  }

  const normalizedUserId = String(userId);

  if (group.owner && String(group.owner) === normalizedUserId) {
    return "owner";
  }

  if (group.manager && String(group.manager) === normalizedUserId) {
    return "manager";
  }

  if (group.members && group.members.some((memberId) => String(memberId) === normalizedUserId)) {
    return "member";
  }

  return "member";
};

export const transferOwnership = ({ group, currentOwnerId, nextOwnerId }) => {
  if (!group || !currentOwnerId || !nextOwnerId) {
    throw new Error("Missing ownership transfer data");
  }

  if (String(group.owner) !== String(currentOwnerId)) {
    throw new Error("Only the current owner can transfer ownership");
  }

  const nextOwnerIdString = String(nextOwnerId);
  const hasMember = group.members.some((memberId) => String(memberId) === nextOwnerIdString);

  if (!hasMember) {
    throw new Error("Selected user must already be a member of this group");
  }

  const updatedGroup = {
    ...group,
    owner: nextOwnerIdString,
    manager: nextOwnerIdString,
    members: group.members.map((memberId) => {
      const memberIdString = String(memberId);
      if (memberIdString === String(currentOwnerId)) {
        return memberIdString;
      }
      return memberIdString;
    }),
  };

  return updatedGroup;
};

export const validateLeavePolicy = ({ group, userId }) => {
  if (!group || !userId) {
    return { allowed: false, reason: "Missing group or user information" };
  }

  const normalizedUserId = String(userId);
  const isOwner = group.owner && String(group.owner) === normalizedUserId;
  const isManager = group.manager && String(group.manager) === normalizedUserId;
  const remainingMembers = (group.members || []).filter(
    (memberId) => String(memberId) !== normalizedUserId
  );

  if (isOwner) {
    if (remainingMembers.length === 0) {
      return {
        allowed: true,
        dissolveGroup: true,
        reason: "Last remaining member is leaving and the group will dissolve.",
      };
    }

    return {
      allowed: false,
      reason: "You must transfer ownership to another member before leaving the group.",
    };
  }

  if (isManager) {
    if (remainingMembers.length === 0) {
      return {
        allowed: true,
        dissolveGroup: true,
        reason: "Last remaining member is leaving and the group will dissolve.",
      };
    }

    if (group.manager && String(group.manager) !== normalizedUserId) {
      return { allowed: true, reason: "A replacement manager has already been assigned." };
    }

    return {
      allowed: false,
      reason: "You must promote a member to manager before leaving the group.",
    };
  }

  return { allowed: true, reason: "Member exit permitted." };
};
