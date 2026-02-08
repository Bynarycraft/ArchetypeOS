import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ testId: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { testId } = await params;

    try {
        const test = await prisma.test.findUnique({
            where: { id: testId },
        });

        if (!test) {
            return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
        }

        // Transform JSON questions to proper type if needed or return as is
        return NextResponse.json(test);
    } catch (error) {
        console.error("Test fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch assessment" }, { status: 500 });
    }
}
