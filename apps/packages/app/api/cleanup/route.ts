import * as minio from "minio";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  if (secret !== "91f955ba-0c05-44bb-bd62-9a2f94bdb503") {
    return new Response(null, { status: 401 });
  }

  // Connect to the cloud storage.
  const client = new minio.Client({
    endPoint: process.env.PACKAGES_ENDPOINT,
    accessKey: process.env.PACKAGES_ACCESS_KEY,
    secretKey: process.env.PACKAGES_SECRET_KEY,
  });

  // Test to see if the bucket exists.
  const bucketExists = await client.bucketExists(process.env.PACKAGES_BUCKET);
  if (!bucketExists) {
    throw new Error(`Bucket "${process.env.PACKAGES_BUCKET}" does not exist`);
  }

  // Get the list of objects in the bucket, sorted by date.
  const stream = await client.listObjectsV2(process.env.PACKAGES_BUCKET);

  const objects: string[] = [];

  stream.on("data", (object) => {
    if (
      object.name &&
      object.lastModified.getTime() < Date.now() - 1000 * 60 * 60 * 24
    ) {
      objects.push(object.name);
    }
  });

  await new Promise<void>((resolve, reject) => {
    stream.on("end", resolve);
    stream.on("error", reject);
  });

  // Delete the objects.
  await client.removeObjects(process.env.PACKAGES_BUCKET, objects);

  return new Response(
    JSON.stringify(
      {
        objects,
      },
      null,
      2
    ),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
