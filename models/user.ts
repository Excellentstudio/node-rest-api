import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  firstName: string;
  email: string;
  country: string;
  password: string;
  emailVerified: boolean;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  firstName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  country: { type: String, required: true },
  password: { type: String, required: true },
  emailVerified: { type: Boolean, default: false }
});

export default mongoose.model<IUser>('User', UserSchema);
