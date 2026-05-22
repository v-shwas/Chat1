/**
 * Group route tests
 * POST /api/groups/create
 * GET  /api/groups/my-groups
 * GET  /api/groups/:id
 * POST /api/groups/:id/message
 * GET  /api/groups/:id/messages
 * POST /api/groups/:id/add-members
 * POST /api/groups/:id/remove-member
 * POST /api/groups/:id/leave
 */

import request from "supertest";
import mongoose from "mongoose";
import Group from "../models/groupModel.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./setup.js";
import { TEST_SECRET, createTestUser } from "./helpers.js";
import buildApp from "./testApp.js";

process.env.SECRET_KEY = TEST_SECRET;

let app;

beforeAll(async () => {
  await connectTestDB();
  app = buildApp();
});

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

// ── Helper: create a group via the API ───────────────────────────────────────
const apiCreateGroup = (app, token, payload) =>
  request(app)
    .post("/api/groups/create")
    .set("Authorization", `Bearer ${token}`)
    .send(payload);

// ── POST /api/groups/create ──────────────────────────────────────────────────

describe("POST /api/groups/create", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app)
      .post("/api/groups/create")
      .send({ name: "G", members: [] });

    expect(res.status).toBe(401);
  });

  it("creates a group and returns it with populated members", async () => {
    const { user: creator, token } = await createTestUser({
      username: "creator",
      email: "creator@example.com",
    });
    const { user: member } = await createTestUser({
      username: "member1",
      email: "member1@example.com",
    });

    const res = await apiCreateGroup(app, token, {
      name: "My Group",
      description: "A test group",
      members: [member._id.toString()],
    });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("My Group");
    expect(res.body.members).toHaveLength(2); // creator + member
  });

  it("sets the creator as an admin", async () => {
    const { user: creator, token } = await createTestUser({
      username: "adminCreator",
      email: "adminCreator@example.com",
    });
    const { user: member } = await createTestUser({
      username: "adminMember",
      email: "adminMember@example.com",
    });

    const res = await apiCreateGroup(app, token, {
      name: "Admin Test",
      members: [member._id.toString()],
    });

    expect(res.status).toBe(201);
    const adminIds = res.body.admins.map((a) => a._id.toString());
    expect(adminIds).toContain(creator._id.toString());
  });

  it("includes the creator in members even if not passed", async () => {
    const { user: creator, token } = await createTestUser({
      username: "creatorMember",
      email: "creatorMember@example.com",
    });
    const { user: member } = await createTestUser({
      username: "creatorMember2",
      email: "creatorMember2@example.com",
    });

    const res = await apiCreateGroup(app, token, {
      name: "Creator In Members",
      members: [member._id.toString()],
    });

    const memberIds = res.body.members.map((m) => m._id.toString());
    expect(memberIds).toContain(creator._id.toString());
  });

  it("returns 400 when name or members are missing", async () => {
    const { token } = await createTestUser({
      username: "noNameUser",
      email: "noName@example.com",
    });

    const res = await apiCreateGroup(app, token, { members: [] });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/group name and at least 1 member required/i);
  });
});

// ── GET /api/groups/my-groups ────────────────────────────────────────────────

describe("GET /api/groups/my-groups", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/groups/my-groups");

    expect(res.status).toBe(401);
  });

  it("returns only groups the user belongs to", async () => {
    const { user: user1, token: token1 } = await createTestUser({
      username: "myGrpUser1",
      email: "myGrpUser1@example.com",
    });
    const { user: user2, token: token2 } = await createTestUser({
      username: "myGrpUser2",
      email: "myGrpUser2@example.com",
    });

    // user1 creates a group with user2 as member
    await apiCreateGroup(app, token1, {
      name: "Group A",
      members: [user2._id.toString()],
    });

    // user2 creates a group without user1
    const { user: user3 } = await createTestUser({
      username: "myGrpUser3",
      email: "myGrpUser3@example.com",
    });
    await apiCreateGroup(app, token2, {
      name: "Group B",
      members: [user3._id.toString()],
    });

    // user1 should see Group A but not Group B
    const res = await request(app)
      .get("/api/groups/my-groups")
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const groupNames = res.body.map((g) => g.name);
    expect(groupNames).toContain("Group A");
    expect(groupNames).not.toContain("Group B");
  });

  it("returns empty array when user is in no groups", async () => {
    const { token } = await createTestUser({
      username: "noGroups",
      email: "noGroups@example.com",
    });

    const res = await request(app)
      .get("/api/groups/my-groups")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ── GET /api/groups/:id ──────────────────────────────────────────────────────

describe("GET /api/groups/:id", () => {
  it("returns 401 without a token", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/groups/${fakeId}`);

    expect(res.status).toBe(401);
  });

  it("returns the group with populated members and admins", async () => {
    const { user: creator, token } = await createTestUser({
      username: "getGrpCreator",
      email: "getGrpCreator@example.com",
    });
    const { user: member } = await createTestUser({
      username: "getGrpMember",
      email: "getGrpMember@example.com",
    });

    const createRes = await apiCreateGroup(app, token, {
      name: "Populated Group",
      members: [member._id.toString()],
    });
    const groupId = createRes.body._id;

    const res = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body._id.toString()).toBe(groupId.toString());
    expect(res.body.name).toBe("Populated Group");
    // Members should be populated objects (not just IDs)
    expect(typeof res.body.members[0]).toBe("object");
    expect(res.body.members[0]).toHaveProperty("fullname");
  });

  it("returns 403 when an authenticated non-member requests the group", async () => {
    const { token: creatorToken } = await createTestUser({
      username: "privateCreator",
      email: "privateCreator@example.com",
    });
    const { user: member } = await createTestUser({
      username: "privateMember",
      email: "privateMember@example.com",
    });
    const { token: outsiderToken } = await createTestUser({
      username: "privateOutsider",
      email: "privateOutsider@example.com",
    });

    const createRes = await apiCreateGroup(app, creatorToken, {
      name: "Members Only",
      members: [member._id.toString()],
    });

    const res = await request(app)
      .get(`/api/groups/${createRes.body._id}`)
      .set("Authorization", `Bearer ${outsiderToken}`);

    expect(res.status).toBe(403);
  });

  it("returns 404 for a non-existent group", async () => {
    const { token } = await createTestUser({
      username: "getGrp404",
      email: "getGrp404@example.com",
    });
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/groups/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/group not found/i);
  });
});

// ── POST /api/groups/:id/message ─────────────────────────────────────────────

describe("POST /api/groups/:id/message", () => {
  it("returns 401 without a token", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/api/groups/${fakeId}/message`)
      .send({ message: "hi" });

    expect(res.status).toBe(401);
  });

  it("sends a group message and returns 201", async () => {
    const { user: creator, token } = await createTestUser({
      username: "grpMsgCreator",
      email: "grpMsgCreator@example.com",
    });
    const { user: member } = await createTestUser({
      username: "grpMsgMember",
      email: "grpMsgMember@example.com",
    });

    const createRes = await apiCreateGroup(app, token, {
      name: "Msg Group",
      members: [member._id.toString()],
    });
    const groupId = createRes.body._id;

    const res = await request(app)
      .post(`/api/groups/${groupId}/message`)
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "Hello group!" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Hello group!");
    expect(res.body.groupId.toString()).toBe(groupId.toString());
  });

  it("returns 403 when a non-member tries to send a message", async () => {
    const { user: creator, token: creatorToken } = await createTestUser({
      username: "grpMsgOwner",
      email: "grpMsgOwner@example.com",
    });
    const { user: outsider, token: outsiderToken } = await createTestUser({
      username: "grpMsgOutsider",
      email: "grpMsgOutsider@example.com",
    });
    const { user: member } = await createTestUser({
      username: "grpMsgMbr",
      email: "grpMsgMbr@example.com",
    });

    const createRes = await apiCreateGroup(app, creatorToken, {
      name: "Private Group",
      members: [member._id.toString()],
    });
    const groupId = createRes.body._id;

    const res = await request(app)
      .post(`/api/groups/${groupId}/message`)
      .set("Authorization", `Bearer ${outsiderToken}`)
      .send({ message: "I'm crashing the party" });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/not a member/i);
  });

  it("returns 404 for a non-existent group", async () => {
    const { token } = await createTestUser({
      username: "grpMsg404",
      email: "grpMsg404@example.com",
    });
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post(`/api/groups/${fakeId}/message`)
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "ghost message" });

    expect(res.status).toBe(404);
  });
});

// ── GET /api/groups/:id/messages ─────────────────────────────────────────────

describe("GET /api/groups/:id/messages", () => {
  it("returns 401 without a token", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/groups/${fakeId}/messages`);

    expect(res.status).toBe(401);
  });

  it("returns messages for a group", async () => {
    const { user: creator, token } = await createTestUser({
      username: "getGrpMsgCr",
      email: "getGrpMsgCr@example.com",
    });
    const { user: member } = await createTestUser({
      username: "getGrpMsgMbr",
      email: "getGrpMsgMbr@example.com",
    });

    const createRes = await apiCreateGroup(app, token, {
      name: "Messages Group",
      members: [member._id.toString()],
    });
    const groupId = createRes.body._id;

    await request(app)
      .post(`/api/groups/${groupId}/message`)
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "First group message" });

    const res = await request(app)
      .get(`/api/groups/${groupId}/messages`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].message).toBe("First group message");
  });

  it("returns 403 when a non-member requests group messages", async () => {
    const { token: creatorToken } = await createTestUser({
      username: "grpMsgPrivateCreator",
      email: "grpMsgPrivateCreator@example.com",
    });
    const { user: member } = await createTestUser({
      username: "grpMsgPrivateMember",
      email: "grpMsgPrivateMember@example.com",
    });
    const { token: outsiderToken } = await createTestUser({
      username: "grpMsgPrivateOutsider",
      email: "grpMsgPrivateOutsider@example.com",
    });

    const createRes = await apiCreateGroup(app, creatorToken, {
      name: "Private Messages Group",
      members: [member._id.toString()],
    });

    const res = await request(app)
      .get(`/api/groups/${createRes.body._id}/messages`)
      .set("Authorization", `Bearer ${outsiderToken}`);

    expect(res.status).toBe(403);
  });

  it("returns 404 for a non-existent group", async () => {
    const { token } = await createTestUser({
      username: "getGrpMsg404",
      email: "getGrpMsg404@example.com",
    });
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/groups/${fakeId}/messages`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

// ── POST /api/groups/:id/add-members ─────────────────────────────────────────

describe("POST /api/groups/:id/add-members", () => {
  it("returns 401 without a token", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/api/groups/${fakeId}/add-members`)
      .send({ members: [] });

    expect(res.status).toBe(401);
  });

  it("allows an admin to add new members", async () => {
    const { user: admin, token: adminToken } = await createTestUser({
      username: "addMbrAdmin",
      email: "addMbrAdmin@example.com",
    });
    const { user: existingMember } = await createTestUser({
      username: "addMbrExisting",
      email: "addMbrExisting@example.com",
    });
    const { user: newMember } = await createTestUser({
      username: "addMbrNew",
      email: "addMbrNew@example.com",
    });

    const createRes = await apiCreateGroup(app, adminToken, {
      name: "Add Members Group",
      members: [existingMember._id.toString()],
    });
    const groupId = createRes.body._id;

    const res = await request(app)
      .post(`/api/groups/${groupId}/add-members`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ members: [newMember._id.toString()] });

    expect(res.status).toBe(200);
    const memberIds = res.body.members.map((m) => m._id.toString());
    expect(memberIds).toContain(newMember._id.toString());
  });

  it("returns 400 when adding a non-existent member id", async () => {
    const { token: adminToken } = await createTestUser({
      username: "addMissingAdmin",
      email: "addMissingAdmin@example.com",
    });
    const { user: existingMember } = await createTestUser({
      username: "addMissingExisting",
      email: "addMissingExisting@example.com",
    });

    const createRes = await apiCreateGroup(app, adminToken, {
      name: "Add Missing Member Group",
      members: [existingMember._id.toString()],
    });

    const res = await request(app)
      .post(`/api/groups/${createRes.body._id}/add-members`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ members: [new mongoose.Types.ObjectId().toString()] });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/do not exist/i);
  });

  it("returns 403 when a non-admin tries to add members", async () => {
    const { user: admin, token: adminToken } = await createTestUser({
      username: "addNonAdminOwner",
      email: "addNonAdminOwner@example.com",
    });
    const { user: regularMember, token: memberToken } = await createTestUser({
      username: "addNonAdminMbr",
      email: "addNonAdminMbr@example.com",
    });
    const { user: newMember } = await createTestUser({
      username: "addNonAdminNew",
      email: "addNonAdminNew@example.com",
    });

    const createRes = await apiCreateGroup(app, adminToken, {
      name: "Non-Admin Add Test",
      members: [regularMember._id.toString()],
    });
    const groupId = createRes.body._id;

    const res = await request(app)
      .post(`/api/groups/${groupId}/add-members`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ members: [newMember._id.toString()] });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/only admins can add members/i);
  });
});

// ── POST /api/groups/:id/remove-member ───────────────────────────────────────

describe("POST /api/groups/:id/remove-member", () => {
  it("returns 401 without a token", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/api/groups/${fakeId}/remove-member`)
      .send({ memberId: "123" });

    expect(res.status).toBe(401);
  });

  it("allows an admin to remove a member", async () => {
    const { user: admin, token: adminToken } = await createTestUser({
      username: "remMbrAdmin",
      email: "remMbrAdmin@example.com",
    });
    const { user: memberToRemove } = await createTestUser({
      username: "remMbrTarget",
      email: "remMbrTarget@example.com",
    });

    const createRes = await apiCreateGroup(app, adminToken, {
      name: "Remove Member Group",
      members: [memberToRemove._id.toString()],
    });
    const groupId = createRes.body._id;

    const res = await request(app)
      .post(`/api/groups/${groupId}/remove-member`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ memberId: memberToRemove._id.toString() });

    expect(res.status).toBe(200);
    const memberIds = res.body.members.map((m) => m._id.toString());
    expect(memberIds).not.toContain(memberToRemove._id.toString());
  });

  it("returns 403 when a non-admin tries to remove a member", async () => {
    const { user: admin, token: adminToken } = await createTestUser({
      username: "remNonAdminOwner",
      email: "remNonAdminOwner@example.com",
    });
    const { user: regularMember, token: memberToken } = await createTestUser({
      username: "remNonAdminMbr",
      email: "remNonAdminMbr@example.com",
    });
    const { user: targetMember } = await createTestUser({
      username: "remNonAdminTarget",
      email: "remNonAdminTarget@example.com",
    });

    const createRes = await apiCreateGroup(app, adminToken, {
      name: "Non-Admin Remove Test",
      members: [regularMember._id.toString(), targetMember._id.toString()],
    });
    const groupId = createRes.body._id;

    const res = await request(app)
      .post(`/api/groups/${groupId}/remove-member`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ memberId: targetMember._id.toString() });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/only admins can remove members/i);
  });
});

// ── POST /api/groups/:id/leave ────────────────────────────────────────────────

describe("POST /api/groups/:id/leave", () => {
  it("returns 401 without a token", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).post(`/api/groups/${fakeId}/leave`);

    expect(res.status).toBe(401);
  });

  it("allows a member to leave a group", async () => {
    const { user: creator, token: creatorToken } = await createTestUser({
      username: "leaveCreator",
      email: "leaveCreator@example.com",
    });
    const { user: leaver, token: leaverToken } = await createTestUser({
      username: "leaveUser",
      email: "leaveUser@example.com",
    });

    const createRes = await apiCreateGroup(app, creatorToken, {
      name: "Leave Group",
      members: [leaver._id.toString()],
    });
    const groupId = createRes.body._id;

    const res = await request(app)
      .post(`/api/groups/${groupId}/leave`)
      .set("Authorization", `Bearer ${leaverToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/left group successfully/i);

    // Verify in DB
    const group = await Group.findById(groupId);
    const memberIds = group.members.map((m) => m.toString());
    expect(memberIds).not.toContain(leaver._id.toString());
  });

  it("returns 404 for a non-existent group", async () => {
    const { token } = await createTestUser({
      username: "leave404",
      email: "leave404@example.com",
    });
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post(`/api/groups/${fakeId}/leave`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/group not found/i);
  });
});
