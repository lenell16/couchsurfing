import express from 'express';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, friends, User } from './schema';
import bodyParser from 'body-parser';

const connectionString =
  'postgres://user:pass@postgres:5432/db?sslmode=disable';
const client = postgres(connectionString);
const db = drizzle(client);

const app = express();
// Middleware
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/users', async (req, res) => {
  const allUsers = await db.select().from(users);
  return res.json(allUsers);
});

app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (user) {
    const friendsOfUser = await getFriends(user.id);
    return res.json({ user, friends: friendsOfUser });
  }
  return res.status(404).json({ error: 'User not found' });
});

app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email required' });
  }
  try {
    const [newUser] = await db
      .insert(users)
      .values({ name, email })
      .returning();

    let friendsOfUser = [] as User[];
    if (req.body.friends) {
      await addFriendsToUser(newUser.id, req.body.friends);
      friendsOfUser = await getFriends(newUser.id);
    }
    return res.json({ ...newUser, friends: friendsOfUser });
  } catch (e) {
    if (e instanceof postgres.PostgresError) {
      return res.status(409).json({ error: 'User already exists' });
    }
  }
});

app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    let updatedUser;

    if (name || email) {
      [updatedUser] = await db
        .update(users)
        .set({ name, email })
        .where(eq(users.id, id))
        .returning();
    } else {
      [updatedUser] = await db.select().from(users).where(eq(users.id, id));
    }
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    let friendsOfUser = [] as User[];
    if (req.body.friends) {
      await addFriendsToUser(updatedUser.id, req.body.friends);
      friendsOfUser = await getFriends(updatedUser.id);
    }
    return res.json({ ...updatedUser, friends: friendsOfUser });
  } catch (error) {
    return res.status(400).json({ error: 'Friend does not exist' });
  }
});

app.get('/relationship-distance/:fromUser/:toUser', async (req, res) => {
  const { fromUser, toUser } = req.params;

  if (!fromUser || !toUser) {
    return res
      .status(400)
      .json({ error: 'startUserId and targetUserId are required.' });
  }

  let visitedUsers = new Set();
  let currentUsers = [fromUser];
  let depth = 0;

  while (currentUsers.length > 0) {
    let nextUsers: number[] = [];

    for (let userId of currentUsers) {
      const currentUserFriends = await db
        .select()
        .from(friends)
        .where(eq(friends.userId1, userId));
      for (let friend of currentUserFriends) {
        if (friend.userId2 == toUser) {
          return res.json({ distance: depth + 1 });
        }
        if (!visitedUsers.has(friend.userId2)) {
          visitedUsers.add(friend.userId2);
          nextUsers.push(friend.userId2);
        }
      }
    }

    currentUsers = nextUsers;
    depth++;
  }

  res.json({ distance: -1, message: 'No relationship found' });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

async function getFriends(id: number) {
  const friendsOfUser = (await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .fullJoin(friends, eq(friends.userId2, users.id))
    .where(eq(friends.userId1, id))) as User[];
  return friendsOfUser;
}

async function addFriendsToUser(id: number, friendIds: number[]) {
  await db.insert(friends).values(
    friendIds.flatMap((friendId) => [
      {
        userId1: id,
        userId2: friendId,
      },
      {
        userId2: id,
        userId1: friendId,
      },
    ]),
  );
}
