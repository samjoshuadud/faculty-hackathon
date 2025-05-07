import dbConnect from "@/lib/db";
import Certifications from "@/models/Certifications";

export async function POST(req: any) {
  await dbConnect();

  try {
    const { 
      user, 
      name, 
      issuingOrganization, 
      issueDate, 
      expirationDate, 
      credentialId, 
      credentialURL, 
      description 
    } = await req.json();

    await Certifications.create({
      user,
      name,
      issuingOrganization,
      issueDate,
      expirationDate,
      credentialId,
      credentialURL,
      description
    });

    return new Response(JSON.stringify({ message: "Certification created successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error creating certification: ", error);
    return new Response(JSON.stringify({ message: "An unexpected error occurred. Please try again later." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function GET(req: any) {
  await dbConnect();

  try {
    const userID = req.nextUrl.searchParams.get('userID'); // assuming you want to fetch certifications by user ID
    if (!userID) {
      return new Response(JSON.stringify({ message: 'User ID is required' }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const certifications = await Certifications.find({ user: userID });

    return new Response(JSON.stringify(certifications), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error fetching certifications: ", error);
    return new Response(JSON.stringify({ message: "An unexpected error occurred. Please try again later.", error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}