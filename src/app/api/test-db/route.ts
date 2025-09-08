import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    if (action === "seed") {
      await seedSampleData();
      return NextResponse.json({ status: "success", message: "Sample data seeded" });
    }
    if (action === "reset") {
      await resetDatabase();
      return NextResponse.json({ status: "success", message: "Database reset" });
    }
    // Test Supabase connection
    const client = supabaseAdmin ?? supabase;
    const { data: testData, error: testError } = await client
      .from("contents")
      .select("count", { count: "exact", head: true });

    if (testError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Supabase connection failed",
          error: testError.message,
        },
        { status: 500 }
      );
    }

    // Get counts
    const { count: contentCount } = await client
      .from("contents")
      .select("*", { count: "exact", head: true });

    const { count: userCount } = await client
      .from("users")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      status: "success",
      message: "Supabase connection successful",
      data: {
        contentsCount: contentCount || 0,
        usersCount: userCount || 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Supabase test error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Supabase test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();

    switch (action) {
      case "seed":
        // Seed some sample data
        await seedSampleData();
        return NextResponse.json({
          status: "success",
          message: "Sample data seeded successfully",
        });

      case "reset":
        // Reset database (clear all data)
        await resetDatabase();
        return NextResponse.json({
          status: "success",
          message: "Database reset successfully",
        });

      default:
        return NextResponse.json(
          {
            status: "error",
            message: 'Invalid action. Use "seed" or "reset"',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Database action error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Database action failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function seedSampleData() {
  // Seed users
  const db = supabaseAdmin ?? supabase;
  await db.from("users").upsert(
    [
      {
        username: "admin",
        password:
          "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
        email: "admin@example.com",
        role: "admin",
        createdDate: new Date().toISOString(),
      },
      {
        username: "editor",
        password:
          "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
        email: "editor@example.com",
        role: "editor",
        createdDate: new Date().toISOString(),
      },
      {
        username: "viewer",
        password:
          "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
        email: "viewer@example.com",
        role: "viewer",
        createdDate: new Date().toISOString(),
      },
    ],
    { onConflict: "username" }
  );

  // Seed categories
  await db.from("categories").upsert(
    [
      {
        name: "Technology",
        description: "Technology related content",
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
      {
        name: "Design",
        description: "Design and UI/UX content",
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
      {
        name: "Marketing",
        description: "Marketing and business content",
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
      {
        name: "Tutorials",
        description: "How-to guides and tutorials",
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
    ],
    { onConflict: "name" }
  );

  // Seed tags
  await db.from("tags").upsert(
    [
      {
        name: "React",
        color: "#61dafb",
        createdDate: new Date().toISOString(),
      },
      {
        name: "Next.js",
        color: "#000000",
        createdDate: new Date().toISOString(),
      },
      {
        name: "Design",
        color: "#4caf50",
        createdDate: new Date().toISOString(),
      },
      {
        name: "Tutorial",
        color: "#ff9800",
        createdDate: new Date().toISOString(),
      },
      {
        name: "Tips",
        color: "#2196f3",
        createdDate: new Date().toISOString(),
      },
    ],
    { onConflict: "name" }
  );

  // Seed contents
  await db.from("contents").upsert(
    [
      {
        title: "Getting Started with React",
        textHtml: "<p>Learn the basics of React development...</p>",
        banner: "/images/products/s4.jpg",
        createdBy: "admin",
        status: "Published",
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
      {
        title: "Draft Article",
        textHtml: "<p>This is a draft...</p>",
        banner: "/images/products/s5.jpg",
        createdBy: "editor",
        status: "Draft",
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
      {
        title: "Scheduled Post",
        textHtml: "<p>This will be published later...</p>",
        banner: "/images/products/s7.jpg",
        createdBy: "admin",
        status: "Scheduled",
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
      {
        title: "Another Draft",
        textHtml: "<p>Another draft content...</p>",
        banner: "/images/products/s11.jpg",
        createdBy: "editor",
        status: "Draft",
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
    ],
    { onConflict: "id" }
  );

  // Link contents to categories and tags for demo metrics
  // Fetch IDs
  const { data: allContents } = await db
    .from("contents")
    .select("id,title");
  const { data: allCats } = await db
    .from("categories")
    .select("id,name");
  const { data: allTags } = await db
    .from("tags")
    .select("id,name");

  const findId = (arr: any[] | null, key: string, val: string) =>
    (arr || []).find((r) => String(r[key]).toLowerCase() === val.toLowerCase())?.id as number | undefined;

  const cReact = findId(allContents, "title", "Getting Started with React");
  const cDraft = findId(allContents, "title", "Draft Article");
  const cSched = findId(allContents, "title", "Scheduled Post");
  const cAnother = findId(allContents, "title", "Another Draft");

  const catTech = findId(allCats, "name", "Technology");
  const catDesign = findId(allCats, "name", "Design");
  const catMarketing = findId(allCats, "name", "Marketing");
  const catTutorials = findId(allCats, "name", "Tutorials");

  const tagReact = findId(allTags, "name", "React");
  const tagNext = findId(allTags, "name", "Next.js");
  const tagDesign = findId(allTags, "name", "Design");
  const tagTutorial = findId(allTags, "name", "Tutorial");
  const tagTips = findId(allTags, "name", "Tips");

  // Compose relation base tuples (contentId, categoryId / tagId)
  const catPairs: Array<[number, number]> = [];
  const tagPairs: Array<[number, number]> = [];

  if (cReact && catTech) catPairs.push([cReact, catTech]);
  if (cDraft && catDesign) catPairs.push([cDraft, catDesign]);
  if (cSched && catMarketing) catPairs.push([cSched, catMarketing]);
  if (cAnother && catTutorials) catPairs.push([cAnother, catTutorials]);

  if (cReact && tagReact) tagPairs.push([cReact, tagReact]);
  if (cReact && tagNext) tagPairs.push([cReact, tagNext]);
  if (cDraft && tagDesign) tagPairs.push([cDraft, tagDesign]);
  if (cSched && tagTutorial) tagPairs.push([cSched, tagTutorial]);
  if (cAnother && tagTips) tagPairs.push([cAnother, tagTips]);

  // Helper to try multiple naming styles
  const tryInsert = async (
    table: string,
    pairs: Array<[number, number]>,
    names: [string, string][]
  ) => {
    for (const [aName, bName] of names) {
      const payload = pairs.map(([a, b]) => ({ [aName]: a, [bName]: b }));
      const { error } = await db.from(table).insert(payload as any);
      if (!error) return true;
      // Continue trying next naming if column missing
      if (String(error.code) !== "42703") {
        // Unexpected error; still try next variant, but log
        console.warn(`Seed ${table} insert failed (${aName}, ${bName}):`, error.message);
      }
    }
    return false;
  };

  if (catPairs.length)
    await tryInsert("content_categories", catPairs, [
      ["contentid", "categoryid"],
      ["contentId", "categoryId"],
      ["content_id", "category_id"],
    ]);
  if (tagPairs.length)
    await tryInsert("content_tags", tagPairs, [
      ["contentid", "tagid"],
      ["contentId", "tagId"],
      ["content_id", "tag_id"],
    ]);
}

async function resetDatabase() {
  // Clear all data (in reverse order due to foreign keys)
  const db = supabaseAdmin ?? supabase;
  await db.from("content_tags").delete().neq("contentid", 0);
  await db.from("content_categories").delete().neq("contentid", 0);
  await db.from("contents").delete().neq("id", 0);
  await db.from("categories").delete().neq("id", 0);
  await db.from("tags").delete().neq("id", 0);
  await db.from("users").delete().neq("id", 0);
}
