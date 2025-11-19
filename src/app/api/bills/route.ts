import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(req: Request) {
    const { unitId, billType, amount, dueDate, status, proofUrl } = await req.json();
    try {

        const createdBill = await prisma.bill.create({
            data: {
                unitId,
                billType,
                amount,
                dueDate,
                status,
                proofURL: proofUrl ? proofUrl : ''
            },
        });

        return Response.json({
            createdBill,
            success: true,
            message: "Unit added successfully"
        }, { status: 200 })
    } catch (error) {
        console.error('Error adding unit', error)
        return Response.json({
            success: false,
            message: "Error adding unit"
        },
            {
                status: 500
            }
        )
    }

}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const ownerId = session?.user?.id
        if (!ownerId) {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 })
        }
        const bills = await prisma.bill.findMany({
            where: {
                unit: {
                    ownerId: ownerId
                }
            },
            select: {
                id: true,
                unitId: true,
                amount: true,
                billType: true,
                dueDate: true,
                status: true,
                dateSent: true,
                datePaid: true,
                proofURL: true
            }
        })
        if (!bills) {
            return Response.json({
                success: false,
                message: "Error fetching bills"
            }, { status: 500 })
        }
        return Response.json({
            success: true,
            message: "Bills fetched successfully",
            data: bills
        }, { status: 200 })
    } catch (error) {
        console.error('Error fetching bills', error)
        return Response.json({
            success: false,
            message: "Error fetching bills"
        }, { status: 500 })
    }
}