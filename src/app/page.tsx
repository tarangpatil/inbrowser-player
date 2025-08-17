import { readdir } from "node:fs/promises";
import { redirect } from "next/navigation";
import os from "node:os";
import Image from "next/image";

import FolderIcon from "@/assets/folder.svg";
import Link from "next/link";
import path from "node:path";
import { URL } from "node:url";
import { headers } from "next/headers";

type Props = {
  searchParams: Promise<{ [any: string]: string }>;
};

const vidExts = [".mp4", ".mkv", ".avi", ".mov", ".webm", ".flv", ".wmv"];

export default async function page({ searchParams }: Props) {
  const headerList = await headers();
  const host = headerList.get("host");

  const { path: pathName } = await searchParams;
  if (!pathName) redirect(`?path=${os.homedir()}`);
  const dirContent = await readdir(pathName, { withFileTypes: true });
  const childDirs = dirContent
    .filter((i) => i.isDirectory())
    .filter((i) => !i.name.startsWith("."));
  const videos = dirContent
    .filter((i) => i.isFile())
    .filter((i) =>
      vidExts.includes(i.name.slice(i.name.lastIndexOf(".")).toLowerCase())
    );
  return (
    <main className="container mt-4">
      <ul className="list-group list-group ">
        {pathName !== "/" && (
          <li className="list-group-item">
            <Link href={`?path=${path.join(pathName, "..")}`} className="w-100">
              <Image alt="folder-icon" src={FolderIcon} className="me-1" />
              ..
            </Link>
          </li>
        )}
        {childDirs.map((dir, idx) => (
          <li key={idx} className="list-group-item">
            <Link href={`?path=${path.join(dir.parentPath, dir.name)}`}>
              <Image alt="folder-icon" src={FolderIcon} className="me-1" />
              {dir.name}
            </Link>
          </li>
        ))}
        {videos.map((dir, idx) => {
          const baseUrl = host
            ? host.startsWith("http")
              ? host
              : `http://${host}`
            : "http://localhost:3000";
          const url = new URL("/watch", baseUrl);
          url.searchParams.set("path", dir.parentPath);
          return (
            <li key={idx} className="list-group-item">
              <Link href={url.toString()}>
                <Image alt="folder-icon" src={FolderIcon} className="me-1" />
                {dir.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
