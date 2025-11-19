import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
    try {
        const { username, email, password } = await request.json()

        const existingUserByEmail = await prisma.owner.findFirst({
            where: {
                email: email
            }
        })

        if(existingUserByEmail){
            return Response.json({
                success: false,
                message: "Email already exists"
            }, { status: 400 })
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.owner.create({
            data: {
                email: email,
                username: username,
                password: hashedPassword
            }
        })

        return Response.json({
            success: true,
            message: "Account created successfully"
        }, { status: 200 })

    } catch (error) {
        console.error('Error registering user', error)
        return Response.json({
            success: false,
            message: "Error registering.Please try again after some time"
        },
            {
                status: 500
            }
        )
    }
}