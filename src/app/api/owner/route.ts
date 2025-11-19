// get all the bills associated with a particular unit of this owner

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const ownerId = session?.user?.id
        if(!ownerId){
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 })
        }
        const bills=await prisma.bill.findMany({
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
        if(!bills){
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
    }
    catch (error) {
       
    }
}