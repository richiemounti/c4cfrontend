// lib/mdx.ts
import fs from 'fs';
import path from 'path';
import { serialize } from 'next-mdx-remote/serialize';

export async function getMdxContent(filePath: string) {
  try {
    const fileContent = fs.readFileSync(
      path.join(process.cwd(), filePath),
      'utf8'
    );
    return await serialize(fileContent);
  } catch (error) {
    console.error(`Error loading MDX content from ${filePath}:`, error);
    return await serialize('# Content not found\n\nThe requested content could not be loaded.');
  }
}