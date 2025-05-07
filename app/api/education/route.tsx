import dbConnect from "@/lib/db";
import Education from "@/models/Education";


export async function POST(req: any) {
  await dbConnect();

  try {
    const { user, degree, institution, year, description, gpa } = await req.json();

    await Education.create({
      user,
      degree,
      institution,
      year,
      description,
      gpa
    });
    return new Response(JSON.stringify({ message: "Created successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error creating education: ", error);
    return new Response(JSON.stringify({ message: "An unexpected error occurred. Please try again later." }),
      { status: 500 });
  }
}

export async function GET(req: any) {
  await dbConnect();
  console.log("IT HIT HERE");
  try {
    const userID = req.nextUrl.searchParams.get('userID');
    const items = await Education.find({ user: userID });
    return new Response(JSON.stringify(items),
      { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.log('Fetching user API error:', error);
    return new Response(JSON.stringify({ message: 'An unexpected error occured.', error: error }),
      { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
