import dbConnect from "@/lib/db";
import Experience from "@/models/Experience";

export async function POST(req: any) {
  await dbConnect();

  try {
    const {
      user,
      title,
      employmentType,
      company,
      isCurrentRole,
      startDate,
      endDate,
      location,
      locationType,
      description
    } = await req.json();

    await Experience.create({
      user,
      title,
      employmentType,
      company,
      isCurrentRole,
      startDate,
      endDate,
      location,
      locationType,
      description
    });

    return new Response(JSON.stringify({ message: "Experience created successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error creating experience: ", error);
    return new Response(JSON.stringify({ message: "An unexpected error occurred. Please try again later." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function GET(req: any) {
  await dbConnect();

  try {
    const userID = req.nextUrl.searchParams.get('userID');
    if (!userID) {
      return new Response(JSON.stringify({ message: 'User ID is required' }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const items = await Experience.find({ user: userID });

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error fetching experience: ", error);
    return new Response(JSON.stringify({ message: "An unexpected error occurred. Please try again later.", error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
