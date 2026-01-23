import { generateDataFile, dataFiles } from '@/lib/data-generator';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    // Check if file exists
    if (!dataFiles[fileId as keyof typeof dataFiles]) {
      return Response.json(
        { error: 'Fil hittades inte' },
        { status: 404 }
      );
    }

    // Generate the file
    const result = generateDataFile(fileId);

    if (!result) {
      return Response.json(
        { error: 'Kunde inte generera fil' },
        { status: 500 }
      );
    }

    // Return the file as a download - convert Buffer to Uint8Array for Response
    const uint8Array = new Uint8Array(result.buffer);
    return new Response(uint8Array, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return Response.json(
      { error: 'Kunde inte ladda ner fil' },
      { status: 500 }
    );
  }
}
