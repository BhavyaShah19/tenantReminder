import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";

// add tenant to unit
export async function PATCH(request: Request,{ params }: { params: { unitID: string } }) {
    try {
        const {name,phoneNumber,leaseStart,leaseEnd} = await request.json()
        const {unitID} = await params 
        const session = await getServerSession(authOptions);
        const ownerId = session?.user?.id
        if(!ownerId){
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 })
        }
        if(!ownerId){
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 })
        }
        const newTenantData = {
            name: name,
            phoneNumber: phoneNumber,
            leaseStart: leaseStart,
            leaseEnd: leaseEnd,
            ownerId: ownerId
        };
        const res=await prisma.unit.update({
            where: {
                id: unitID,
                ownerId: ownerId
            },
            data: {
                tenants: {
                   create: [newTenantData]
                }
            },
            select:{
                tenants:true
            }
        })
        if(!res){
            return Response.json({
                success: false,
                message: "Error adding Tenant",
            }, { status: 500 })
        }
        return Response.json({
            success: true,
            message: "Tenant added successfully",
            data:res 
        }, { status: 200 })

    } catch (error) {
        console.error('Error adding Tenant', error)
        return Response.json({
            success: false,
            message: "Error adding Tenant" 
        },
            {
                status: 500
            }
        )
    }
}

export async function GET(request: Request,{ params }: { params: { unitID: string } }) {
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
        const tenants = await prisma.unit.findMany({
            where: {
                id: unitID,
                ownerId: ownerId
            },
            select: {
                tenants: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true
                    }
                },
                unitName: true
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