import { listBooks, createBook, ValidationError } from "@/lib/server/books";

// GET /api/books – az összes könyv
export async function GET() {
  return Response.json(listBooks());
}

// POST /api/books – új könyv
export async function POST(request) {
  try {
    const book = createBook(await request.json());
    return Response.json(book, { status: 201 });
  } catch (e) {
    if (e instanceof ValidationError) return Response.json({ error: e.message }, { status: 400 });
    throw e;
  }
}
