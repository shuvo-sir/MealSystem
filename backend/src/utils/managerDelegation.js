import MealGroup from "../models/MealGroup.js";
import User from "../models/User.js";

export const TEMP_MANAGER_DURATIONS = {
  "3": 3,
  "7": 7,
  "30": 30,
};

export const PERMANENT_MANAGER_DURATION = "permanent";

const isValidObjectId = (value) => Boolean(value && value.toString);

export const normalizeManagerDuration = (duration) => {
  const normalized = String(duration ?? "").trim().toLowerCase();

  if (normalized === PERMANENT_MANAGER_DURATION) {
    return PERMANENT_MANAGER_DURATION;
  }

  if (Object.prototype.hasOwnProperty.call(TEMP_MANAGER_DURATIONS, normalized)) {
    return normalized;
  }

  return null;
};

export const getManagerDelegationExpiresAt = (duration) => {
  const normalizedDuration = normalizeManagerDuration(duration);

  if (!normalizedDuration || normalizedDuration === PERMANENT_MANAGER_DURATION) {
    return null;
  }

  const days = TEMP_MANAGER_DURATIONS[normalizedDuration];
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

export const syncGroupManagerRoles = async (group) => {
  if (!group) {
    return;
  }

  const memberIds = (group.members || []).map((memberId) => memberId.toString());

  if (memberIds.length > 0) {
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $set: { role: "member" } }
    );
  }

  if (group.owner) {
    await User.findByIdAndUpdate(group.owner, { role: "owner" });
  }

  if (group.manager && group.manager.toString() !== group.owner?.toString()) {
    await User.findByIdAndUpdate(group.manager, { role: "manager" });
  }
};

export const resolveExpiredManagerDelegation = async (group) => {
  if (!group?.managerDelegation?.previousManager || !group?.managerDelegation?.expiresAt) {
    return group;
  }

  const expiresAt = new Date(group.managerDelegation.expiresAt);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt > new Date()) {
    return group;
  }

  const previousManagerId = group.managerDelegation.previousManager.toString();

  if (!isValidObjectId(previousManagerId)) {
    group.managerDelegation = { previousManager: null, expiresAt: null };
    await group.save();
    return group;
  }

  if (!group.members.some((memberId) => memberId.toString() === previousManagerId)) {
    group.members.push(previousManagerId);
  }

  group.manager = previousManagerId;
  group.managerDelegation = { previousManager: null, expiresAt: null };

  await group.save();
  await syncGroupManagerRoles(group);

  return group;
};

export const transferGroupManager = async ({
  group,
  currentManager,
  nextManager,
  duration,
}) => {
  if (!group || !currentManager || !nextManager) {
    throw new Error("Missing manager transfer data");
  }

  const normalizedDuration = normalizeManagerDuration(duration);
  if (!normalizedDuration) {
    throw new Error("Invalid manager duration");
  }

  const nextManagerId = nextManager._id.toString();
  const currentManagerId = currentManager._id.toString();

  if (group.manager?.toString() !== currentManagerId) {
    throw new Error("Only the active manager can transfer manager rights");
  }

  if (!group.members.some((memberId) => memberId.toString() === nextManagerId)) {
    throw new Error("Selected user must already be a member of this group");
  }

  if (!group.members.some((memberId) => memberId.toString() === currentManagerId)) {
    group.members.push(currentManagerId);
  }

  if (!group.members.some((memberId) => memberId.toString() === nextManagerId)) {
    group.members.push(nextManagerId);
  }

  group.manager = nextManager._id;
  group.managerDelegation =
    normalizedDuration === PERMANENT_MANAGER_DURATION
      ? { previousManager: null, expiresAt: null }
      : {
          previousManager: currentManager._id,
          expiresAt: getManagerDelegationExpiresAt(normalizedDuration),
        };

  await group.save();
  await syncGroupManagerRoles(group);

  return group;
};