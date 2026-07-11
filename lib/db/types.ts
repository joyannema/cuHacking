import type { ObjectId } from "mongodb";

export interface UserDoc {
  _id?: ObjectId;
  username: string;
  passwordHash: string;
  createdAt: Date;
}

export interface CategoryDoc {
  _id?: ObjectId;
  userId: ObjectId;
  label: string;
  createdAt: Date;
}

export interface NoteDoc {
  _id?: ObjectId;
  userId: ObjectId;
  categoryId: ObjectId | null;
  text: string;
  tags: string[];
  createdAt: Date;
}
