import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";


export async function GET(request: NextRequest,{params}:{params:{billID:string}}) {
    try {
        // console.log("billId in backend", params.billID)   
        const {billID}= await params
        const bill = await prisma.bill.findUnique({
            where: {
                id: billID
            }
        })
        if(!bill){
            return Response.json({
                success: false,
                message: "Bill not found"
            }, { status: 404 })
        }
        return Response.json({
            success: true,
            message: "Bill fetched successfully",
            data: bill
        }, { status: 200 })
    } catch (error) {
        console.error('Error fetching bill', error)
        return Response.json({
            success: false,
            message: "Error fetching bill" 
        },
            {
                status: 500
            }
        )
    }
}

export async function PUT(request: NextRequest,{params}:{params:{billID:string}}) {
    const {status, datePaid, proofUrl} = await request.json();
    const  {billID}  =await params;
    try {
        const updatedBill = await prisma.bill.update({
            where: {
                id: billID
            },
            data: {
                datePaid,
                status,
                proofURL: proofUrl ? proofUrl : ''
            },
        });
        // return new Response.(JSON.stringify(updatedBill),{success:true}, { status: 200 });
        if(!updatedBill){
            return Response.json({
                success: false,
                message: "Error updating bill"
            }, { status: 500 })
        }
        return Response.json({
            data: updatedBill.toString(),
            success: true,
            message: "Bill updated successfully"
        }, { status: 200 })
    } catch (error) {
        return Response.json({
            success: false,
            message: "Error updating bill"
        }, { status: 500 })
    }
}