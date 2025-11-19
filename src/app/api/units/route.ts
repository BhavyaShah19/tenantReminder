import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

// create unit with tenants
export async function POST(request: Request) {
    try {
        const {unitName,tenants} = await request.json()
        const session = await getServerSession(authOptions);
        const ownerId = session?.user?.id
        if(!ownerId){
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 })
        }
        const res=await prisma.unit.create({
            data: {
                unitName: unitName,
                ownerId: ownerId,
                tenants: {
                    create:tenants.map(t=>{
                        return {
                            ...t,
                            ownerId:ownerId
                        }
                    })
                }
            }
        })
        if(!res){
            return Response.json({
                success: false,
                message: "Error adding unit"
            }, { status: 500 })
        }
        return Response.json({
            success: true,
            message: "Unit added successfully",
            data: res
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
//get all units for the owner
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
        const units = await prisma.unit.findMany({
            where: {
                ownerId: ownerId
            },
            include: {
                tenants: true
            }
        })
        if(!units){
            return Response.json({
                success: false,
                message: "Error fetching units"
            }, { status: 500 })
        }
        return Response.json({
            success: true,
            message: "Units fetched successfully",
            data: units
        }, { status: 200 })

    } catch (error) {
        console.error('Error fetching units', error)
        return Response.json({
            success: false,
            message: "Error fetching units" 
        },
            {
                status: 500
            }
        )
    }
}
//delete unit


// add tenant to unit
