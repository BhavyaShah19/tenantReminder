import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function DELETE(request: Request, { params }: { params: { unitID: string, tenantID: string } }) {
    try {
        const { unitID, tenantID } = await params
        const session = await getServerSession(authOptions);
        const ownerId = session?.user?.id
        if (!unitID || !tenantID || !ownerId) {
            return Response.json({
                success: false,
                message: "Missing unitId, tenantId, or user session ID."
            }, { status: 400 });
        }
        const res=await prisma.unit.update({
            where: {
                id: unitID,
                ownerId: ownerId
            },
            data: {
                tenants: {
                    delete: {
                        id: tenantID
                    }
                }
            }
        })
        if(!res){
            return Response.json({
                success: false,
                message: "Error deleting tenant"
            }, { status: 500 })
        }
        return Response.json({
            success: true,
            message: "Unit updated successfully"
        }, { status: 200 })

    } catch (error) {
        console.error('Error updating unit', error)
        return Response.json({
            success: false,
            message: "Error updating unit"
        },
            {
                status: 500
            }
        )
    }
}