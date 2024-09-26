import { Suspense } from "react";
import * as minio from "minio";

export const dynamic = "force-dynamic";

const client = new minio.Client({
  endPoint: process.env.PACKAGES_ENDPOINT,
  accessKey: process.env.PACKAGES_ACCESS_KEY,
  secretKey: process.env.PACKAGES_SECRET_KEY,
});

async function Packages() {
  const stream = await client.listObjectsV2(process.env.PACKAGES_BUCKET);

  const objects: string[] = [];
  stream.on("data", (object) => {
    if (object.name) {
      objects.push(object.name);
    }
  });

  await new Promise((resolve, reject) => {
    stream.on("end", resolve);
    stream.on("error", reject);
  });

  return (
    <ul className="font-mono">
      {objects.map((object) => (
        <li key={object}>{object}</li>
      ))}
    </ul>
  );
}

export default async function Page() {
  return (
    <main className="prose mx-auto max-w-screen-lg p-16">
      <h1>Packages</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <Packages />
      </Suspense>
    </main>
  );
}
