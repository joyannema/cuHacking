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
  category: string;
  title: string;
  text: string;
  tags: string[];
  mood: string | null;
  isTodo: boolean;
  todoText: string | null;
  todoDone: boolean;
  photo: boolean;
  colorIdx: number;
  createdAt: Date;
}
