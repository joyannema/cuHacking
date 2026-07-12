import {
  getCategoriesCollection,
  getNotesCollection,
  getUsersCollection,
} from "./collections";

export async function ensureIndexes() {
  const users = await getUsersCollection();
  const notes = await getNotesCollection();
  const categories = await getCategoriesCollection();

  await users.createIndex({ username: 1 }, { unique: true });

  await notes.createIndex({ userId: 1, createdAt: -1 });
  await notes.createIndex({ userId: 1, category: 1 });

  await categories.createIndex({ userId: 1, label: 1 }, { unique: true });
  await categories.createIndex({ userId: 1, createdAt: -1 });

  return {
    users: users.collectionName,
    notes: notes.collectionName,
    categories: categories.collectionName,
  };
}
