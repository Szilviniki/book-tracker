import { getBook, updateBook, deleteBook, ValidationError } from "@/lib/server/books";

const notFound = () => Response.json({ error: "Nincs ilyen könyv." }, { status: 404 });

// GET /api/books/:id
export async function GET(request, { params }) {
  const { id } = await params;
  const book = getBook(id);
  return book ? Response.json(book) : notFound();
}

// PATCH /api/books/:id – csak a megadott mezőket módosítja
export async function PATCH(request, { params }) {
  const { id } = await params;
  try {
    const book = updateBook(id, await request.json());
    return book ? Response.json(book) : notFound();
  } catch (e) {
    if (e instanceof ValidationError) return Response.json({ error: e.message }, { status: 400 });
    throw e;
  }
}

// DELETE /api/books/:id
export async function DELETE(request, { params }) {
  const { id } = await params;
  return deleteBook(id) ? new Response(null, { status: 204 }) : notFound();
}
