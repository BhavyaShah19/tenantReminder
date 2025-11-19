import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

// get all tenants for this owner
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
        const tenants = await prisma.tenant.findMany({
            where: {
                ownerId: ownerId
            }
        })
        if(!tenants){
            return Response.json({
                success: false,
                message: "Error fetching tenants"
            }, { status: 500 })
        }
        return Response.json({
            success: true,
            message: "Tenants fetched successfully",
            data: tenants
        }, { status: 200 })

    } catch (error) {
        console.error('Error fetching tenants', error)
        return Response.json({
            success: false,
            message: "Error fetching tenants" 
        },
            {
                status: 500
            }
        )
    }
}