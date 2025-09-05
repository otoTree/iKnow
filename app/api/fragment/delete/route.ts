import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function DELETE(req: NextRequest) {
  // curl --location --request DELETE 'http://localhost:3000/api/core/dataset/collection/delete?id=65aa2a64e6cb9b8ccdc00de8' \
  // --header 'Authorization: Bearer {{authorization}}' \
  const authorization = req.headers.get("Authorization")?.split(" ")[1];
  if (!authorization) {
    return NextResponse.json(
      { error: "Missing authorization" },
      { status: 400 }
    );
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const response = await axios.delete(
    process.env.NEXT_PUBLIC_API_BASE_URL +
      "/api/core/dataset/collection/delete?id=" +
      id,
    {
      headers: {
        Authorization: `Bearer ${authorization}`,
      },
    }
  );
  return NextResponse.json(response.data);
}
