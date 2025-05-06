import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function FindOrCreateUser({ name, email, image, role }:
  { name: String, email: String, image: String, role: String }) {
  await dbConnect()
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      image,
      role,
    })
  }

  return user;
}
