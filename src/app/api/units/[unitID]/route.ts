import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function DELETE(request: Request,{params}:{params:{unitID:string}}) {
    try {
        const {unitID} = await params
        const session = await getServerSession(authOptions);
        const ownerId = session?.user?.id
        if(!ownerId){
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 })
        }
        const res = await prisma.$transaction([
            prisma.tenant.deleteMany({
                where: {
                    unitId: unitID,
                },
            }),
            prisma.unit.delete({
                where: {
                    id: unitID,
                    ownerId: ownerId, 
                },
            }),
        ]);
        if(!res){
            return Response.json({
                success: false,
                message: "Error deleting unit"
            }, { status: 500 })
        }
        return Response.json({
            success: true,
            message: "Unit deleted successfully"
        }, { status: 200 })

    } catch (error) {
        console.error('Error deleting unit', error)
        return Response.json({
            success: false,
            message: "Error deleting unit" 
        },
            {
                status: 500
            }
        )
    }
}